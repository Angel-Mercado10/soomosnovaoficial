import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Resend with a real class (Vitest 4 requires class/function for constructors)
const sendMock = vi.fn().mockResolvedValue({ id: 'test-id' })

vi.mock('resend', () => ({
  Resend: class MockResend {
    emails = { send: sendMock }
  },
}))

const { sendContactEmail } = await import('@/app/actions/contact')

function validData() {
  return {
    name: 'María López',
    email: 'maria@example.com',
    eventDate: '2026-11-15',
    message: '¿Tienen disponibilidad para noviembre?',
  }
}

describe('sendContactEmail — validation', () => {
  it('rejects empty name', async () => {
    const result = await sendContactEmail({ ...validData(), name: '   ' })
    expect(result).toEqual({ success: false, error: 'El nombre es obligatorio.' })
  })

  it('rejects empty email', async () => {
    const result = await sendContactEmail({ ...validData(), email: '' })
    expect(result).toEqual({ success: false, error: 'El email es obligatorio.' })
  })

  it('rejects invalid email format', async () => {
    const result = await sendContactEmail({ ...validData(), email: 'not-an-email' })
    expect(result).toEqual({ success: false, error: 'El email no es válido.' })
  })

  it('rejects empty eventDate', async () => {
    const result = await sendContactEmail({ ...validData(), eventDate: '' })
    expect(result).toEqual({ success: false, error: 'La fecha del evento es obligatoria.' })
  })

  it('rejects empty message', async () => {
    const result = await sendContactEmail({ ...validData(), message: '  ' })
    expect(result).toEqual({ success: false, error: 'El mensaje es obligatorio.' })
  })

  it('rejects name exceeding max length', async () => {
    const result = await sendContactEmail({ ...validData(), name: 'a'.repeat(1001) })
    expect(result).toEqual({ success: false, error: 'El nombre es demasiado largo.' })
  })

  it('rejects message exceeding max length', async () => {
    const result = await sendContactEmail({ ...validData(), message: 'a'.repeat(1001) })
    expect(result).toEqual({ success: false, error: 'El mensaje es demasiado largo.' })
  })
})

describe('sendContactEmail — success', () => {
  beforeEach(() => {
    sendMock.mockClear()
  })

  it('returns success for valid data', async () => {
    const result = await sendContactEmail(validData())
    expect(result).toEqual({ success: true })
  })

  it('calls Resend with reply-to set to user email', async () => {
    await sendContactEmail(validData())
    expect(sendMock).toHaveBeenCalledOnce()
    const call = sendMock.mock.calls[0][0]
    expect(call.replyTo).toBe('maria@example.com')
  })

  it('accepts valid email formats', async () => {
    const emails = ['user@example.com', 'user+tag@domain.co', 'first.last@sub.domain.com']
    for (const email of emails) {
      sendMock.mockClear()
      const result = await sendContactEmail({ ...validData(), email })
      expect(result.success).toBe(true)
    }
  })
})

describe('sendContactEmail — XSS prevention', () => {
  beforeEach(() => {
    sendMock.mockClear()
  })

  it('escapes HTML tags in user inputs', async () => {
    await sendContactEmail({
      ...validData(),
      name: '<script>alert("xss")</script>',
    })

    const call = sendMock.mock.calls[0][0]
    expect(call.html).not.toContain('<script>')
    expect(call.html).toContain('&lt;script&gt;')
  })

  it('escapes ampersands and quotes', async () => {
    await sendContactEmail({
      ...validData(),
      message: 'Test & "quotes" & <tags>',
    })

    const call = sendMock.mock.calls[0][0]
    expect(call.html).toContain('&amp;')
    expect(call.html).toContain('&quot;')
    expect(call.html).toContain('&lt;tags&gt;')
  })
})

describe('sendContactEmail — error handling', () => {
  it('returns error when Resend throws', async () => {
    sendMock.mockRejectedValueOnce(new Error('Network error'))
    const result = await sendContactEmail(validData())
    expect(result).toEqual({
      success: false,
      error: 'No se pudo enviar el mensaje. Intentá de nuevo.',
    })
  })
})
