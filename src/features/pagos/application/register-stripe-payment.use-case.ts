// application/register-stripe-payment.use-case.ts
// Idempotente: upsert pago antes de marcar evento.

import type { PagosRepository } from '../infrastructure/pagos.repository'
import type { RegisterStripePaymentInput, Pago } from '../domain/pago.types'
import { shouldMarkEventoPagado } from '../domain/pago.entity'

export async function registerStripePayment(
  input: RegisterStripePaymentInput,
  repo: PagosRepository
): Promise<Pago> {
  // 1. Persistir/actualizar el pago PRIMERO (idempotente)
  const pago = await repo.upsertStripePayment(input)

  // 2. Solo si succeeded → marcar evento pagado
  if (shouldMarkEventoPagado(pago.status)) {
    await repo.markEventoPagado(pago.evento_id)
  }

  // 3. Si refunded → marcar evento pendiente
  if (pago.status === 'refunded') {
    await repo.markEventoPendiente(pago.evento_id)
  }

  // 4. Si failed → no cambiar estado del evento

  return pago
}
