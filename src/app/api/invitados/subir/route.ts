import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateQRBulk } from '@/lib/qr'
import type { TablesInsert } from '@/types/database'

interface FilaInvitado {
  nombre?: string
  Nombre?: string
  NOMBRE?: string
  telefono?: string
  Telefono?: string
  TELEFONO?: string
  email?: string
  Email?: string
  EMAIL?: string
  [key: string]: unknown
}

interface ResultadoSubida {
  creados: number
  errores: number
  total: number
  detalles?: string[]
}

/**
 * Normaliza el valor de una celda a string limpio, o null si vacío.
 */
function normalizeCell(val: unknown): string | null {
  if (val === undefined || val === null || val === '') return null
  return String(val).trim()
}

/**
 * Extrae un campo por múltiples variantes de nombre de columna.
 */
function getField(row: FilaInvitado, keys: string[]): string | null {
  for (const key of keys) {
    const val = normalizeCell(row[key])
    if (val) return val
  }
  return null
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Verificar sesión
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autenticado.' }, { status: 401 })
  }

  // Obtener pareja y evento
  const { data: pareja } = await supabase
    .from('parejas')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  if (!pareja) {
    return NextResponse.json({ error: 'Pareja no encontrada.' }, { status: 404 })
  }

  const { data: evento } = await supabase
    .from('eventos')
    .select('id')
    .eq('pareja_id', pareja.id)
    .single()

  if (!evento) {
    return NextResponse.json(
      { error: 'Primero debés configurar tu evento antes de subir invitados.' },
      { status: 400 }
    )
  }

  // Parsear el form data
  const formData = await request.formData()
  const archivo = formData.get('archivo')

  if (!archivo || !(archivo instanceof File)) {
    return NextResponse.json({ error: 'No se recibió ningún archivo.' }, { status: 400 })
  }

  const ext = archivo.name.split('.').pop()?.toLowerCase()
  if (ext !== 'xlsx' && ext !== 'csv') {
    return NextResponse.json(
      { error: 'Formato no soportado. Solo .xlsx o .csv.' },
      { status: 400 }
    )
  }

  // Parsear con XLSX
  const buffer = await archivo.arrayBuffer()
  let rows: FilaInvitado[]

  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' })
    const sheetName = workbook.SheetNames[0]
    if (!sheetName) {
      return NextResponse.json({ error: 'El archivo está vacío.' }, { status: 400 })
    }
    const sheet = workbook.Sheets[sheetName]
    rows = XLSX.utils.sheet_to_json<FilaInvitado>(sheet, { defval: '' })
  } catch {
    return NextResponse.json({ error: 'Error al parsear el archivo.' }, { status: 400 })
  }

  if (rows.length === 0) {
    return NextResponse.json({ error: 'El archivo no tiene datos.' }, { status: 400 })
  }

  // Procesar filas
  const admin = createAdminClient()
  const invitadosACrear: TablesInsert<'invitados'>[] = []
  const errores: string[] = []

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const fila = i + 2 // fila 1 es el header

    const nombre = getField(row as FilaInvitado, ['nombre', 'Nombre', 'NOMBRE', 'name', 'Name'])
    if (!nombre) {
      errores.push(`Fila ${fila}: falta el nombre`)
      continue
    }

    const telefono = getField(row as FilaInvitado, [
      'telefono',
      'Telefono',
      'TELEFONO',
      'phone',
      'Phone',
      'celular',
      'Celular',
    ])
    const email = getField(row as FilaInvitado, ['email', 'Email', 'EMAIL', 'correo', 'Correo'])

    if (!telefono && !email) {
      errores.push(`Fila ${fila}: "${nombre}" no tiene teléfono ni email`)
      continue
    }

    invitadosACrear.push({
      evento_id: evento.id,
      nombre,
      telefono,
      email,
      estado_envio: 'pendiente_envio',
      estado_confirmacion: 'pendiente',
    })
  }

  if (invitadosACrear.length === 0) {
    return NextResponse.json<ResultadoSubida>(
      { creados: 0, errores: errores.length, total: rows.length, detalles: errores },
      { status: 200 }
    )
  }

  // Insertar en bulk
  const { data: insertados, error: insertError } = await admin
    .from('invitados')
    .insert(invitadosACrear)
    .select('id, token')

  if (insertError || !insertados) {
    return NextResponse.json(
      { error: `Error al insertar invitados: ${insertError?.message ?? 'desconocido'}` },
      { status: 500 }
    )
  }

  // Generar QRs en bulk
  const qrInput = insertados.map((inv) => ({
    id: inv.id,
    token: inv.token,
    eventoId: evento.id,
  }))

  const qrResults = await generateQRBulk(qrInput)

  const qrOk = qrResults.size
  const qrFailed = insertados.length - qrOk

  if (qrFailed > 0) {
    errores.push(`${qrFailed} QR(s) no se generaron correctamente`)
  }

  const resultado: ResultadoSubida = {
    creados: insertados.length,
    errores: errores.length,
    total: rows.length,
    detalles: errores.length > 0 ? errores : undefined,
  }

  return NextResponse.json(resultado, { status: 200 })
}
