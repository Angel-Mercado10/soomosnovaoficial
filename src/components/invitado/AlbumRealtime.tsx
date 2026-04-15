'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Foto } from '@/types/database'

interface AlbumRealtimeProps {
  eventoId: string
  onNuevaFoto: React.Dispatch<React.SetStateAction<Foto[]>>
}

export default function AlbumRealtime({ eventoId, onNuevaFoto }: AlbumRealtimeProps) {
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
          if (!nuevaFoto.oculto) {
            onNuevaFoto((prev) => {
              const yaExiste = prev.some((f) => f.id === nuevaFoto.id)
              return yaExiste ? prev : [nuevaFoto, ...prev]
            })
          }
        }
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [eventoId, onNuevaFoto])

  return null
}
