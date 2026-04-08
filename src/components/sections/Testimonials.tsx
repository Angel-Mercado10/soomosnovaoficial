'use client'

import { motion } from 'framer-motion'

export function Testimonials() {
  return (
    <section id="testimonios" className="px-6 py-24 bg-nova-card/30">
      <div className="mx-auto max-w-3xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <span className="text-xs font-semibold tracking-widest text-nova-gold uppercase">
            TESTIMONIOS
          </span>
          <h2 className="mt-3 font-cormorant text-4xl font-semibold text-white md:text-5xl">
            Confianza que se percibe desde el primer vistazo.
          </h2>
        </motion.div>

        <motion.div
          className="mt-12 rounded-xl border border-nova-border bg-nova-card p-8 md:p-12"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
        >
          <span
            className="font-cormorant text-6xl leading-none text-nova-gold/60 block"
            aria-hidden="true"
          >
            &ldquo;
          </span>
          <p className="font-cormorant text-xl italic text-white/80 leading-relaxed md:text-2xl">
            La experiencia de nuestros invitados fue completamente diferente. Sin confusión, sin
            filas, sin estrés. Solo el día que soñamos.
          </p>
          <span
            className="font-cormorant text-6xl leading-none text-nova-gold/60 block text-right"
            aria-hidden="true"
          >
            &rdquo;
          </span>
        </motion.div>
      </div>
    </section>
  )
}
