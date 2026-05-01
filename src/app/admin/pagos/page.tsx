import 'server-only'
import type { Metadata } from 'next'
import { getPagosRepository } from '@/features/pagos/infrastructure/supabase-pagos.repository'
import { listPagos } from '@/features/pagos/application/list-pagos.use-case'
import { getRevenueTotal } from '@/features/pagos/application/get-revenue-total.use-case'
import { PagosList } from '@/features/pagos/ui/pagos-list'
import { RevenueSummary } from '@/features/pagos/ui/revenue-summary'

export const metadata: Metadata = {
  title: 'Pagos — Admin SoomosNova',
}

interface Props {
  searchParams: Promise<{ page?: string }>
}

export default async function AdminPagosPage({ searchParams }: Props) {
  const { page: pageStr } = await searchParams
  const page = Math.max(1, parseInt(pageStr ?? '1', 10) || 1)

  const repo = getPagosRepository()

  const [result, revenue] = await Promise.all([
    listPagos({ page, pageSize: 25 }, repo),
    getRevenueTotal(repo),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-cormorant text-3xl text-white">
          Registro de <span className="text-[#C9A84C]">pagos</span>
        </h1>
        <p className="text-[#9CA3AF] text-sm mt-1">
          Historial completo de transacciones del sistema.
        </p>
      </div>

      <RevenueSummary revenue={revenue} />

      <PagosList
        pagos={result.pagos}
        page={result.page}
        totalPages={result.totalPages}
        total={result.total}
      />
    </div>
  )
}
