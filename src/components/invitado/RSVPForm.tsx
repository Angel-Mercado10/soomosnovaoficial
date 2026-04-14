'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { Invitado, Evento } from '@/types/database'
import type { Json } from '@/types/database'

interface RSVPFormProps {
  invitado: Invitado
  evento: Evento
}

type AsistenciaOpt = 'si' | 'no' | 'talvez' | null

interface FormState {
  asiste: AsistenciaOpt
  opcion_menu: string
  lleva_acompanante: boolean
}

interface RSVPResponse {
  success: boolean
  invitado?: Invitado
  evento?: Evento
  error?: string
}

interface ConfirmacionExitosa {
  invitado: Invitado
  evento: Evento
}

function parseOpcionesMenu(opciones: Json): string[] {
  if (Array.isArray(opciones)) {
    return opciones.filter((o): o is string => typeof o === 'string')
  }
  return []
}

function BotonAsistencia({
  label,
  value,
  selected,
  onClick,
}: {
  label: string
  value: AsistenciaOpt
  selected: AsistenciaOpt
  onClick: (v: AsistenciaOpt) => void
}) {
  const isSelected = selected === value
  return (
    <button
      type="button"
      onClick={() => onClick(value)}
      className={`flex-1 py-3 px-4 rounded-full text-sm font-medium border transition-colors ${
        isSelected
          ? 'bg-[#C9A84C] border-[#C9A84C] text-[#0A0A0A]'
          : 'bg-transparent border-[#2A2A2A] text-[#9CA3AF] hover:border-[#C9A84C]/40 hover:text-white'
      }`}
    >
      {label}
    </button>
  )
}

