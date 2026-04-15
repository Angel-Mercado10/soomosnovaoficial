import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import AlbumGaleria from '@/components/invitado/AlbumGaleria'
import SubirFotoForm from '@/components/invitado/SubirFotoForm'

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ token?: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const admin = createAdminClient()
  const { data: evento } = await admin
    .from('eventos')
    .select('nombre_evento')
    .eq('slug', slug)
    .single()

  return {
    title: evento ? `Álbum de ${evento.nombre_evento}` : 'Álbum — SoomosNova',
  }
}

export default async function AlbumPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const { token } = await searchParams
  const admin = createAdminClient()

  const { data: evento } = await admin
    .from('eventos')
    .select('id, nombre_evento, album_activo, pareja_id')
    .eq('slug', slug)
    .is('deleted_at', null)
    .single()

  if (!evento) return notFound()

  const { data: pareja } = await admin
    .from('parejas')
    .select('nombre_1, nombre_2')
    .eq('id', evento.pareja_id)
    .single()

  const parejaNombres = pareja
    ? `${pareja.nombre_1} & ${pareja.nombre_2}`
    : evento.nombre_evento

  // Álbum no activo
  if (!evento.album_activo) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-4 py-12 text-center">
        <div className="text-[#C9A84C] text-3xl mb-6 select-none">✦</div>
        <h1 className="font-cormorant text-4xl text-white mb-3">
          {parejaNombres}
        </h1>
        <p className="text-[#9CA3AF] max-w-sm">
          El álbum estará disponible pronto. ¡Volvé después del evento!
        </p>
      </div>
    )
  }

  const { data: fotos } = await admin
    .from('fotos')
    .select('id, url_original, url_thumbnail, tipo, evento_id, invitado_id, oculto, subido_at')
    .eq('evento_id', evento.id)
    .eq('oculto', false)
    .order('subido_at', { ascending: false })

  const fotosIniciales = fotos ?? []

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Header */}
      <header className="px-4 py-12 text-center border-b border-[#2A2A2A]">
        <p className="text-[#C9A84C] text-xs uppercase tracking-widest mb-3">
          Álbum del evento
        </p>
        <h1 className="font-cormorant text-5xl text-white">{parejaNombres}</h1>
        <p className="text-[#9CA3AF] text-sm mt-2">
          {fotosIniciales.length} foto{fotosIniciales.length !== 1 ? 's' : ''}
        </p>
      </header>

      {/* Botón subir */}
      <div className="flex justify-center py-6 border-b border-[#2A2A2A]">
        <SubirFotoForm
          eventoId={evento.id}
          invitadoToken={token}
        />
      </div>

      {/* Galería */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        <AlbumGaleria
          fotosIniciales={fotosIniciales}
          eventoId={evento.id}
        />
      </main>

      <div className="text-center py-8 text-[#9CA3AF]/30 text-xs">
        SoomosNova
      </div>
    </div>
  )
}
