'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface UploadResult {
  creados: number
  errores: number
  total: number
  detalles?: string[]
}

type EstadoUpload = 'idle' | 'uploading' | 'success' | 'error'

export function SubirInvitadosForm() {
  const router = useRouter()
  const [estado, setEstado] = useState<EstadoUpload>('idle')
  const [resultado, setResultado] = useState<UploadResult | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [archivo, setArchivo] = useState<File | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  const handleFile = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase()
    if (ext !== 'xlsx' && ext !== 'csv') {
      setErrorMsg('Solo se aceptan archivos .xlsx o .csv')
      return
    }
    setArchivo(file)
    setErrorMsg(null)
    setResultado(null)
    setEstado('idle')
  }

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!archivo) return

    setEstado('uploading')
    setErrorMsg(null)
    setResultado(null)

    const formData = new FormData()
    formData.append('archivo', archivo)

    try {
      const res = await fetch('/api/invitados/subir', {
        method: 'POST',
        body: formData,
      })

      const data: UploadResult | { error: string } = await res.json()

      if (!res.ok) {
        const err = data as { error: string }
        setErrorMsg(err.error ?? 'Error al procesar el archivo')
        setEstado('error')
        return
      }

      const result = data as UploadResult
      setResultado(result)
      setEstado('success')
      setArchivo(null)

      // Refresh de los datos del server
      router.refresh()
    } catch {
      setErrorMsg('Error de red. Intentá de nuevo.')
      setEstado('error')
    }
  }

  return (
    <div className="max-w-xl space-y-6">
      {/* Instrucciones */}
      <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-4">
        <h3 className="text-white text-sm font-medium mb-2">Formato del archivo</h3>
        <p className="text-[#9CA3AF] text-sm mb-2">
          El archivo debe tener al menos las siguientes columnas:
        </p>
        <ul className="text-[#9CA3AF] text-sm space-y-1 list-disc list-inside">
          <li>
            <span className="text-white font-mono text-xs bg-[#2A2A2A] px-1 rounded">nombre</span>{' '}
            (obligatorio)
          </li>
          <li>
            <span className="text-white font-mono text-xs bg-[#2A2A2A] px-1 rounded">telefono</span>{' '}
            y/o{' '}
            <span className="text-white font-mono text-xs bg-[#2A2A2A] px-1 rounded">email</span>{' '}
            (al menos uno)
          </li>
        </ul>
      </div>

      {/* Drop zone */}
      <form onSubmit={handleSubmit}>
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
            isDragOver
              ? 'border-[#C9A84C] bg-[#C9A84C]/5'
              : archivo
                ? 'border-[#C9A84C]/40 bg-[#1A1A1A]'
                : 'border-[#2A2A2A] hover:border-[#3A3A3A] bg-[#1A1A1A]'
          }`}
          onClick={() => document.getElementById('archivo-input')?.click()}
        >
          <input
            id="archivo-input"
            type="file"
            accept=".xlsx,.csv"
            className="hidden"
            onChange={handleInputChange}
          />

          {archivo ? (
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/20 flex items-center justify-center mx-auto">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <p className="text-white text-sm font-medium">{archivo.name}</p>
              <p className="text-[#9CA3AF] text-xs">
                {(archivo.size / 1024).toFixed(1)} KB — Hacé click para cambiar
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-full bg-[#2A2A2A] flex items-center justify-center mx-auto">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <p className="text-white text-sm">
                Arrastrá el archivo o hacé click
              </p>
              <p className="text-[#9CA3AF] text-xs">.xlsx o .csv</p>
            </div>
          )}
        </div>

        {/* Error de validación */}
        {errorMsg && (
          <div className="mt-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            <p className="text-red-400 text-sm">{errorMsg}</p>
          </div>
        )}

        {/* Botón submit */}
        <button
          type="submit"
          disabled={!archivo || estado === 'uploading'}
          className="mt-4 w-full bg-[#C9A84C] hover:bg-[#B8974B] disabled:bg-[#C9A84C]/30 disabled:cursor-not-allowed text-[#0A0A0A] font-semibold rounded-full py-3 px-8 transition-colors text-sm"
        >
          {estado === 'uploading' ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              Procesando...
            </span>
          ) : (
            'Subir invitados'
          )}
        </button>
      </form>

      {/* Resultado */}
      {resultado && estado === 'success' && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 space-y-2">
          <p className="text-green-400 font-medium text-sm">
            ✓ Archivo procesado correctamente
          </p>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="font-cormorant text-2xl text-[#C9A84C]">{resultado.creados}</p>
              <p className="text-[#9CA3AF] text-xs">Creados</p>
            </div>
            <div>
              <p className="font-cormorant text-2xl text-red-400">{resultado.errores}</p>
              <p className="text-[#9CA3AF] text-xs">Errores</p>
            </div>
            <div>
              <p className="font-cormorant text-2xl text-white">{resultado.total}</p>
              <p className="text-[#9CA3AF] text-xs">Total</p>
            </div>
          </div>
          {resultado.detalles && resultado.detalles.length > 0 && (
            <div className="mt-2 space-y-1">
              <p className="text-[#9CA3AF] text-xs font-medium">Detalles de errores:</p>
              {resultado.detalles.map((d, i) => (
                <p key={i} className="text-red-400 text-xs">{d}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
