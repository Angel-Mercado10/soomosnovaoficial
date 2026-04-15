'use client'

import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import type { FotoConInvitado } from '@/app/dashboard/album/page'

interface AlbumModerationGridProps {
  fotos: FotoConInvitado[]
  eventoId: string
}

type Filtro = 'todas' | 'visibles' | 'ocultas'

const FILTROS: { value: Filtro; label: string }[] = [
  { value: 'todas', label: 'Todas' },
  { value: 'visibles', label: 'Visibles' },
  { value: 'ocultas', label: 'Ocultas' },
]

export function AlbumModerationGrid({ fotos: initialFotos, eventoId }: AlbumModerationGridProps) {
  const [fotos, setFotos] = useState<FotoConInvitado[]>(initialFotos)
  const [filtro, setFiltro] = useState<Filtro>('todas')
  const [loadingId, setLoadingId] = useState<string | null>(null)

  // Realtime: nuevas fotos llegan automáticamente
  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel(`album-moderation-${eventoId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'fotos',
          filter: `evento_id=eq.${eventoId}`,
        },
        (payload) => {
          const nuevaFoto = payload.new as FotoConInvitado
          setFotos((prev) => [{ ...nuevaFoto, invitado_nombre: null }, ...prev])
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'fotos',
          filter: `evento_id=eq.${eventoId}`,
        },
        (payload) => {
          const fotoActualizada = payload.new as FotoConInvitado
          setFotos((prev) =>
            prev.map((f) =>
              f.id === fotoActualizada.id
                ? { ...f, oculto: fotoActualizada.oculto }
                : f
            )
          )
        }
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [eventoId])

  const toggleOculto = useCallback(async (foto: FotoConInvitado) => {
    setLoadingId(foto.id)

    const supabase = createClient()
    const nuevoOculto = !foto.oculto

    const { error } = await supabase
      .from('fotos')
      .update({ oculto: nuevoOculto })
      .eq('id', foto.id)

    if (!error) {
      setFotos((prev) =>
        prev.map((f) => (f.id === foto.id ? { ...f, oculto: nuevoOculto } : f))
      )
    }

    setLoadingId(null)
  }, [])

  const fotosFiltradas = fotos.filter((f) => {
    if (filtro === 'visibles') return !f.oculto
    if (filtro === 'ocultas') return f.oculto
    return true
  })

  const totalFotos = fotos.length
  const totalOcultas = fotos.filter((f) => f.oculto).length
  const totalVisibles = totalFotos - totalOcultas

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-4 text-center">
          <p className="font-cormorant text-3xl text-[#C9A84C] font-semibold">{totalFotos}</p>
          <p className="text-[#9CA3AF] text-xs mt-1">Total</p>
        </div>
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-4 text-center">
          <p className="font-cormorant text-3xl text-green-400 font-semibold">{totalVisibles}</p>
          <p className="text-[#9CA3AF] text-xs mt-1">Visibles</p>
        </div>
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-4 text-center">
          <p className="font-cormorant text-3xl text-[#9CA3AF] font-semibold">{totalOcultas}</p>
          <p className="text-[#9CA3AF] text-xs mt-1">Ocultas</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2">
        {FILTROS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFiltro(f.value)}
            className={`px-4 py-2 rounded-full text-xs font-medium transition-colors border ${
              filtro === f.value
                ? 'bg-[#C9A84C]/10 text-[#C9A84C] border-[#C9A84C]/30'
                : 'text-[#9CA3AF] border-[#2A2A2A] hover:border-[#3A3A3A] hover:text-white'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {fotosFiltradas.length === 0 ? (
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-12 text-center">
          <p className="text-[#9CA3AF]">
            {filtro === 'todas'
              ? 'Aún no hay fotos en el álbum.'
              : `No hay fotos ${filtro === 'ocultas' ? 'ocultas' : 'visibles'}.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {fotosFiltradas.map((foto) => (
            <div
              key={foto.id}
              className={`group relative bg-[#1A1A1A] border rounded-xl overflow-hidden transition-colors ${
                foto.oculto ? 'border-[#3A3A3A] opacity-60' : 'border-[#2A2A2A]'
              }`}
            >
              {/* Thumbnail */}
              <div className="relative aspect-square">
                <Image
                  src={foto.url_thumbnail}
                  alt={`Foto de ${foto.invitado_nombre ?? 'invitado'}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  unoptimized
                />
                {foto.oculto && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#9CA3AF"
                      strokeWidth="2"
                      aria-label="Foto oculta"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  </div>
                )}
                {/* Badge tipo video */}
                {foto.tipo === 'video' && (
                  <div className="absolute top-2 right-2 bg-black/70 rounded px-1.5 py-0.5 text-[10px] text-white">
                    VIDEO
                  </div>
                )}
              </div>

              {/* Info + acciones */}
              <div className="p-3 space-y-2">
                <div>
                  <p className="text-white text-xs font-medium truncate">
                    {foto.invitado_nombre ?? 'Anónimo'}
                  </p>
                  <p className="text-[#9CA3AF] text-[10px]">
                    {new Date(foto.subido_at).toLocaleDateString('es-AR', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>

                <button
                  onClick={() => void toggleOculto(foto)}
                  disabled={loadingId === foto.id}
                  className={`w-full text-xs py-1.5 px-3 rounded-lg border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                    foto.oculto
                      ? 'border-[#C9A84C]/30 text-[#C9A84C] hover:bg-[#C9A84C]/10'
                      : 'border-[#3A3A3A] text-[#9CA3AF] hover:border-[#C9A84C]/20 hover:text-white'
                  }`}
                >
                  {loadingId === foto.id
                    ? '...'
                    : foto.oculto
                      ? 'Mostrar'
                      : 'Ocultar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
