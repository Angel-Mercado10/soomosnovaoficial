// ui/pago-row.tsx
import type { PagoWithRelations } from '../domain/pago.types'
import { formatAmountMXN } from '../domain/pago.entity'
import Link from 'next/link'

interface PagoRowProps {
  pago: PagoWithRelations
}

const STATUS_LABELS: Record<string, { label: string; class: string }> = {
  succeeded: {
    label: 'Exitoso',
    class: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
  },
  pending: {
    label: 'Pendiente',
    class: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
  },
  failed: {
    label: 'Fallido',
    class: 'bg-red-400/10 text-red-400 border-red-400/20',
  },
  refunded: {
    label: 'Reembolsado',
    class: 'bg-blue-400/10 text-blue-400 border-blue-400/20',
  },
}

export function PagoRow({ pago }: PagoRowProps) {
  const statusInfo = STATUS_LABELS[pago.status] ?? STATUS_LABELS.pending
  const fecha = new Date(pago.created_at).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

  const stripeLink = pago.stripe_payment_intent_id
    ? `https://dashboard.stripe.com/payments/${pago.stripe_payment_intent_id}`
    : pago.stripe_session_id
      ? `https://dashboard.stripe.com/checkout/sessions/${pago.stripe_session_id}`
      : null

  return (
    <tr className="border-b border-[#1A1A1A] last:border-0 hover:bg-[#161616] transition-colors">
      <td className="px-5 py-3 text-[#9CA3AF] text-sm">{fecha}</td>
      <td className="px-5 py-3 text-white text-sm">
        {pago.pareja_nombre ?? '—'}
        {pago.pareja_email && (
          <span className="block text-xs text-[#6B6B6B]">{pago.pareja_email}</span>
        )}
      </td>
      <td className="px-5 py-3 text-sm">
        {pago.evento_nombre ? (
          <Link
            href={`/admin/eventos/${pago.evento_id}`}
            className="text-[#C9A84C] hover:underline"
          >
            {pago.evento_nombre}
          </Link>
        ) : (
          <span className="text-[#9CA3AF]">—</span>
        )}
      </td>
      <td className="px-5 py-3 text-white text-sm font-medium">
        {formatAmountMXN(pago.amount_cents)}
      </td>
      <td className="px-5 py-3">
        <span
          className={`inline-flex text-xs border rounded-full px-2.5 py-1 ${statusInfo.class}`}
        >
          {statusInfo.label}
        </span>
      </td>
      <td className="px-5 py-3 text-[#9CA3AF] text-xs">
        {pago.is_manual ? 'Manual' : 'Stripe'}
      </td>
      <td className="px-5 py-3 text-sm">
        {stripeLink ? (
          <a
            href={stripeLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#C9A84C] hover:underline"
          >
            Ver →
          </a>
        ) : (
          <span className="text-[#6B6B6B]">—</span>
        )}
      </td>
    </tr>
  )
}
