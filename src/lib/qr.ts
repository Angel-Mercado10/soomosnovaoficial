import QRCode from 'qrcode'
import { createAdminClient } from '@/lib/supabase/admin'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://soomosnova.com'

/**
 * Genera un QR PNG para un invitado y lo sube a Supabase Storage.
 * Guarda el registro en la tabla qr_codes y actualiza invitados.qr_url.
 *
 * @param invitadoId - UUID del invitado
 * @param token      - UUID token del invitado (aparece en la URL)
 * @param eventoId   - UUID del evento al que pertenece
 * @returns URL pública del QR en Supabase Storage
 */
export async function generateQR(
  invitadoId: string,
  token: string,
  eventoId: string
): Promise<string> {
  const invitacionUrl = `${APP_URL}/i/${token}`

  // Generar PNG en buffer
  const pngBuffer = await QRCode.toBuffer(invitacionUrl, {
    type: 'png',
    width: 400,
    margin: 2,
    color: {
      dark: '#0A0A0A',
      light: '#FFFFFF',
    },
    errorCorrectionLevel: 'H',
  })

  const admin = createAdminClient()

  const storagePath = `qr/${eventoId}/${invitadoId}.png`

  // Subir a Supabase Storage (bucket: qr-codes)
  const { error: uploadError } = await admin.storage
    .from('qr-codes')
    .upload(storagePath, pngBuffer, {
      contentType: 'image/png',
      upsert: true, // permite regenerar si ya existe
    })

  if (uploadError) {
    throw new Error(`Error al subir QR a Storage: ${uploadError.message}`)
  }

  // Obtener URL pública
  const { data: urlData } = admin.storage
    .from('qr-codes')
    .getPublicUrl(storagePath)

  const publicUrl = urlData.publicUrl

  // Verificar si ya existe un registro para este invitado
  const { data: existente } = await admin
    .from('qr_codes')
    .select('id')
    .eq('invitado_id', invitadoId)
    .single()

  // Guardar en tabla qr_codes
  const qrData = {
    invitado_id: invitadoId,
    evento_id: eventoId,
    storage_path: storagePath,
    public_url: publicUrl,
    ...(existente ? { regenerado_at: new Date().toISOString() } : {}),
  }

  const { error: qrError } = await admin
    .from('qr_codes')
    .upsert(qrData, { onConflict: 'invitado_id' })

  if (qrError) {
    throw new Error(`Error al guardar QR en base de datos: ${qrError.message}`)
  }

  // Actualizar invitados.qr_url
  const { error: invitadoError } = await admin
    .from('invitados')
    .update({ qr_url: publicUrl })
    .eq('id', invitadoId)

  if (invitadoError) {
    throw new Error(`Error al actualizar qr_url del invitado: ${invitadoError.message}`)
  }

  return publicUrl
}

/**
 * Genera QR para múltiples invitados en paralelo (con límite de concurrencia).
 * Usado en la carga masiva de CSV/Excel.
 */
export async function generateQRBulk(
  invitados: Array<{ id: string; token: string; eventoId: string }>,
  concurrencyLimit = 5
): Promise<Map<string, string>> {
  const results = new Map<string, string>()
  const errors: string[] = []

  // Procesar en batches para no saturar Storage
  for (let i = 0; i < invitados.length; i += concurrencyLimit) {
    const batch = invitados.slice(i, i + concurrencyLimit)

    const batchResults = await Promise.allSettled(
      batch.map(({ id, token, eventoId }) =>
        generateQR(id, token, eventoId).then((url) => ({ id, url }))
      )
    )

    for (const result of batchResults) {
      if (result.status === 'fulfilled') {
        results.set(result.value.id, result.value.url)
      } else {
        errors.push(result.reason?.message ?? 'Error desconocido')
      }
    }
  }

  if (errors.length > 0) {
    console.error(`[generateQRBulk] ${errors.length} errores:`, errors)
  }

  return results
}
