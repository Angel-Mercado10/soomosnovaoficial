import { Resend } from 'resend'

interface RsvpConfirmacionEmailInput {
  /** Nombre del invitado */
  invitadoNombre: string
  /** Email del invitado */
  invitadoEmail: string
  /** Nombre del evento (ej: "Boda de Ana & Luis") */
  eventoNombre: string
  /** Fecha del evento en formato legible (ej: "Sábado 14 de Febrero · 19:00") */
  fechaEvento: string
  /** URL del QR de entrada (si existe) */
  qrUrl: string | null
}

function formatFechaLegible(fecha: string, hora: string | null): string {
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

export { formatFechaLegible }

/**
 * Envía el email de confirmación de RSVP al invitado.
 * Si el invitado no tiene email, retorna sin hacer nada.
 * Si el envío falla, loga el error pero NO bloquea el flujo RSVP.
 */
export async function sendRsvpConfirmacionEmail(
  input: RsvpConfirmacionEmailInput
): Promise<void> {
  const { invitadoNombre, invitadoEmail, eventoNombre, fechaEvento, qrUrl } = input

  const resend = new Resend(process.env.RESEND_API_KEY)
  const fromEmail = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev'

  const qrSection = qrUrl
    ? `
      <div style="text-align: center; margin: 32px 0 24px;">
        <p style="color: #9CA3AF; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 16px;">
          Tu código de entrada
        </p>
        <img
          src="${qrUrl}"
          alt="Código QR de entrada"
          width="180"
          height="180"
          style="border-radius: 12px; border: 1px solid #2A2A2A; background: white; padding: 12px; display: inline-block;"
        />
        <p style="color: #9CA3AF; font-size: 12px; margin-top: 12px;">
          Guardá este QR — lo necesitarás en la entrada del evento.
        </p>
        <a
          href="${qrUrl}"
          target="_blank"
          style="display: inline-block; margin-top: 12px; background: #C9A84C; color: #0A0A0A; font-weight: 600; font-size: 13px; padding: 10px 24px; border-radius: 100px; text-decoration: none;"
        >
          Descargar QR
        </a>
      </div>
    `
    : `
      <div style="margin: 24px 0; padding: 16px; background: #1A1A1A; border: 1px solid #2A2A2A; border-radius: 8px; text-align: center;">
        <p style="color: #9CA3AF; font-size: 13px; margin: 0;">
          Tu código QR estará disponible pronto. Volvé a visitar tu invitación.
        </p>
      </div>
    `

  const html = `
    <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; background: #0A0A0A; color: #ffffff; padding: 40px 32px; border-radius: 16px;">

      <!-- Header -->
      <div style="text-align: center; margin-bottom: 32px;">
        <span style="font-size: 22px; font-weight: 600; color: #ffffff;">Soomos</span>
        <span style="font-size: 22px; font-weight: 600; color: #C9A84C;">Nova</span>
      </div>

      <!-- Ornamento -->
      <div style="text-align: center; color: #C9A84C; font-size: 18px; margin-bottom: 24px;">✦</div>

      <!-- Título -->
      <h1 style="font-size: 28px; font-weight: 400; text-align: center; color: #ffffff; margin: 0 0 8px; line-height: 1.3;">
        ¡Asistencia confirmada!
      </h1>
      <p style="text-align: center; color: #9CA3AF; font-size: 14px; margin: 0 0 32px;">
        ${invitadoNombre}, tu lugar en el evento está reservado.
      </p>

      <!-- Separador -->
      <div style="border-top: 1px solid #2A2A2A; margin: 0 0 28px;"></div>

      <!-- Detalles del evento -->
      <div style="margin-bottom: 28px;">
        <p style="color: #9CA3AF; font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; margin: 0 0 8px;">
          Evento
        </p>
        <p style="color: #ffffff; font-size: 20px; margin: 0 0 16px; font-weight: 400;">
          ${eventoNombre}
        </p>

        <p style="color: #9CA3AF; font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; margin: 0 0 8px;">
          Fecha y hora
        </p>
        <p style="color: #ffffff; font-size: 15px; margin: 0;">
          ${fechaEvento}
        </p>
      </div>

      <!-- Separador -->
      <div style="border-top: 1px solid #2A2A2A; margin: 0 0 28px;"></div>

      <!-- QR Section -->
      ${qrSection}

      <!-- Footer -->
      <div style="border-top: 1px solid #2A2A2A; margin-top: 32px; padding-top: 24px; text-align: center; color: #4A4A4A; font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em;">
        SoomosNova
      </div>
    </div>
  `

  try {
    await resend.emails.send({
      from: fromEmail,
      to: invitadoEmail,
      subject: `Tu asistencia a ${eventoNombre} fue confirmada 🎉`,
      html,
    })
  } catch (err) {
    // No bloquear el flujo RSVP por fallo de email
    console.error('[sendRsvpConfirmacionEmail] Error al enviar email de confirmación:', err)
  }
}
