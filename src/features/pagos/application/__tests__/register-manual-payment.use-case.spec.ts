import { describe, it, expect, vi } from 'vitest'
import { registerManualPayment } from '../register-manual-payment.use-case'
import type { PagosRepository } from '../../infrastructure/pagos.repository'
import type { Pago, RegisterManualPaymentInput } from '../../domain/pago.types'

function makePago(overrides: Partial<Pago> = {}): Pago {
  return {
    id: 'pago-manual-1',
    evento_id: 'evento-1',
    pareja_id: 'pareja-1',
    stripe_payment_intent_id: null,
    stripe_session_id: null,
    amount_cents: 299900,
    currency: 'mxn',
    status: 'succeeded',
    is_manual: true,
    paid_at: new Date().toISOString(),
    raw_event: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  }
}

function makeRepo(overrides: Partial<PagosRepository> = {}): PagosRepository {
  return {
    upsertStripePayment: vi.fn(),
    createManualPayment: vi.fn().mockResolvedValue(makePago()),
    listPagos: vi.fn(),
    getPagosByEvento: vi.fn(),
    getRevenueTotal: vi.fn(),
    markEventoPagado: vi.fn().mockResolvedValue(undefined),
    markEventoPendiente: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  } as PagosRepository
}

const baseInput: RegisterManualPaymentInput = {
  evento_id: 'evento-1',
  pareja_id: 'pareja-1',
  amount_cents: 299900,
  admin_user_id: 'admin-user-1',
}

describe('registerManualPayment', () => {
  it('crea pago con is_manual=true y status=succeeded', async () => {
    const repo = makeRepo()
    const pago = await registerManualPayment(baseInput, repo)

    expect(repo.createManualPayment).toHaveBeenCalledOnce()
    expect(pago.is_manual).toBe(true)
    expect(pago.status).toBe('succeeded')
  })

  it('marca el evento como pagado', async () => {
    const repo = makeRepo()
    await registerManualPayment(baseInput, repo)

    expect(repo.markEventoPagado).toHaveBeenCalledOnce()
    expect(repo.markEventoPagado).toHaveBeenCalledWith('evento-1')
  })

  it('llama createManualPayment antes de markEventoPagado', async () => {
    const callOrder: string[] = []
    const repo = makeRepo({
      createManualPayment: vi.fn().mockImplementation(async () => {
        callOrder.push('create')
        return makePago()
      }),
      markEventoPagado: vi.fn().mockImplementation(async () => {
        callOrder.push('markPagado')
      }),
    })

    await registerManualPayment(baseInput, repo)

    expect(callOrder).toEqual(['create', 'markPagado'])
  })
})
