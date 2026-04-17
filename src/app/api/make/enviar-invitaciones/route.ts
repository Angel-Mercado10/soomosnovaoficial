import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(_req: NextRequest) {
  // ── Autenticación ────────────────────────────────────────────────────────────
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const admin = createAdminClient()

  // ── Buscar pareja autenticada ────────────────────────────────────────────────
  const { data: pareja } = await admin
    .from('parejas')
    .select('id')
    .eq('auth_user_id', user.id)
    .is('deleted_at', null)
    .single()

  if (!pareja) {
    return NextResponse.json({ error: 'Pareja no encontrada' }, { status: 404 })
  }

  // ── Buscar evento y verificar estado de pago ─────────────────────────────────
  const { data: evento } = await admin
    .from('eventos')
    .select('id, nombre_evento, fecha_evento, hora_evento, lugar_nombre, slug, estado_pago')
    .eq('pareja_id', pareja.id)
    .is('deleted_at', null)
    .single()

  if (!evento) {
    return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 })
  }

  if (evento.estado_pago !== 'pagado') {
    return NextResponse.json(
      { error: 'El evento no está activado. Completá el pago primero.' },
      { status: 403 }
    )
  }

  // ── Obtener invitados pendientes de envío ────────────────────────────────────
  const { data: invitados } = await admin
    .from('invitados')
    .select('id, nombre, telefono, email, token, qr_url')
    .eq('evento_id', evento.id)
    .eq('estado_envio', 'pendiente_envio')
    .is('deleted_at', null)

  if (!invitados || invitados.length === 0) {
    return NextResponse.json({
      success: true,
      enviados: 0,
      mensaje: 'No hay invitados pendientes de envío',
    })
  }

  // ── Llamar al webhook de Make ────────────────────────────────────────────────
  const makeWebhookUrl = process.env.MAKE_WEBHOOK_ENVIO_MASIVO
  if (!makeWebhookUrl) {
    return NextResponse.json(
      { error: 'MAKE_WEBHOOK_ENVIO_MASIVO no configurado' },
      { status: 500 }
    )
  }

  const payload = {
    evento: {
      id: evento.id,
      nombre_evento: evento.nombre_evento,
      fecha_evento: evento.fecha_evento,
      hora_evento: evento.hora_evento,
      lugar_nombre: evento.lugar_nombre,
      slug: evento.slug,
    },
    invitados: invitados.map((inv) => ({
      id: inv.id,
      nombre: inv.nombre,
      telefono: inv.telefono,
      email: inv.email,
      url_invitacion: `${process.env.NEXT_PUBLIC_APP_URL}/i/${inv.token}`,
      url_rsvp: `${process.env.NEXT_PUBLIC_APP_URL}/rsvp/${inv.token}`,
      qr_url: inv.qr_url,
    })),
  }

  const makeRes = await fetch(makeWebhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!makeRes.ok) {
    return NextResponse.json({ error: 'Error al contactar Make' }, { status: 502 })
  }

  // ── Marcar invitados como enviados ───────────────────────────────────────────
  const ids = invitados.map((i) => i.id)
  await admin
    .from('invitados')
    .update({
      estado_envio: 'enviado',
      enviado_at: new Date().toISOString(),
    })
    .in('id', ids)

  return NextResponse.json({ success: true, enviados: invitados.length })
}
