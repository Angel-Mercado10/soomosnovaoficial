'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { EnvelopeAnimation, type EnvelopeTheme } from './EnvelopeAnimation'
import { formatFechaEvento, staggerVariants, itemVariants, type InvitationTemplateProps } from './types'
import { InvitacionCTA } from './InvitacionCTA'

const theme: EnvelopeTheme = {
  bg: '#0C0608',
  envelopeBg: '#1A0C10',
  envelopeAccent: '#C97A9A',
  envelopeShadow: 'rgba(180,80,120,0.22)',
  sealColor: '#A84870',
  sealText: '#FFE8F0',
  nameColor: '#FFE0EA',
}

/**
 * Detailed rose divider with 5 petals and center — CRITICAL 7.
 */
function RoseDivider({ color }: { color: string }) {
  return (
    <div className="flex items-center justify-center gap-3 w-full max-w-[260px]">
      <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, transparent, ${color}35)` }} />
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        {/* 5 petals */}
        <path d="M10 5 C12 7 13 9 10 10 C9 8 9 6 10 5Z" fill={color} opacity="0.62" />
        <path d="M14.5 7.5 C13 10 11 11 10 10 C11 8 13 7 14.5 7.5Z" fill={color} opacity="0.55" />
        <path d="M13 13.5 C11 12 10 10 10 10 C11.5 9.5 13 10.5 13 13.5Z" fill={color} opacity="0.55" />
        <path d="M7 13.5 C9 12 10 10 10 10 C8.5 9.5 7 10.5 7 13.5Z" fill={color} opacity="0.55" />
        <path d="M5.5 7.5 C7 10 9 11 10 10 C9 8 7 7 5.5 7.5Z" fill={color} opacity="0.55" />
        {/* Center */}
        <circle cx="10" cy="10" r="2" fill={color} opacity="0.80" />
      </svg>
      <div className="flex-1 h-px" style={{ background: `linear-gradient(to left, transparent, ${color}35)` }} />
    </div>
  )
}

/**
 * Elegant floral header — flowing curved swirls with detailed rose blooms,
 * rosebuds and tendril curls. CRITICAL 7 — 12+ path elements.
 */
function FloralHeader() {
  const rose = '#C97A9A'
  const dkRose = '#A85880'
  return (
    <svg width="260" height="64" viewBox="0 0 260 64" fill="none" aria-hidden="true">
      <defs>
        <radialGradient id="romPetal" cx="50%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#E090B0" stopOpacity="0.70" />
          <stop offset="100%" stopColor="#A85880" stopOpacity="0.22" />
        </radialGradient>
      </defs>

      {/* ── Left flowing swirl ── */}
      <path d="M8 56 Q16 44 28 48 Q40 32 58 40 Q72 22 92 34" stroke={rose} strokeWidth="1.0" strokeOpacity="0.42" fill="none" />
      {/* Left tendril curls */}
      <path d="M28 48 Q24 36 30 38 Q26 40 28 48Z" stroke={rose} strokeWidth="0.7" strokeOpacity="0.30" fill="none" />
      <path d="M46 36 Q40 26 46 30 Q44 34 46 36Z" stroke={rose} strokeWidth="0.6" strokeOpacity="0.25" fill="none" />

      {/* Left rose bloom — 5 petals */}
      <path d="M28 30 C30 32 32 34 29 36 C27 38 24 36 28 32 C28 30 28 30 28 30Z" fill="url(#romPetal)" />
      <path d="M28 30 C26 32 24 34 27 36 C29 38 32 36 28 32 C28 30 28 30 28 30Z" fill="url(#romPetal)" />
      <path d="M34 32 C33 35 31 37 29 36 C27 35 27 32 31 31 C33 30 34 32 34 32Z" fill="url(#romPetal)" />
      <path d="M22 32 C23 35 25 37 27 36 C29 35 29 32 25 31 C23 30 22 32 22 32Z" fill="url(#romPetal)" />
      <path d="M28 38 C26 37 24 35 27 33 C29 31 31 33 28 37Z" fill="url(#romPetal)" />
      <circle cx="28" cy="33" r="2.5" fill={dkRose} opacity="0.65" />

      {/* Left small bud */}
      <path d="M52 28 C53 24 56 24 57 27 C58 30 55 32 52 28Z" fill={rose} opacity="0.30" />
      <path d="M57 27 L58 32" stroke={rose} strokeWidth="0.7" strokeOpacity="0.25" />

      {/* Left tiny dot buds */}
      <circle cx="70" cy="26" r="2.5" fill={rose} opacity="0.22" />
      <circle cx="80" cy="32" r="2" fill={rose} opacity="0.18" />

      {/* ── Center rose bloom — larger, more detailed ── */}
      <path d="M130 18 C134 22 137 26 132 30 C130 33 127 30 130 24 C130 20 130 18 130 18Z" fill="url(#romPetal)" />
      <path d="M130 18 C126 22 123 26 128 30 C130 33 133 30 130 24 C130 20 130 18 130 18Z" fill="url(#romPetal)" />
      <path d="M140 24 C138 29 135 32 132 30 C128 29 128 25 134 23 C137 22 140 24 140 24Z" fill="url(#romPetal)" />
      <path d="M120 24 C122 29 125 32 128 30 C132 29 132 25 126 23 C123 22 120 24 120 24Z" fill="url(#romPetal)" />
      <path d="M138 34 C135 32 132 29 134 25 C136 22 140 24 138 31 C138 33 138 34 138 34Z" fill="url(#romPetal)" />
      <path d="M122 34 C125 32 128 29 126 25 C124 22 120 24 122 31 C122 33 122 34 122 34Z" fill="url(#romPetal)" />
      <path d="M130 36 C127 33 124 29 127 25 C130 22 133 24 132 30Z" fill="url(#romPetal)" />
      <path d="M130 36 C133 33 136 29 133 25 C130 22 127 24 128 30Z" fill="url(#romPetal)" />
      {/* Center inner spiral */}
      <path d="M130 24 C132 26 133 28 130 30 C128 31 127 29 129 27Z" fill={dkRose} opacity="0.68" />
      <circle cx="130" cy="28" r="3" fill={dkRose} opacity="0.72" />
      {/* Stem */}
      <path d="M130 36 Q129 48 130 58" stroke={rose} strokeWidth="0.9" strokeOpacity="0.30" fill="none" />
      {/* Small leaves on center stem */}
      <path d="M130 44 C126 40 123 44 127 46Z" fill={rose} opacity="0.22" />
      <path d="M130 44 C134 40 137 44 133 46Z" fill={rose} opacity="0.22" />

      {/* ── Right (mirrored) ── */}
      <path d="M252 56 Q244 44 232 48 Q220 32 202 40 Q188 22 168 34" stroke={rose} strokeWidth="1.0" strokeOpacity="0.42" fill="none" />
      <path d="M232 48 Q236 36 230 38 Q234 40 232 48Z" stroke={rose} strokeWidth="0.7" strokeOpacity="0.30" fill="none" />
      <path d="M214 36 Q220 26 214 30 Q216 34 214 36Z" stroke={rose} strokeWidth="0.6" strokeOpacity="0.25" fill="none" />

      <path d="M232 30 C230 32 228 34 231 36 C233 38 236 36 232 32 C232 30 232 30 232 30Z" fill="url(#romPetal)" />
      <path d="M232 30 C234 32 236 34 233 36 C231 38 228 36 232 32 C232 30 232 30 232 30Z" fill="url(#romPetal)" />
      <path d="M226 32 C227 35 229 37 231 36 C233 35 233 32 229 31 C227 30 226 32 226 32Z" fill="url(#romPetal)" />
      <path d="M238 32 C237 35 235 37 233 36 C231 35 231 32 235 31 C237 30 238 32 238 32Z" fill="url(#romPetal)" />
      <path d="M232 38 C234 37 236 35 233 33 C231 31 229 33 232 37Z" fill="url(#romPetal)" />
      <circle cx="232" cy="33" r="2.5" fill={dkRose} opacity="0.65" />

      <path d="M208 28 C207 24 204 24 203 27 C202 30 205 32 208 28Z" fill={rose} opacity="0.30" />
      <circle cx="190" cy="26" r="2.5" fill={rose} opacity="0.22" />
      <circle cx="180" cy="32" r="2" fill={rose} opacity="0.18" />
    </svg>
  )
}

export function PlantillaRomantica({ invitado, evento, parejaNombres }: InvitationTemplateProps) {
  const rose = '#C97A9A'
  const blush = '#FFE0EA'
  const dimBlush = '#A06080'

  return (
    <EnvelopeAnimation coupleNames={parejaNombres} theme={theme}>
      <motion.div
        variants={staggerVariants}
        initial="hidden"
        animate="visible"
        className="min-h-screen flex flex-col items-center px-6 pt-10 pb-16 relative"
        style={{ backgroundColor: '#0C0608' }}
      >
        {/* Ambient glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-64 rounded-full pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at center, rgba(180,60,100,0.10) 0%, transparent 70%)`,
            filter: 'blur(50px)',
          }}
        />

        {/* Floral header */}
        <motion.div variants={itemVariants} className="mb-4 relative z-10">
          <FloralHeader />
        </motion.div>

        {/* Tagline */}
        <motion.p
          variants={itemVariants}
          className="font-cormorant italic text-[13px] tracking-wider mb-3 relative z-10"
          style={{ color: dimBlush }}
        >
          con todo el amor del mundo
        </motion.p>

        {/* Couple names — MEDIUM 25: text-4xl sm:text-5xl */}
        <motion.h1
          variants={itemVariants}
          className="font-cormorant text-4xl sm:text-5xl italic text-center leading-tight mb-3 relative z-10"
          style={{ color: blush, textShadow: `0 0 48px rgba(200,100,140,0.30)` }}
        >
          {parejaNombres}
        </motion.h1>

        {/* Guest */}
        <motion.p
          variants={itemVariants}
          className="text-[13px] text-center mb-7 relative z-10"
          style={{ color: dimBlush }}
        >
          con gran alegría invitan a{' '}
          <span className="font-cormorant text-[17px] not-italic" style={{ color: rose }}>
            {invitado.nombre}
          </span>
        </motion.p>

        <motion.div variants={itemVariants} className="mb-7 relative z-10">
          <RoseDivider color={rose} />
        </motion.div>

        {/* Date */}
        <motion.div variants={itemVariants} className="text-center mb-5 relative z-10">
          <p className="text-[9px] uppercase tracking-[0.3em] mb-2" style={{ color: `${dimBlush}80` }}>
            el día especial
          </p>
          <p className="font-cormorant text-xl text-center" style={{ color: blush }}>
            {formatFechaEvento(evento.fecha_evento, evento.hora_evento)}
          </p>
        </motion.div>

        {/* Venue */}
        {evento.lugar_nombre && (
          <motion.div variants={itemVariants} className="text-center mb-6 relative z-10">
            <p className="text-[9px] uppercase tracking-[0.3em] mb-2" style={{ color: `${dimBlush}80` }}>
              celebración
            </p>
            {evento.lugar_maps_url ? (
              <a
                href={evento.lugar_maps_url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-cormorant text-xl text-center transition-opacity hover:opacity-80"
                style={{ color: blush }}
              >
                {evento.lugar_nombre}
                {evento.lugar_direccion && (
                  <span className="block text-[13px] mt-0.5" style={{ color: dimBlush }}>
                    {evento.lugar_direccion}
                  </span>
                )}
              </a>
            ) : (
          <p className="font-cormorant text-xl sm:text-2xl text-center" style={{ color: blush }}>
                {evento.lugar_nombre}
                {evento.lugar_direccion && (
                  <span className="block text-[13px] mt-0.5" style={{ color: dimBlush }}>
                    {evento.lugar_direccion}
                  </span>
                )}
              </p>
            )}
          </motion.div>
        )}

        {/* Dress code */}
        {evento.dress_code && (
          <motion.div variants={itemVariants} className="text-center mb-6 relative z-10">
            <p className="text-[9px] uppercase tracking-[0.3em] mb-2" style={{ color: `${dimBlush}80` }}>
              etiqueta
            </p>
            <p className="font-cormorant text-lg" style={{ color: blush }}>{evento.dress_code}</p>
          </motion.div>
        )}

        <motion.div variants={itemVariants} className="mb-6 relative z-10">
          <RoseDivider color={rose} />
        </motion.div>

        {/* QR */}
        {invitado.qr_url && (
          <motion.div variants={itemVariants} className="mb-3 relative z-10">
            <div
              className="p-4 rounded-2xl"
              style={{
                backgroundColor: '#FFF0F5',
                boxShadow: `0 8px 40px rgba(180,60,100,0.20), 0 4px 16px rgba(0,0,0,0.4)`,
                border: `1px solid ${rose}20`,
              }}
            >
              <Image
                src={invitado.qr_url}
                alt={`Código QR de ${invitado.nombre}`}
                width={168}
                height={168}
                className="block"
                priority
              />
            </div>
          </motion.div>
        )}
        <motion.p
          variants={itemVariants}
          className="text-[10px] text-center uppercase tracking-widest mb-10 relative z-10"
          style={{ color: `${dimBlush}50` }}
        >
          tu pase de entrada
        </motion.p>

        {/* CTA — HIGH 18 ROMANTICA: rounded pill, heart icon, warm rose-gold gradient */}
        <motion.div variants={itemVariants} className="flex flex-col gap-3 w-full max-w-[280px] relative z-10">
          <InvitacionCTA
            token={invitado.token}
            eventoSlug={evento.slug}
            qrUrl={invitado.qr_url}
            estadoConfirmacion={invitado.estado_confirmacion}
            accentColor={rose}
            textColor={blush}
            borderColor={`${rose}30`}
            variant="romantica"
            primaryBtnStyle={{
              background: `linear-gradient(135deg, #A84870 0%, #C97A9A 55%, #D4927E 100%)`,
              color: '#FFF0F5',
              boxShadow: `0 4px 24px rgba(168,72,112,0.40)`,
              borderRadius: '999px',
              fontSize: '14px',
              fontWeight: 600,
              padding: '14px 24px',
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              width: '100%',
              transition: 'all 0.3s',
            }}
            secondaryBtnStyle={{
              border: `1px solid ${rose}30`,
              color: blush,
              borderRadius: '999px',
              fontSize: '13px',
              padding: '14px 24px',
              textAlign: 'center',
              display: 'block',
              width: '100%',
              transition: 'opacity 0.2s',
            }}
          />
        </motion.div>

        {/* Footer */}
        <motion.div variants={itemVariants} className="mt-12 relative z-10">
          <svg width="24" height="22" viewBox="0 0 24 22" fill="none" aria-hidden="true">
            <path
              d="M12 21 C12 21 1 13 1 6.5 C1 3.42 3.42 1 6.5 1 C8.24 1 9.91 1.81 11 3.08 C12.09 1.81 13.76 1 15.5 1 C18.58 1 21 3.42 21 6.5 C21 13 12 21 12 21Z"
              fill={rose}
              opacity="0.35"
            />
          </svg>
        </motion.div>
      </motion.div>
    </EnvelopeAnimation>
  )
}
