import { ImageResponse } from 'next/og'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

export const runtime = 'edge'

export const alt = 'Invitación — SoomosNova'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function OpengraphImage({ params }: Props) {
  const { slug } = await params

  // On edge runtime we cannot use the server-only admin wrapper;
  // we use @supabase/supabase-js directly with the service-role key (server-side only).
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: evento } = await supabase
    .from('eventos')
    .select('id, nombre_evento, fecha_evento, slug, pareja_id')
    .eq('slug', slug)
    .single()

  const { data: pareja } = evento?.pareja_id
    ? await supabase
        .from('parejas')
        .select('nombre_1, nombre_2')
        .eq('id', evento.pareja_id)
        .single()
    : { data: null }

  const titulo = pareja
    ? `${pareja.nombre_1} & ${pareja.nombre_2}`
    : evento?.nombre_evento ?? 'SoomosNova'

  const subtitulo = evento?.nombre_evento ?? 'Tu invitación digital'

  let fechaStr = ''
  if (evento?.fecha_evento) {
    const date = new Date(evento.fecha_evento + 'T12:00:00')
    fechaStr = date.toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    fechaStr = fechaStr.charAt(0).toUpperCase() + fechaStr.slice(1)
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          backgroundColor: '#0A0A0A',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Georgia, serif',
          position: 'relative',
        }}
      >
        {/* Gold border frame */}
        <div
          style={{
            position: 'absolute',
            inset: '24px',
            border: '1px solid rgba(201, 168, 76, 0.25)',
            borderRadius: '16px',
          }}
        />

        {/* Decorative corner accents */}
        <div style={{ position: 'absolute', top: '40px', left: '40px', color: '#C9A84C', fontSize: '20px' }}>✦</div>
        <div style={{ position: 'absolute', top: '40px', right: '40px', color: '#C9A84C', fontSize: '20px' }}>✦</div>
        <div style={{ position: 'absolute', bottom: '40px', left: '40px', color: '#C9A84C', fontSize: '20px' }}>✦</div>
        <div style={{ position: 'absolute', bottom: '40px', right: '40px', color: '#C9A84C', fontSize: '20px' }}>✦</div>

        {/* Content */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '0 80px', textAlign: 'center' }}>
          <p style={{ color: '#C9A84C', fontSize: '14px', letterSpacing: '0.2em', textTransform: 'uppercase', margin: '0' }}>
            Con alegría os invitan
          </p>

          <h1 style={{ color: '#FFFFFF', fontSize: '72px', fontWeight: 'bold', margin: '0', lineHeight: '1.1' }}>
            {titulo}
          </h1>

          <div style={{ width: '80px', height: '1px', backgroundColor: 'rgba(201, 168, 76, 0.5)' }} />

          {subtitulo !== titulo && (
            <p style={{ color: '#C9A84C', fontSize: '24px', margin: '0', fontStyle: 'italic' }}>
              {subtitulo}
            </p>
          )}

          {fechaStr && (
            <p style={{ color: '#9CA3AF', fontSize: '18px', margin: '0' }}>
              {fechaStr}
            </p>
          )}
        </div>

        {/* Watermark */}
        <p style={{ position: 'absolute', bottom: '44px', color: 'rgba(156, 163, 175, 0.4)', fontSize: '13px', margin: '0', letterSpacing: '0.1em' }}>
          SOOMOSNOVA.COM
        </p>
      </div>
    ),
    { ...size }
  )
}
