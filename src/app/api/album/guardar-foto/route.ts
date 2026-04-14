import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

interface GuardarFotoBody {
  cloudinary_public_id: string
  url_original: string
  url_thumbnail: string
  tipo: 'foto' | 'video'
  evento_id: string
  invitado_token?: string | null
}

export async function POST(req: NextRequest) {
  let body: GuardarFotoBody

  try {
    body = (await req.json()) as GuardarFotoBody
  } catch {
    return NextResponse.json({ success: false, error: 'Cuerpo inválido' }, { status: 400 })
  }

  const {
    cloudinary_public_id,
    url_original,
    url_thumbnail,
    tipo,
    evento_id,
    invitado_token,
  } = body

  if (!cloudinary_public_id || !url_original || !url_thumbnail || !tipo || !evento_id) {
    return NextResponse.json(
      { success: false, error: 'Faltan campos requeridos' },
      { status: 400 }
    )
  }

  if (tipo !== 'foto' && tipo !== 'video') {
    return NextResponse.json(
      { success: false, error: 'tipo debe ser "foto" o "video"' },
      { status: 400 }
    )
  }

  const admin = createAdminClient()

  // Verificar que el evento existe
  const { data: evento, error: eventoError } = await admin
    .from('eventos')
    .select('id, album_activo')
    .eq('id', evento_id)
    .single()

  if (eventoError || !evento) {
    return NextResponse.json(
      { success: false, error: 'Evento no encontrado' },
      { status: 404 }
    )
  }

  if (!evento.album_activo) {
    return NextResponse.json(
      { success: false, error: 'El álbum no está activo para este evento' },
      { status: 403 }
    )
  }

  // Resolver invitado_id desde token si se proveyó
  let invitado_id: string | null = null
  if (invitado_token) {
    const { data: invitado } = await admin
      .from('invitados')
      .select('id')
      .eq('token', invitado_token)
      .single()

    if (invitado) {
      invitado_id = invitado.id
    }
  }

  // Insertar foto
  const { data: foto, error: insertError } = await admin
    .from('fotos')
    .insert({
      evento_id,
      invitado_id,
      cloudinary_public_id,
      url_original,
      url_thumbnail,
      tipo,
      oculto: false,
    })
    .select('id')
    .single()

  if (insertError) {
    return NextResponse.json(
      { success: false, error: 'Error al guardar la foto' },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true, foto })
}
