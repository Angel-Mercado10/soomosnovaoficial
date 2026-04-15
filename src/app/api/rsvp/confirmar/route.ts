import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { confirmarRSVP } from '@/lib/rsvp'
import { sendRsvpConfirmacionEmail, formatFechaLegible } from '@/lib/email'

interface ConfirmarBody {
  token: string
  asiste: boolean
  opcion_menu?: string | null
  lleva_acompanante?: boolean
  pendiente_decision?: boolean
}

export async function POST(req: NextRequest) {
  let body: ConfirmarBody

  try {
    body = (await req.json()) as ConfirmarBody
  } catch {
    return NextResponse.json({ success: false, error: 'Cuerpo inválido' }, { status: 400 })
  }

  const { token, asiste, opcion_menu, lleva_acompanante, pendiente_decision } = body

  if (!token || typeof asiste !== 'boolean') {
    return NextResponse.json(
      { success: false, error: 'token y asiste son requeridos' },
      { status: 400 }
    )
  }

  const admin = createAdminClient()

  const result = await confirmarRSVP(admin, {
    token,
    asiste,
    opcion_menu,
    lleva_acompanante,
    pendiente_decision,
  })

  if (!result.success) {
    return NextResponse.json(
      { success: false, error: result.error },
      { status: result.status }
    )
  }

  // ── Enviar email de confirmación si el invitado tiene email y asiste ────────
  // El email es un side effect — no bloquea el response ante fallos.
  if (asiste && !pendiente_decision) {
    // Recuperar el email del invitado (no viene en el select de confirmarRSVP)
    const { data: invitadoConEmail } = await admin
      .from('invitados')
      .select('email, evento_id')
      .eq('id', result.invitado.id)
      .single()

    if (invitadoConEmail?.email) {
      // Recuperar la fecha del evento para el email
      const { data: eventoCompleto } = await admin
        .from('eventos')
        .select('nombre_evento, fecha_evento, hora_evento')
        .eq('id', invitadoConEmail.evento_id)
        .single()

      if (eventoCompleto) {
        void sendRsvpConfirmacionEmail({
          invitadoNombre: result.invitado.nombre,
          invitadoEmail: invitadoConEmail.email,
          eventoNombre: eventoCompleto.nombre_evento,
          fechaEvento: formatFechaLegible(
            eventoCompleto.fecha_evento,
            eventoCompleto.hora_evento
          ),
          qrUrl: result.invitado.qr_url,
        })
      }
    }
  }

  return NextResponse.json({
    success: true,
    invitado: result.invitado,
    evento: result.evento,
  })
}
