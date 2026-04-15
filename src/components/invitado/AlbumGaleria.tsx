'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import type { Foto } from '@/types/database'
import AlbumRealtime from './AlbumRealtime'

interface AlbumGaleriaProps {
  fotosIniciales: Foto[]
  eventoId: string
}

interface FotoModalProps {
  foto: Foto
  onClose: () => void
}

// ─── Framer Motion variants — MEDIUM 28 ──────────────────────────────────────
const galleryContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
}

const galleryItem = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.45, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] },
  },
}

const modalOverlay = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, transition: { duration: 0.20 } },
}

const modalPhoto = {
  hidden: { opacity: 0, scale: 0.88 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] } },
  exit: { opacity: 0, scale: 0.92, transition: { duration: 0.20 } },
}

/**
 * Modal overlay with fade + scale animation — MEDIUM 28.
 * Styled close button instead of plain text.
 */
function FotoModal({ foto, onClose }: FotoModalProps) {
  return (
    <AnimatePresence>
      <motion.div
        key="modal-overlay"
        variants={modalOverlay}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          key="modal-photo"
          variants={modalPhoto}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative max-w-3xl w-full"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Styled close button — MEDIUM 28 */}
          <button
            onClick={onClose}
            className="absolute -top-12 right-0 flex items-center gap-2 text-[#9CA3AF] hover:text-white transition-colors text-sm group"
            aria-label="Cerrar foto"
          >
            <span className="group-hover:text-white transition-colors">Cerrar</span>
            <div className="w-7 h-7 rounded-full border border-[#3A3A3A] flex items-center justify-center group-hover:border-[#C9A84C]/50 transition-colors">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M1 1L11 11M11 1L1 11" />
              </svg>
            </div>
          </button>

          <Image
            src={foto.url_original}
            alt="Foto del álbum"
            width={900}
            height={600}
            className="w-full h-auto rounded-[12px] object-contain"
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default function AlbumGaleria({
  fotosIniciales,
  eventoId,
}: AlbumGaleriaProps) {
  const [fotos, setFotos] = useState<Foto[]>(fotosIniciales)
  const [fotoActiva, setFotoActiva] = useState<Foto | null>(null)

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
        /* Staggered gallery entrance — MEDIUM 28 */
        <motion.div
          variants={galleryContainer}
          initial="hidden"
          animate="visible"
          className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3"
        >
          {fotos.map((foto) => (
            <motion.button
              key={foto.id}
              variants={galleryItem}
              onClick={() => setFotoActiva(foto)}
              className="w-full block overflow-hidden rounded-[12px] bg-[#1A1A1A] border border-[#2A2A2A] hover:border-[#C9A84C]/40 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Image
                src={foto.url_thumbnail}
                alt="Foto del álbum"
                width={400}
                height={400}
                className="w-full h-auto object-cover"
              />
            </motion.button>
          ))}
        </motion.div>
      )}

      <AlbumRealtime eventoId={eventoId} onNuevaFoto={setFotos} />
    </>
  )
}
