'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Foto } from '@/types/database'

interface AlbumRealtimeProps {
  eventoId: string
}

export default function AlbumRealtime({ eventoId }: AlbumRealtimeProps) {
  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel(`album-fotos-${eventoId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'fotos',
          filter: `evento_id=eq.${eventoId}`,
        },
        (payload) => {
          const nuevaFoto = payload.new as Foto
          // Si la foto no está oculta, la agrega a la galería
          if (!nuevaFoto.oculto) {
            const setter = window.__albumSetFotos
            if (typeof setter === 'function') {
              setter((prev: Foto[]) => {
                const yaExiste = prev.some((f) => f.id === nuevaFoto.id)
                return yaExiste ? prev : [nuevaFoto, ...prev]
              })
            }
          }
        }
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [eventoId])

  return null
}
