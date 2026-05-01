'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { WhatsAppPreviewModal } from '@/components/ui/WhatsAppPreviewModal'
import { SITE_CONFIG } from '@/lib/constants'

const WA_MESSAGE_CTA = `Hola SoomosNova! Quiero saber más sobre cómo pueden elevar la experiencia de mis invitados.`

export function FinalCTA() {
  const [waOpen, setWaOpen] = useState(false)

  return (
    <section id="contacto" className="relative px-6 py-28 overflow-hidden">
      {/* Atmospheric gold pulse */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[700px] rounded-full bg-nova-gold/[0.05] blur-[100px]" />

      <div className="relative mx-auto max-w-2xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
        >
          <span className="section-label">Empezá hoy</span>
          <h2 className="mt-4 font-cormorant text-4xl font-semibold leading-tight text-white md:text-5xl lg:text-6xl">
            Una sola conversación<br className="hidden md:block" /> puede cambiarlo todo.
          </h2>
          <p className="mt-5 text-[1.0625rem] text-nova-gray leading-[1.7] max-w-lg mx-auto">
            Escribinos por WhatsApp y te mostramos cómo elevar la experiencia de invitados
            con un sistema verdaderamente premium.
          </p>

          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button
              as="button"
              onClick={() => setWaOpen(true)}
              variant="primary"
              size="lg"
            >
              Chatea por WhatsApp
            </Button>
            <Button
              as="a"
              href={SITE_CONFIG.calendarUrl}
              target="_blank"
              rel="noopener noreferrer"
              variant="secondary"
              size="lg"
            >
              Agenda una demo
            </Button>
          </div>

          {/* Divider ornament */}
          <div className="mt-14 ornament-line">
            <span className="text-[0.6rem] tracking-[0.3em] text-white/20 uppercase font-medium">
              SoomosNova · Bodas premium en México
            </span>
          </div>
        </motion.div>
      </div>

      <WhatsAppPreviewModal
        isOpen={waOpen}
        onClose={() => setWaOpen(false)}
        message={WA_MESSAGE_CTA}
      />
    </section>
  )
}
