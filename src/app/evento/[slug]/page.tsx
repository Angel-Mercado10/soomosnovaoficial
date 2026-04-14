import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import CountdownEvento from '@/components/invitado/CountdownEvento'

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ token?: string }>
}

function formatFecha(fecha: string, hora: string | null): string {
  const date = new Date(fecha + 'T12:00:00')
  const fechaStr = date.toLocaleDateString('es-AR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const capitalizada = fechaStr.charAt(0).toUpperCase() + fechaStr.slice(1)
  return hora ? `${capitalizada} · ${hora}` : capitalizada
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const admin = createAdminClient()
  const { data: evento } = await admin
    .from('eventos')
    .select('nombre_evento, lugar_nombre')
    .eq('slug', slug)
    .single()

  if (!evento) return { title: 'Evento — SoomosNova' }

  return {
    title: `${evento.nombre_evento} — SoomosNova`,
    description: evento.lugar_nombre
      ? `Evento en ${evento.lugar_nombre}`
      : 'Detalles de tu evento.',
  }
}

export default async function EventoPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const { token } = await searchParams
  const admin = createAdminClient()

  const { data: evento } = await admin
    .from('eventos')
    .select('*')
    .eq('slug', slug)
    .is('deleted_at', null)
    .single()

  if (!evento) return notFound()

  const { data: pareja } = await admin
    .from('parejas')
    .select('nombre_1, nombre_2')
    .eq('id', evento.pareja_id)
    .single()

  const parejaNombres = pareja
    ? `${pareja.nombre_1} & ${pareja.nombre_2}`
    : evento.nombre_evento

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center px-4 py-20 text-center border-b border-[#2A2A2A]">
        <p className="text-[#C9A84C] text-xs uppercase tracking-widest mb-4">
          Con alegría os invitan
        </p>
        <h1 className="font-cormorant text-6xl md:text-8xl text-white leading-tight mb-4">
          {parejaNombres}
        </h1>
        <div className="w-16 h-px bg-[#C9A84C]/40 mb-6" />
        <p className="text-[#9CA3AF] text-base">
          {formatFecha(evento.fecha_evento, evento.hora_evento)}
        </p>
      </section>

      {/* Detalles */}
      <section className="max-w-lg mx-auto px-4 py-12 space-y-8">

        {/* Lugar */}
        {evento.lugar_nombre && (
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-[12px] p-6">
            <p className="text-[#9CA3AF] text-xs uppercase tracking-widest mb-2">Lugar</p>
            <p className="text-white text-lg font-medium">{evento.lugar_nombre}</p>
            {evento.lugar_direccion && (
              <p className="text-[#9CA3AF] text-sm mt-1">{evento.lugar_direccion}</p>
            )}
            {evento.lugar_maps_url && (
              <a
                href={evento.lugar_maps_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-4 text-[#C9A84C] text-sm hover:underline"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                Ver en Google Maps
              </a>
            )}
          </div>
        )}

        {/* Countdown */}
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-[12px] p-6 text-center">
          <p className="text-[#9CA3AF] text-xs uppercase tracking-widest mb-6">
            Faltan
          </p>
          <CountdownEvento
            fechaEvento={evento.fecha_evento}
            horaEvento={evento.hora_evento}
          />
        </div>

        {/* Dress code */}
        {evento.dress_code && (
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-[12px] p-6">
            <p className="text-[#9CA3AF] text-xs uppercase tracking-widest mb-2">
              Dress code
            </p>
            <p className="text-white">{evento.dress_code}</p>
          </div>
        )}

        {/* Cuenta regalo */}
        {evento.cuenta_regalo && (
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-[12px] p-6">
            <p className="text-[#9CA3AF] text-xs uppercase tracking-widest mb-2">
              Cuenta regalo
            </p>
            <p className="text-white font-mono text-sm break-all">
              {evento.cuenta_regalo}
            </p>
          </div>
        )}

        {/* CTA confirmar — solo si viene con token */}
        {token && (
          <a
            href={`/rsvp/${token}`}
            className="block w-full text-center bg-[#C9A84C] hover:bg-[#b8943e] text-[#0A0A0A] font-semibold text-sm px-6 py-4 rounded-full transition-colors"
          >
            Confirmar asistencia
          </a>
        )}
      </section>

      <div className="text-center py-8 text-[#9CA3AF]/30 text-xs">
        SoomosNova
      </div>
    </div>
  )
}
