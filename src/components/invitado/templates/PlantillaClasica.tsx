'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { EnvelopeAnimation, type EnvelopeTheme } from './EnvelopeAnimation'
import { formatFechaEvento, staggerVariants, itemVariants, type InvitationTemplateProps } from './types'
import { InvitacionCTA } from './InvitacionCTA'

const theme: EnvelopeTheme = {
  bg: '#0A0A0A',
  envelopeBg: '#141414',
  envelopeAccent: '#C9A84C',
  envelopeShadow: 'rgba(201,168,76,0.15)',
  sealColor: '#C9A84C',
  sealText: '#0A0A0A',
  nameColor: '#FFFFFF',
}

/**
 * Detailed rose SVG — multi-petal with depth and layered gold gradient tones.
 * At least 8 path elements with proper Bezier curves.
 */
function RoseOrnament() {
  return (
    <svg
      width="260"
      height="82"
      viewBox="0 0 260 82"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="rcGrad" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#E0C060" stopOpacity="0.95" />
          <stop offset="55%" stopColor="#B08030" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#6A4A10" stopOpacity="0.15" />
        </radialGradient>
        <radialGradient id="rpGrad" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#D4B460" stopOpacity="0.72" />
          <stop offset="100%" stopColor="#8C6428" stopOpacity="0.20" />
        </radialGradient>
      </defs>

      {/* ── Left branch stem ── */}
      <path d="M4 74 Q16 58 30 62 Q42 44 60 54 Q76 36 96 46" stroke="#C9A84C" strokeWidth="0.9" strokeOpacity="0.38" fill="none" />
      {/* Leaf 1 – larger, with vein */}
      <path d="M22 58 C16 50 12 44 20 47 C24 41 30 47 22 58Z" fill="#C9A84C" opacity="0.28" />
      <path d="M22 58 C19 53 21 47 22 58Z" stroke="#C9A84C" strokeWidth="0.45" strokeOpacity="0.38" fill="none" />
      {/* Leaf 2 */}
      <path d="M42 50 C36 42 34 36 42 40 C48 34 52 42 42 50Z" fill="#C9A84C" opacity="0.24" />
      <path d="M42 50 C40 45 42 40 42 50Z" stroke="#C9A84C" strokeWidth="0.45" strokeOpacity="0.32" fill="none" />
      {/* Leaf 3 – small */}
      <path d="M62 50 C57 43 56 37 63 41 C68 35 71 43 62 50Z" fill="#C9A84C" opacity="0.19" />
      {/* Small bud left */}
      <path d="M82 42 C80 38 82 34 85 37 C88 34 90 38 88 42 C86 46 82 44 82 42Z" fill="#C9A84C" opacity="0.30" />
      <path d="M85 42 L85 46" stroke="#C9A84C" strokeWidth="0.7" strokeOpacity="0.28" />

      {/* ── Center rose ── 8 outer petals */}
      {/* Top petal */}
      <path d="M130 22 C134 27 138 33 133 39 C130 43 127 39 130 31 C130 26 130 22 130 22Z" fill="url(#rpGrad)" />
      {/* Top-left petal */}
      <path d="M130 22 C126 27 122 33 127 39 C130 43 133 39 130 31 C130 26 130 22 130 22Z" fill="url(#rpGrad)" />
      {/* Right petal */}
      <path d="M144 30 C142 35 139 40 133 39 C129 38 129 33 136 31 C140 29 144 30 144 30Z" fill="url(#rpGrad)" />
      {/* Left petal */}
      <path d="M116 30 C118 35 121 40 127 39 C131 38 131 33 124 31 C120 29 116 30 116 30Z" fill="url(#rpGrad)" />
      {/* Bottom-right petal */}
      <path d="M144 48 C140 45 137 41 139 36 C141 32 146 33 145 40 C145 44 144 48 144 48Z" fill="url(#rpGrad)" />
      {/* Bottom-left petal */}
      <path d="M116 48 C120 45 123 41 121 36 C119 32 114 33 115 40 C115 44 116 48 116 48Z" fill="url(#rpGrad)" />
      {/* Bottom petal right */}
      <path d="M130 54 C126 50 123 46 126 40 C129 36 133 37 132 43 C131 48 130 54 130 54Z" fill="url(#rpGrad)" />
      {/* Bottom petal left */}
      <path d="M130 54 C134 50 137 46 134 40 C131 36 127 37 128 43 C129 48 130 54 130 54Z" fill="url(#rpGrad)" />
      {/* Inner spiral petals */}
      <path d="M130 30 C133 32 136 36 132 39 C130 41 127 39 129 35Z" fill="#C9A84C" opacity="0.68" />
      <path d="M130 30 C127 32 124 36 128 39 C130 41 133 39 131 35Z" fill="#C9A84C" opacity="0.58" />
      <path d="M126 37 C128 34 132 34 134 37 C135 40 130 42 128 40Z" fill="#C9A84C" opacity="0.52" />
      {/* Rose center */}
      <circle cx="130" cy="38" r="4.5" fill="url(#rcGrad)" />
      <circle cx="130" cy="38" r="2.2" fill="#D4B060" opacity="0.90" />
      {/* Stem */}
      <path d="M130 54 Q129 62 130 74" stroke="#C9A84C" strokeWidth="0.9" strokeOpacity="0.32" fill="none" />
      {/* Sepals */}
      <path d="M130 58 C126 54 122 56 126 60Z" fill="#C9A84C" opacity="0.22" />
      <path d="M130 58 C134 54 138 56 134 60Z" fill="#C9A84C" opacity="0.22" />

      {/* ── Right branch stem (mirrored) ── */}
      <path d="M256 74 Q244 58 230 62 Q218 44 200 54 Q184 36 164 46" stroke="#C9A84C" strokeWidth="0.9" strokeOpacity="0.38" fill="none" />
      <path d="M238 58 C244 50 248 44 240 47 C236 41 230 47 238 58Z" fill="#C9A84C" opacity="0.28" />
      <path d="M238 58 C241 53 239 47 238 58Z" stroke="#C9A84C" strokeWidth="0.45" strokeOpacity="0.38" fill="none" />
      <path d="M218 50 C224 42 226 36 218 40 C212 34 208 42 218 50Z" fill="#C9A84C" opacity="0.24" />
      <path d="M218 50 C220 45 218 40 218 50Z" stroke="#C9A84C" strokeWidth="0.45" strokeOpacity="0.32" fill="none" />
      <path d="M198 50 C203 43 204 37 197 41 C192 35 189 43 198 50Z" fill="#C9A84C" opacity="0.19" />
      <path d="M178 42 C180 38 178 34 175 37 C172 34 170 38 172 42 C174 46 178 44 178 42Z" fill="#C9A84C" opacity="0.30" />
      <path d="M175 42 L175 46" stroke="#C9A84C" strokeWidth="0.7" strokeOpacity="0.28" />
    </svg>
  )
}

