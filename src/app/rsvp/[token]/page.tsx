import { createAdminClient } from '@/lib/supabase/admin'
import type { Metadata } from 'next'
import Image from 'next/image'
import RSVPForm from '@/components/invitado/RSVPForm'
import { PageTransition } from '@/components/ui/PageTransition'
import { SITE_CONFIG } from '@/lib/constants'

interface PageProps {
  params: Promise<{ token: string }>
  searchParams: Promise<{ cambiar?: string }>
}

/** Máximo de cambios permitidos por invitado */
const MAX_CAMBIOS = 3

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

export default async function RSVPPage({ params, searchParams }: PageProps) {
  const { token } = await params
  const { cambiar } = await searchParams
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
      <PageTransition>
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
            href={`${SITE_CONFIG.whatsappUrl}?text=Hola%2C+tengo+un+problema+con+mi+RSVP+de+SoomosNova`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#C9A84C] hover:bg-[#b8943e] text-[#0A0A0A] font-semibold text-sm px-6 py-3 rounded-full transition-colors"
          >
            Contactar soporte
          </a>
        </div>
      </PageTransition>
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

  // Ya confirmó y no pidió cambiar: mostrar pantalla de confirmación con QR
  if (
    confirmacionExistente &&
    cambiar !== '1' &&
    (invitado.estado_confirmacion === 'confirmado' ||
      invitado.estado_confirmacion === 'rechazo')
  ) {
    const { data: evento } = await admin
      .from('eventos')
      .select('nombre_evento, slug')
      .eq('id', invitado.evento_id)
      .single()

    return (
      <PageTransition>
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

          <div className="flex flex-col items-center gap-3 mt-2">
            {evento && (
              <a
                href={`/evento/${evento.slug}`}
                className="text-[#9CA3AF] text-sm hover:text-white transition-colors underline"
              >
                Ver detalles del evento
              </a>
            )}
            <a
              href={`/rsvp/${token}?cambiar=1`}
              className="text-[#9CA3AF] text-xs hover:text-white transition-colors underline"
            >
              Cambiar mi respuesta
            </a>
          </div>
        </div>
      </PageTransition>
    )
  }

  // ── Verificar límite de cambios ─────────────────────────────────────────────
  // Si el invitado ya tenía una confirmación previa y llega con ?cambiar=1,
  // es una reconfirmación. El límite de MAX_CAMBIOS previene abuso.
  //
  // TODO: Para un tracking exacto del count (más allá de detectar si es la
  // primera reconfirmación), agregar migración:
  //   ALTER TABLE confirmaciones ADD COLUMN cambios_count INT DEFAULT 0;
  // y en la API hacer: cambios_count = cambios_count + 1 en cada UPDATE.
  const isReconfirmation = cambiar === '1' && !!confirmacionExistente

  // Leer el cambios_count desde la confirmación existente.
  // Si la columna no existe en DB, el campo será undefined y se tratará como 0.
  // Una vez ejecutada la migración, este valor será el count real.
  const cambiosCount = (confirmacionExistente as { cambios_count?: number } | null)
    ?.cambios_count ?? 0

  // Si ya alcanzó el límite máximo de cambios, mostrar pantalla de bloqueo
  if (isReconfirmation && cambiosCount >= MAX_CAMBIOS) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-4 py-12 text-center">
          <div className="text-[#C9A84C] text-3xl mb-6 select-none">✦</div>
          <h1 className="font-cormorant text-4xl text-white mb-2">
            Límite de cambios alcanzado
          </h1>
          <p className="text-[#9CA3AF] mb-8 max-w-sm">
            {invitado.nombre}, alcanzaste el límite de {MAX_CAMBIOS} cambios en tu
            respuesta. Para modificarla, contactá directamente a los novios.
          </p>
          <a
            href={`${SITE_CONFIG.whatsappUrl}?text=Hola%2C+necesito+cambiar+mi+respuesta+de+RSVP+para+${encodeURIComponent(invitado.nombre)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#C9A84C] hover:bg-[#b8943e] text-[#0A0A0A] font-semibold text-sm px-6 py-3 rounded-full transition-colors"
          >
            Contactar a los novios
          </a>
        </div>
      </PageTransition>
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
      <PageTransition>
        <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-4 py-12 text-center">
          <p className="text-[#9CA3AF]">El evento no fue encontrado.</p>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <RSVPForm
        invitado={invitado}
        evento={evento}
        isReconfirmation={isReconfirmation}
      />
    </PageTransition>
  )
}
