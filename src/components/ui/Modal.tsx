'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { sendContactEmail } from '@/app/actions/contact'
import { SITE_CONFIG } from '@/lib/constants'

type ModalProps = {
  isOpen: boolean
  onClose: () => void
}

type View = 'choice' | 'whatsapp' | 'form' | 'success'

type FieldErrors = {
  name?: string
  email?: string
  eventDate?: string
  message?: string
}

const INPUT_BASE =
  'w-full rounded-lg border border-nova-border bg-nova-black px-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-nova-gold transition-colors duration-200'

const INPUT_ERROR = 'border-red-500/60 focus:border-red-500'

function validateField(name: string, value: string): string | undefined {
  const v = value.trim()
  if (!v) {
    const labels: Record<string, string> = {
      name: 'El nombre es obligatorio',
      email: 'El email es obligatorio',
      eventDate: 'La fecha es obligatoria',
      message: 'El mensaje es obligatorio',
    }
    return labels[name]
  }
  if (name === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
    return 'Ingresá un email válido'
  }
  return undefined
}

function WhatsAppOptionIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 shrink-0" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  )
}

function MailOptionIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 shrink-0" aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  )
}

function ArrowLeftIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  )
}

export function Modal({ isOpen, onClose }: ModalProps) {
  const firstInputRef = useRef<HTMLInputElement>(null)
  const [view, setView] = useState<View>('choice')
  const [isPending, startTransition] = useTransition()
  const [serverError, setServerError] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})

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

  useEffect(() => {
    if (view === 'form') {
      const timer = setTimeout(() => firstInputRef.current?.focus(), 50)
      return () => clearTimeout(timer)
    }
  }, [view])

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setView('choice')
        setServerError('')
        setErrors({})
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  const WA_PREVIEW_MESSAGE = `Hola SoomosNova! Quiero conocer más sobre sus servicios de gestión digital para bodas.`
  const waUrl = `https://wa.me/${SITE_CONFIG.whatsappNumber}?text=${encodeURIComponent(WA_PREVIEW_MESSAGE)}`

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = {
      name: (form.elements.namedItem('name') as HTMLInputElement).value,
      email: (form.elements.namedItem('email') as HTMLInputElement).value,
      eventDate: (form.elements.namedItem('eventDate') as HTMLInputElement).value,
      message: (form.elements.namedItem('message') as HTMLTextAreaElement).value,
    }

    const fieldErrors: FieldErrors = {
      name: validateField('name', data.name),
      email: validateField('email', data.email),
      eventDate: validateField('eventDate', data.eventDate),
      message: validateField('message', data.message),
    }

    const hasErrors = Object.values(fieldErrors).some(Boolean)
    setErrors(fieldErrors)
    if (hasErrors) return

    startTransition(async () => {
      const result = await sendContactEmail(data)
      if (result.success) {
        setView('success')
      } else {
        setServerError(result.error)
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
              {/* Header */}
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {(view === 'form' || view === 'whatsapp') && (
                    <button
                      onClick={() => { setView('choice'); setErrors({}); setServerError('') }}
                      aria-label="Volver"
                      className="text-white/40 hover:text-white transition-colors duration-200 mr-1 cursor-pointer"
                    >
                      <ArrowLeftIcon />
                    </button>
                  )}
                  <span className="text-nova-gold text-base">✦</span>
                  <h2 id="modal-title" className="font-cormorant text-xl font-semibold text-white">
                    {view === 'choice' && 'Atención Privada'}
                    {view === 'whatsapp' && 'Mensaje por WhatsApp'}
                    {view === 'form' && 'Escribe tu mensaje'}
                    {view === 'success' && 'Mensaje enviado'}
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

              {/* Choice view */}
              {view === 'choice' && (
                <div className="flex flex-col gap-3">
                  <p className="text-sm text-nova-gray mb-1">
                    Elegí cómo prefieres contactarnos.
                  </p>
                  <button
                    onClick={() => setView('whatsapp')}
                    className="flex items-center gap-4 rounded-xl border border-nova-border bg-nova-black p-4 text-white text-left hover:border-[#25D366]/60 transition-colors duration-200 cursor-pointer"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#25D366]/10 text-[#25D366]">
                      <WhatsAppOptionIcon />
                    </div>
                    <div>
                      <span className="text-sm font-medium">Chatea por WhatsApp</span>
                      <p className="text-xs text-nova-gray mt-0.5">Te respondemos al instante</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setView('form')}
                    className="flex items-center gap-4 rounded-xl border border-nova-border bg-nova-black p-4 text-white text-left hover:border-nova-gold/60 transition-colors duration-200 cursor-pointer"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-nova-gold/10 text-nova-gold">
                      <MailOptionIcon />
                    </div>
                    <div>
                      <span className="text-sm font-medium">Escríbenos un mensaje</span>
                      <p className="text-xs text-nova-gray mt-0.5">Te contactamos por email</p>
                    </div>
                  </button>
                </div>
              )}

              {/* WhatsApp preview view */}
              {view === 'whatsapp' && (
                <div className="flex flex-col">
                  <p className="mb-2 text-xs text-nova-gray">
                    Este mensaje se enviará a nuestro equipo:
                  </p>
                  <div
                    className="mb-5 rounded-xl bg-[#25D366]/8 border border-[#25D366]/20 p-4 text-sm text-white/90 whitespace-pre-wrap leading-relaxed"
                    aria-label="Vista previa del mensaje"
                  >
                    {WA_PREVIEW_MESSAGE}
                  </div>
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={onClose}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] py-3 text-sm font-medium text-white hover:bg-[#1fb855] transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366]"
                    aria-label="Enviar mensaje por WhatsApp"
                  >
                    <WhatsAppOptionIcon />
                    Enviar por WhatsApp
                  </a>
                </div>
              )}

              {/* Form view */}
              {view === 'form' && (
                <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
                  <div>
                    <label htmlFor="contact-name" className="sr-only">Nombre completo</label>
                    <input
                      ref={firstInputRef}
                      id="contact-name"
                      name="name"
                      type="text"
                      placeholder="Nombre completo"
                      className={`${INPUT_BASE} ${errors.name ? INPUT_ERROR : ''}`}
                      disabled={isPending}
                    />
                    {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
                  </div>

                  <div>
                    <label htmlFor="contact-email" className="sr-only">Tu email</label>
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      placeholder="Tu email"
                      className={`${INPUT_BASE} ${errors.email ? INPUT_ERROR : ''}`}
                      disabled={isPending}
                    />
                    {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
                  </div>

                  <div>
                    <label htmlFor="contact-date" className="sr-only">Fecha del evento</label>
                    <input
                      id="contact-date"
                      name="eventDate"
                      type="date"
                      className={`${INPUT_BASE} [color-scheme:dark] ${errors.eventDate ? INPUT_ERROR : ''}`}
                      disabled={isPending}
                    />
                    {errors.eventDate && <p className="mt-1 text-xs text-red-400">{errors.eventDate}</p>}
                  </div>

                  <div>
                    <label htmlFor="contact-message" className="sr-only">Tu consulta</label>
                    <textarea
                      id="contact-message"
                      name="message"
                      rows={3}
                      placeholder="Tu consulta"
                      className={`${INPUT_BASE} resize-none ${errors.message ? INPUT_ERROR : ''}`}
                      disabled={isPending}
                    />
                    {errors.message && <p className="mt-1 text-xs text-red-400">{errors.message}</p>}
                  </div>

                  {serverError && <p className="text-xs text-red-400">{serverError}</p>}

                  <button
                    type="submit"
                    disabled={isPending}
                    className="mt-1 w-full rounded-full bg-nova-gold py-3 text-sm font-medium text-black hover:opacity-90 transition-opacity duration-200 disabled:opacity-50 cursor-pointer"
                  >
                    {isPending ? 'Enviando...' : 'Enviar mensaje'}
                  </button>
                </form>
              )}

              {/* Success view */}
              {view === 'success' && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="py-8 text-center"
                >
                  <div className="mb-3 text-3xl text-nova-gold">✦</div>
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
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
