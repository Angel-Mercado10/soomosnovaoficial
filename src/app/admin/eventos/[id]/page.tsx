import 'server-only'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Evento, Pareja } from '@/types/database'
import { getPagosRepository } from '@/features/pagos/infrastructure/supabase-pagos.repository'
import { getPagosByEvento } from '@/features/pagos/application/get-pagos-by-evento.use-case'
import { formatAmountMXN } from '@/features/pagos/domain/pago.entity'
import { MarkAsPaidButton } from '@/features/pagos/ui/mark-as-paid-button'
import { markEventoAsPaidAction } from './actions'

export const metadata: Metadata = {
  title: 'Detalle de evento — Admin SoomosNova',
}

interface Props {
  params: Promise<{ id: string }>
}

const STATUS_LABELS: Record<string, { label: string; class: string }> = {
  succeeded: { label: 'Exitoso', class: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' },
  pending: { label: 'Pendiente', class: 'bg-amber-400/10 text-amber-400 border-amber-400/20' },
  failed: { label: 'Fallido', class: 'bg-red-400/10 text-red-400 border-red-400/20' },
  refunded: { label: 'Reembolsado', class: 'bg-blue-400/10 text-blue-400 border-blue-400/20' },
}

export default async function AdminEventoDetallePage({ params }: Props) {
  const { id } = await params
  const adminClient = createAdminClient()

  const { data: eventoData, error } = await adminClient
    .from('eventos')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (error || !eventoData) {
    notFound()
  }

  const evento = eventoData as Evento

  // Obtener datos de pareja por separado
  const { data: parejaData } = await adminClient
    .from('parejas')
    .select('nombre_1, nombre_2, email')
    .eq('id', evento.pareja_id)
    .single()

  const pareja = parejaData as Pick<Pareja, 'nombre_1' | 'nombre_2' | 'email'> | null

  const repo = getPagosRepository()
  const pagos = await getPagosByEvento(id, repo)

  return (
    <div className="space-y-8">
      {/* Encabezado */}
      <div>
        <h1 className="font-cormorant text-3xl text-white">
          {evento.nombre_evento}
        </h1>
        <p className="text-[#9CA3AF] text-sm mt-1">
          {pareja ? `${pareja.nombre_1} & ${pareja.nombre_2} · ${pareja.email}` : '—'}
        </p>
      </div>

      {/* Datos del evento */}
      <div className="bg-[#111111] border border-[#1E1E1E] rounded-xl px-6 py-5 grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-[#6B6B6B] text-xs uppercase tracking-widest mb-1">Fecha del evento</p>
          <p className="text-white">
            {new Date(evento.fecha_evento).toLocaleDateString('es-MX', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>
        <div>
          <p className="text-[#6B6B6B] text-xs uppercase tracking-widest mb-1">Estado de pago</p>
          {evento.estado_pago === 'pagado' ? (
            <span className="inline-flex text-xs bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 rounded-full px-2.5 py-1">
              Pagado
            </span>
          ) : (
            <span className="inline-flex text-xs bg-amber-400/10 text-amber-400 border border-amber-400/20 rounded-full px-2.5 py-1">
              Pendiente
            </span>
          )}
        </div>
        <div>
          <p className="text-[#6B6B6B] text-xs uppercase tracking-widest mb-1">Lugar</p>
          <p className="text-white">{evento.lugar_nombre ?? '—'}</p>
        </div>
        <div>
          <p className="text-[#6B6B6B] text-xs uppercase tracking-widest mb-1">Template</p>
          <p className="text-white capitalize">{evento.template}</p>
        </div>
      </div>

      {/* Botón marcar manual */}
      {evento.estado_pago !== 'pagado' && (
        <div className="bg-[#111111] border border-[#1E1E1E] rounded-xl px-6 py-5 space-y-3">
          <p className="text-[#9CA3AF] text-sm">
            Este evento aún no ha sido activado. Si el pago fue realizado fuera de Stripe,
            puede registrarlo manualmente.
          </p>
          <MarkAsPaidButton eventoId={id} onAction={markEventoAsPaidAction} />
        </div>
      )}

      {/* Historial de pagos */}
      <div className="space-y-3">
        <h2 className="font-cormorant text-xl text-white">Historial de pagos</h2>

        <div className="bg-[#111111] border border-[#1E1E1E] rounded-xl overflow-hidden">
          {pagos.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#1E1E1E]">
                    <th className="text-left px-5 py-3 text-[#9CA3AF] font-normal">Fecha</th>
                    <th className="text-left px-5 py-3 text-[#9CA3AF] font-normal">Monto</th>
                    <th className="text-left px-5 py-3 text-[#9CA3AF] font-normal">Estado</th>
                    <th className="text-left px-5 py-3 text-[#9CA3AF] font-normal">Origen</th>
                    <th className="text-left px-5 py-3 text-[#9CA3AF] font-normal">Stripe</th>
                  </tr>
                </thead>
                <tbody>
                  {pagos.map((pago) => {
                    const statusInfo = STATUS_LABELS[pago.status] ?? STATUS_LABELS.pending
                    const stripeLink = pago.stripe_payment_intent_id
                      ? `https://dashboard.stripe.com/payments/${pago.stripe_payment_intent_id}`
                      : pago.stripe_session_id
                        ? `https://dashboard.stripe.com/checkout/sessions/${pago.stripe_session_id}`
                        : null
                    return (
                      <tr key={pago.id} className="border-b border-[#1A1A1A] last:border-0">
                        <td className="px-5 py-3 text-[#9CA3AF]">
                          {new Date(pago.created_at).toLocaleDateString('es-MX', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="px-5 py-3 text-white font-medium">
                          {formatAmountMXN(pago.amount_cents)}
                        </td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex text-xs border rounded-full px-2.5 py-1 ${statusInfo.class}`}>
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-[#9CA3AF] text-xs">
                          {pago.is_manual ? 'Manual' : 'Stripe'}
                        </td>
                        <td className="px-5 py-3">
                          {stripeLink ? (
                            <a href={stripeLink} target="_blank" rel="noopener noreferrer" className="text-xs text-[#C9A84C] hover:underline">
                              Ver →
                            </a>
                          ) : (
                            <span className="text-[#6B6B6B]">—</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-[#9CA3AF] text-sm px-5 py-8 text-center">
              No hay pagos registrados para este evento.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
