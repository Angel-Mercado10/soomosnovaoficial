'use client'

import { useState } from 'react'

interface BotonEnviarInvitacionesProps {
  pendientes: number
}

export function BotonEnviarInvitaciones({ pendientes }: BotonEnviarInvitacionesProps) {
  const [cargando, setCargando] = useState(false)
  const [mensaje, setMensaje] = useState<{ tipo: 'exito' | 'error'; texto: string } | null>(null)
  const [enviados, setEnviados] = useState(0)

  const totalPendientes = pendientes - enviados

  async function handleEnviar() {
    setCargando(true)
    setMensaje(null)

    try {
      const res = await fetch('/api/make/enviar-invitaciones', { method: 'POST' })
      const data = (await res.json()) as {
        success?: boolean
        enviados?: number
        mensaje?: string
        error?: string
      }

      if (!res.ok) {
        setMensaje({ tipo: 'error', texto: data.error ?? 'Ocurrió un error. Intentá de nuevo.' })
        return
      }

      const cantEnviados = data.enviados ?? 0
      setEnviados((prev) => prev + cantEnviados)
      setMensaje({
        tipo: 'exito',
        texto:
          cantEnviados > 0
            ? `${cantEnviados} invitación${cantEnviados !== 1 ? 'es' : ''} enviada${cantEnviados !== 1 ? 's' : ''} correctamente`
            : (data.mensaje ?? 'No hay invitados pendientes'),
      })
    } catch {
      setMensaje({ tipo: 'error', texto: 'Error de conexión. Intentá de nuevo.' })
    } finally {
      setCargando(false)
    }
  }

  if (totalPendientes <= 0) {
    return (
      <div className="flex items-center gap-2 text-[#9CA3AF] text-sm">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        Todas las invitaciones fueron enviadas
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleEnviar}
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
            Enviando...
          </>
        ) : (
          `Enviar invitaciones (${totalPendientes} pendiente${totalPendientes !== 1 ? 's' : ''})`
        )}
      </button>
      {mensaje && (
        <p
          className={`text-xs ${
            mensaje.tipo === 'exito' ? 'text-[#C9A84C]' : 'text-red-400'
          }`}
        >
          {mensaje.texto}
        </p>
      )}
    </div>
  )
}
