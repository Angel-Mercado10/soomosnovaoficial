import { createAdminClient } from '@/lib/supabase/admin'
import type { Metadata } from 'next'
import Image from 'next/image'
import RSVPForm from '@/components/invitado/RSVPForm'

interface PageProps {
  params: Promise<{ token: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { token } = await params
  const admin = createAdminClient()
  const { data: invitado } = await admin
    .from('invitados')
    .select('nombre')
    .eq('token', token)
    .single()

  return {
    title: invitado
      ? `RSVP de ${invitado.nombre} — SoomosNova`
      : 'RSVP — SoomosNova',
  }
}

export default async function RSVPPage({ params }: PageProps) {
  const { token } = await params
  const admin = createAdminClient()

  const { data: invitado } = await admin
    .from('invitados')
    .select('*')
    .eq('token', token)
    .is('deleted_at', null)
    .single()

  // Token inválido
  if (!invitado) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-4 py-12 text-center">
        <div className="text-[#C9A84C] text-3xl mb-6 select-none">✦</div>
        <h1 className="font-cormorant text-4xl text-white mb-3">
          Enlace inválido
        </h1>
        <p className="text-[#9CA3AF] mb-8 max-w-sm">
          No encontramos una invitación vinculada a este enlace.
          Si crees que es un error, escribinos por WhatsApp.
        </p>
        <a
          href="https://wa.me/5491100000000?text=Hola%2C+tengo+un+problema+con+mi+RSVP+de+SoomosNova"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#C9A84C] hover:bg-[#b8943e] text-[#0A0A0A] font-semibold text-sm px-6 py-3 rounded-full transition-colors"
        >
          Contactar soporte
        </a>
      </div>
    )
  }

  // Buscar confirmación existente
  const { data: confirmacionExistente } = await admin
    .from('confirmaciones')
    .select('*')
    .eq('invitado_id', invitado.id)
    .order('confirmed_at', { ascending: false })
    .limit(1)
    .single()

  // Ya confirmó: mostrar pantalla de confirmación con QR
  if (
    confirmacionExistente &&
    (invitado.estado_confirmacion === 'confirmado' ||
      invitado.estado_confirmacion === 'rechazo')
  ) {
    const { data: evento } = await admin
      .from('eventos')
      .select('nombre_evento, slug')
      .eq('id', invitado.evento_id)
      .single()

    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-4 py-12 text-center">
        <div className="text-[#C9A84C] text-3xl mb-6 select-none">✦</div>
        <h1 className="font-cormorant text-4xl text-white mb-2">
          Ya confirmaste tu asistencia
        </h1>
        <p className="text-[#9CA3AF] mb-6 max-w-sm">
          {confirmacionExistente.asiste
            ? `¡Genial, ${invitado.nombre}! Nos vemos en el evento.`
            : `Entendemos, ${invitado.nombre}. Gracias por avisarnos.`}
        </p>

        {confirmacionExistente.asiste && invitado.qr_url && (
          <div className="bg-white rounded-[12px] p-4 mb-4 shadow-lg">
            <Image
              src={invitado.qr_url}
              alt="Tu QR de entrada"
              width={180}
              height={180}
            />
          </div>
        )}

        {confirmacionExistente.asiste && invitado.qr_url && (
          <a
            href={invitado.qr_url}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#C9A84C] hover:bg-[#b8943e] text-[#0A0A0A] font-semibold text-sm px-6 py-3 rounded-full transition-colors mb-4"
          >
            Descargar QR
          </a>
        )}

        {evento && (
          <a
            href={`/evento/${evento.slug}`}
            className="text-[#9CA3AF] text-sm hover:text-white transition-colors underline"
          >
            Ver detalles del evento
          </a>
        )}
      </div>
    )
  }

  // Formulario RSVP
  const { data: evento } = await admin
    .from('eventos')
    .select('*')
    .eq('id', invitado.evento_id)
    .single()

  if (!evento) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-4 py-12 text-center">
        <p className="text-[#9CA3AF]">El evento no fue encontrado.</p>
      </div>
    )
  }

  return <RSVPForm invitado={invitado} evento={evento} />
}
