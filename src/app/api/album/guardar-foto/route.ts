import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { validateCloudinaryUrls, guardarFoto } from '@/lib/album'

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

  if (!validateCloudinaryUrls(url_original, url_thumbnail)) {
    return NextResponse.json(
      { success: false, error: 'URLs deben ser de Cloudinary' },
      { status: 400 }
    )
  }

  const admin = createAdminClient()

  const result = await guardarFoto(admin, {
    cloudinary_public_id,
    url_original,
    url_thumbnail,
    tipo,
    evento_id,
    invitado_token,
  })

  if (!result.success) {
    return NextResponse.json(
      { success: false, error: result.error },
      { status: result.status }
    )
  }

  return NextResponse.json({ success: true, foto: result.foto })
}
