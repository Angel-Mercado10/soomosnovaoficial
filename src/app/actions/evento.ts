'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const MAX_FIELD_LENGTH = 500

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

function generarPin(): string {
  const array = new Uint32Array(1)
  crypto.getRandomValues(array)
  return String(100000 + (array[0] % 900000))
}

/** Only allows http:// and https:// URLs to prevent javascript: URI stored XSS */
function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:' || parsed.protocol === 'http:'
  } catch {
    return false
  }
}

function truncate(value: string | null, maxLen: number): string | null {
  if (!value) return null
  return value.slice(0, maxLen)
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
  const lugar_nombre = truncate(formData.get('lugar_nombre') as string, MAX_FIELD_LENGTH)
  const lugar_direccion = truncate(formData.get('lugar_direccion') as string, MAX_FIELD_LENGTH)
  const rawMapsUrl = truncate(formData.get('lugar_maps_url') as string, MAX_FIELD_LENGTH)
  // Validate URL to prevent javascript: URI stored XSS
  const lugar_maps_url = rawMapsUrl && isValidUrl(rawMapsUrl) ? rawMapsUrl : null
  const dress_code = truncate(formData.get('dress_code') as string, 200)
  const cuenta_regalo = truncate(formData.get('cuenta_regalo') as string, MAX_FIELD_LENGTH)
  const opciones_menu_raw = formData.get('opciones_menu') as string
  const permite_acompanante = formData.get('permite_acompanante') === 'on'
  const evento_id = formData.get('evento_id') as string | null

  const VALID_TEMPLATES = ['clasica', 'art-deco', 'celestial', 'botanical', 'romantica'] as const
  type Template = (typeof VALID_TEMPLATES)[number]
  const rawTemplate = formData.get('template') as string | null
  const template: Template = VALID_TEMPLATES.includes(rawTemplate as Template)
    ? (rawTemplate as Template)
    : 'clasica'

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

  let slug = generarSlug(nombre1, nombre2, fecha_evento)

  if (evento_id) {
    const { error } = await supabase
      .from('eventos')
      .update({
        nombre_evento: nombre_evento.trim().slice(0, MAX_FIELD_LENGTH),
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
        template,
      })
      .eq('id', evento_id)
      .eq('pareja_id', parejaId)

    if (error) {
      if (error.code === '23505') {
        return { success: false, error: 'Ya existe un evento con ese nombre y fecha. Probá con un nombre diferente.' }
      }
      return { success: false, error: 'Error al actualizar el evento. Intentá de nuevo.' }
    }
  } else {
    const pin_venue = generarPin()

    // Intentar insertar — si hay colisión de slug, agregar sufijo
    let { error } = await supabase.from('eventos').insert({
      pareja_id: parejaId,
      nombre_evento: nombre_evento.trim().slice(0, MAX_FIELD_LENGTH),
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
      template,
    })

    // Colisión de slug: agregar sufijo numérico
    if (error?.code === '23505') {
      const suffix = Math.floor(Math.random() * 9000 + 1000)
      slug = `${slug}-${suffix}`

      const retry = await supabase.from('eventos').insert({
        pareja_id: parejaId,
        nombre_evento: nombre_evento.trim().slice(0, MAX_FIELD_LENGTH),
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
        template,
      })
      error = retry.error
    }

    if (error) {
      return { success: false, error: 'Error al crear el evento. Intentá de nuevo.' }
    }
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/configuracion')

  return { success: true }
}
