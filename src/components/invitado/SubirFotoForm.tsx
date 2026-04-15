'use client'

import { useState, useRef } from 'react'

interface SubirFotoFormProps {
  eventoId: string
  invitadoToken?: string
}

interface SignatureResponse {
  signature: string
  timestamp: number
  cloudName: string
  apiKey: string
  folder: string
  error?: string
}

interface GuardarFotoResponse {
  success: boolean
  foto?: { id: string }
  error?: string
}

type UploadEstado = 'idle' | 'firmando' | 'subiendo' | 'guardando' | 'listo' | 'error'

const MAX_FILE_SIZE_MB = 50
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

export default function SubirFotoForm({
  eventoId,
  invitadoToken,
}: SubirFotoFormProps) {
  const [estado, setEstado] = useState<UploadEstado>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [progreso, setProgreso] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo
    const esImagen = file.type.startsWith('image/')
    const esVideo = file.type.startsWith('video/')
    if (!esImagen && !esVideo) {
      setEstado('error')
      setErrorMsg('Solo se permiten imágenes y videos.')
      return
    }

    // Validar tamaño
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setEstado('error')
      setErrorMsg(`El archivo es demasiado grande. Máximo ${MAX_FILE_SIZE_MB}MB.`)
      return
    }

    setErrorMsg(null)
    setProgreso(0)

    try {
      // 1. Obtener firma del servidor
      setEstado('firmando')
      const sigRes = await fetch('/api/album/upload-signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventoId }),
      })

      if (sigRes.status === 503) {
        const data: SignatureResponse = await sigRes.json()
        throw new Error(data.error ?? 'Cloudinary no configurado')
      }

      if (!sigRes.ok) {
        throw new Error('Error al obtener firma de upload')
      }

      const sig: SignatureResponse = await sigRes.json()

      // 2. Upload a Cloudinary via XMLHttpRequest para progreso
      setEstado('subiendo')
      const formData = new FormData()
      formData.append('file', file)
      formData.append('api_key', sig.apiKey)
      formData.append('timestamp', String(sig.timestamp))
      formData.append('signature', sig.signature)
      formData.append('folder', sig.folder)

      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${sig.cloudName}/auto/upload`

      const uploadRes = await new Promise<{
        public_id: string
        secure_url: string
        eager?: Array<{ secure_url: string }>
        resource_type: string
      }>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open('POST', cloudinaryUrl)
        xhr.upload.onprogress = (ev) => {
          if (ev.lengthComputable) {
            setProgreso(Math.round((ev.loaded / ev.total) * 100))
          }
        }
        xhr.onload = () => {
          if (xhr.status === 200) {
            resolve(JSON.parse(xhr.responseText))
          } else {
            reject(new Error('Error en el upload a Cloudinary'))
          }
        }
        xhr.onerror = () => reject(new Error('Error de red al subir archivo'))
        xhr.send(formData)
      })

      // 3. Guardar metadatos en Supabase
      setEstado('guardando')
      const thumbnail =
        uploadRes.eager?.[0]?.secure_url ?? uploadRes.secure_url

      const guardarRes = await fetch('/api/album/guardar-foto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cloudinary_public_id: uploadRes.public_id,
          url_original: uploadRes.secure_url,
          url_thumbnail: thumbnail,
          tipo: uploadRes.resource_type === 'video' ? 'video' : 'foto',
          evento_id: eventoId,
          invitado_token: invitadoToken ?? null,
        }),
      })

      const guardarData: GuardarFotoResponse = await guardarRes.json()
      if (!guardarData.success) {
        throw new Error(guardarData.error ?? 'Error al guardar la foto')
      }

      setEstado('listo')
      // Reset input
      if (inputRef.current) inputRef.current.value = ''
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error desconocido'
      setErrorMsg(msg)
      setEstado('error')
    }
  }

  function reset() {
    setEstado('idle')
    setErrorMsg(null)
    setProgreso(0)
  }

  const ocupado = estado === 'firmando' || estado === 'subiendo' || estado === 'guardando'

  return (
    <div className="flex flex-col items-center gap-3">
      {estado === 'listo' ? (
        <div className="flex flex-col items-center gap-2">
          <span className="text-[#C9A84C] text-2xl">✓</span>
          <p className="text-white text-sm">¡Foto agregada al álbum!</p>
          <button
            onClick={reset}
            className="text-[#9CA3AF] text-xs hover:text-white transition-colors underline"
          >
            Subir otra
          </button>
        </div>
      ) : (
        <>
          <label
            className={`inline-flex items-center gap-2 cursor-pointer bg-[#1A1A1A] hover:bg-[#222] border border-[#2A2A2A] hover:border-[#C9A84C]/40 text-white text-sm px-5 py-2.5 rounded-full transition-colors ${
              ocupado ? 'opacity-60 cursor-not-allowed' : ''
            }`}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            {ocupado ? 'Subiendo...' : 'Agregar al álbum'}
            <input
              ref={inputRef}
              type="file"
              accept="image/*,video/*"
              className="sr-only"
              onChange={handleFileChange}
              disabled={ocupado}
            />
          </label>

          {estado === 'subiendo' && progreso > 0 && (
            <div className="w-48 bg-[#2A2A2A] rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-[#C9A84C] h-full transition-all duration-200"
                style={{ width: `${progreso}%` }}
              />
            </div>
          )}

          {estado === 'error' && errorMsg && (
            <div className="flex flex-col items-center gap-1">
              <p className="text-red-400 text-xs text-center max-w-xs">{errorMsg}</p>
              <button
                onClick={reset}
                className="text-[#9CA3AF] text-xs hover:text-white transition-colors underline"
              >
                Intentar de nuevo
              </button>
            </div>
          )}

          {estado === 'firmando' && (
            <p className="text-[#9CA3AF] text-xs">Preparando upload...</p>
          )}
          {estado === 'guardando' && (
            <p className="text-[#9CA3AF] text-xs">Guardando foto...</p>
          )}
        </>
      )}
    </div>
  )
}
