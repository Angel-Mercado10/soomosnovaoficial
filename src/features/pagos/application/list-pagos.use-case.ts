// application/list-pagos.use-case.ts

import type { PagosRepository } from '../infrastructure/pagos.repository'
import type { ListPagosParams, ListPagosResult } from '../domain/pago.types'

export async function listPagos(
  params: ListPagosParams,
  repo: PagosRepository
): Promise<ListPagosResult> {
  return repo.listPagos(params)
}
