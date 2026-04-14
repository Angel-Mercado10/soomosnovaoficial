'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Genera el slug del evento: {nombre1}-y-{nombre2}-{mes}-{año}
 * Todo lowercase, sin acentos, espacios → guiones
 */
function generarSlug(nombre1: string, nombre2: string, fecha: string): string {
  const date = new Date(fecha)
  const mes = date.toLocaleString('es-AR', { month: 'long' }).toLowerCase()
  const anio = date.getFullYear()

  const limpiar = (str: string): string =>
    str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

  return `${limpiar(nombre1)}-y-${limpiar(nombre2)}-${limpiar(mes)}-${anio}`
}

/**
 * Genera un PIN numérico de 6 dígitos
 */
function generarPin(): string {
  return String(Math.floor(100000 + Math.random() * 900000))
}

interface GuardarEventoResult {
  success: boolean
  error?: string
}

export async function guardarEvento(formData: FormData): Promise<GuardarEventoResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'No autenticado.' }
  }

  // Verificar que la pareja pertenece al usuario
  const parejaId = formData.get('pareja_id') as string
  const { data: pareja } = await supabase
    .from('parejas')
    .select('id')
    .eq('id', parejaId)
    .eq('auth_user_id', user.id)
    .single()

  if (!pareja) {
    return { success: false, error: 'No autorizado.' }
  }

  const nombre1 = formData.get('nombre_1') as string
  const nombre2 = formData.get('nombre_2') as string
  const nombre_evento = formData.get('nombre_evento') as string
  const fecha_evento = formData.get('fecha_evento') as string
  const hora_evento = (formData.get('hora_evento') as string) || null
  const lugar_nombre = (formData.get('lugar_nombre') as string) || null
  const lugar_direccion = (formData.get('lugar_direccion') as string) || null
  const lugar_maps_url = (formData.get('lugar_maps_url') as string) || null
  const dress_code = (formData.get('dress_code') as string) || null
  const cuenta_regalo = (formData.get('cuenta_regalo') as string) || null
  const opciones_menu_raw = formData.get('opciones_menu') as string
  const permite_acompanante = formData.get('permite_acompanante') === 'on'
  const evento_id = formData.get('evento_id') as string | null

  // Validaciones mínimas
  if (!nombre_evento?.trim()) {
    return { success: false, error: 'El nombre del evento es requerido.' }
  }
  if (!fecha_evento) {
    return { success: false, error: 'La fecha del evento es requerida.' }
  }

  let opciones_menu: string[] = []
  try {
    const parsed = JSON.parse(opciones_menu_raw ?? '[]')
    if (Array.isArray(parsed)) {
      opciones_menu = parsed.filter((o): o is string => typeof o === 'string')
    }
  } catch {
    opciones_menu = ['Pollo', 'Res', 'Vegetariano']
  }

  const slug = generarSlug(nombre1, nombre2, fecha_evento)

  if (evento_id) {
    // Update — mantener pin_venue existente
    const { error } = await supabase
      .from('eventos')
      .update({
        nombre_evento: nombre_evento.trim(),
        slug,
        fecha_evento,
        hora_evento,
        lugar_nombre,
        lugar_direccion,
        lugar_maps_url,
        dress_code,
        cuenta_regalo,
        opciones_menu,
        permite_acompanante,
      })
      .eq('id', evento_id)
      .eq('pareja_id', parejaId)

    if (error) {
      return { success: false, error: `Error al actualizar: ${error.message}` }
    }
  } else {
    // Insert — generar pin_venue
    const pin_venue = generarPin()

    const { error } = await supabase.from('eventos').insert({
      pareja_id: parejaId,
      nombre_evento: nombre_evento.trim(),
      slug,
      fecha_evento,
      hora_evento,
      lugar_nombre,
      lugar_direccion,
      lugar_maps_url,
      dress_code,
      cuenta_regalo,
      opciones_menu,
      permite_acompanante,
      pin_venue,
      album_activo: false,
      estado_pago: 'pendiente',
    })

    if (error) {
      return { success: false, error: `Error al crear: ${error.message}` }
    }
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/configuracion')

  return { success: true }
}
