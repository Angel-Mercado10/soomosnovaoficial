import { describe, it, expect, vi } from 'vitest'
import { listPagos } from '../list-pagos.use-case'
import type { PagosRepository } from '../../infrastructure/pagos.repository'
import type { ListPagosResult, PagoWithRelations } from '../../domain/pago.types'

function makePagoWithRelations(overrides: Partial<PagoWithRelations> = {}): PagoWithRelations {
  return {
    id: 'pago-1',
    evento_id: 'evento-1',
    pareja_id: 'pareja-1',
    stripe_payment_intent_id: null,
    stripe_session_id: null,
    amount_cents: 299900,
    currency: 'mxn',
    status: 'succeeded',
    is_manual: false,
    paid_at: new Date().toISOString(),
    raw_event: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    evento_nombre: 'Boda Test',
    pareja_nombre: 'Juan & María',
    ...overrides,
  }
}

function makeListResult(overrides: Partial<ListPagosResult> = {}): ListPagosResult {
  return {
    pagos: [makePagoWithRelations()],
    total: 1,
    page: 1,
    pageSize: 25,
    totalPages: 1,
    ...overrides,
  }
}

function makeRepo(result: ListPagosResult): Pick<PagosRepository, 'listPagos'> {
  return {
    listPagos: vi.fn().mockResolvedValue(result),
  }
}

describe('listPagos', () => {
  it('delega al repositorio con params correctos', async () => {
    const result = makeListResult()
    const repo = makeRepo(result) as PagosRepository

    const output = await listPagos({ page: 1, pageSize: 25 }, repo)

    expect(repo.listPagos).toHaveBeenCalledWith({ page: 1, pageSize: 25 })
    expect(output).toBe(result)
  })

  it('pagina correctamente: página 2 con 25 elementos', async () => {
    const pagos = Array.from({ length: 25 }, (_, i) =>
      makePagoWithRelations({ id: `pago-${i}` })
    )
    const result = makeListResult({
      pagos,
      total: 50,
      page: 2,
      pageSize: 25,
      totalPages: 2,
    })
    const repo = makeRepo(result) as PagosRepository

    const output = await listPagos({ page: 2, pageSize: 25 }, repo)

    expect(output.page).toBe(2)
    expect(output.total).toBe(50)
    expect(output.totalPages).toBe(2)
    expect(output.pagos).toHaveLength(25)
  })

  it('retorna lista vacía cuando no hay pagos', async () => {
    const result = makeListResult({ pagos: [], total: 0, totalPages: 0 })
    const repo = makeRepo(result) as PagosRepository

    const output = await listPagos({}, repo)

    expect(output.pagos).toHaveLength(0)
    expect(output.total).toBe(0)
  })
})
