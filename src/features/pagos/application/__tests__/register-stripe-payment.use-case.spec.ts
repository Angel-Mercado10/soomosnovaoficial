import { describe, it, expect, vi } from 'vitest'
import { registerStripePayment } from '../register-stripe-payment.use-case'
import type { PagosRepository } from '../../infrastructure/pagos.repository'
import type { Pago, RegisterStripePaymentInput } from '../../domain/pago.types'

function makePago(overrides: Partial<Pago> = {}): Pago {
  return {
    id: 'pago-1',
    evento_id: 'evento-1',
    pareja_id: 'pareja-1',
    stripe_payment_intent_id: 'pi_test_123',
    stripe_session_id: null,
    amount_cents: 299900,
    currency: 'mxn',
    status: 'succeeded',
    is_manual: false,
    paid_at: new Date().toISOString(),
    raw_event: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  }
}

function makeRepo(overrides: Partial<PagosRepository> = {}): PagosRepository {
  return {
    upsertStripePayment: vi.fn().mockResolvedValue(makePago()),
    createManualPayment: vi.fn(),
    listPagos: vi.fn(),
    getPagosByEvento: vi.fn(),
    getRevenueTotal: vi.fn(),
    markEventoPagado: vi.fn().mockResolvedValue(undefined),
    markEventoPendiente: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  } as PagosRepository
}

function makeInput(overrides: Partial<RegisterStripePaymentInput> = {}): RegisterStripePaymentInput {
  return {
    stripe_payment_intent_id: 'pi_test_123',
    evento_id: 'evento-1',
    pareja_id: 'pareja-1',
    amount_cents: 299900,
    currency: 'mxn',
    status: 'succeeded',
    ...overrides,
  }
}

describe('registerStripePayment', () => {
  describe('idempotencia: upsert pago ANTES de marcar evento', () => {
    it('llama upsertStripePayment antes de markEventoPagado', async () => {
      const callOrder: string[] = []
      const repo = makeRepo({
        upsertStripePayment: vi.fn().mockImplementation(async () => {
          callOrder.push('upsert')
          return makePago()
        }),
        markEventoPagado: vi.fn().mockImplementation(async () => {
          callOrder.push('markPagado')
        }),
      })

      await registerStripePayment(makeInput(), repo)

      expect(callOrder).toEqual(['upsert', 'markPagado'])
    })
  })

  describe('succeeded', () => {
    it('marca el evento como pagado cuando status=succeeded', async () => {
      const repo = makeRepo({
        upsertStripePayment: vi.fn().mockResolvedValue(makePago({ status: 'succeeded' })),
      })

      await registerStripePayment(makeInput({ status: 'succeeded' }), repo)

      expect(repo.markEventoPagado).toHaveBeenCalledOnce()
      expect(repo.markEventoPagado).toHaveBeenCalledWith('evento-1')
      expect(repo.markEventoPendiente).not.toHaveBeenCalled()
    })
  })

  describe('failed', () => {
    it('NO marca el evento como pagado cuando status=failed', async () => {
      const repo = makeRepo({
        upsertStripePayment: vi.fn().mockResolvedValue(makePago({ status: 'failed' })),
      })

      await registerStripePayment(makeInput({ status: 'failed' }), repo)

      expect(repo.markEventoPagado).not.toHaveBeenCalled()
      expect(repo.markEventoPendiente).not.toHaveBeenCalled()
    })
  })

  describe('refunded', () => {
    it('actualiza pago a refunded y marca evento pendiente sin duplicar', async () => {
      const repo = makeRepo({
        upsertStripePayment: vi.fn().mockResolvedValue(makePago({ status: 'refunded' })),
      })

      await registerStripePayment(makeInput({ status: 'refunded' }), repo)

      expect(repo.upsertStripePayment).toHaveBeenCalledOnce()
      expect(repo.markEventoPagado).not.toHaveBeenCalled()
      expect(repo.markEventoPendiente).toHaveBeenCalledOnce()
      expect(repo.markEventoPendiente).toHaveBeenCalledWith('evento-1')
    })
  })
})
