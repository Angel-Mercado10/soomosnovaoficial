import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

interface UploadSignatureBody {
  eventoId: string
}

export async function POST(req: NextRequest) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  // Verificar configuración antes de procesar
  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json(
      {
        success: false,
        error: 'Cloudinary no configurado',
      },
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

  const { eventoId } = body

  if (!eventoId) {
    return NextResponse.json(
      { success: false, error: 'eventoId es requerido' },
      { status: 400 }
    )
  }

  const timestamp = Math.round(Date.now() / 1000)
  const folder = `soomosnova/album/${eventoId}`

  // Generar firma según Cloudinary spec
  // https://cloudinary.com/documentation/upload_images#generating_authentication_signatures
  const paramsToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`
  const signature = crypto
    .createHash('sha1')
    .update(paramsToSign)
    .digest('hex')

  return NextResponse.json({
    signature,
    timestamp,
    cloudName,
    apiKey,
    folder,
  })
}
