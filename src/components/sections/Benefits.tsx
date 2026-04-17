'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { BENEFITS } from '@/lib/constants'
import type { BenefitCard } from '@/types'

function BenefitItem({ card, index }: { card: BenefitCard; index: number }) {
  return (
    <motion.article
      className="group relative flex flex-col gap-6 rounded-[14px] border border-nova-border bg-nova-card p-7 transition-all duration-500 hover:border-nova-gold/40 hover:bg-nova-card-elevated hover:shadow-[0_8px_40px_rgba(0,0,0,0.5),0_0_0_1px_rgba(201,168,76,0.12)] md:flex-row md:items-start"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.55, ease: 'easeOut', delay: index * 0.08 }}
    >
      {/* Subtle gold gradient on hover — top edge */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-[14px] bg-gradient-to-r from-transparent via-nova-gold/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="flex-1">
        {/* Number */}
        <span className="font-cormorant text-[3.5rem] leading-none font-semibold text-nova-gold/20 select-none tabular-nums">
          {String(card.id).padStart(2, '0')}
        </span>
        {/* Title */}
        <h3 className="mt-1 font-cormorant text-[1.625rem] font-semibold leading-snug text-white group-hover:text-nova-gold/90 transition-colors duration-300">
          {card.title}
        </h3>
        {/* Description */}
        <p className="mt-2.5 text-[0.875rem] text-nova-gray leading-relaxed">{card.description}</p>
        {/* Tag */}
        <span className="mt-5 inline-block section-label opacity-60 group-hover:opacity-100 transition-opacity duration-300">
          {card.tag}
        </span>
      </div>

      {/* Mockup image */}
      <div className="w-full md:w-60 shrink-0 rounded-xl overflow-hidden border border-nova-border group-hover:border-nova-gold/20 transition-colors duration-500">
        <Image
          src={`/mockups/mockup${card.id}.png`}
          alt={card.mockupAlt}
          width={240}
          height={135}
          className="w-full h-auto object-cover"
          loading="lazy"
        />
      </div>
    </motion.article>
  )
}

export function Benefits() {
  return (
    <section id="beneficios" className="px-6 py-28">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="mb-14 text-center"
        >
          <span className="section-label">Beneficios</span>
          <h2 className="mt-4 font-cormorant text-4xl font-semibold leading-tight text-white md:text-5xl">
            Resultados claros.<br className="hidden md:block" /> Sin complejidad operativa.
          </h2>
        </motion.div>

        <div className="flex flex-col gap-5">
          {BENEFITS.map((card, i) => (
            <BenefitItem key={card.id} card={card} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
