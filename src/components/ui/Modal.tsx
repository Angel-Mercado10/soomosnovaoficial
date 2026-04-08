'use client'

import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

type ModalProps = {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export function Modal({ isOpen, onClose, onConfirm }: ModalProps) {
  const confirmRef = useRef<HTMLButtonElement>(null)
  const cancelRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!isOpen) return

    const focusable = [confirmRef.current, cancelRef.current].filter(Boolean) as HTMLElement[]
    let index = 0
    focusable[0]?.focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key === 'Tab') {
        e.preventDefault()
        index = e.shiftKey
          ? (index - 1 + focusable.length) % focusable.length
          : (index + 1) % focusable.length
        focusable[index]?.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            className="relative z-10 w-full max-w-sm rounded-xl border border-nova-border bg-nova-card p-6 shadow-xl"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div className="mb-2 flex items-center gap-2">
              <span className="text-nova-gold text-lg">✦</span>
              <h2 id="modal-title" className="text-white font-semibold text-lg">
                Atención Privada
              </h2>
            </div>
            <p className="text-nova-gray text-sm mb-6 leading-relaxed">
              Vas a ser redirigido a WhatsApp para iniciar una conversación directa con nuestro
              equipo. Te atenderemos con total privacidad y en el menor tiempo posible.
            </p>
            <div className="flex flex-col gap-3">
              <button
                ref={confirmRef}
                onClick={onConfirm}
                className="w-full rounded-full bg-nova-gold py-3 text-sm font-medium text-black hover:opacity-90 transition-opacity duration-200 cursor-pointer"
              >
                Continuar a WhatsApp
              </button>
              <button
                ref={cancelRef}
                onClick={onClose}
                className="w-full rounded-full border border-white/20 py-3 text-sm font-medium text-white/70 hover:text-white hover:border-white/40 transition-all duration-200 cursor-pointer"
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
