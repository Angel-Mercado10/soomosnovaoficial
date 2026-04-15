import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateQRBulk } from '@/lib/qr'
import {
  parseArchivoInvitados,
  validarFilasInvitados,
  type ResultadoSubida,
} from '@/lib/invitados'

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

  const buffer = await archivo.arrayBuffer()
  const { rows, error: parseError } = parseArchivoInvitados(buffer)

  if (parseError) {
    return NextResponse.json({ error: parseError }, { status: 400 })
  }

  if (rows.length === 0) {
    return NextResponse.json({ error: 'El archivo no tiene datos.' }, { status: 400 })
  }

  const { invitados: invitadosACrear, errores } = validarFilasInvitados(rows, evento.id)

  if (invitadosACrear.length === 0) {
    return NextResponse.json<ResultadoSubida>(
      { creados: 0, errores: errores.length, total: rows.length, detalles: errores },
      { status: 200 }
    )
  }

  // Re-verificar ownership antes del insert (TOCTOU mitigation)
  const { data: eventoVerificado } = await supabase
    .from('eventos')
    .select('id')
    .eq('id', evento.id)
    .eq('pareja_id', pareja.id)
    .single()

  if (!eventoVerificado) {
    return NextResponse.json(
      { error: 'No autorizado para insertar invitados en este evento.' },
      { status: 403 }
    )
  }

  // Insertar en bulk
  const admin = createAdminClient()

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

  const qrFailed = insertados.length - qrResults.size
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
