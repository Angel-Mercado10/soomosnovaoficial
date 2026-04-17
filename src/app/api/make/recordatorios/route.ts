import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

const TRES_DIAS_MS = 3 * 24 * 60 * 60 * 1000
const CUATRO_DIAS_MS = 4 * 24 * 60 * 60 * 1000

export async function GET(req: NextRequest) {
  // ── Verificar API key ────────────────────────────────────────────────────────
  const apiKey = req.headers.get('x-make-api-key')
  if (!apiKey || apiKey !== process.env.MAKE_API_KEY) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const admin = createAdminClient()
  const ahora = new Date()

  // ── Obtener invitados pendientes de decisión en eventos activos ──────────────
  // Join manual: primero eventos pagados, luego invitados de esos eventos
  const { data: eventosPagados } = await admin
    .from('eventos')
    .select('id')
    .eq('estado_pago', 'pagado')
    .is('deleted_at', null)

  if (!eventosPagados || eventosPagados.length === 0) {
    return NextResponse.json({ recordatorio_1: [], recordatorio_2: [] })
  }

  const eventoIds = eventosPagados.map((e) => e.id)

  const { data: invitados } = await admin
    .from('invitados')
    .select('id, nombre, telefono, email, token, evento_id, enviado_at, recordatorio_1_at, recordatorio_2_at')
    .in('evento_id', eventoIds)
    .eq('estado_confirmacion', 'pendiente_decision')
    .is('deleted_at', null)

  if (!invitados || invitados.length === 0) {
    return NextResponse.json({ recordatorio_1: [], recordatorio_2: [] })
  }

  // ── Separar en listas según criterio de recordatorio ────────────────────────
  const recordatorio_1: typeof invitados = []
  const recordatorio_2: typeof invitados = []

  for (const inv of invitados) {
    const enviadoAt = inv.enviado_at ? new Date(inv.enviado_at).getTime() : null

    // Recordatorio 1: sin recordatorio previo y enviado hace más de 3 días
    if (
      inv.recordatorio_1_at === null &&
      enviadoAt !== null &&
      ahora.getTime() - enviadoAt > TRES_DIAS_MS
    ) {
      recordatorio_1.push(inv)
      continue
    }

    // Recordatorio 2: con recordatorio_1 pero sin recordatorio_2,
    // y recordatorio_1 fue hace más de 4 días
    if (
      inv.recordatorio_1_at !== null &&
      inv.recordatorio_2_at === null &&
      ahora.getTime() - new Date(inv.recordatorio_1_at).getTime() > CUATRO_DIAS_MS
    ) {
      recordatorio_2.push(inv)
    }
  }

  // ── Formatear respuesta con URLs de invitación ───────────────────────────────
  const formatear = (inv: (typeof invitados)[0]) => ({
    id: inv.id,
    nombre: inv.nombre,
    telefono: inv.telefono,
    email: inv.email,
    token: inv.token,
    evento_id: inv.evento_id,
    url_invitacion: `${process.env.NEXT_PUBLIC_APP_URL}/i/${inv.token}`,
    url_rsvp: `${process.env.NEXT_PUBLIC_APP_URL}/rsvp/${inv.token}`,
  })

  return NextResponse.json({
    recordatorio_1: recordatorio_1.map(formatear),
    recordatorio_2: recordatorio_2.map(formatear),
  })
}
