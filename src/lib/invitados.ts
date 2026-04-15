import * as XLSX from 'xlsx'
import type { TablesInsert } from '@/types/database'

export interface FilaInvitado {
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

export interface ResultadoSubida {
  creados: number
  errores: number
  total: number
  detalles?: string[]
}

export interface InvitadoParseado {
  nombre: string
  telefono: string | null
  email: string | null
}

/**
 * Normaliza el valor de una celda a string limpio, o null si vacío.
 */
export function normalizeCell(val: unknown): string | null {
  if (val === undefined || val === null || val === '') return null
  return String(val).trim()
}

/**
 * Extrae un campo por múltiples variantes de nombre de columna.
 */
export function getField(row: FilaInvitado, keys: string[]): string | null {
  for (const key of keys) {
    const val = normalizeCell(row[key])
    if (val) return val
  }
  return null
}

/**
 * Parsea un archivo XLSX/CSV y retorna las filas como objetos.
 */
export function parseArchivoInvitados(buffer: ArrayBuffer): {
  rows: FilaInvitado[]
  error?: string
} {
  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' })
    const sheetName = workbook.SheetNames[0]
    if (!sheetName) return { rows: [], error: 'El archivo está vacío.' }
    const sheet = workbook.Sheets[sheetName]
    const rows = XLSX.utils.sheet_to_json<FilaInvitado>(sheet, { defval: '' })
    return { rows }
  } catch {
    return { rows: [], error: 'Error al parsear el archivo.' }
  }
}

/**
 * Valida y transforma filas crudas en invitados listos para insertar.
 * Retorna los invitados válidos y los errores encontrados.
 */
export function validarFilasInvitados(
  rows: FilaInvitado[],
  eventoId: string
): {
  invitados: TablesInsert<'invitados'>[]
  errores: string[]
} {
  const invitados: TablesInsert<'invitados'>[] = []
  const errores: string[] = []

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const fila = i + 2 // fila 1 es el header

    const nombre = getField(row, ['nombre', 'Nombre', 'NOMBRE', 'name', 'Name'])
    if (!nombre) {
      errores.push(`Fila ${fila}: falta el nombre`)
      continue
    }

    const telefono = getField(row, [
      'telefono',
      'Telefono',
      'TELEFONO',
      'phone',
      'Phone',
      'celular',
      'Celular',
    ])
    const email = getField(row, ['email', 'Email', 'EMAIL', 'correo', 'Correo'])

    if (!telefono && !email) {
      errores.push(`Fila ${fila}: "${nombre}" no tiene teléfono ni email`)
      continue
    }

    invitados.push({
      evento_id: eventoId,
      nombre,
      telefono,
      email,
      estado_envio: 'pendiente_envio',
      estado_confirmacion: 'pendiente',
    })
  }

  return { invitados, errores }
}
