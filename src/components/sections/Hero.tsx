'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { WhatsAppPreviewModal } from '@/components/ui/WhatsAppPreviewModal'
import { SITE_CONFIG } from '@/lib/constants'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

const stagger = {
  visible: { transition: { staggerChildren: 0.12 } },
}

const WA_MESSAGE_HERO = `Hola SoomosNova! Me interesa conocer más sobre sus servicios de gestión digital para bodas.`

export function Hero() {
  const [waOpen, setWaOpen] = useState(false)

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center px-6 py-28 text-center overflow-hidden">
      {/* Background atmosphere */}
      <div className="pointer-events-none absolute inset-0">
        {/* Radial gold glow */}
        <div className="absolute left-1/2 top-0 -translate-x-1/2 h-[600px] w-[900px] rounded-full bg-nova-gold/[0.04] blur-[120px]" />
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `linear-gradient(rgba(201,168,76,0.6) 1px, transparent 1px),
              linear-gradient(90deg, rgba(201,168,76,0.6) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <motion.div
        className="relative mx-auto max-w-2xl"
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        {/* Eyebrow */}
        <motion.div variants={fadeUp} transition={{ duration: 0.5, ease: 'easeOut' }}>
          <span className="section-label">
            Gestión de bodas premium · México
          </span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          className="mt-5 font-cormorant text-5xl font-semibold leading-[1.12] tracking-tight text-white md:text-6xl lg:text-7xl"
          variants={fadeUp}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          Tu boda, sin caos.
          <br />
          <em className="not-italic text-nova-gold">Tu recuerdo, para siempre.</em>
        </motion.h1>

        {/* Ornament separator */}
        <motion.div
          className="mt-6 flex items-center justify-center gap-3"
          variants={fadeUp}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <span className="h-px w-12 bg-gradient-to-r from-transparent to-nova-gold/40" />
          <span className="text-nova-gold/50 text-xs">✦</span>
          <span className="h-px w-12 bg-gradient-to-l from-transparent to-nova-gold/40" />
        </motion.div>

        {/* Subtitle */}
        <motion.p
          className="mt-6 text-[1.0625rem] text-nova-gray leading-[1.7] max-w-lg mx-auto"
          variants={fadeUp}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          Invitaciones digitales, confirmaciones automáticas y un álbum que nunca desaparece.
          Todo en un solo sistema diseñado para bodas de alta gama.
        </motion.p>

        {/* CTAs */}
        <motion.div
          className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
          variants={fadeUp}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <Button
            as="a"
            href={SITE_CONFIG.calendarUrl}
            target="_blank"
            rel="noopener noreferrer"
            variant="primary"
            size="lg"
          >
            Agenda tu demo gratis
          </Button>
          <Button
            as="button"
            onClick={() => setWaOpen(true)}
            variant="secondary"
            size="lg"
          >
            Chatea por WhatsApp
          </Button>
        </motion.div>

        {/* Trust signal */}
        <motion.p
          className="mt-8 text-xs text-white/25 tracking-wide"
          variants={fadeUp}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          Sin tarjeta de crédito · Demo en menos de 30 minutos · Cancelá cuando quieras
        </motion.p>
      </motion.div>

      <WhatsAppPreviewModal
        isOpen={waOpen}
        onClose={() => setWaOpen(false)}
        message={WA_MESSAGE_HERO}
      />
    </section>
  )
}
