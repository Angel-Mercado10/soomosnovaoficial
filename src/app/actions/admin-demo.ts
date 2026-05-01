'use server'

import 'server-only'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { VALID_TEMPLATES, type CrearDemoInput, type CrearDemoResult, type EventoCreado, type Template } from '@/lib/admin-demo-types'

// ─────────────────────────────────────────────────────────────────────────────
// Helpers internos
// ─────────────────────────────────────────────────────────────────────────────

function limpiarSlug(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function generarSlugBase(nombre1: string, nombre2: string, fecha: string): string {
  const date = new Date(fecha)
  const mes = date.toLocaleString('es-MX', { month: 'long' }).toLowerCase()
  const anio = date.getFullYear()
  return `${limpiarSlug(nombre1)}-y-${limpiarSlug(nombre2)}-${limpiarSlug(mes)}-${anio}`
}

function generarPin(): string {
  const array = new Uint32Array(1)
  crypto.getRandomValues(array)
  return String(100000 + (array[0] % 900000))
}

function generarPasswordAleatorio(): string {
  const bytes = new Uint8Array(24)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

// ─────────────────────────────────────────────────────────────────────────────
// Verificar que el caller es super_admin
// ─────────────────────────────────────────────────────────────────────────────

async function verificarAdmin(): Promise<string | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const adminSupabase = createAdminClient()
  const { data: authUser } = await adminSupabase.auth.admin.getUserById(user.id)

  const role = (authUser?.user?.app_metadata as Record<string, unknown>)?.role as
    | string
    | undefined

  return role === 'super_admin' ? user.id : null
}

// ─────────────────────────────────────────────────────────────────────────────
// Crear un evento + invitados demo para una pareja ya creada
// ─────────────────────────────────────────────────────────────────────────────

async function crearEventoConInvitados(
  adminClient: ReturnType<typeof createAdminClient>,
  parejaId: string,
  input: CrearDemoInput,
  template: Template,
  slugSufijo?: string,
): Promise<EventoCreado> {
  const slugBase = generarSlugBase(input.nombre_1, input.nombre_2, input.fecha_evento)
  const slugConTemplate = slugSufijo ? `${slugBase}-${slugSufijo}` : slugBase
  const pin_venue = generarPin()

  // Intentar con slug base; si hay colisión, agregar timestamp
  let slug = slugConTemplate
  let { data: eventoData, error: eventoError } = await adminClient
    .from('eventos')
    .insert({
      pareja_id: parejaId,
      nombre_evento: input.nombre_evento.trim().slice(0, 500),
      slug,
      fecha_evento: input.fecha_evento,
      hora_evento: input.hora_evento ?? null,
      lugar_nombre: input.lugar_nombre?.slice(0, 500) ?? null,
      lugar_direccion: input.lugar_direccion?.slice(0, 500) ?? null,
      dress_code: input.dress_code?.slice(0, 200) ?? null,
      opciones_menu: ['Pollo', 'Res', 'Vegetariano'],
      permite_acompanante: false,
      album_activo: false,
      pin_venue,
      estado_pago: 'pendiente' as const,
      template,
    })
    .select('id, slug')
    .single()

  if (eventoError?.code === '23505') {
    // Colisión de slug — agregar sufijo temporal
    const ts = Date.now().toString(36)
    slug = `${slugConTemplate}-${ts}`
    const retry = await adminClient
      .from('eventos')
      .insert({
        pareja_id: parejaId,
        nombre_evento: input.nombre_evento.trim().slice(0, 500),
        slug,
        fecha_evento: input.fecha_evento,
        hora_evento: input.hora_evento ?? null,
        lugar_nombre: input.lugar_nombre?.slice(0, 500) ?? null,
        lugar_direccion: input.lugar_direccion?.slice(0, 500) ?? null,
        dress_code: input.dress_code?.slice(0, 200) ?? null,
        opciones_menu: ['Pollo', 'Res', 'Vegetariano'],
        permite_acompanante: false,
        album_activo: false,
        pin_venue,
        estado_pago: 'pendiente' as const,
        template,
      })
      .select('id, slug')
      .single()

    eventoData = retry.data
    eventoError = retry.error
  }

  if (eventoError || !eventoData) {
    throw new Error(`Error al crear evento (template: ${template}): ${eventoError?.message}`)
  }

  // Insertar invitados
  const invitadosInsert = input.invitados.map((inv) => ({
    evento_id: eventoData!.id,
    nombre: inv.nombre.trim().slice(0, 200),
    email: inv.email?.trim() || null,
    telefono: inv.telefono?.trim() || null,
  }))

  const { data: invitadosData, error: invError } = await adminClient
    .from('invitados')
    .insert(invitadosInsert)
    .select('nombre, token')

  if (invError) {
    throw new Error(`Error al crear invitados: ${invError.message}`)
  }

  return {
    id: eventoData.id,
    slug: eventoData.slug,
    template,
    invitados: invitadosData ?? [],
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Server Action principal
// ─────────────────────────────────────────────────────────────────────────────

export async function crearDemo(input: CrearDemoInput): Promise<CrearDemoResult> {
  // 1. Verificar admin
  const adminUserId = await verificarAdmin()
  if (!adminUserId) {
    return { success: false, error: 'No autorizado. Se requiere rol super_admin.' }
  }

  // 2. Validaciones mínimas
  if (!input.nombre_1?.trim() || !input.nombre_2?.trim()) {
    return { success: false, error: 'Los nombres de la pareja son obligatorios.' }
  }
  if (!input.email_contacto?.trim()) {
    return { success: false, error: 'El email de contacto es obligatorio.' }
  }
  if (!input.nombre_evento?.trim()) {
    return { success: false, error: 'El nombre del evento es obligatorio.' }
  }
  if (!input.fecha_evento) {
    return { success: false, error: 'La fecha del evento es obligatoria.' }
  }
  if (!input.invitados || input.invitados.length === 0) {
    return { success: false, error: 'Debe incluir al menos un invitado demo.' }
  }
  if (!VALID_TEMPLATES.includes(input.template)) {
    return { success: false, error: 'Template inválido.' }
  }

  const adminClient = createAdminClient()
  let phantomUserId: string | null = null
  let parejaId: string | null = null

  try {
    // 3. Crear phantom auth user
    const phantomEmail = `demo-${crypto.randomUUID().slice(0, 8)}@soomosnova.internal`
    const phantomPassword = generarPasswordAleatorio()

    const { data: phantomUser, error: authError } = await adminClient.auth.admin.createUser({
      email: phantomEmail,
      password: phantomPassword,
      email_confirm: true,
      user_metadata: {
        tipo: 'demo',
        nombre_1: input.nombre_1,
        nombre_2: input.nombre_2,
        creado_por: adminUserId,
      },
    })

    if (authError || !phantomUser?.user) {
      throw new Error(`Error al crear usuario phantom: ${authError?.message}`)
    }
    phantomUserId = phantomUser.user.id

    // 4. Crear o completar pareja.
    // El trigger de Supabase `handle_new_user` puede crear una fila en parejas
    // automáticamente al crear el auth user. Si eso ocurre, la reutilizamos y
    // la actualizamos con los datos reales del demo para evitar violar
    // `parejas_auth_user_id_key`.
    const parejaPayload = {
      nombre_1: input.nombre_1.trim().slice(0, 200),
      nombre_2: input.nombre_2.trim().slice(0, 200),
      email: input.email_contacto.trim().slice(0, 300),
      telefono: input.telefono?.trim().slice(0, 50) ?? null,
      plan: input.plan,
    }

    const { data: parejaExistente, error: parejaExistenteError } = await adminClient
      .from('parejas')
      .select('id')
      .eq('auth_user_id', phantomUserId)
      .maybeSingle()

    if (parejaExistenteError) {
      throw new Error(`Error al verificar pareja demo: ${parejaExistenteError.message}`)
    }

    const { data: parejaData, error: parejaError } = parejaExistente
      ? await adminClient
          .from('parejas')
          .update(parejaPayload)
          .eq('id', parejaExistente.id)
          .select('id')
          .single()
      : await adminClient
          .from('parejas')
          .insert({
            auth_user_id: phantomUserId,
            ...parejaPayload,
          })
          .select('id')
          .single()

    if (parejaError || !parejaData) {
      throw new Error(`Error al crear pareja: ${parejaError?.message}`)
    }
    parejaId = parejaData.id

    // 5. Crear evento(s)
    const eventosCreados: EventoCreado[] = []

    if (input.crear_paquete) {
      // Paquete: 5 eventos, uno por cada template
      for (const tpl of VALID_TEMPLATES) {
        const evento = await crearEventoConInvitados(adminClient, parejaId, input, tpl, tpl)
        eventosCreados.push(evento)
      }
    } else {
      // Solo el template seleccionado
      const evento = await crearEventoConInvitados(adminClient, parejaId, input, input.template)
      eventosCreados.push(evento)
    }

    revalidatePath('/admin')
    revalidatePath('/admin/demos')
    revalidatePath('/admin/parejas')

    return {
      success: true,
      eventos: eventosCreados,
      pareja_id: parejaId,
    }
  } catch (err) {
    // Cleanup razonable: si pareja ya se creó, intentar soft-delete
    // Si solo se creó el auth user, intentar eliminarlo
    if (parejaId) {
      try {
        await adminClient
          .from('parejas')
          .update({ deleted_at: new Date().toISOString() })
          .eq('id', parejaId)
      } catch {
        // ignorar error de cleanup
      }
    }
    if (phantomUserId && !parejaId) {
      // Solo si la pareja no llegó a crearse
      try {
        await adminClient.auth.admin.deleteUser(phantomUserId)
      } catch {
        // ignorar error de cleanup
      }
    }

    const message = err instanceof Error ? err.message : 'Error desconocido al crear demo.'
    return { success: false, error: message }
  }
}
