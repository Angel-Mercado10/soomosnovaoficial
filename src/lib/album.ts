import crypto from 'crypto'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const MAX_FILE_SIZE_MB = 50

export interface CloudinaryConfig {
  cloudName: string
  apiKey: string
  apiSecret: string
}

export interface SignatureResult {
  signature: string
  timestamp: number
  cloudName: string
  apiKey: string
  folder: string
  maxFileSize: number
}

export interface GuardarFotoInput {
  cloudinary_public_id: string
  url_original: string
  url_thumbnail: string
  tipo: 'foto' | 'video'
  evento_id: string
  invitado_token?: string | null
}

export interface GuardarFotoResult {
  success: true
  foto: { id: string }
}

export interface GuardarFotoError {
  success: false
  error: string
  status: number
}

/**
 * Lee y valida la configuración de Cloudinary desde las variables de entorno.
 */
export function getCloudinaryConfig(): CloudinaryConfig | null {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!cloudName || !apiKey || !apiSecret) return null

  return { cloudName, apiKey, apiSecret }
}

/**
 * Genera la firma para un upload directo a Cloudinary.
 */
export function generateUploadSignature(
  config: CloudinaryConfig,
  eventoId: string
): SignatureResult {
  const timestamp = Math.round(Date.now() / 1000)
  const folder = `soomosnova/album/${eventoId}`

  const paramsToSign = `folder=${folder}&timestamp=${timestamp}${config.apiSecret}`
  const signature = crypto.createHash('sha1').update(paramsToSign).digest('hex')

  return {
    signature,
    timestamp,
    cloudName: config.cloudName,
    apiKey: config.apiKey,
    folder,
    maxFileSize: MAX_FILE_SIZE_MB * 1024 * 1024,
  }
}

/**
 * Valida que las URLs de la foto pertenezcan a Cloudinary.
 */
export function validateCloudinaryUrls(urlOriginal: string, urlThumbnail: string): boolean {
  return (
    urlOriginal.includes('cloudinary.com') && urlThumbnail.includes('cloudinary.com')
  )
}

/**
 * Guarda una foto en la base de datos, resolviendo el invitado_id desde su token.
 */
export async function guardarFoto(
  admin: SupabaseClient<Database>,
  input: GuardarFotoInput
): Promise<GuardarFotoResult | GuardarFotoError> {
  const {
    cloudinary_public_id,
    url_original,
    url_thumbnail,
    tipo,
    evento_id,
    invitado_token,
  } = input

  // Verificar que el evento existe y tiene álbum activo
  const { data: evento, error: eventoError } = await admin
    .from('eventos')
    .select('id, album_activo')
    .eq('id', evento_id)
    .single()

  if (eventoError || !evento) {
    return { success: false, error: 'Evento no encontrado', status: 404 }
  }

  if (!evento.album_activo) {
    return { success: false, error: 'El álbum no está activo para este evento', status: 403 }
  }

  // Resolver invitado_id desde token
  let invitado_id: string | null = null
  if (invitado_token) {
    const { data: invitado } = await admin
      .from('invitados')
      .select('id')
      .eq('token', invitado_token)
      .eq('evento_id', evento_id)
      .single()

    if (invitado) {
      invitado_id = invitado.id
    }
  }

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

  if (insertError || !foto) {
    return { success: false, error: 'Error al guardar la foto', status: 500 }
  }

  return { success: true, foto }
}
