'use client'

import { motion } from 'framer-motion'

const testimonials = [
  {
    quote:
      'La experiencia de nuestros invitados fue completamente diferente. Sin confusión, sin filas, sin estrés. Solo el día que soñamos.',
    name: 'Valeria & Rodrigo',
    detail: 'Boda en CDMX · 180 invitados · 2024',
  },
]

export function Testimonials() {
  return (
    <section id="testimonios" className="relative px-6 py-28 overflow-hidden">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-nova-gold/[0.025] to-transparent" />

      <div className="relative mx-auto max-w-3xl text-center">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
        >
          <span className="section-label">Testimonios</span>
          <h2 className="mt-4 font-cormorant text-4xl font-semibold leading-tight text-white md:text-5xl">
            Confianza que se percibe<br className="hidden md:block" /> desde el primer vistazo.
          </h2>
        </motion.div>

        {/* Testimonial card */}
        {testimonials.map((t, i) => (
          <motion.div
            key={i}
            className="mt-14 relative rounded-[14px] border border-nova-border bg-nova-card px-8 py-10 md:px-14 md:py-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.55, ease: 'easeOut', delay: 0.1 }}
          >
            {/* Top gold accent */}
            <div className="absolute inset-x-0 top-0 h-px rounded-t-[14px] bg-gradient-to-r from-transparent via-nova-gold/50 to-transparent" />

            {/* Stars */}
            <div className="mb-6 flex justify-center gap-1" aria-label="5 de 5 estrellas">
              {[...Array(5)].map((_, idx) => (
                <svg
                  key={idx}
                  className="h-4 w-4 text-nova-gold"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>

            {/* Quote */}
            <blockquote>
              <p className="font-cormorant text-xl italic text-white/85 leading-relaxed md:text-2xl">
                &ldquo;{t.quote}&rdquo;
              </p>
            </blockquote>

            {/* Attribution */}
            <div className="mt-8 flex flex-col items-center gap-1">
              <div className="h-px w-8 bg-nova-gold/30" />
              <p className="mt-3 text-sm font-semibold text-white/80">{t.name}</p>
              <p className="text-xs text-nova-gray">{t.detail}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
