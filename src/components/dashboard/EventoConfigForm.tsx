'use client'

import { useState, useTransition } from 'react'
import { guardarEvento } from '@/app/actions/evento'
import type { Evento } from '@/types/database'

interface EventoConfigFormProps {
  evento: Evento | null
  parejaId: string
  nombre1: string
  nombre2: string
}

export function EventoConfigForm({ evento, parejaId, nombre1, nombre2 }: EventoConfigFormProps) {
  const [isPending, startTransition] = useTransition()
  const [mensaje, setMensaje] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null)

  // Estado del formulario inicializado con datos existentes
  const [opciones, setOpciones] = useState<string[]>(
    Array.isArray(evento?.opciones_menu) && evento.opciones_menu.length > 0
      ? (evento.opciones_menu as string[])
      : ['Pollo', 'Res', 'Vegetariano']
  )
  const [nuevaOpcion, setNuevaOpcion] = useState('')
  const [permiteAcompanante, setPermiteAcompanante] = useState(
    evento?.permite_acompanante ?? true
  )

  const handleAddOpcion = () => {
    const trimmed = nuevaOpcion.trim()
    if (trimmed && !opciones.includes(trimmed)) {
      setOpciones([...opciones, trimmed])
      setNuevaOpcion('')
    }
  }

  const handleRemoveOpcion = (opcion: string) => {
    setOpciones(opciones.filter((o) => o !== opcion))
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.set('opciones_menu', JSON.stringify(opciones))
    formData.set('permite_acompanante', permiteAcompanante ? 'on' : '')
    formData.set('pareja_id', parejaId)
    formData.set('nombre_1', nombre1)
    formData.set('nombre_2', nombre2)
    if (evento?.id) formData.set('evento_id', evento.id)

    startTransition(async () => {
      const result = await guardarEvento(formData)
      if (result.success) {
        setMensaje({ tipo: 'ok', texto: 'Evento guardado correctamente.' })
      } else {
        setMensaje({ tipo: 'error', texto: result.error ?? 'Error al guardar.' })
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      {/* Nombre del evento */}
      <div>
        <label className="block text-sm text-[#9CA3AF] mb-1.5" htmlFor="nombre_evento">
          Nombre del evento <span className="text-red-400">*</span>
        </label>
        <input
          id="nombre_evento"
          name="nombre_evento"
          type="text"
          required
          defaultValue={evento?.nombre_evento ?? `Boda de ${nombre1} y ${nombre2}`}
          placeholder="Ej: Boda de Ana y Carlos"
          className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-4 py-2.5 text-white placeholder-[#9CA3AF] focus:outline-none focus:border-[#C9A84C]/50 transition-colors text-sm"
        />
      </div>

      {/* Fecha y hora */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-[#9CA3AF] mb-1.5" htmlFor="fecha_evento">
            Fecha <span className="text-red-400">*</span>
          </label>
          <input
            id="fecha_evento"
            name="fecha_evento"
            type="date"
            required
            defaultValue={evento?.fecha_evento ?? ''}
            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#C9A84C]/50 transition-colors text-sm [color-scheme:dark]"
          />
        </div>
        <div>
          <label className="block text-sm text-[#9CA3AF] mb-1.5" htmlFor="hora_evento">
            Hora (opcional)
          </label>
          <input
            id="hora_evento"
            name="hora_evento"
            type="time"
            defaultValue={evento?.hora_evento ?? ''}
            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#C9A84C]/50 transition-colors text-sm [color-scheme:dark]"
          />
        </div>
      </div>

      {/* Lugar */}
      <div>
        <label className="block text-sm text-[#9CA3AF] mb-1.5" htmlFor="lugar_nombre">
          Nombre del lugar
        </label>
        <input
          id="lugar_nombre"
          name="lugar_nombre"
          type="text"
          defaultValue={evento?.lugar_nombre ?? ''}
          placeholder="Ej: Salón La Arboleda"
          className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-4 py-2.5 text-white placeholder-[#9CA3AF] focus:outline-none focus:border-[#C9A84C]/50 transition-colors text-sm"
        />
      </div>
      <div>
        <label className="block text-sm text-[#9CA3AF] mb-1.5" htmlFor="lugar_direccion">
          Dirección
        </label>
        <input
          id="lugar_direccion"
          name="lugar_direccion"
          type="text"
          defaultValue={evento?.lugar_direccion ?? ''}
          placeholder="Ej: Av. del Libertador 1234, CABA"
          className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-4 py-2.5 text-white placeholder-[#9CA3AF] focus:outline-none focus:border-[#C9A84C]/50 transition-colors text-sm"
        />
      </div>
      <div>
        <label className="block text-sm text-[#9CA3AF] mb-1.5" htmlFor="lugar_maps_url">
          Link de Google Maps (opcional)
        </label>
        <input
          id="lugar_maps_url"
          name="lugar_maps_url"
          type="url"
          defaultValue={evento?.lugar_maps_url ?? ''}
          placeholder="https://maps.google.com/..."
          className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-4 py-2.5 text-white placeholder-[#9CA3AF] focus:outline-none focus:border-[#C9A84C]/50 transition-colors text-sm"
        />
      </div>

      {/* Dress code y cuenta regalo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-[#9CA3AF] mb-1.5" htmlFor="dress_code">
            Dress code
          </label>
          <input
            id="dress_code"
            name="dress_code"
            type="text"
            defaultValue={evento?.dress_code ?? ''}
            placeholder="Ej: Formal elegante"
            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-4 py-2.5 text-white placeholder-[#9CA3AF] focus:outline-none focus:border-[#C9A84C]/50 transition-colors text-sm"
          />
        </div>
        <div>
          <label className="block text-sm text-[#9CA3AF] mb-1.5" htmlFor="cuenta_regalo">
            Cuenta / Regalo
          </label>
          <input
            id="cuenta_regalo"
            name="cuenta_regalo"
            type="text"
            defaultValue={evento?.cuenta_regalo ?? ''}
            placeholder="Ej: CBU 0000..."
            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-4 py-2.5 text-white placeholder-[#9CA3AF] focus:outline-none focus:border-[#C9A84C]/50 transition-colors text-sm"
          />
        </div>
      </div>

      {/* Opciones de menú */}
      <div>
        <label className="block text-sm text-[#9CA3AF] mb-2">
          Opciones de menú
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          {opciones.map((opcion) => (
            <span
              key={opcion}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1A1A1A] border border-[#2A2A2A] rounded-full text-sm text-white"
            >
              {opcion}
              <button
                type="button"
                onClick={() => handleRemoveOpcion(opcion)}
                className="text-[#9CA3AF] hover:text-red-400 transition-colors ml-0.5"
                aria-label={`Eliminar ${opcion}`}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={nuevaOpcion}
            onChange={(e) => setNuevaOpcion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAddOpcion()
              }
            }}
            placeholder="Nueva opción..."
            className="flex-1 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-4 py-2 text-white placeholder-[#9CA3AF] focus:outline-none focus:border-[#C9A84C]/50 transition-colors text-sm"
          />
          <button
            type="button"
            onClick={handleAddOpcion}
            className="px-4 py-2 bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white rounded-xl text-sm transition-colors"
          >
            Agregar
          </button>
        </div>
      </div>

      {/* Permite acompañante toggle */}
      <div className="flex items-center justify-between bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-4 py-3">
        <div>
          <p className="text-white text-sm font-medium">Permite acompañante</p>
          <p className="text-[#9CA3AF] text-xs mt-0.5">
            Los invitados podrán indicar si traen +1
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={permiteAcompanante}
          onClick={() => setPermiteAcompanante(!permiteAcompanante)}
          className={`relative inline-flex w-11 h-6 items-center rounded-full transition-colors ${
            permiteAcompanante ? 'bg-[#C9A84C]' : 'bg-[#3A3A3A]'
          }`}
        >
          <span
            className={`inline-block w-4 h-4 bg-white rounded-full shadow transition-transform ${
              permiteAcompanante ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* PIN del venue (solo lectura si ya existe) */}
      {evento?.pin_venue && (
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-4 py-3">
          <p className="text-[#9CA3AF] text-xs mb-1">PIN del venue (ingreso en el evento)</p>
          <p className="text-[#C9A84C] font-mono text-lg tracking-widest">{evento.pin_venue}</p>
        </div>
      )}

      {/* Slug generado */}
      {evento?.slug && (
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-4 py-3">
          <p className="text-[#9CA3AF] text-xs mb-1">URL del evento</p>
          <p className="text-white text-sm font-mono">/i/{evento.slug}/...</p>
        </div>
      )}

      {/* Mensaje de estado */}
      {mensaje && (
        <div
          className={`rounded-xl px-4 py-3 text-sm ${
            mensaje.tipo === 'ok'
              ? 'bg-green-500/10 border border-green-500/20 text-green-400'
              : 'bg-red-500/10 border border-red-500/20 text-red-400'
          }`}
        >
          {mensaje.texto}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending}
        className="bg-[#C9A84C] hover:bg-[#B8974B] disabled:bg-[#C9A84C]/30 disabled:cursor-not-allowed text-[#0A0A0A] font-semibold rounded-full py-3 px-8 transition-colors text-sm"
      >
        {isPending ? 'Guardando...' : evento ? 'Guardar cambios' : 'Crear evento'}
      </button>
    </form>
  )
}
