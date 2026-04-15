import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import CountdownEvento from '@/components/invitado/CountdownEvento'
import { PageTransition } from '@/components/ui/PageTransition'

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ token?: string }>
}

/** Validates that a token is a safe UUID or alphanumeric-with-hyphens string. Prevents javascript: URI injection. */
function isSafeToken(value: string): boolean {
  return /^[a-zA-Z0-9\-_]{1,128}$/.test(value)
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
  const { token: rawToken } = await searchParams
  // Validate token to prevent javascript: URI injection via href
  const token = rawToken && isSafeToken(rawToken) ? rawToken : undefined
  const admin = createAdminClient()

  const { data: evento } = await admin
    .from('eventos')
    .select('id, pareja_id, nombre_evento, fecha_evento, hora_evento, lugar_nombre, lugar_direccion, lugar_maps_url, dress_code, cuenta_regalo, slug')
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

  const fechaFormateada = formatFecha(evento.fecha_evento, evento.hora_evento)

  return (
    <PageTransition>
    <div className="min-h-screen bg-[#0A0A0A] text-white">

      {/* ── HERO — full-width immersive, HIGH 17 ── */}
      <section className="relative flex flex-col items-center justify-center px-6 pt-24 pb-20 text-center overflow-hidden">
        {/* Ambient glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(201,168,76,0.10) 0%, transparent 70%)',
            filter: 'blur(48px)',
          }}
        />
        <p className="text-[#C9A84C] text-[11px] uppercase tracking-[0.3em] mb-5 relative z-10">
          Con alegría os invitamos
        </p>
        {/* Couple names — large serif */}
        <h1 className="font-cormorant text-5xl sm:text-7xl md:text-8xl text-white leading-tight mb-5 relative z-10">
          {parejaNombres}
        </h1>
        <div className="w-20 h-px bg-[#C9A84C]/40 mb-5 relative z-10" />
        <p className="text-[#9CA3AF] text-base sm:text-lg relative z-10">
          {fechaFormateada}
        </p>
      </section>

      {/* ── Decorative divider ── HIGH 17 */}
      <div className="flex items-center justify-center gap-3 px-8 mb-16">
        <div className="flex-1 max-w-24 h-px bg-[#C9A84C]/20" />
        <span className="text-[#C9A84C]/50 text-sm">✦</span>
        <div className="flex-1 max-w-24 h-px bg-[#C9A84C]/20" />
      </div>

      {/* ── Countdown — no card, ample whitespace ── */}
      <section className="flex flex-col items-center px-6 mb-16">
        <p className="text-[#C9A84C] text-[10px] uppercase tracking-[0.25em] mb-6">Faltan</p>
        <CountdownEvento
          fechaEvento={evento.fecha_evento}
          horaEvento={evento.hora_evento}
        />
      </section>

      {/* ── Thin divider ── */}
      <div className="flex items-center justify-center gap-3 px-8 mb-16">
        <div className="flex-1 max-w-32 h-px bg-[#C9A84C]/12" />
        <div className="w-1 h-1 rounded-full bg-[#C9A84C]/30" />
        <div className="flex-1 max-w-32 h-px bg-[#C9A84C]/12" />
      </div>

      {/* ── Details — ample whitespace, no card borders ── */}
      <div className="max-w-lg mx-auto px-6 space-y-14 pb-20">

        {/* Lugar — text-centered, serif heading */}
        {evento.lugar_nombre && (
          <section className="text-center">
            <p className="text-[#C9A84C] text-[10px] uppercase tracking-[0.25em] mb-3">Celebración</p>
            <p className="font-cormorant text-2xl sm:text-3xl text-white mb-1">{evento.lugar_nombre}</p>
            {evento.lugar_direccion && (
              <p className="text-[#9CA3AF] text-sm mt-1">{evento.lugar_direccion}</p>
            )}
            {evento.lugar_maps_url && (
              <a
                href={evento.lugar_maps_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-5 text-[#C9A84C] text-sm hover:underline underline-offset-4"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                Ver en Google Maps
              </a>
            )}
          </section>
        )}

        {evento.lugar_nombre && (
          <div className="w-12 h-px bg-[#C9A84C]/20 mx-auto" />
        )}

        {/* Dress code — elegant callout */}
        {evento.dress_code && (
          <section className="text-center">
            <p className="text-[#C9A84C] text-[10px] uppercase tracking-[0.25em] mb-3">Dress Code</p>
            <p className="font-cormorant text-xl sm:text-2xl text-white">{evento.dress_code}</p>
          </section>
        )}

        {evento.dress_code && (
          <div className="w-12 h-px bg-[#C9A84C]/20 mx-auto" />
        )}

        {/* Nuestra historia */}
        <section className="text-center">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-[#C9A84C]/15" />
            <p className="text-[#C9A84C] text-[10px] uppercase tracking-[0.25em] shrink-0">Nuestra Historia</p>
            <div className="flex-1 h-px bg-[#C9A84C]/15" />
          </div>
          <p className="font-cormorant text-4xl text-[#C9A84C] leading-none select-none mb-2">❝</p>
          <p className="font-cormorant text-xl sm:text-2xl text-white italic leading-relaxed max-w-sm mx-auto">
            Cada historia de amor es única. La nuestra comenzó con una mirada,
            creció con el tiempo y hoy se celebra con todos ustedes.
          </p>
          <p className="font-cormorant text-xl text-[#C9A84C] italic mt-4">— {parejaNombres}</p>
        </section>

        {/* Cuenta regalo — gift section */}
        {evento.cuenta_regalo && (
          <>
            <div className="w-12 h-px bg-[#C9A84C]/20 mx-auto" />
            <section className="text-center">
              <p className="text-[#C9A84C] text-[10px] uppercase tracking-[0.25em] mb-3">Regalo</p>
              <p className="font-cormorant text-lg text-white mb-3">Si deseás hacernos un obsequio</p>
              <p className="text-[#9CA3AF] font-mono text-sm break-all bg-[#141414] px-4 py-3 rounded-lg border border-[#2A2A2A] inline-block">
                {evento.cuenta_regalo}
              </p>
            </section>
          </>
        )}

      </div>

      {/* ── Decorative divider before CTA ── */}
      <div className="flex items-center justify-center gap-3 px-8 mb-10">
        <div className="flex-1 max-w-24 h-px bg-[#C9A84C]/20" />
        <span className="text-[#C9A84C]/50 text-sm">✦</span>
        <div className="flex-1 max-w-24 h-px bg-[#C9A84C]/20" />
      </div>

      {/* ── CTA — HIGH 17 ── */}
      <div className="flex flex-col items-center px-6 pb-20 gap-3">
        {token ? (
          <>
            <p className="text-[#9CA3AF] text-sm text-center mb-1">¿Ya confirmaste tu asistencia?</p>
            <a
              href={`/rsvp/${token}`}
              className="bg-[#C9A84C] hover:bg-[#b8943e] text-[#0A0A0A] font-cormorant font-semibold text-base tracking-wide px-8 py-4 transition-colors"
              style={{ letterSpacing: '0.06em' }}
            >
              Confirmar asistencia
            </a>
          </>
        ) : (
          <p className="text-[#9CA3AF]/40 text-xs text-center max-w-xs">
            Si recibiste una invitación personal, usá el link de tu invitación para confirmar.
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="text-center py-8 text-[#9CA3AF]/20 text-[10px] uppercase tracking-widest">
        SoomosNova
      </div>
    </div>
    </PageTransition>
  )
}
