// application/get-revenue-total.use-case.ts

import type { PagosRepository } from '../infrastructure/pagos.repository'
import type { RevenueTotalResult } from '../domain/pago.types'

export async function getRevenueTotal(repo: PagosRepository): Promise<RevenueTotalResult> {
  return repo.getRevenueTotal()
}
