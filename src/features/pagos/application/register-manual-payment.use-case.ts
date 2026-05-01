// application/register-manual-payment.use-case.ts

import type { PagosRepository } from '../infrastructure/pagos.repository'
import type { RegisterManualPaymentInput, Pago } from '../domain/pago.types'

export async function registerManualPayment(
  input: RegisterManualPaymentInput,
  repo: PagosRepository
): Promise<Pago> {
  // 1. Crear pago manual (is_manual=true, status=succeeded)
  const pago = await repo.createManualPayment(input)

  // 2. Marcar evento como pagado
  await repo.markEventoPagado(pago.evento_id)

  return pago
}
