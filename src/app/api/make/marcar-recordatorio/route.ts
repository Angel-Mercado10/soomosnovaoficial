import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

interface MarcarRecordatorioBody {
  invitado_id: string
  tipo: 1 | 2
}

export async function POST(req: NextRequest) {
  // ── Verificar API key ────────────────────────────────────────────────────────
  const apiKey = req.headers.get('x-make-api-key')
  if (!apiKey || apiKey !== process.env.MAKE_API_KEY) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  // ── Parsear body ─────────────────────────────────────────────────────────────
  let body: MarcarRecordatorioBody
  try {
    body = (await req.json()) as MarcarRecordatorioBody
  } catch {
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 })
  }

  const { invitado_id, tipo } = body

  if (!invitado_id || (tipo !== 1 && tipo !== 2)) {
    return NextResponse.json(
      { error: 'invitado_id y tipo (1 o 2) son requeridos' },
      { status: 400 }
    )
  }

  const admin = createAdminClient()
  const ahora = new Date().toISOString()

  // ── Actualizar el campo correspondiente ──────────────────────────────────────
  const campo = tipo === 1 ? 'recordatorio_1_at' : 'recordatorio_2_at'

  const { error } = await admin
    .from('invitados')
    .update({ [campo]: ahora })
    .eq('id', invitado_id)

  if (error) {
    return NextResponse.json({ error: 'Error al actualizar invitado' }, { status: 500 })
  }

  return NextResponse.json({ success: true, campo, invitado_id })
}
