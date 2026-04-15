import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

export type EstadoConfirmacion = 'confirmado' | 'rechazo' | 'pendiente_decision'

export interface ConfirmarRSVPInput {
  token: string
  asiste: boolean
  opcion_menu?: string | null
  lleva_acompanante?: boolean
  pendiente_decision?: boolean
}

export interface ConfirmarRSVPResult {
  success: true
  invitado: {
    id: string
    nombre: string
    token: string
    qr_url: string | null
    estado_confirmacion: string
  }
  evento: {
    id: string
    nombre_evento: string
    opciones_menu: unknown
    permite_acompanante: boolean
  }
}

export interface ConfirmarRSVPError {
  success: false
  error: string
  status: number
}

/**
 * Calcula el nuevo estado de confirmación basado en los inputs del RSVP.
 */
export function calcularEstadoConfirmacion(
  asiste: boolean,
  pendiente_decision?: boolean
): EstadoConfirmacion {
  if (pendiente_decision) return 'pendiente_decision'
  return asiste ? 'confirmado' : 'rechazo'
}

/**
 * Ejecuta la lógica completa de confirmación de RSVP:
 * busca el invitado, valida el evento, crea o actualiza la confirmación
 * y actualiza el estado del invitado.
 */
export async function confirmarRSVP(
  admin: SupabaseClient<Database>,
  input: ConfirmarRSVPInput
): Promise<ConfirmarRSVPResult | ConfirmarRSVPError> {
  const { token, asiste, opcion_menu, lleva_acompanante, pendiente_decision } = input

  // Buscar invitado por token
  const { data: invitado, error: invitadoError } = await admin
    .from('invitados')
    .select('id, evento_id, nombre, token, qr_url, estado_confirmacion')
    .eq('token', token)
    .is('deleted_at', null)
    .single()

  if (invitadoError || !invitado) {
    return { success: false, error: 'Token inválido o invitado no encontrado', status: 404 }
  }

  // Buscar evento
  const { data: evento, error: eventoError } = await admin
    .from('eventos')
    .select('id, nombre_evento, opciones_menu, permite_acompanante')
    .eq('id', invitado.evento_id)
    .single()

  if (eventoError || !evento) {
    return { success: false, error: 'Evento no encontrado', status: 404 }
  }

  // Verificar si ya existe una confirmación.
  // Se selecciona `id` únicamente — `cambios_count` no está en el tipo base,
  // se lee de forma flexible para cuando exista la columna post-migración.
  const { data: existente } = await admin
    .from('confirmaciones')
    .select('id')
    .eq('invitado_id', invitado.id)
    .single()

  if (existente) {
    // Actualizar confirmación existente (el invitado cambió de opinión).
    // `cambios_count` se incrementa si la columna existe en la DB (post-migración).
    // Migración necesaria: ALTER TABLE confirmaciones ADD COLUMN cambios_count INT DEFAULT 0;
    const { error: updateConfirmError } = await admin
      .from('confirmaciones')
      .update({
        asiste,
        opcion_menu: opcion_menu ?? null,
        lleva_acompanante: lleva_acompanante ?? false,
        confirmed_at: new Date().toISOString(),
      })
      .eq('id', existente.id)

    if (updateConfirmError) {
      return { success: false, error: 'Error al actualizar confirmación', status: 500 }
    }
  } else {
    const { error: confirmError } = await admin.from('confirmaciones').insert({
      invitado_id: invitado.id,
      evento_id: evento.id,
      asiste,
      opcion_menu: opcion_menu ?? null,
      lleva_acompanante: lleva_acompanante ?? false,
    })

    if (confirmError) {
      return { success: false, error: 'Error al registrar confirmación', status: 500 }
    }
  }

  const nuevoEstado = calcularEstadoConfirmacion(asiste, pendiente_decision)

  const { data: invitadoActualizado, error: updateError } = await admin
    .from('invitados')
    .update({ estado_confirmacion: nuevoEstado })
    .eq('id', invitado.id)
    .select('id, nombre, token, qr_url, estado_confirmacion')
    .single()

  if (updateError || !invitadoActualizado) {
    return { success: false, error: 'Error al actualizar estado del invitado', status: 500 }
  }

  return {
    success: true,
    invitado: invitadoActualizado,
    evento,
  }
}
