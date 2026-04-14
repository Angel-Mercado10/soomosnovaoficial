import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

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

  // Buscar invitado por token
  const { data: invitado, error: invitadoError } = await admin
    .from('invitados')
    .select('*')
    .eq('token', token)
    .is('deleted_at', null)
    .single()

  if (invitadoError || !invitado) {
    return NextResponse.json(
      { success: false, error: 'Token inválido o invitado no encontrado' },
      { status: 404 }
    )
  }

  // Buscar evento
  const { data: evento, error: eventoError } = await admin
    .from('eventos')
    .select('*')
    .eq('id', invitado.evento_id)
    .single()

  if (eventoError || !evento) {
    return NextResponse.json(
      { success: false, error: 'Evento no encontrado' },
      { status: 404 }
    )
  }

  // Crear registro en confirmaciones
  const { error: confirmError } = await admin.from('confirmaciones').insert({
    invitado_id: invitado.id,
    evento_id: evento.id,
    asiste,
    opcion_menu: opcion_menu ?? null,
    lleva_acompanante: lleva_acompanante ?? false,
  })

  if (confirmError) {
    // Si ya existe una confirmación (unique constraint) igual devolvemos success
    if (!confirmError.message.includes('duplicate') && !confirmError.message.includes('unique')) {
      return NextResponse.json(
        { success: false, error: 'Error al registrar confirmación' },
        { status: 500 }
      )
    }
  }

  // Determinar nuevo estado de confirmación
  let nuevoEstado: 'confirmado' | 'rechazo' | 'pendiente_decision'
  if (pendiente_decision) {
    nuevoEstado = 'pendiente_decision'
  } else if (asiste) {
    nuevoEstado = 'confirmado'
  } else {
    nuevoEstado = 'rechazo'
  }

  // Actualizar estado del invitado
  const { data: invitadoActualizado, error: updateError } = await admin
    .from('invitados')
    .update({ estado_confirmacion: nuevoEstado })
    .eq('id', invitado.id)
    .select('*')
    .single()

  if (updateError) {
    return NextResponse.json(
      { success: false, error: 'Error al actualizar estado del invitado' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    invitado: invitadoActualizado,
    evento,
  })
}
