'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { EnvelopeAnimation, type EnvelopeTheme } from './EnvelopeAnimation'
import { formatFechaEvento, staggerVariants, itemVariants, type InvitationTemplateProps } from './types'
import { InvitacionCTA } from './InvitacionCTA'
import CountdownEvento from '@/components/invitado/CountdownEvento'

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
        className="min-h-screen bg-[#0A0A0A] flex flex-col items-center px-6 pt-10 pb-16 relative overflow-hidden"
      >
        {/* SVG noise layer — profundidad de fondo */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          aria-hidden="true"
          style={{ opacity: 0.04 }}
        >
          <filter id="noiseClassica">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noiseClassica)" />
        </svg>

        {/* Filete vertical dorado — detalle editorial izquierdo */}
        <div
          className="absolute left-0 top-0 bottom-0 w-px pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent, #C9A84C20, #C9A84C40, #C9A84C20, transparent)' }}
        />

        {/* HERO — ornamento SVG principal */}
        <motion.div variants={itemVariants} className="mb-4 relative z-10">
          <RoseOrnament />
        </motion.div>

        {/* Frase temática */}
        <motion.p
          variants={itemVariants}
          className="font-cormorant italic text-[12px] tracking-[0.18em] text-center mb-4 relative z-10"
          style={{ color: '#C9A84C80' }}
        >
          Dos almas. Una historia. Un día para siempre.
        </motion.p>

        {/* Gold ornament animado */}
        <motion.div
          variants={itemVariants}
          className="text-nova-gold text-xl mb-6 leading-none relative z-10"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          ✦
        </motion.div>

        {/* PAREJA — nombres en tipografía masiva */}
        <motion.h1
          variants={itemVariants}
          className="font-cormorant text-6xl md:text-8xl text-white text-center leading-none tracking-[0.15em] mb-6 relative z-10"
        >
          {parejaNombres}
        </motion.h1>

        {/* SALUDO PERSONAL */}
        <motion.p
          variants={itemVariants}
          className="font-cormorant text-xl text-center mb-2 relative z-10"
          style={{ color: '#9CA3AF' }}
        >
          con todo nuestro amor, te invitamos
        </motion.p>
        <motion.p
          variants={itemVariants}
          className="font-cormorant text-3xl md:text-4xl text-center mb-8 relative z-10"
          style={{ color: '#C9A84C' }}
        >
          {invitado.nombre}
        </motion.p>

        {/* DIVIDER */}
        <motion.div variants={itemVariants} className="mb-8 relative z-10">
          <GoldRule />
        </motion.div>

        {/* COUNTDOWN */}
        <motion.div variants={itemVariants} className="mb-8 relative z-10">
          <CountdownEvento
            fechaEvento={evento.fecha_evento}
            horaEvento={evento.hora_evento}
          />
        </motion.div>

        {/* DIVIDER */}
        <motion.div variants={itemVariants} className="mb-10 relative z-10">
          <GoldRule />
        </motion.div>

        {/* DETALLES */}
        {/* Fecha */}
        <motion.div variants={itemVariants} className="flex flex-col items-center gap-1 mb-8 relative z-10">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" className="mb-1">
            <rect x="2" y="4" width="16" height="14" rx="2" stroke="#C9A84C" strokeOpacity="0.6" strokeWidth="1" />
            <line x1="6" y1="2" x2="6" y2="6" stroke="#C9A84C" strokeOpacity="0.6" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="14" y1="2" x2="14" y2="6" stroke="#C9A84C" strokeOpacity="0.6" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="2" y1="9" x2="18" y2="9" stroke="#C9A84C" strokeOpacity="0.3" strokeWidth="0.8" />
          </svg>
          <p className="text-[10px] uppercase tracking-[0.3em]" style={{ color: '#C9A84C80' }}>Fecha y hora</p>
          <p className="font-cormorant text-xl text-white text-center">
            {formatFechaEvento(evento.fecha_evento, evento.hora_evento)}
          </p>
        </motion.div>

        {/* Lugar */}
        {evento.lugar_nombre && (
          <motion.div variants={itemVariants} className="flex flex-col items-center gap-1 mb-8 relative z-10">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" className="mb-1">
              <path d="M10 2C7.24 2 5 4.24 5 7c0 4.25 5 11 5 11s5-6.75 5-11c0-2.76-2.24-5-5-5Z" stroke="#C9A84C" strokeOpacity="0.6" strokeWidth="1" />
              <circle cx="10" cy="7" r="2" stroke="#C9A84C" strokeOpacity="0.6" strokeWidth="0.9" />
            </svg>
            <p className="text-[10px] uppercase tracking-[0.3em]" style={{ color: '#C9A84C80' }}>Celebración</p>
            {evento.lugar_maps_url ? (
              <a
                href={evento.lugar_maps_url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-cormorant text-xl text-center text-white hover:text-nova-gold transition-colors"
              >
                {evento.lugar_nombre}
                {evento.lugar_direccion && (
                  <span className="block text-nova-gray text-sm mt-0.5">{evento.lugar_direccion}</span>
                )}
              </a>
            ) : (
              <p className="font-cormorant text-xl text-center text-white">
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
          <motion.div variants={itemVariants} className="flex flex-col items-center gap-1 mb-8 relative z-10">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" className="mb-1">
              <path d="M7 2L5 7H3l3 11h8l3-11h-2L13 2H7Z" stroke="#C9A84C" strokeOpacity="0.6" strokeWidth="1" strokeLinejoin="round" />
              <path d="M7 2C7 2 8.5 5 10 5C11.5 5 13 2 13 2" stroke="#C9A84C" strokeOpacity="0.4" strokeWidth="0.8" />
            </svg>
            <p className="text-[10px] uppercase tracking-[0.3em]" style={{ color: '#C9A84C80' }}>Dress code</p>
            <p className="font-cormorant text-xl text-white">{evento.dress_code}</p>
          </motion.div>
        )}

        {/* DIVIDER */}
        <motion.div variants={itemVariants} className="mb-10 relative z-10">
          <GoldRule />
        </motion.div>

        {/* QR — momento climático */}
        {invitado.qr_url && (
          <motion.div variants={itemVariants} className="flex flex-col items-center mb-3 relative z-10">
            <p className="font-cormorant text-2xl text-white text-center mb-4 tracking-wide">
              Tu pase de entrada
            </p>
            <div
              className="bg-white rounded-lg p-4"
              style={{
                border: '2px solid rgba(201,168,76,0.60)',
                outline: '1px solid rgba(201,168,76,0.30)',
                outlineOffset: '4px',
                boxShadow: '0 0 40px rgba(201,168,76,0.15), 0 8px 32px rgba(0,0,0,0.5)',
              }}
            >
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
        <motion.p variants={itemVariants} className="text-nova-gray/60 text-xs text-center mb-12 max-w-[220px] relative z-10">
          Presentá este código en la entrada del evento
        </motion.p>

        {/* CTA */}
        <motion.div variants={itemVariants} className="flex flex-col gap-3 w-full max-w-[280px] relative z-10">
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

        {/* FOOTER */}
        <motion.div variants={itemVariants} className="mt-14 flex flex-col items-center gap-2 relative z-10">
          <motion.div
            className="text-nova-gold/30 text-lg"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            ✦
          </motion.div>
          <p className="text-nova-gray/25 text-[10px] uppercase tracking-widest">SoomosNova</p>
        </motion.div>
      </motion.div>
    </EnvelopeAnimation>
  )
}
