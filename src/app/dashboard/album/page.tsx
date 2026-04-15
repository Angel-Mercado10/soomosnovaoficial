import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { AlbumModerationGrid } from '@/components/dashboard/AlbumModerationGrid'
import type { Foto, Invitado } from '@/types/database'
import Link from 'next/link'

export const metadata = {
  title: 'Álbum — SoomosNova',
}

export interface FotoConInvitado extends Foto {
  invitado_nombre: string | null
}

export default async function DashboardAlbumPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: pareja } = await supabase
    .from('parejas')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  if (!pareja) redirect('/auth/login')

  const { data: evento } = await supabase
    .from('eventos')
    .select('id, nombre_evento, album_activo')
    .eq('pareja_id', pareja.id)
    .single()

  if (!evento) {
    return (
      <div className="space-y-4">
        <h1 className="font-cormorant text-3xl text-white">Álbum</h1>
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6 text-center">
          <p className="text-[#9CA3AF] mb-4">Configurá tu evento para gestionar el álbum.</p>
          <Link
            href="/dashboard/configuracion"
            className="inline-block bg-[#C9A84C] hover:bg-[#B8974B] text-[#0A0A0A] font-semibold rounded-full py-2.5 px-6 transition-colors text-sm"
          >
            Configurar evento
          </Link>
        </div>
      </div>
    )
  }

  // Usar admin client para traer también fotos ocultas
  const admin = createAdminClient()

  const { data: fotos } = await admin
    .from('fotos')
    .select('*')
    .eq('evento_id', evento.id)
    .order('subido_at', { ascending: false })

  const fotosBase: Foto[] = fotos ?? []

  // Enriquecer con nombres de invitados
  const invitadoIds = [
    ...new Set(fotosBase.map((f) => f.invitado_id).filter((id): id is string => id !== null)),
  ]

  const invitadosMap = new Map<string, string>()

  if (invitadoIds.length > 0) {
    const { data: invitadosData } = await admin
      .from('invitados')
      .select('id, nombre')
      .in('id', invitadoIds)

    ;(invitadosData ?? []).forEach((i: Pick<Invitado, 'id' | 'nombre'>) => {
      invitadosMap.set(i.id, i.nombre)
    })
  }

  const fotosConInvitado: FotoConInvitado[] = fotosBase.map((f) => ({
    ...f,
    invitado_nombre: f.invitado_id ? (invitadosMap.get(f.invitado_id) ?? null) : null,
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-cormorant text-3xl text-white">Álbum</h1>
          <p className="text-[#9CA3AF] text-sm mt-0.5">{evento.nombre_evento}</p>
        </div>
        <span
          className={`shrink-0 text-xs px-3 py-1 rounded-full border ${
            evento.album_activo
              ? 'text-green-400 border-green-800 bg-green-950/30'
              : 'text-[#9CA3AF] border-[#2A2A2A]'
          }`}
        >
          {evento.album_activo ? 'Álbum activo' : 'Álbum inactivo'}
        </span>
      </div>

      <AlbumModerationGrid
        fotos={fotosConInvitado}
        eventoId={evento.id}
      />
    </div>
  )
}
