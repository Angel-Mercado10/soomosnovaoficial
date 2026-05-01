import 'server-only'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Eventos — Admin SoomosNova',
}

export default async function AdminEventosPage() {
  const supabase = createAdminClient()

  const { data: eventos, error } = await supabase
    .from('eventos')
    .select(
      'id, nombre_evento, estado_pago, fecha_evento, template, created_at, slug, pareja_id, lugar_nombre'
    )
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  const parejaIds = [...new Set((eventos ?? []).map((e) => e.pareja_id))]
  const { data: parejas } = await supabase
    .from('parejas')
    .select('id, nombre_1, nombre_2')
    .in('id', parejaIds.length > 0 ? parejaIds : ['__none__'])

  const parejaMap = new Map((parejas ?? []).map((p) => [p.id, p]))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-cormorant text-3xl text-white">
          Todos los <span className="text-[#C9A84C]">eventos</span>
        </h1>
        <p className="text-[#9CA3AF] text-sm mt-1">
          {eventos?.length ?? 0} eventos en el sistema.
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
                  <th className="text-left px-5 py-3 text-[#9CA3AF] font-normal">Estado</th>
                  <th className="text-left px-5 py-3 text-[#9CA3AF] font-normal">Fecha</th>
                  <th className="text-left px-5 py-3 text-[#9CA3AF] font-normal">Template</th>
                  <th className="text-left px-5 py-3 text-[#9CA3AF] font-normal">Acciones</th>
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
                      <td className="px-5 py-3 text-white font-medium">
                        {evento.nombre_evento}
                        {evento.lugar_nombre && (
                          <span className="block text-xs text-[#6B6B6B]">{evento.lugar_nombre}</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-[#9CA3AF]">
                        {pareja ? `${pareja.nombre_1} & ${pareja.nombre_2}` : '—'}
                      </td>
                      <td className="px-5 py-3">
                        {evento.estado_pago === 'pagado' ? (
                          <span className="inline-flex text-xs bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 rounded-full px-2.5 py-1">
                            Pagado
                          </span>
                        ) : (
                          <span className="inline-flex text-xs bg-amber-400/10 text-amber-400 border border-amber-400/20 rounded-full px-2.5 py-1">
                            Pendiente
                          </span>
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
                      <td className="px-5 py-3">
                        <div className="flex flex-col gap-1">
                          <a
                            href={`/i/${evento.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-[#C9A84C] hover:underline"
                          >
                            Ver invitación →
                          </a>
                          <a
                            href={`/admin/eventos/${evento.id}`}
                            className="text-xs text-[#9CA3AF] hover:text-white hover:underline"
                          >
                            Detalle →
                          </a>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-[#9CA3AF] text-sm px-5 py-8 text-center">
            No hay eventos creados aún.
          </p>
        )}
      </div>
    </div>
  )
}
