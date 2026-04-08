'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { SITE_CONFIG } from '@/lib/constants'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
}

export function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center px-6 py-24 text-center">
      <div className="absolute inset-0 bg-gradient-to-b from-nova-gold/5 via-transparent to-transparent pointer-events-none" />

      <div className="relative mx-auto max-w-3xl">
        <motion.h1
          className="font-cormorant text-5xl font-semibold leading-tight text-white md:text-6xl lg:text-7xl"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0 }}
        >
          Tu boda, sin caos.
          <br />
          <span className="text-nova-gold">Tu recuerdo, para siempre.</span>
        </motion.h1>

        <motion.p
          className="mt-6 text-base text-nova-gray md:text-lg leading-relaxed max-w-xl mx-auto"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
        >
          Invitaciones digitales, confirmaciones automáticas y un álbum que nunca desaparece.
          Todo en un solo sistema.
        </motion.p>

        <motion.div
          className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
        >
          <Button
            as="a"
            href={SITE_CONFIG.calendarUrl}
            target="_blank"
            rel="noopener noreferrer"
            variant="primary"
            className="px-8 py-4 text-sm"
          >
            Agenda tu demo gratis
          </Button>
          <Button
            as="a"
            href={SITE_CONFIG.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            variant="secondary"
            className="px-8 py-4 text-sm"
          >
            Chatea por WhatsApp
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
