// ui/revenue-summary.tsx
import { formatAmountMXN } from '../domain/pago.entity'
import type { RevenueTotalResult } from '../domain/pago.types'

interface RevenueSummaryProps {
  revenue: RevenueTotalResult
}

export function RevenueSummary({ revenue }: RevenueSummaryProps) {
  return (
    <div className="bg-[#111111] border border-[#1E1E1E] rounded-xl px-6 py-5">
      <p className="text-[#9CA3AF] text-xs uppercase tracking-widest mb-1">Ingresos acumulados</p>
      <p className="font-cormorant text-3xl text-white">
        {formatAmountMXN(revenue.total_cents)}{' '}
        <span className="text-[#C9A84C] text-lg">MXN</span>
      </p>
      <p className="text-[#6B6B6B] text-xs mt-1">
        {revenue.count} {revenue.count === 1 ? 'pago exitoso' : 'pagos exitosos'}
      </p>
    </div>
  )
}
