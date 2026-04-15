'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { EnvelopeAnimation, type EnvelopeTheme } from './EnvelopeAnimation'
import { formatFechaEvento, staggerVariants, itemVariants, type InvitationTemplateProps } from './types'
import { InvitacionCTA } from './InvitacionCTA'

const theme: EnvelopeTheme = {
  bg: '#060814',
  envelopeBg: '#0D1128',
  envelopeAccent: '#A8B8E8',
  envelopeShadow: 'rgba(100,130,220,0.25)',
  sealColor: '#6478C8',
  sealText: '#F0F4FF',
  nameColor: '#E8EEFF',
}

/**
 * Detailed star field with varying sizes, twinkling animation, crescent moon
 * with crater detail, and constellation lines — CRITICAL 7.
 */
function StarField() {
  // stars: varying sizes for depth perception
  const stars = [
    { cx: 20, cy: 28, r: 1.2, delay: 0 },
    { cx: 55, cy: 12, r: 1.6, delay: 0.4 },
    { cx: 90, cy: 42, r: 0.8, delay: 0.8 },
    { cx: 130, cy: 18, r: 2.0, delay: 0.2 },
    { cx: 160, cy: 58, r: 0.9, delay: 1.2 },
    { cx: 200, cy: 8, r: 1.4, delay: 0.6 },
    { cx: 240, cy: 32, r: 1.7, delay: 1.0 },
    { cx: 268, cy: 16, r: 1.0, delay: 1.4 },
    { cx: 10, cy: 62, r: 0.7, delay: 0.3 },
    { cx: 75, cy: 52, r: 1.1, delay: 0.9 },
    { cx: 115, cy: 68, r: 1.5, delay: 0.7 },
    { cx: 190, cy: 52, r: 1.0, delay: 1.1 },
    { cx: 38, cy: 50, r: 0.6, delay: 1.3 },
    { cx: 220, cy: 22, r: 0.8, delay: 0.5 },
    { cx: 250, cy: 60, r: 1.2, delay: 1.6 },
    // 4-point sparkle stars at prominent positions
  ]
  return (
    <svg
      width="280"
      height="80"
      viewBox="0 0 280 80"
      fill="none"
      aria-hidden="true"
      className="absolute top-0 left-0 w-full pointer-events-none"
    >
      {/* Constellation lines */}
      <line x1="55" y1="12" x2="90" y2="42" stroke="#A8C0F8" strokeOpacity="0.15" strokeWidth="0.6" />
      <line x1="90" y1="42" x2="130" y2="18" stroke="#A8C0F8" strokeOpacity="0.15" strokeWidth="0.6" />
      <line x1="200" y1="8" x2="240" y2="32" stroke="#A8C0F8" strokeOpacity="0.12" strokeWidth="0.6" />
      <line x1="240" y1="32" x2="268" y2="16" stroke="#A8C0F8" strokeOpacity="0.12" strokeWidth="0.6" />
      <line x1="75" y1="52" x2="115" y2="68" stroke="#A8C0F8" strokeOpacity="0.10" strokeWidth="0.5" />

      {/* Circular stars with twinkling */}
      {stars.map((s, i) => (
        <motion.circle
          key={i}
          cx={s.cx}
          cy={s.cy}
          r={s.r}
          fill="#A8C0F8"
          initial={{ opacity: 0.1 }}
          animate={{ opacity: [0.1, 0.85, 0.25, 0.90, 0.15] }}
          transition={{ duration: 3 + i * 0.35, repeat: Infinity, repeatType: 'reverse', delay: s.delay }}
        />
      ))}

      {/* 4-point sparkle at bright stars */}
      {[[130, 18], [55, 12], [200, 8]].map(([cx, cy], i) => (
        <motion.g key={`spark-${i}`}
          initial={{ opacity: 0.2 }}
          animate={{ opacity: [0.2, 0.8, 0.1] }}
          transition={{ duration: 4 + i * 0.5, repeat: Infinity, repeatType: 'reverse', delay: i * 0.6 }}
        >
          <line x1={cx - 4} y1={cy} x2={cx + 4} y2={cy} stroke="#C8D8FF" strokeOpacity="0.55" strokeWidth="0.6" />
          <line x1={cx} y1={cy - 4} x2={cx} y2={cy + 4} stroke="#C8D8FF" strokeOpacity="0.55" strokeWidth="0.6" />
          <line x1={cx - 2.5} y1={cy - 2.5} x2={cx + 2.5} y2={cy + 2.5} stroke="#C8D8FF" strokeOpacity="0.30" strokeWidth="0.5" />
          <line x1={cx + 2.5} y1={cy - 2.5} x2={cx - 2.5} y2={cy + 2.5} stroke="#C8D8FF" strokeOpacity="0.30" strokeWidth="0.5" />
        </motion.g>
      ))}
    </svg>
  )
}