export default function RSVPForm({ invitado, evento }: RSVPFormProps) {
  const [form, setForm] = useState<FormState>({
    asiste: null,
    opcion_menu: '',
    lleva_acompanante: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmado, setConfirmado] = useState<ConfirmacionExitosa | null>(null)

  const opcionesMenu = parseOpcionesMenu(evento.opciones_menu)
  const mostrarMenu = form.asiste === 'si' && opcionesMenu.length > 0
  const mostrarAcompanante = form.asiste === 'si' && evento.permite_acompanante

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.asiste) {
      setError('Por favor indicá si vas a asistir')
      return
    }
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/rsvp/confirmar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: invitado.token,
          asiste: form.asiste === 'si',
          opcion_menu: form.asiste === 'si' ? form.opcion_menu || null : null,
          lleva_acompanante:
            form.asiste === 'si' && evento.permite_acompanante
              ? form.lleva_acompanante
              : false,
          pendiente_decision: form.asiste === 'talvez',
        }),
      })

      const data: RSVPResponse = await res.json()

      if (!res.ok || !data.success) {
        setError(data.error ?? 'Ocurrió un error. Intentá de nuevo.')
        return
      }

      if (data.invitado && data.evento) {
        setConfirmado({ invitado: data.invitado, evento: data.evento })
      }
    } catch {
      setError('Error de red. Verificá tu conexión e intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  // ─── Pantalla de confirmación exitosa ───────────────────────────────────────
  if (confirmado) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-4 py-12">
        <div className="text-[#C9A84C] text-3xl mb-6">✦</div>
        <h1 className="font-cormorant text-4xl text-white text-center mb-2">
          {form.asiste === 'si'
            ? '¡Nos vemos en tu gran día!'
            : form.asiste === 'talvez'
              ? 'Anotamos tu respuesta'
              : 'Gracias por avisarnos'}
        </h1>
        <p className="text-[#9CA3AF] text-center mb-8 max-w-sm">
          {form.asiste === 'si'
            ? `${confirmado.invitado.nombre}, tu asistencia fue confirmada. Guardá este QR para ingresar.`
            : `Recibimos tu respuesta, ${confirmado.invitado.nombre}. La pareja lo tendrá en cuenta.`}
        </p>

        {form.asiste === 'si' && confirmado.invitado.qr_url && (
          <div className="bg-white rounded-[12px] p-4 mb-6 shadow-lg">
            <Image
              src={confirmado.invitado.qr_url}
              alt="Tu QR de entrada"
              width={200}
              height={200}
            />
          </div>
        )}

        {form.asiste === 'si' && confirmado.invitado.qr_url && (
          <a
            href={confirmado.invitado.qr_url}
            download={`qr-${confirmado.invitado.nombre.replace(/\s+/g, '-').toLowerCase()}.png`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#C9A84C] hover:bg-[#b8943e] text-[#0A0A0A] font-semibold text-sm px-6 py-3 rounded-full transition-colors mb-4"
          >
            Descargar QR
          </a>
        )}
      </div>
    )
  }

  // ─── Formulario RSVP ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-[#C9A84C] text-2xl text-center mb-6 select-none">✦</div>
        <h1 className="font-cormorant text-4xl text-white text-center mb-2">
          Confirmá tu asistencia
        </h1>
        <p className="text-[#9CA3AF] text-center text-sm mb-8">
          Hola <span className="text-white">{invitado.nombre}</span> — completá el
          formulario en menos de un minuto.
        </p>

        <form
          onSubmit={handleSubmit}
          className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-[12px] p-6 space-y-6"
        >
          {/* ¿Asistirás? */}
          <div>
            <p className="text-white text-sm font-medium mb-3">¿Vas a asistir?</p>
            <div className="flex gap-2">
              <BotonAsistencia label="Sí" value="si" selected={form.asiste} onClick={(v) => setForm((f) => ({ ...f, asiste: v }))} />
              <BotonAsistencia label="No" value="no" selected={form.asiste} onClick={(v) => setForm((f) => ({ ...f, asiste: v }))} />
              <BotonAsistencia label="Tal vez" value="talvez" selected={form.asiste} onClick={(v) => setForm((f) => ({ ...f, asiste: v }))} />
            </div>
          </div>

          {/* Opción de menú */}
          {mostrarMenu && (
            <div>
              <p className="text-white text-sm font-medium mb-3">Opción de menú</p>
              <div className="flex flex-col gap-2">
                {opcionesMenu.map((opcion) => (
                  <button
                    key={opcion}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, opcion_menu: opcion }))}
                    className={`w-full text-left py-3 px-4 rounded-[12px] text-sm border transition-colors ${
                      form.opcion_menu === opcion
                        ? 'bg-[#C9A84C]/10 border-[#C9A84C]/40 text-white'
                        : 'bg-[#111111] border-[#2A2A2A] text-[#9CA3AF] hover:border-[#C9A84C]/20 hover:text-white'
                    }`}
                  >
                    {opcion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ¿Llevás acompañante? */}
          {mostrarAcompanante && (
            <div>
              <p className="text-white text-sm font-medium mb-3">¿Llevás acompañante?</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, lleva_acompanante: true }))}
                  className={`flex-1 py-3 px-4 rounded-full text-sm font-medium border transition-colors ${
                    form.lleva_acompanante
                      ? 'bg-[#C9A84C] border-[#C9A84C] text-[#0A0A0A]'
                      : 'bg-transparent border-[#2A2A2A] text-[#9CA3AF] hover:border-[#C9A84C]/40 hover:text-white'
                  }`}
                >
                  Sí
                </button>
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, lleva_acompanante: false }))}
                  className={`flex-1 py-3 px-4 rounded-full text-sm font-medium border transition-colors ${
                    !form.lleva_acompanante
                      ? 'bg-[#C9A84C] border-[#C9A84C] text-[#0A0A0A]'
                      : 'bg-transparent border-[#2A2A2A] text-[#9CA3AF] hover:border-[#C9A84C]/40 hover:text-white'
                  }`}
                >
                  No
                </button>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !form.asiste}
            className="w-full bg-[#C9A84C] hover:bg-[#b8943e] disabled:opacity-40 disabled:cursor-not-allowed text-[#0A0A0A] font-semibold text-sm px-6 py-3 rounded-full transition-colors"
          >
            {loading ? 'Enviando...' : 'Confirmar'}
          </button>
        </form>
      </div>
    </div>
  )
}
