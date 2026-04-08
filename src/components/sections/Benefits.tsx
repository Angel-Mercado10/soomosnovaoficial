'use client'

import { motion } from 'framer-motion'
import { BENEFITS } from '@/lib/constants'
import type { BenefitCard } from '@/types'

function BenefitItem({ card }: { card: BenefitCard }) {
  return (
    <motion.article
      className="group flex flex-col gap-6 rounded-xl border border-nova-border bg-nova-card p-6 transition-colors duration-300 hover:border-nova-gold md:flex-row md:items-start"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex-1">
        <span className="font-cormorant text-4xl font-semibold text-nova-gold/30">
          {String(card.id).padStart(2, '0')}
        </span>
        <h3 className="mt-2 font-cormorant text-2xl font-semibold text-white">
          {card.title}
        </h3>
        <p className="mt-2 text-sm text-nova-gray leading-relaxed">{card.description}</p>
        <span className="mt-4 inline-block text-xs font-semibold tracking-widest text-nova-gold/70 uppercase">
          {card.tag}
        </span>
      </div>

      <div
        className="w-full md:w-64 shrink-0 rounded-lg bg-nova-black border border-nova-border flex items-center justify-center"
        style={{ aspectRatio: '16/9' }}
        aria-label={card.mockupAlt}
        role="img"
      >
        <span className="text-xs text-white/20">Mockup próximamente</span>
      </div>
    </motion.article>
  )
}

export function Benefits() {
  return (
    <section id="beneficios" className="px-6 py-24">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="mb-12 text-center"
        >
          <span className="text-xs font-semibold tracking-widest text-nova-gold uppercase">
            BENEFICIOS
          </span>
          <h2 className="mt-3 font-cormorant text-4xl font-semibold text-white md:text-5xl">
            Resultados claros. Sin complejidad operativa.
          </h2>
        </motion.div>

        <div className="flex flex-col gap-6">
          {BENEFITS.map((card) => (
            <BenefitItem key={card.id} card={card} />
          ))}
        </div>
      </div>
    </section>
  )
}