/**
 * Crescent moon with crater detail and flanking star sparkles.
 * CRITICAL 7 — detailed moon illustration.
 */
function CrescentMoon({ color }: { color: string }) {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden="true">
      {/* Moon body */}
      <path
        d="M34 22 C34 29.732 27.732 36 20 36 C12.268 36 6 29.732 6 22 C6 14.268 12.268 8 20 8 C15.582 10.8 15.582 33.2 20 36 C24.418 33.2 24.418 10.8 20 8 C27.732 8 34 14.268 34 22Z"
        fill={color}
        opacity="0.82"
      />
      {/* Crater 1 — small */}
      <circle cx="24" cy="16" r="1.8" fill={color} opacity="0.40" />
      <circle cx="24" cy="16" r="0.9" fill={color} opacity="0.22" />
      {/* Crater 2 */}
      <circle cx="26" cy="25" r="2.5" fill={color} opacity="0.32" />
      <circle cx="26" cy="25" r="1.2" fill={color} opacity="0.18" />
      {/* Crater 3 — tiny */}
      <circle cx="23" cy="30" r="1.2" fill={color} opacity="0.28" />
      {/* Surface highlight */}
      <path d="M16 12 Q17 18 15 24" stroke={color} strokeOpacity="0.22" strokeWidth="0.7" fill="none" />
      {/* Flanking sparkles */}
      <path d="M36 10 L36.8 12.4 L39.2 13.2 L36.8 14 L36 16.4 L35.2 14 L32.8 13.2 L35.2 12.4Z" fill={color} opacity="0.70" />
      <path d="M6 30 L6.5 31.6 L8.1 32.1 L6.5 32.6 L6 34.2 L5.5 32.6 L3.9 32.1 L5.5 31.6Z" fill={color} opacity="0.50" />
      <circle cx="38" cy="22" r="0.9" fill={color} opacity="0.45" />
      <circle cx="5" cy="18" r="0.7" fill={color} opacity="0.35" />
    </svg>
  )
}

