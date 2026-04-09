'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { sendContactEmail } from '@/app/actions/contact'

type ModalProps = {
  isOpen: boolean
  onClose: () => void
}

type FormState = 'idle' | 'success' | 'error'

const INPUT_BASE =
  'w-full rounded-lg border border-nova-border bg-nova-black px-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-nova-gold transition-colors duration-200'

export function Modal({ isOpen, onClose }: ModalProps) {
  const firstInputRef = useRef<HTMLInputElement>(null)
  const [isPending, startTransition] = useTransition()
  const [formState, setFormState] = useState<FormState>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (!isOpen) return

    const timer = setTimeout(() => firstInputRef.current?.focus(), 50)

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      clearTimeout(timer)
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  // Reset form state when modal closes
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setFormState('idle')
        setErrorMsg('')
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = {
      name: (form.elements.namedItem('name') as HTMLInputElement).value.trim(),
      email: (form.elements.namedItem('email') as HTMLInputElement).value.trim(),
      eventDate: (form.elements.namedItem('eventDate') as HTMLInputElement).value.trim(),
      message: (form.elements.namedItem('message') as HTMLTextAreaElement).value.trim(),
    }

    startTransition(async () => {
      const result = await sendContactEmail(data)
      if (result.success) {
        setFormState('success')
      } else {
        setErrorMsg(result.error)
        setFormState('error')
      }
    })
  }

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
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            className="relative z-10 w-full sm:max-w-md rounded-t-2xl sm:rounded-xl border border-nova-border bg-nova-card shadow-xl"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            {/* Handle bar for mobile */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="h-1 w-10 rounded-full bg-white/20" />
            </div>

            <div className="px-6 pb-6 pt-4">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-nova-gold text-base">✦</span>
                  <h2 id="modal-title" className="font-cormorant text-xl font-semibold text-white">
                    Escribe tu mensaje
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

              {formState === 'success' ? (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="py-8 text-center"
                >
                  <div className="mb-3 text-3xl">✦</div>
                  <p className="font-cormorant text-xl text-white font-semibold">
                    Mensaje enviado
                  </p>
                  <p className="mt-2 text-sm text-nova-gray">
                    Te respondemos a la brevedad por email.
                  </p>
                  <button
                    onClick={onClose}
                    className="mt-6 w-full rounded-full bg-nova-gold py-3 text-sm font-medium text-black hover:opacity-90 transition-opacity duration-200 cursor-pointer"
                  >
                    Cerrar
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
                  <div>
                    <label htmlFor="contact-name" className="sr-only">
                      Nombre completo
                    </label>
                    <input
                      ref={firstInputRef}
                      id="contact-name"
                      name="name"
                      type="text"
                      required
                      placeholder="Nombre completo"
                      className={INPUT_BASE}
                      disabled={isPending}
                    />
                  </div>

                  <div>
                    <label htmlFor="contact-email" className="sr-only">
                      Tu email
                    </label>
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      required
                      placeholder="Tu email"
                      className={INPUT_BASE}
                      disabled={isPending}
                    />
                  </div>

                  <div>
                    <label htmlFor="contact-date" className="sr-only">
                      Fecha del evento
                    </label>
                    <input
                      id="contact-date"
                      name="eventDate"
                      type="date"
                      required
                      className={`${INPUT_BASE} [color-scheme:dark]`}
                      disabled={isPending}
                    />
                  </div>

                  <div>
                    <label htmlFor="contact-message" className="sr-only">
                      Tu consulta
                    </label>
                    <textarea
                      id="contact-message"
                      name="message"
                      required
                      rows={3}
                      placeholder="Tu consulta"
                      className={`${INPUT_BASE} resize-none`}
                      disabled={isPending}
                    />
                  </div>

                  {formState === 'error' && (
                    <p className="text-xs text-red-400">{errorMsg}</p>
                  )}

                  <button
                    type="submit"
                    disabled={isPending}
                    className="mt-1 w-full rounded-full bg-nova-gold py-3 text-sm font-medium text-black hover:opacity-90 transition-opacity duration-200 disabled:opacity-50 cursor-pointer"
                  >
                    {isPending ? 'Enviando...' : 'Enviar mensaje'}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
