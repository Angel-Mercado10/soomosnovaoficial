import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCloudinaryConfig, generateUploadSignature } from '@/lib/album'

interface UploadSignatureBody {
  eventoId: string
  invitadoToken: string
}

export async function POST(req: NextRequest) {
  const config = getCloudinaryConfig()

  if (!config) {
    return NextResponse.json(
      { success: false, error: 'Cloudinary no configurado' },
      { status: 503 }
    )
  }

  let body: UploadSignatureBody

  try {
    body = (await req.json()) as UploadSignatureBody
  } catch {
    return NextResponse.json(
      { success: false, error: 'Cuerpo inválido' },
      { status: 400 }
    )
  }

  const { eventoId, invitadoToken } = body

  if (!eventoId) {
    return NextResponse.json(
      { success: false, error: 'eventoId es requerido' },
      { status: 400 }
    )
  }

  if (!invitadoToken) {
    return NextResponse.json(
      { success: false, error: 'Se requiere token de invitado para subir fotos' },
      { status: 401 }
    )
  }

  const admin = createAdminClient()

  const { data: evento, error: eventoError } = await admin
    .from('eventos')
    .select('id, album_activo')
    .eq('id', eventoId)
    .single()

  if (eventoError || !evento) {
    return NextResponse.json(
      { success: false, error: 'Evento no encontrado' },
      { status: 404 }
    )
  }

  if (!evento.album_activo) {
    return NextResponse.json(
      { success: false, error: 'El álbum no está activo' },
      { status: 403 }
    )
  }

  const { data: invitado } = await admin
    .from('invitados')
    .select('id')
    .eq('token', invitadoToken)
    .eq('evento_id', eventoId)
    .is('deleted_at', null)
    .single()

  if (!invitado) {
    return NextResponse.json(
      { success: false, error: 'Token de invitado inválido' },
      { status: 403 }
    )
  }

  const result = generateUploadSignature(config, eventoId)

  return NextResponse.json(result)
}
