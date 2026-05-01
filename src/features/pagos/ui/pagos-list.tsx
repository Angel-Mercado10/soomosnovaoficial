// ui/pagos-list.tsx
import type { PagoWithRelations } from '../domain/pago.types'
import { PagoRow } from './pago-row'
import Link from 'next/link'

interface PagosListProps {
  pagos: PagoWithRelations[]
  page: number
  totalPages: number
  total: number
}

export function PagosList({ pagos, page, totalPages, total }: PagosListProps) {
  return (
    <div className="space-y-4">
      <p className="text-[#9CA3AF] text-sm">{total} pagos en el sistema.</p>

      <div className="bg-[#111111] border border-[#1E1E1E] rounded-xl overflow-hidden">
        {pagos.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1E1E1E]">
                  <th className="text-left px-5 py-3 text-[#9CA3AF] font-normal">Fecha</th>
                  <th className="text-left px-5 py-3 text-[#9CA3AF] font-normal">Pareja</th>
                  <th className="text-left px-5 py-3 text-[#9CA3AF] font-normal">Evento</th>
                  <th className="text-left px-5 py-3 text-[#9CA3AF] font-normal">Monto</th>
                  <th className="text-left px-5 py-3 text-[#9CA3AF] font-normal">Estado</th>
                  <th className="text-left px-5 py-3 text-[#9CA3AF] font-normal">Origen</th>
                  <th className="text-left px-5 py-3 text-[#9CA3AF] font-normal">Stripe</th>
                </tr>
              </thead>
              <tbody>
                {pagos.map((pago) => (
                  <PagoRow key={pago.id} pago={pago} />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-[#9CA3AF] text-sm px-5 py-8 text-center">
            No hay pagos registrados.
          </p>
        )}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center gap-3 justify-end">
          {page > 1 && (
            <Link
              href={`?page=${page - 1}`}
              className="text-sm text-[#9CA3AF] hover:text-white px-3 py-1.5 rounded-lg border border-[#1E1E1E] hover:border-[#333] transition-colors"
            >
              ← Anterior
            </Link>
          )}
          <span className="text-xs text-[#6B6B6B]">
            Página {page} de {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={`?page=${page + 1}`}
              className="text-sm text-[#9CA3AF] hover:text-white px-3 py-1.5 rounded-lg border border-[#1E1E1E] hover:border-[#333] transition-colors"
            >
              Siguiente →
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
