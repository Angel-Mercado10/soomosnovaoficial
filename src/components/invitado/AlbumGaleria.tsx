'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { Foto } from '@/types/database'

interface AlbumGaleriaProps {
  fotosIniciales: Foto[]
  eventoId: string
  eventoSlug: string
}

interface FotoModalProps {
  foto: Foto
  onClose: () => void
}

function FotoModal({ foto, onClose }: FotoModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-3xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-[#9CA3AF] hover:text-white text-sm"
        >
          Cerrar ✕
        </button>
        <Image
          src={foto.url_original}
          alt="Foto del álbum"
          width={900}
          height={600}
          className="w-full h-auto rounded-[12px] object-contain"
        />
      </div>
    </div>
  )
}

export default function AlbumGaleria({
  fotosIniciales,
}: AlbumGaleriaProps) {
  const [fotos, setFotos] = useState<Foto[]>(fotosIniciales)
  const [fotoActiva, setFotoActiva] = useState<Foto | null>(null)

  // Expone setter para que AlbumRealtime pueda agregar fotos
  // usando una prop de callback o context — aquí usamos un ref global via window
  // Para evitar coupling, AlbumRealtime recibe el mismo estado via prop
  // La composición en page.tsx pasa el setter a AlbumRealtime via un wrapper

  return (
    <>
      {fotoActiva && (
        <FotoModal foto={fotoActiva} onClose={() => setFotoActiva(null)} />
      )}

      {fotos.length === 0 ? (
        <div className="col-span-full text-center py-16">
          <p className="text-[#9CA3AF]">Todavía no hay fotos en el álbum.</p>
          <p className="text-[#9CA3AF] text-sm mt-1">¡Sé el primero en agregar una!</p>
        </div>
      ) : (
        <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
          {fotos.map((foto) => (
            <button
              key={foto.id}
              onClick={() => setFotoActiva(foto)}
              className="w-full block overflow-hidden rounded-[12px] bg-[#1A1A1A] border border-[#2A2A2A] hover:border-[#C9A84C]/40 transition-colors"
            >
              <Image
                src={foto.url_thumbnail}
                alt="Foto del álbum"
                width={400}
                height={400}
                className="w-full h-auto object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Setter expuesto en window para que AlbumRealtime lo use sin prop drilling */}
      <SetFotosRef setter={setFotos} />
    </>
  )
}

// Componente auxiliar que registra el setter en window
function SetFotosRef({
  setter,
}: {
  setter: React.Dispatch<React.SetStateAction<Foto[]>>
}) {
  if (typeof window !== 'undefined') {
    window.__albumSetFotos = setter
  }
  return null
}