/** Horizontal gold rule with center ornament */
function GoldRule() {
  return (
    <svg width="200" height="12" viewBox="0 0 200 12" fill="none" aria-hidden="true">
      <line x1="0" y1="6" x2="88" y2="6" stroke="#C9A84C" strokeOpacity="0.28" strokeWidth="0.8" />
      <rect x="96" y="2" width="8" height="8" transform="rotate(45 100 6)" fill="#C9A84C" opacity="0.65" />
      <rect x="88" y="4" width="4" height="4" transform="rotate(45 90 6)" fill="#C9A84C" opacity="0.35" />
      <rect x="108" y="4" width="4" height="4" transform="rotate(45 110 6)" fill="#C9A84C" opacity="0.35" />
      <line x1="112" y1="6" x2="200" y2="6" stroke="#C9A84C" strokeOpacity="0.28" strokeWidth="0.8" />
    </svg>
  )
}

export function PlantillaClasica({ invitado, evento, parejaNombres }: InvitationTemplateProps) {
  return (
    <EnvelopeAnimation coupleNames={parejaNombres} theme={theme}>
      <motion.div
        variants={staggerVariants}
        initial="hidden"
        animate="visible"
        className="min-h-screen bg-[#0A0A0A] flex flex-col items-center px-6 pt-10 pb-16"
      >
        {/* Rose illustration header (CRITICAL 7) */}
        <motion.div variants={itemVariants} className="mb-4">
          <RoseOrnament />
        </motion.div>

        {/* Gold ornament */}
        <motion.div variants={itemVariants} className="text-nova-gold text-xl mb-5 leading-none">
          ✦
        </motion.div>

        {/* Couple names — MEDIUM 25: text-4xl sm:text-5xl */}
        <motion.h1
          variants={itemVariants}
          className="font-cormorant text-4xl sm:text-5xl text-white text-center leading-tight mb-1"
        >
          {parejaNombres}
        </motion.h1>

        {/* Personal invite */}
        <motion.p variants={itemVariants} className="text-nova-gray text-sm text-center mb-7">
          tienen el honor de invitar a{' '}
          <span className="text-nova-gold font-medium">{invitado.nombre}</span>
        </motion.p>

        {/* Gold rule divider */}
        <motion.div variants={itemVariants} className="mb-7">
          <GoldRule />
        </motion.div>

        {/* Date */}
        <motion.div variants={itemVariants} className="text-center mb-5">
          <p className="text-nova-gold text-[10px] uppercase tracking-[0.2em] mb-1">Fecha y hora</p>
          <p className="text-white text-base sm:text-lg font-light">
            {formatFechaEvento(evento.fecha_evento, evento.hora_evento)}
          </p>
        </motion.div>

        {/* Venue */}
        {evento.lugar_nombre && (
          <motion.div variants={itemVariants} className="text-center mb-8">
            <p className="text-nova-gold text-[10px] uppercase tracking-[0.2em] mb-1">Celebración</p>
            {evento.lugar_maps_url ? (
              <a
                href={evento.lugar_maps_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white text-base font-light hover:text-nova-gold transition-colors"
              >
                {evento.lugar_nombre}
                {evento.lugar_direccion && (
                  <span className="block text-nova-gray text-sm mt-0.5">{evento.lugar_direccion}</span>
                )}
              </a>
            ) : (
              <p className="text-white text-base font-light">
                {evento.lugar_nombre}
                {evento.lugar_direccion && (
                  <span className="block text-nova-gray text-sm mt-0.5">{evento.lugar_direccion}</span>
                )}
              </p>
            )}
          </motion.div>
        )}

        {/* Dress code */}
        {evento.dress_code && (
          <motion.div variants={itemVariants} className="text-center mb-8">
            <p className="text-nova-gold text-[10px] uppercase tracking-[0.2em] mb-1">Dress code</p>
            <p className="text-white text-sm font-light">{evento.dress_code}</p>
          </motion.div>
        )}

        {/* QR */}
        {invitado.qr_url && (
          <motion.div variants={itemVariants} className="mb-3">
            <div className="bg-white rounded-xl p-4 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
              <Image
                src={invitado.qr_url}
                alt={`Código QR de ${invitado.nombre}`}
                width={180}
                height={180}
                className="block"
                priority
              />
            </div>
          </motion.div>
        )}
        <motion.p variants={itemVariants} className="text-nova-gray/60 text-xs text-center mb-10 max-w-[220px]">
          Presentá este QR en la entrada del evento
        </motion.p>

        {/* CTA — HIGH 18 CLASICA: elegant gold button, thin border, serif text */}
        <motion.div variants={itemVariants} className="flex flex-col gap-3 w-full max-w-[280px]">
          <InvitacionCTA
            token={invitado.token}
            eventoSlug={evento.slug}
            qrUrl={invitado.qr_url}
            estadoConfirmacion={invitado.estado_confirmacion}
            accentColor="#C9A84C"
            textColor="#FFFFFF"
            borderColor="#2A2A2A"
            variant="clasica"
            primaryBtnClass="text-center border border-[#C9A84C] bg-[#C9A84C] hover:bg-[#b8943e] hover:border-[#b8943e] text-[#0A0A0A] font-cormorant font-semibold text-base tracking-wide px-6 py-3.5 transition-colors"
            secondaryBtnClass="text-center border border-[#C9A84C]/30 hover:border-[#C9A84C]/60 text-white font-cormorant text-base px-6 py-3.5 transition-colors"
          />
        </motion.div>

        {/* Footer */}
        <motion.div variants={itemVariants} className="mt-14 flex flex-col items-center gap-2">
          <div className="text-nova-gold/30 text-lg">✦</div>
          <p className="text-nova-gray/25 text-[10px] uppercase tracking-widest">SoomosNova</p>
        </motion.div>
      </motion.div>
    </EnvelopeAnimation>
  )
}
