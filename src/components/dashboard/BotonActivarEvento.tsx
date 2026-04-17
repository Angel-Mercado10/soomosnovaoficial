'use client'

import { useState } from 'react'

export function BotonActivarEvento() {
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleActivar() {
    setCargando(true)
    setError(null)

    try {
      const res = await fetch('/api/stripe/crear-sesion', { method: 'POST' })
      const data = (await res.json()) as { url?: string; error?: string }

      if (!res.ok || !data.url) {
        setError(data.error ?? 'Ocurrió un error. Intentá de nuevo.')
        return
      }

      window.location.href = data.url
    } catch {
      setError('Error de conexión. Intentá de nuevo.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleActivar}
        disabled={cargando}
        className="inline-flex items-center gap-2 bg-[#C9A84C] text-[#0A0A0A] font-semibold text-sm px-6 py-2.5 rounded-full hover:bg-[#B8943E] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {cargando ? (
          <>
            <svg
              className="animate-spin"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            Redirigiendo...
          </>
        ) : (
          'Activar evento — $2,999 MXN'
        )}
      </button>
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  )
}
