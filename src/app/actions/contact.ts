'use server'

import { Resend } from 'resend'

type ContactFormData = {
  name: string
  email: string
  eventDate: string
  message: string
}

type ContactResult =
  | { success: true }
  | { success: false; error: string }

const resend = new Resend(process.env.RESEND_API_KEY)

const MAX_LENGTH = 1000

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function validate(data: ContactFormData): string | null {
  if (!data.name.trim()) return 'El nombre es obligatorio.'
  if (!data.email.trim()) return 'El email es obligatorio.'
  if (!isValidEmail(data.email)) return 'El email no es válido.'
  if (!data.eventDate.trim()) return 'La fecha del evento es obligatoria.'
  if (!data.message.trim()) return 'El mensaje es obligatorio.'
  if (data.name.length > MAX_LENGTH) return 'El nombre es demasiado largo.'
  if (data.message.length > MAX_LENGTH) return 'El mensaje es demasiado largo.'
  return null
}

export async function sendContactEmail(data: ContactFormData): Promise<ContactResult> {
  const validationError = validate(data)
  if (validationError) return { success: false, error: validationError }

  const name = escapeHtml(data.name.trim())
  const email = escapeHtml(data.email.trim())
  const eventDate = escapeHtml(data.eventDate.trim())
  const message = escapeHtml(data.message.trim())

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev',
      to: process.env.CONTACT_EMAIL ?? 'hola@soomosnova.com',
      replyTo: data.email.trim(),
      subject: `Nueva consulta de ${name}`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #0A0A0A; color: #ffffff; padding: 40px; border-radius: 12px;">
          <div style="border-bottom: 1px solid #2A2A2A; padding-bottom: 24px; margin-bottom: 32px;">
            <span style="font-size: 24px; font-weight: 600; color: #ffffff;">Soomos</span>
            <span style="font-size: 24px; font-weight: 600; color: #C9A84C;">Nova</span>
            <p style="color: #9CA3AF; font-size: 13px; margin: 4px 0 0;">Nueva consulta recibida</p>
          </div>

          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #2A2A2A; color: #9CA3AF; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; width: 140px;">Nombre completo</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #2A2A2A; color: #ffffff; font-size: 15px;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #2A2A2A; color: #9CA3AF; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Email</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #2A2A2A; color: #C9A84C; font-size: 15px;">${email}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #2A2A2A; color: #9CA3AF; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Fecha del evento</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #2A2A2A; color: #ffffff; font-size: 15px;">${eventDate}</td>
            </tr>
            <tr>
              <td style="padding: 16px 0 0; color: #9CA3AF; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; vertical-align: top;">Consulta</td>
              <td style="padding: 16px 0 0; color: #ffffff; font-size: 15px; line-height: 1.6;">${message.replace(/\n/g, '<br/>')}</td>
            </tr>
          </table>

          <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #2A2A2A; text-align: center; color: #9CA3AF; font-size: 12px;">
            Respond&eacute; directamente a este email para contestarle a ${name}.
          </div>
        </div>
      `,
    })

    return { success: true }
  } catch {
    return { success: false, error: 'No se pudo enviar el mensaje. Intentá de nuevo.' }
  }
}
