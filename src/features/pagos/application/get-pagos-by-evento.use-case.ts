// application/get-pagos-by-evento.use-case.ts

import type { PagosRepository } from '../infrastructure/pagos.repository'
import type { PagoWithRelations } from '../domain/pago.types'

export async function getPagosByEvento(
  eventoId: string,
  repo: PagosRepository
): Promise<PagoWithRelations[]> {
  return repo.getPagosByEvento(eventoId)
}
