'use client'

/**
 * WhatsAppPreviewModal
 *
 * Muestra un modal con el mensaje que se enviará por WhatsApp.
 * El usuario confirma tocando "Enviar por WhatsApp", que abre wa.me
 * con el mensaje codificado. No envía nada automáticamente.
 */

import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { SITE_CONFIG } from '@/lib/constants'

interface WhatsAppPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  /** Mensaje prellenado para WA. Si se omite, abre WA sin texto. */
  message?: string
}

function WhatsAppIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-5 w-5 shrink-0"
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  )
}

function buildWaUrl(message?: string): string {
  const base = `https://wa.me/${SITE_CONFIG.whatsappNumber}`
  if (!message?.trim()) return base
  return `${base}?text=${encodeURIComponent(message.trim())}`
}

export function WhatsAppPreviewModal({
  isOpen,
  onClose,
  message,
}: WhatsAppPreviewModalProps) {
  const sendBtnRef = useRef<HTMLAnchorElement>(null)

  // Escape key + scroll lock
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  // Focus "Enviar" cuando abre
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => sendBtnRef.current?.focus(), 50)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  const waUrl = buildWaUrl(message)

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="wa-preview-title"
            className="relative z-10 w-full sm:max-w-sm rounded-t-2xl sm:rounded-xl border border-nova-border bg-nova-card shadow-xl"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            {/* Handle bar mobile */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="h-1 w-10 rounded-full bg-white/20" aria-hidden="true" />
            </div>

            <div className="px-6 pb-6 pt-4">
              {/* Header */}
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-nova-gold text-base" aria-hidden="true">✦</span>
                  <h2 id="wa-preview-title" className="font-cormorant text-xl font-semibold text-white">
                    Mensaje por WhatsApp
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  aria-label="Cerrar"
                  className="text-white/40 hover:text-white transition-colors duration-200 text-xl leading-none cursor-pointer"
                >
                  ×
                </button>
              </div>

              {/* Preview */}
              {message ? (
                <>
                  <p className="mb-2 text-xs text-nova-gray">
                    Este mensaje se enviará a nuestro equipo:
                  </p>
                  <div
                    className="mb-5 rounded-xl bg-[#25D366]/8 border border-[#25D366]/20 p-4 text-sm text-white/90 whitespace-pre-wrap leading-relaxed"
                    aria-label="Vista previa del mensaje"
                  >
                    {message}
                  </div>
                </>
              ) : (
                <p className="mb-5 text-sm text-nova-gray">
                  Al tocar &ldquo;Enviar&rdquo; se abrirá WhatsApp con nuestro equipo.
                </p>
              )}

              {/* CTA */}
              <a
                ref={sendBtnRef}
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] py-3 text-sm font-medium text-white hover:bg-[#1fb855] transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366]"
                aria-label="Enviar mensaje por WhatsApp"
              >
                <WhatsAppIcon />
                Enviar por WhatsApp
              </a>

              <button
                onClick={onClose}
                className="mt-3 w-full rounded-full border border-nova-border py-3 text-sm text-white/50 hover:text-white hover:border-white/30 transition-colors duration-200 cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
