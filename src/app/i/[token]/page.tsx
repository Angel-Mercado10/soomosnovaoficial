import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { InvitacionTemplate } from '@/components/invitado/templates'
import { SITE_CONFIG } from '@/lib/constants'

interface PageProps {
  params: Promise<{ token: string }>
}

async function marcarVista(invitadoId: string) {
  try {
    const admin = createAdminClient()
    await admin
      .from('invitados')
      .update({ vista_at: new Date().toISOString() })
      .eq('id', invitadoId)
      .is('vista_at', null)
  } catch {
    // No crítico — tracking de vista, no bloquea la experiencia
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { token } = await params
  const admin = createAdminClient()

  const { data: invitado } = await admin
    .from('invitados')
    .select('nombre, evento_id')
    .eq('token', token)
    .single()

  if (!invitado) {
    return { title: 'Invitación — SoomosNova' }
  }

  const { data: evento } = await admin
    .from('eventos')
    .select('nombre_evento')
    .eq('id', invitado.evento_id)
    .single()

  return {
    title: `Invitación para ${invitado.nombre} — ${evento?.nombre_evento ?? 'SoomosNova'}`,
    description: 'Tu invitación personal al evento.',
  }
}

export default async function InvitacionPage({ params }: PageProps) {
  const { token } = await params
  const admin = createAdminClient()

  const { data: invitado } = await admin
    .from('invitados')
    .select('id, nombre, token, evento_id, qr_url, estado_confirmacion, estado_envio')
    .eq('token', token)
    .is('deleted_at', null)
    .single()

  if (!invitado) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-4 py-12 text-center">
        <div className="text-[#C9A84C] text-3xl mb-6 select-none">✦</div>
        <h1 className="font-cormorant text-4xl text-white mb-3">
          Invitación no encontrada
        </h1>
        <p className="text-[#9CA3AF] mb-8 max-w-sm">
          El enlace que usaste no es válido o ya no está disponible.
          Si creés que es un error, contactanos.
        </p>
        <a
          href={`${SITE_CONFIG.whatsappUrl}?text=Hola%2C+tengo+un+problema+con+mi+invitaci%C3%B3n+de+SoomosNova`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#C9A84C] hover:bg-[#b8943e] text-[#0A0A0A] font-semibold text-sm px-6 py-3 rounded-full transition-colors"
        >
          Contactar soporte
        </a>
      </div>
    )
  }

  const { data: evento } = await admin
    .from('eventos')
    .select('id, nombre_evento, fecha_evento, hora_evento, lugar_nombre, lugar_direccion, lugar_maps_url, dress_code, slug, template, pareja_id')
    .eq('id', invitado.evento_id)
    .single()

  if (!evento) return notFound()

  const { data: pareja } = await admin
    .from('parejas')
    .select('nombre_1, nombre_2')
    .eq('id', evento.pareja_id)
    .single()

  void marcarVista(invitado.id)

  const parejaNombres = pareja
    ? `${pareja.nombre_1} & ${pareja.nombre_2}`
    : evento.nombre_evento

  return (
    <InvitacionTemplate
      invitado={invitado}
      evento={evento}
      parejaNombres={parejaNombres}
    />
  )
}
