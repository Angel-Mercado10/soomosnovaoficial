'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { SITE_CONFIG } from '@/lib/constants'

export function FinalCTA() {
  return (
    <section id="contacto" className="px-6 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <span className="text-xs font-semibold tracking-widest text-nova-gold uppercase">
            ACCIÓN FINAL
          </span>
          <h2 className="mt-3 font-cormorant text-4xl font-semibold text-white md:text-5xl">
            Una sola conversación puede cambiarlo todo.
          </h2>
          <p className="mt-4 text-base text-nova-gray leading-relaxed">
            Escríbenos por WhatsApp y te mostramos cómo elevar la gestión de invitados con una
            experiencia verdaderamente premium.
          </p>

          <div className="mt-8">
            <Button
              as="a"
              href={SITE_CONFIG.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              variant="primary"
              className="px-8 py-4"
            >
              Chatea por WhatsApp
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
