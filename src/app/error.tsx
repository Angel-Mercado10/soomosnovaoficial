'use client'

import { useEffect } from 'react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log del error para diagnóstico — en producción usar un servicio como Sentry
    console.error('[SoomosNova] Error boundary:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-4 text-center">
      <div className="text-[#C9A84C] text-3xl mb-6 select-none">✦</div>

      <p className="text-red-400 text-xs uppercase tracking-widest mb-4">Error inesperado</p>

      <h1 className="font-cormorant text-5xl md:text-6xl text-white mb-4">
        Algo salió mal
      </h1>

      <div className="w-16 h-px bg-[#C9A84C]/40 mx-auto mb-6" />

      <p className="text-[#9CA3AF] text-base max-w-sm mb-10">
        Ocurrió un problema inesperado. Podés intentar de nuevo o volver al inicio.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <button
          onClick={reset}
          className="bg-[#C9A84C] hover:bg-[#b8943e] text-[#0A0A0A] font-semibold text-sm px-6 py-3 rounded-full transition-colors"
        >
          Intentar de nuevo
        </button>
        <a
          href="/"
          className="border border-[#2A2A2A] hover:border-[#C9A84C]/40 text-[#9CA3AF] hover:text-white text-sm px-6 py-3 rounded-full transition-colors"
        >
          Volver al inicio
        </a>
      </div>

      <p className="text-[#9CA3AF]/30 text-xs mt-16">SoomosNova</p>
    </div>
  )
}
