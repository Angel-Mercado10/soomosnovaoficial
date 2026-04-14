import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardStats, NoEventoCTA } from '@/components/dashboard/DashboardStats'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: pareja } = await supabase
    .from('parejas')
    .select('*')
    .eq('auth_user_id', user.id)
    .single()

  if (!pareja) {
    redirect('/auth/login')
  }

  const { data: evento } = await supabase
    .from('eventos')
    .select('*')
    .eq('pareja_id', pareja.id)
    .single()

  // Estadísticas iniciales para SSR (evita flicker en Realtime)
  let initialStats = { total: 0, confirmados: 0, pendientes: 0, rechazos: 0 }

  if (evento) {
    const { data: invitados } = await supabase
      .from('invitados')
      .select('estado_confirmacion')
      .eq('evento_id', evento.id)
      .is('deleted_at', null)

    if (invitados) {
      initialStats = {
        total: invitados.length,
        confirmados: invitados.filter((i) => i.estado_confirmacion === 'confirmado').length,
        pendientes: invitados.filter(
          (i) =>
            i.estado_confirmacion === 'pendiente' ||
            i.estado_confirmacion === 'pendiente_decision'
        ).length,
        rechazos: invitados.filter((i) => i.estado_confirmacion === 'rechazo').length,
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header de página */}
      <div>
        <h1 className="font-cormorant text-3xl text-white">
          Bienvenidos,{' '}
          <span className="text-[#C9A84C]">
            {pareja.nombre_1} &amp; {pareja.nombre_2}
          </span>
        </h1>
        <p className="text-[#9CA3AF] text-sm mt-1">
          {evento
            ? 'Tu evento está configurado. Gestioná tus invitados desde acá.'
            : 'Comenzá configurando tu evento.'}
        </p>
      </div>

      {evento ? (
        <div className="space-y-6">
          {/* Info del evento */}
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-cormorant text-2xl text-[#C9A84C]">
                  {evento.nombre_evento}
                </h2>
                <p className="text-[#9CA3AF] text-sm mt-1">
                  {new Date(evento.fecha_evento).toLocaleDateString('es-AR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                  {evento.hora_evento && ` · ${evento.hora_evento}`}
                </p>
                {evento.lugar_nombre && (
                  <p className="text-[#9CA3AF] text-sm mt-0.5">{evento.lugar_nombre}</p>
                )}
              </div>
              <Link
                href="/dashboard/configuracion"
                className="shrink-0 text-xs text-[#9CA3AF] hover:text-[#C9A84C] transition-colors border border-[#2A2A2A] rounded-full px-3 py-1.5"
              >
                Editar
              </Link>
            </div>
          </div>

          {/* Stats con Realtime */}
          <DashboardStats eventoId={evento.id} initialStats={initialStats} />

          {/* Acciones rápidas */}
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-5">
            <h3 className="text-white font-medium mb-4 text-sm">Acciones rápidas</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Link
                href="/dashboard/invitados/subir"
                className="flex items-center gap-3 p-3 bg-[#111111] hover:bg-[#222222] border border-[#2A2A2A] hover:border-[#C9A84C]/20 rounded-xl transition-colors group"
              >
                <div className="w-9 h-9 rounded-lg bg-[#C9A84C]/10 border border-[#C9A84C]/20 flex items-center justify-center shrink-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
                <div>
                  <p className="text-white text-sm font-medium group-hover:text-[#C9A84C] transition-colors">
                    Subir invitados
                  </p>
                  <p className="text-[#9CA3AF] text-xs">CSV / Excel</p>
                </div>
              </Link>

              <Link
                href="/dashboard/invitados"
                className="flex items-center gap-3 p-3 bg-[#111111] hover:bg-[#222222] border border-[#2A2A2A] hover:border-[#C9A84C]/20 rounded-xl transition-colors group"
              >
                <div className="w-9 h-9 rounded-lg bg-[#C9A84C]/10 border border-[#C9A84C]/20 flex items-center justify-center shrink-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <div>
                  <p className="text-white text-sm font-medium group-hover:text-[#C9A84C] transition-colors">
                    Ver invitados
                  </p>
                  <p className="text-[#9CA3AF] text-xs">Lista completa</p>
                </div>
              </Link>

              <Link
                href="/dashboard/confirmaciones"
                className="flex items-center gap-3 p-3 bg-[#111111] hover:bg-[#222222] border border-[#2A2A2A] hover:border-[#C9A84C]/20 rounded-xl transition-colors group"
              >
                <div className="w-9 h-9 rounded-lg bg-[#C9A84C]/10 border border-[#C9A84C]/20 flex items-center justify-center shrink-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2">
                    <polyline points="9 11 12 14 22 4" />
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                  </svg>
                </div>
                <div>
                  <p className="text-white text-sm font-medium group-hover:text-[#C9A84C] transition-colors">
                    Confirmaciones
                  </p>
                  <p className="text-[#9CA3AF] text-xs">RSVP recibidos</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <NoEventoCTA parejaNombres={`${pareja.nombre_1} y ${pareja.nombre_2}`} />
      )}
    </div>
  )
}
