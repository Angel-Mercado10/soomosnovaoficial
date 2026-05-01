import 'server-only'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Demos / Pendientes — Admin SoomosNova',
}

export default async function AdminDemosPage() {
  const supabase = createAdminClient()

  const { data: eventos, error } = await supabase
    .from('eventos')
    .select(
      'id, nombre_evento, estado_pago, fecha_evento, template, created_at, slug, pareja_id'
    )
    .eq('estado_pago', 'pendiente')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  // Para cada evento, traemos el nombre de la pareja en una sola query adicional
  const parejaIds = [...new Set((eventos ?? []).map((e) => e.pareja_id))]
  const { data: parejas } = await supabase
    .from('parejas')
    .select('id, nombre_1, nombre_2, email')
    .in('id', parejaIds.length > 0 ? parejaIds : ['__none__'])

  const parejaMap = new Map((parejas ?? []).map((p) => [p.id, p]))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-cormorant text-3xl text-white">
          Demos / <span className="text-[#C9A84C]">Pendientes de pago</span>
        </h1>
        <p className="text-[#9CA3AF] text-sm mt-1">
          Eventos creados que aún no completaron el pago ({eventos?.length ?? 0} total).
        </p>
      </div>

      {error && (
        <p className="text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-5 py-4 text-sm">
          Error al cargar datos: {error.message}
        </p>
      )}

      <div className="bg-[#111111] border border-[#1E1E1E] rounded-xl overflow-hidden">
        {eventos && eventos.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1E1E1E]">
                  <th className="text-left px-5 py-3 text-[#9CA3AF] font-normal">Evento</th>
                  <th className="text-left px-5 py-3 text-[#9CA3AF] font-normal">Pareja</th>
                  <th className="text-left px-5 py-3 text-[#9CA3AF] font-normal">Fecha evento</th>
                  <th className="text-left px-5 py-3 text-[#9CA3AF] font-normal">Template</th>
                  <th className="text-left px-5 py-3 text-[#9CA3AF] font-normal">Creado</th>
                  <th className="text-left px-5 py-3 text-[#9CA3AF] font-normal">Ver</th>
                </tr>
              </thead>
              <tbody>
                {eventos.map((evento) => {
                  const pareja = parejaMap.get(evento.pareja_id)
                  return (
                    <tr
                      key={evento.id}
                      className="border-b border-[#1A1A1A] last:border-0 hover:bg-[#161616] transition-colors"
                    >
                      <td className="px-5 py-3 text-white font-medium">{evento.nombre_evento}</td>
                      <td className="px-5 py-3 text-[#9CA3AF]">
                        {pareja
                          ? `${pareja.nombre_1} & ${pareja.nombre_2}`
                          : '—'}
                        {pareja?.email && (
                          <span className="block text-xs text-[#6B6B6B]">{pareja.email}</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-[#9CA3AF]">
                        {new Date(evento.fecha_evento).toLocaleDateString('es-AR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-5 py-3 text-[#9CA3AF] capitalize">{evento.template}</td>
                      <td className="px-5 py-3 text-[#9CA3AF]">
                        {new Date(evento.created_at).toLocaleDateString('es-AR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-5 py-3">
                        <a
                          href={`/i/${evento.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#C9A84C] hover:underline"
                        >
                          Ver demo →
                        </a>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-[#9CA3AF] text-sm px-5 py-8 text-center">
            No hay eventos pendientes de pago.
          </p>
        )}
      </div>
    </div>
  )
}