function MoonDivider({ color }: { color: string }) {
  return (
    <div className="flex items-center justify-center gap-3 w-full max-w-[260px]">
      <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, transparent, ${color}40)` }} />
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path
          d="M12 7 C12 9.761 9.761 12 7 12 C4.239 12 2 9.761 2 7 C2 4.239 4.239 2 7 2 C5.068 3.3 5.068 10.7 7 12 C8.932 10.7 8.932 3.3 7 2 C9.761 2 12 4.239 12 7Z"
          fill={color}
          opacity="0.70"
        />
      </svg>
      <div className="flex-1 h-px" style={{ background: `linear-gradient(to left, transparent, ${color}40)` }} />
    </div>
  )
}

export function PlantillaCelestial({ invitado, evento, parejaNombres }: InvitationTemplateProps) {
  const silver = '#A8B8E8'
  const pale = '#E8EEFF'
  const dimPale = '#7888C0'
  const glow = '#6478C880'

  return (
    <EnvelopeAnimation coupleNames={parejaNombres} theme={theme}>
      <motion.div
        variants={staggerVariants}
        initial="hidden"
        animate="visible"
        className="min-h-screen flex flex-col items-center px-6 pt-12 pb-16 relative overflow-hidden"
        style={{ backgroundColor: '#060814' }}
      >
        {/* Ambient glow background */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at center, ${glow} 0%, transparent 70%)`,
            filter: 'blur(40px)',
          }}
        />

        {/* Star field top */}
        <motion.div variants={itemVariants} className="relative w-full max-w-[280px] h-20 mb-2">
          <StarField />
        </motion.div>

        {/* Moon + title — crescent with crater detail (CRITICAL 7) */}
        <motion.div variants={itemVariants} className="flex flex-col items-center mb-5">
          <div className="mb-2">
            <CrescentMoon color={silver} />
          </div>
          <p
            className="font-cormorant text-[11px] uppercase tracking-[0.35em]"
            style={{ color: dimPale }}
          >
            bajo el cielo de
          </p>
        </motion.div>

        {/* Couple names — MEDIUM 25: text-4xl sm:text-5xl */}
        <motion.h1
          variants={itemVariants}
          className="font-cormorant text-4xl sm:text-5xl text-center leading-tight mb-3"
          style={{ color: pale, textShadow: `0 0 40px ${silver}40` }}
        >
          {parejaNombres}
        </motion.h1>

        {/* Guest line */}
        <motion.p
          variants={itemVariants}
          className="text-[13px] text-center mb-7"
          style={{ color: dimPale }}
        >
          invitan a{' '}
          <span
            className="font-cormorant text-[17px]"
            style={{ color: silver }}
          >
            {invitado.nombre}
          </span>
        </motion.p>

        <motion.div variants={itemVariants} className="mb-7">
          <MoonDivider color={silver} />
        </motion.div>

        {/* Date */}
        <motion.div variants={itemVariants} className="text-center mb-5">
          <p
            className="text-[9px] uppercase tracking-[0.3em] mb-2"
            style={{ color: `${dimPale}80` }}
          >
            noche de celebración
          </p>
          <p className="font-cormorant text-xl text-center" style={{ color: pale }}>
            {formatFechaEvento(evento.fecha_evento, evento.hora_evento)}
          </p>
        </motion.div>

        {/* Venue */}
        {evento.lugar_nombre && (
          <motion.div variants={itemVariants} className="text-center mb-6">
            <p
              className="text-[9px] uppercase tracking-[0.3em] mb-2"
              style={{ color: `${dimPale}80` }}
            >
              lugar
            </p>
            {evento.lugar_maps_url ? (
              <a
                href={evento.lugar_maps_url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-cormorant text-xl text-center transition-opacity hover:opacity-80"
                style={{ color: pale }}
              >
                {evento.lugar_nombre}
                {evento.lugar_direccion && (
                  <span className="block text-[13px] mt-0.5" style={{ color: dimPale }}>
                    {evento.lugar_direccion}
                  </span>
                )}
              </a>
            ) : (
          <p className="font-cormorant text-xl sm:text-2xl text-center" style={{ color: pale }}>
                {evento.lugar_nombre}
                {evento.lugar_direccion && (
                  <span className="block text-[13px] mt-0.5" style={{ color: dimPale }}>
                    {evento.lugar_direccion}
                  </span>
                )}
              </p>
            )}
          </motion.div>
        )}

        {/* Dress code */}
        {evento.dress_code && (
          <motion.div variants={itemVariants} className="text-center mb-6">
            <p className="text-[9px] uppercase tracking-[0.3em] mb-2" style={{ color: `${dimPale}80` }}>
              etiqueta
            </p>
            <p className="font-cormorant text-lg" style={{ color: pale }}>{evento.dress_code}</p>
          </motion.div>
        )}

        <motion.div variants={itemVariants} className="mb-6">
          <MoonDivider color={silver} />
        </motion.div>

        {/* QR */}
        {invitado.qr_url && (
          <motion.div variants={itemVariants} className="mb-3">
            <div
              className="p-4 rounded-xl shadow-2xl"
              style={{
                backgroundColor: '#F0F4FF',
                boxShadow: `0 8px 40px ${glow}, 0 4px 16px rgba(0,0,0,0.4)`,
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
          className="text-[10px] text-center uppercase tracking-widest mb-10"
          style={{ color: `${dimPale}50` }}
        >
          tu pase de entrada
        </motion.p>

        {/* CTA — HIGH 18 CELESTIAL: soft glow button, rounded, subtle star sparkle */}
        <motion.div variants={itemVariants} className="flex flex-col gap-3 w-full max-w-[280px]">
          <InvitacionCTA
            token={invitado.token}
            eventoSlug={evento.slug}
            qrUrl={invitado.qr_url}
            estadoConfirmacion={invitado.estado_confirmacion}
            accentColor={silver}
            textColor={pale}
            borderColor={`${silver}30`}
            variant="celestial"
            primaryBtnStyle={{
              background: `linear-gradient(135deg, #6478C8, #8898E8)`,
              color: '#F0F4FF',
              boxShadow: `0 4px 24px ${glow}, 0 0 12px ${glow}`,
              borderRadius: '999px',
              fontSize: '14px',
              fontWeight: 600,
              padding: '14px 24px',
              textAlign: 'center',
              display: 'block',
              width: '100%',
              letterSpacing: '0.04em',
              transition: 'all 0.3s',
            }}
            secondaryBtnStyle={{
              border: `1px solid ${silver}30`,
              color: pale,
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

        {/* Footer stars */}
        <motion.div variants={itemVariants} className="mt-12 flex items-center gap-3">
          <div className="w-1 h-1 rounded-full" style={{ backgroundColor: `${silver}40` }} />
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: `${silver}60` }} />
          <div className="w-1 h-1 rounded-full" style={{ backgroundColor: `${silver}40` }} />
        </motion.div>
      </motion.div>
    </EnvelopeAnimation>
  )
}
