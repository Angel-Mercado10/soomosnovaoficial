'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { EnvelopeAnimation, type EnvelopeTheme } from './EnvelopeAnimation'
import { formatFechaEvento, staggerVariants, itemVariants, type InvitationTemplateProps } from './types'
import { InvitacionCTA } from './InvitacionCTA'
import CountdownEvento from '@/components/invitado/CountdownEvento'

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
 * Divider de rosas — 5 pétalos con centro
 */
function RoseDivider({ color }: { color: string }) {
  return (
    <div className="flex items-center justify-center gap-3 w-full max-w-[260px]">
      <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, transparent, ${color}35)` }} />
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M10 5 C12 7 13 9 10 10 C9 8 9 6 10 5Z" fill={color} opacity="0.62" />
        <path d="M14.5 7.5 C13 10 11 11 10 10 C11 8 13 7 14.5 7.5Z" fill={color} opacity="0.55" />
        <path d="M13 13.5 C11 12 10 10 10 10 C11.5 9.5 13 10.5 13 13.5Z" fill={color} opacity="0.55" />
        <path d="M7 13.5 C9 12 10 10 10 10 C8.5 9.5 7 10.5 7 13.5Z" fill={color} opacity="0.55" />
        <path d="M5.5 7.5 C7 10 9 11 10 10 C9 8 7 7 5.5 7.5Z" fill={color} opacity="0.55" />
        <circle cx="10" cy="10" r="2" fill={color} opacity="0.80" />
      </svg>
      <div className="flex-1 h-px" style={{ background: `linear-gradient(to left, transparent, ${color}35)` }} />
    </div>
  )
}

/**
 * Header floral ornamentado — rosas con swirls
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

      <path d="M8 56 Q16 44 28 48 Q40 32 58 40 Q72 22 92 34" stroke={rose} strokeWidth="1.0" strokeOpacity="0.42" fill="none" />
      <path d="M28 48 Q24 36 30 38 Q26 40 28 48Z" stroke={rose} strokeWidth="0.7" strokeOpacity="0.30" fill="none" />
      <path d="M46 36 Q40 26 46 30 Q44 34 46 36Z" stroke={rose} strokeWidth="0.6" strokeOpacity="0.25" fill="none" />

      {/* Left rose bloom */}
      <path d="M28 30 C30 32 32 34 29 36 C27 38 24 36 28 32 C28 30 28 30 28 30Z" fill="url(#romPetal)" />
      <path d="M28 30 C26 32 24 34 27 36 C29 38 32 36 28 32 C28 30 28 30 28 30Z" fill="url(#romPetal)" />
      <path d="M34 32 C33 35 31 37 29 36 C27 35 27 32 31 31 C33 30 34 32 34 32Z" fill="url(#romPetal)" />
      <path d="M22 32 C23 35 25 37 27 36 C29 35 29 32 25 31 C23 30 22 32 22 32Z" fill="url(#romPetal)" />
      <path d="M28 38 C26 37 24 35 27 33 C29 31 31 33 28 37Z" fill="url(#romPetal)" />
      <circle cx="28" cy="33" r="2.5" fill={dkRose} opacity="0.65" />

      <path d="M52 28 C53 24 56 24 57 27 C58 30 55 32 52 28Z" fill={rose} opacity="0.30" />
      <path d="M57 27 L58 32" stroke={rose} strokeWidth="0.7" strokeOpacity="0.25" />
      <circle cx="70" cy="26" r="2.5" fill={rose} opacity="0.22" />
      <circle cx="80" cy="32" r="2" fill={rose} opacity="0.18" />

      {/* Center rose — más detallada */}
      <path d="M130 18 C134 22 137 26 132 30 C130 33 127 30 130 24 C130 20 130 18 130 18Z" fill="url(#romPetal)" />
      <path d="M130 18 C126 22 123 26 128 30 C130 33 133 30 130 24 C130 20 130 18 130 18Z" fill="url(#romPetal)" />
      <path d="M140 24 C138 29 135 32 132 30 C128 29 128 25 134 23 C137 22 140 24 140 24Z" fill="url(#romPetal)" />
      <path d="M120 24 C122 29 125 32 128 30 C132 29 132 25 126 23 C123 22 120 24 120 24Z" fill="url(#romPetal)" />
      <path d="M138 34 C135 32 132 29 134 25 C136 22 140 24 138 31 C138 33 138 34 138 34Z" fill="url(#romPetal)" />
      <path d="M122 34 C125 32 128 29 126 25 C124 22 120 24 122 31 C122 33 122 34 122 34Z" fill="url(#romPetal)" />
      <path d="M130 36 C127 33 124 29 127 25 C130 22 133 24 132 30Z" fill="url(#romPetal)" />
      <path d="M130 36 C133 33 136 29 133 25 C130 22 127 24 128 30Z" fill="url(#romPetal)" />
      <path d="M130 24 C132 26 133 28 130 30 C128 31 127 29 129 27Z" fill={dkRose} opacity="0.68" />
      <circle cx="130" cy="28" r="3" fill={dkRose} opacity="0.72" />
      <path d="M130 36 Q129 48 130 58" stroke={rose} strokeWidth="0.9" strokeOpacity="0.30" fill="none" />
      <path d="M130 44 C126 40 123 44 127 46Z" fill={rose} opacity="0.22" />
      <path d="M130 44 C134 40 137 44 133 46Z" fill={rose} opacity="0.22" />

      {/* Right (mirrored) */}
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

// Pétalos de rosa caídos
const PETALS = [
  { left: '8%',  delay: 0,  driftX: [0, 18, -8],  rotate: [0, 120, 240] },
  { left: '25%', delay: 2,  driftX: [0, -20, 10],  rotate: [0, -90, -200] },
  { left: '55%', delay: 4,  driftX: [0, 14, -6],   rotate: [0, 200, 360] },
  { left: '72%', delay: 6,  driftX: [0, -16, 8],   rotate: [0, -150, -300] },
  { left: '88%', delay: 8,  driftX: [0, 22, -12],  rotate: [0, 80, 180] },
]

/**
 * Marco romántico de esquinas — rosas en miniatura + cintas decorativas
 */
function RomanticCorners() {
  const rose = '#C97A9A'
  const dkRose = '#A85880'
  // Mini rosa + swirl en esquina
  const TL = (
    <g>
      {/* Swirl decorativo */}
      <path d="M0 42 Q2 28 8 22 Q14 14 24 10 Q34 4 44 0" stroke={rose} strokeWidth="0.9" strokeOpacity="0.38" fill="none" />
      {/* Tendril */}
      <path d="M10 22 Q6 14 10 16 Q10 20 10 22Z" stroke={rose} strokeWidth="0.6" strokeOpacity="0.25" fill="none" />
      <path d="M22 12 Q18 6 22 8 Q22 10 22 12Z" stroke={rose} strokeWidth="0.5" strokeOpacity="0.20" fill="none" />
      {/* Mini rosa bloom */}
      <path d="M8 18 C9 20 11 21 9 22 C8 23 6 22 8 20 C8 18 8 18 8 18Z" fill={dkRose} opacity="0.55" />
      <path d="M8 18 C7 20 5 21 7 22 C8 23 10 22 8 20 C8 18 8 18 8 18Z" fill={dkRose} opacity="0.50" />
      <circle cx="8" cy="20" r="1.5" fill={rose} opacity="0.65" />
      {/* Pequeño corazón */}
      <path d="M0 0 C0 0 0.6 -1.5 1.2 -1.5 C1.8 -1.5 2.4 0 0 1.5 C-2.4 0 -1.8 -1.5 -1.2 -1.5 C-0.6 -1.5 0 0 0 0Z"
        transform="translate(44 0) scale(1.5)"
        fill={rose} opacity="0.42" />
      {/* Baya decorativa */}
      <circle cx="30" cy="6" r="2.5" fill={rose} opacity="0.28" />
      <circle cx="0" cy="0" r="3" fill={rose} opacity="0.38" />
    </g>
  )
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
      style={{ opacity: 0.70 }}
    >
      {/* Top-left */}
      <g transform="translate(6, 6)">{TL}</g>
      {/* Top-right (mirrored X) */}
      <g transform="translate(calc(100% - 6px), 6) scale(-1, 1)">{TL}</g>
      {/* Bottom-left (mirrored Y) */}
      <g transform="translate(6, calc(100% - 6px)) scale(1, -1)">{TL}</g>
      {/* Bottom-right (mirrored XY) */}
      <g transform="translate(calc(100% - 6px), calc(100% - 6px)) scale(-1, -1)">{TL}</g>

      {/* Filetes con línea de puntos a los lados */}
      <line x1="8" y1="0" x2="8" y2="100%" stroke={rose} strokeOpacity="0.07" strokeWidth="0.7" strokeDasharray="2 10" />
      <line x1="calc(100% - 8px)" y1="0" x2="calc(100% - 8px)" y2="100%" stroke={rose} strokeOpacity="0.07" strokeWidth="0.7" strokeDasharray="2 10" />
    </svg>
  )
}

/**
 * Sello romántico de cera — círculo con monograma y corazón
 */
function WaxSeal() {
  const dkRose = '#A84870'
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" fill="none" aria-hidden="true">
      {/* Forma irregular de sello de cera */}
      <path
        d="M36 4 C42 2 50 6 54 12 C60 10 66 16 66 22 C70 26 70 34 66 38 C70 44 66 52 60 54 C60 60 54 66 48 66 C44 70 38 70 34 66 C28 70 20 66 18 60 C12 60 6 54 6 48 C2 44 2 36 6 32 C2 26 6 18 12 16 C12 10 18 4 24 4 C28 2 34 4 36 4Z"
        fill={dkRose}
        opacity="0.85"
      />
      {/* Patrón de textura en el sello */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i * 360) / 12
        const rad = (angle * Math.PI) / 180
        const x1 = 36 + Math.cos(rad) * 20
        const y1 = 36 + Math.sin(rad) * 20
        const x2 = 36 + Math.cos(rad) * 28
        const y2 = 36 + Math.sin(rad) * 28
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#FFE0EA" strokeOpacity="0.20" strokeWidth="0.6" />
      })}
      {/* Círculo interior */}
      <circle cx="36" cy="36" r="18" stroke="#FFE0EA" strokeOpacity="0.30" strokeWidth="0.8" />
      {/* Monograma ♥ */}
      <path
        d="M36 44 C36 44 24 36 24 28 C24 23.6 27.6 20 32 20 C33.8 20 35.4 20.8 36.4 22.1 C37.4 20.8 39 20 40.8 20 C45.2 20 48 23.6 48 28 C48 36 36 44 36 44Z"
        fill="#FFE0EA"
        opacity="0.88"
        transform="scale(0.72) translate(14.5, 14.5)"
      />
    </svg>
  )
}

/**
 * Cinta decorativa — banda horizontal con textura de cinta
 */
function RibbonBand({ color }: { color: string }) {
  return (
    <svg width="280" height="18" viewBox="0 0 280 18" fill="none" aria-hidden="true">
      {/* La cinta central */}
      <path d="M0 9 Q70 4 140 9 Q210 14 280 9" stroke={color} strokeOpacity="0.28" strokeWidth="1.0" fill="none" />
      <path d="M0 9 Q70 14 140 9 Q210 4 280 9" stroke={color} strokeOpacity="0.15" strokeWidth="0.7" fill="none" />
      {/* Lazos laterales */}
      <path d="M0 5 Q8 2 12 9 Q8 16 0 13 Q4 9 0 5Z" fill={color} opacity="0.22" />
      <path d="M280 5 Q272 2 268 9 Q272 16 280 13 Q276 9 280 5Z" fill={color} opacity="0.22" />
      {/* Centro ornamental */}
      <path d="M136 4 Q140 1 144 4 L142 9 L140 14 L138 9Z" fill={color} opacity="0.35" />
      <circle cx="140" cy="9" r="2.5" fill={color} opacity="0.55" />
      <circle cx="140" cy="9" r="1" fill={color} opacity="0.80" />
      {/* Pequeñas flores a lo largo */}
      {[60, 100, 180, 220].map((x) => (
        <circle key={x} cx={x} cy="9" r="1.2" fill={color} opacity="0.30" />
      ))}
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
        className="min-h-screen flex flex-col items-center px-6 pt-10 pb-16 relative overflow-hidden"
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

        {/* Marco romántico de esquinas — rosas + cintas */}
        <RomanticCorners />

        {/* Pétalos de rosa caídos */}
        {PETALS.map((petal, i) => (
          <motion.div
            key={i}
            className="absolute top-0 pointer-events-none"
            style={{
              left: petal.left,
              width: '12px',
              height: '18px',
              borderRadius: '50% 10% 50% 10%',
              backgroundColor: '#C97A9A15',
            }}
            animate={{
              y: [0, '100vh'],
              x: petal.driftX,
              opacity: [0, 0.6, 0],
              rotate: petal.rotate,
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              repeatDelay: petal.delay,
              ease: 'easeIn',
              delay: petal.delay,
            }}
          />
        ))}

        {/* HERO — FloralHeader con efecto respiración */}
        <motion.div
          variants={itemVariants}
          className="mb-3 relative z-10"
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <FloralHeader />
        </motion.div>

        {/* Cinta decorativa superior */}
        <motion.div variants={itemVariants} className="mb-3 relative z-10">
          <RibbonBand color={rose} />
        </motion.div>

        {/* Frase temática */}
        <motion.p
          variants={itemVariants}
          className="font-cormorant italic text-[13px] tracking-wider mb-3 relative z-10 text-center"
          style={{ color: `${dimBlush}90` }}
        >
          Donde el amor escribe la historia más bella.
        </motion.p>

        {/* FRASE HERO */}
        <motion.div variants={itemVariants} className="mb-4 relative z-10 text-center px-4">
          <p className="font-cormorant italic text-2xl md:text-3xl leading-snug" style={{ color: blush, textShadow: `0 0 30px rgba(200,100,140,0.25)` }}>
            ¡Nos casamos!{' '}
            <span style={{ color: rose }}>
              Y te invitamos a celebrar nuestro día
            </span>
            <span style={{ color: rose }} className="text-xl">!!!</span>
          </p>
        </motion.div>

        {/* Cinta decorativa inferior */}
        <motion.div variants={itemVariants} className="mb-4 relative z-10">
          <RibbonBand color={rose} />
        </motion.div>

        {/* Sello de cera + nombres — disposición editorial */}
        <motion.div variants={itemVariants} className="flex items-center gap-4 mb-4 relative z-10">
          <WaxSeal />
          <div className="flex flex-col items-start">
            <p className="font-cormorant text-5xl md:text-7xl italic text-center leading-none tracking-[0.12em]"
              style={{ color: blush, textShadow: `0 0 48px rgba(200,100,140,0.30)` }}>
              {parejaNombres}
            </p>
            <p className="font-cormorant text-[10px] uppercase tracking-[0.40em] mt-1"
              style={{ color: `${dimBlush}45` }}>
              ♡ unidos para siempre ♡
            </p>
          </div>
        </motion.div>

        {/* SALUDO PERSONAL */}
        <motion.p
          variants={itemVariants}
          className="font-cormorant italic text-xl text-center mb-2 relative z-10"
          style={{ color: `${dimBlush}90` }}
        >
          de todo corazón, queremos que seas parte de este momento,
        </motion.p>
        <motion.p
          variants={itemVariants}
          className="font-cormorant italic text-3xl text-center mb-8 relative z-10"
          style={{ color: rose }}
        >
          {invitado.nombre}
        </motion.p>

        {/* DIVIDER */}
        <motion.div variants={itemVariants} className="mb-8 relative z-10">
          <RoseDivider color={rose} />
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
          <RoseDivider color={rose} />
        </motion.div>

        {/* DETALLES */}
        <motion.div variants={itemVariants} className="text-center mb-8 relative z-10">
          <p className="text-[9px] uppercase tracking-[0.3em] mb-2" style={{ color: `${dimBlush}70` }}>
            ♡ el día especial
          </p>
          <p className="font-cormorant text-xl text-center" style={{ color: blush }}>
            {formatFechaEvento(evento.fecha_evento, evento.hora_evento)}
          </p>
        </motion.div>

        {evento.lugar_nombre && (
          <motion.div variants={itemVariants} className="text-center mb-8 relative z-10">
            <p className="text-[9px] uppercase tracking-[0.3em] mb-2" style={{ color: `${dimBlush}70` }}>
              ♡ celebración
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
              <p className="font-cormorant text-xl text-center" style={{ color: blush }}>
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

        {evento.dress_code && (
          <motion.div variants={itemVariants} className="text-center mb-8 relative z-10">
            <p className="text-[9px] uppercase tracking-[0.3em] mb-2" style={{ color: `${dimBlush}70` }}>
              ♡ etiqueta
            </p>
            <p className="font-cormorant text-lg" style={{ color: blush }}>{evento.dress_code}</p>
          </motion.div>
        )}

        {/* DIVIDER */}
        <motion.div variants={itemVariants} className="mb-10 relative z-10">
          <RoseDivider color={rose} />
        </motion.div>

        {/* QR — frame rosado con corazón decorativo encima */}
        {invitado.qr_url && (
          <motion.div variants={itemVariants} className="flex flex-col items-center mb-3 relative z-10">
            <p className="font-cormorant text-2xl text-center mb-4" style={{ color: blush }}>
              Tu pase de entrada
            </p>
            <div className="relative">
              {/* Corazón SVG decorativo encima del QR */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                <svg width="28" height="26" viewBox="0 0 24 22" fill="none" aria-hidden="true">
                  <path
                    d="M12 21 C12 21 1 13 1 6.5 C1 3.42 3.42 1 6.5 1 C8.24 1 9.91 1.81 11 3.08 C12.09 1.81 13.76 1 15.5 1 C18.58 1 21 3.42 21 6.5 C21 13 12 21 12 21Z"
                    fill={rose}
                    opacity="0.75"
                  />
                </svg>
              </div>
              {/* Rosas en las esquinas del QR */}
              {[
                { style: { top: -8, left: -8 } },
                { style: { top: -8, right: -8 } },
                { style: { bottom: -8, left: -8 } },
                { style: { bottom: -8, right: -8 } },
              ].map(({ style }, i) => (
                <svg key={i} className="absolute pointer-events-none" width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"
                  style={style}
                >
                  <path d="M9 4 C10 6 11 8 9 9 C8 7 8 5 9 4Z" fill={rose} opacity="0.55" />
                  <path d="M9 4 C8 6 7 8 9 9 C10 7 10 5 9 4Z" fill={rose} opacity="0.50" />
                  <path d="M12 6 C11 8 10 9 9 9 C8 8.5 8 7 10 6Z" fill={rose} opacity="0.48" />
                  <path d="M6 6 C7 8 8 9 9 9 C10 8.5 10 7 8 6Z" fill={rose} opacity="0.48" />
                  <circle cx="9" cy="8" r="1.8" fill="#A85880" opacity="0.60" />
                </svg>
              ))}
              <div
                className="rounded-3xl p-4"
                style={{
                  backgroundColor: '#FFF0F5',
                  border: `2px solid rgba(201,122,154,0.30)`,
                  boxShadow: `0 0 40px rgba(201,122,154,0.20), 0 4px 16px rgba(0,0,0,0.4)`,
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
            </div>
          </motion.div>
        )}
        <motion.p
          variants={itemVariants}
          className="text-[10px] text-center uppercase tracking-widest mb-12 relative z-10"
          style={{ color: `${dimBlush}50` }}
        >
          presentar en la entrada del evento
        </motion.p>

        {/* CTA */}
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

        {/* FOOTER */}
        <motion.div variants={itemVariants} className="mt-12 flex flex-col items-center gap-2 relative z-10">
          {/* Mini rama con rosas como separador de footer */}
          <svg width="120" height="24" viewBox="0 0 120 24" fill="none" aria-hidden="true">
            <path d="M4 12 Q20 8 40 12 Q60 16 60 12 Q60 8 80 12 Q100 16 116 12" stroke={rose} strokeOpacity="0.22" strokeWidth="0.8" fill="none" />
            <circle cx="20" cy="10" r="2" fill={rose} opacity="0.25" />
            <circle cx="60" cy="12" r="3" fill={rose} opacity="0.30" />
            <circle cx="100" cy="10" r="2" fill={rose} opacity="0.25" />
          </svg>
          <svg width="24" height="22" viewBox="0 0 24 22" fill="none" aria-hidden="true">
            <path
              d="M12 21 C12 21 1 13 1 6.5 C1 3.42 3.42 1 6.5 1 C8.24 1 9.91 1.81 11 3.08 C12.09 1.81 13.76 1 15.5 1 C18.58 1 21 3.42 21 6.5 C21 13 12 21 12 21Z"
              fill={rose}
              opacity="0.35"
            />
          </svg>
          <p className="text-[9px] uppercase tracking-widest" style={{ color: `${dimBlush}30` }}>SoomosNova</p>
        </motion.div>
      </motion.div>
    </EnvelopeAnimation>
  )
}
