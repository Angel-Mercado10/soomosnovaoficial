'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { EnvelopeAnimation, type EnvelopeTheme } from './EnvelopeAnimation'
import { formatFechaEvento, staggerVariants, itemVariants, type InvitationTemplateProps } from './types'
import { InvitacionCTA } from './InvitacionCTA'
import CountdownEvento from '@/components/invitado/CountdownEvento'

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
 * Constelación de fondo completa — mapa de estrellas con múltiples constelaciones
 */
function ConstellationMap() {
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
      <line x1="55" y1="12" x2="90" y2="42" stroke="#A8C0F8" strokeOpacity="0.15" strokeWidth="0.6" />
      <line x1="90" y1="42" x2="130" y2="18" stroke="#A8C0F8" strokeOpacity="0.15" strokeWidth="0.6" />
      <line x1="200" y1="8" x2="240" y2="32" stroke="#A8C0F8" strokeOpacity="0.12" strokeWidth="0.6" />
      <line x1="240" y1="32" x2="268" y2="16" stroke="#A8C0F8" strokeOpacity="0.12" strokeWidth="0.6" />
      <line x1="75" y1="52" x2="115" y2="68" stroke="#A8C0F8" strokeOpacity="0.10" strokeWidth="0.5" />

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
 * Crescent moon con cráteres y destellos
 */
function CrescentMoon({ color }: { color: string }) {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden="true">
      <path
        d="M34 22 C34 29.732 27.732 36 20 36 C12.268 36 6 29.732 6 22 C6 14.268 12.268 8 20 8 C15.582 10.8 15.582 33.2 20 36 C24.418 33.2 24.418 10.8 20 8 C27.732 8 34 14.268 34 22Z"
        fill={color}
        opacity="0.82"
      />
      <circle cx="24" cy="16" r="1.8" fill={color} opacity="0.40" />
      <circle cx="24" cy="16" r="0.9" fill={color} opacity="0.22" />
      <circle cx="26" cy="25" r="2.5" fill={color} opacity="0.32" />
      <circle cx="26" cy="25" r="1.2" fill={color} opacity="0.18" />
      <circle cx="23" cy="30" r="1.2" fill={color} opacity="0.28" />
      <path d="M16 12 Q17 18 15 24" stroke={color} strokeOpacity="0.22" strokeWidth="0.7" fill="none" />
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

/**
 * Órbita elíptica animada — detalle de profundidad celestial
 */
function OrbitRing({ color }: { color: string }) {
  return (
    <div className="relative flex items-center justify-center" style={{ width: 220, height: 60 }}>
      <svg width="220" height="60" viewBox="0 0 220 60" fill="none" aria-hidden="true">
        {/* Elipse de órbita */}
        <ellipse cx="110" cy="30" rx="108" ry="26" stroke={color} strokeOpacity="0.18" strokeWidth="0.8" strokeDasharray="4 5" />
        {/* Segunda elipse interior */}
        <ellipse cx="110" cy="30" rx="88" ry="20" stroke={color} strokeOpacity="0.10" strokeWidth="0.6" strokeDasharray="2 6" />
        {/* Planetas/puntos en la órbita */}
        <circle cx="2" cy="30" r="3" fill={color} opacity="0.50" />
        <circle cx="218" cy="30" r="2" fill={color} opacity="0.35" />
        <circle cx="110" cy="4" r="1.5" fill={color} opacity="0.40" />
        {/* Sparkle en un punto orbital */}
        <path d="M2 30 L2.6 32 L4.6 32.6 L2.6 33.2 L2 35.2 L1.4 33.2 L-0.6 32.6 L1.4 32Z" fill={color} opacity="0.60" />
      </svg>
    </div>
  )
}

/**
 * Marco celestial de esquinas — estrellas de 4 puntas en las esquinas
 */
function CelestialCorners() {
  const silver = '#A8B8E8'
  // Estrella de 4 puntas + arcos decorativos
  const starPath = `M0 -8 L1.4 -1.4 L8 0 L1.4 1.4 L0 8 L-1.4 1.4 L-8 0 L-1.4 -1.4Z`
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
      style={{ opacity: 0.50 }}
    >
      {/* Top-left star + arco */}
      <g transform="translate(20, 20)">
        <path d={starPath} fill={silver} opacity="0.60" />
        <path d="M-16 0 Q-8 -12 0 -16" stroke={silver} strokeOpacity="0.25" strokeWidth="0.7" fill="none" />
        <path d="M0 16 Q12 8 16 0" stroke={silver} strokeOpacity="0.18" strokeWidth="0.6" fill="none" />
        <line x1="-16" y1="-16" x2="0" y2="0" stroke={silver} strokeOpacity="0.12" strokeWidth="0.5" />
      </g>
      {/* Top-right star */}
      <g transform="translate(calc(100% - 20px), 20)">
        <path d={starPath} fill={silver} opacity="0.60" />
        <path d="M16 0 Q8 -12 0 -16" stroke={silver} strokeOpacity="0.25" strokeWidth="0.7" fill="none" />
        <line x1="16" y1="-16" x2="0" y2="0" stroke={silver} strokeOpacity="0.12" strokeWidth="0.5" />
      </g>
      {/* Bottom-left star */}
      <g transform="translate(20, calc(100% - 20px))">
        <path d={starPath} fill={silver} opacity="0.60" />
        <path d="M-16 0 Q-8 12 0 16" stroke={silver} strokeOpacity="0.25" strokeWidth="0.7" fill="none" />
        <line x1="-16" y1="16" x2="0" y2="0" stroke={silver} strokeOpacity="0.12" strokeWidth="0.5" />
      </g>
      {/* Bottom-right star */}
      <g transform="translate(calc(100% - 20px), calc(100% - 20px))">
        <path d={starPath} fill={silver} opacity="0.60" />
        <path d="M16 0 Q8 12 0 16" stroke={silver} strokeOpacity="0.25" strokeWidth="0.7" fill="none" />
        <line x1="16" y1="16" x2="0" y2="0" stroke={silver} strokeOpacity="0.12" strokeWidth="0.5" />
      </g>

      {/* Filetes laterales con línea punteada */}
      <line x1="8" y1="0" x2="8" y2="100%" stroke={silver} strokeOpacity="0.08" strokeWidth="0.6" strokeDasharray="3 8" />
      <line x1="calc(100% - 8px)" y1="0" x2="calc(100% - 8px)" y2="100%" stroke={silver} strokeOpacity="0.08" strokeWidth="0.6" strokeDasharray="3 8" />
    </svg>
  )
}

/**
 * Mapa de constelación completo — fondo absoluto
 */
function ConstellationBackground() {
  const s = '#A8C0F8'
  // Posiciones de estrellas adicionales para el mapa de fondo
  const bgStars = [
    [15, 80], [45, 120], [80, 200], [30, 300], [60, 420], [25, 500],
    [260, 90], [240, 180], [270, 280], [255, 380], [245, 460],
    [120, 160], [150, 240], [100, 340], [140, 440],
  ]
  // Líneas de constelación de fondo
  const bgLines = [
    [15, 80, 45, 120], [45, 120, 80, 200], [80, 200, 60, 420],
    [260, 90, 240, 180], [240, 180, 255, 380],
    [120, 160, 150, 240], [150, 240, 100, 340],
  ]
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
      style={{ opacity: 0.07 }}
      preserveAspectRatio="xMidYMid slice"
    >
      {bgLines.map(([x1, y1, x2, y2], i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={s} strokeWidth="0.8" />
      ))}
      {bgStars.map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={0.8 + (i % 3) * 0.4} fill={s} />
      ))}
    </svg>
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
        {/* Mapa de constelaciones de fondo absoluto */}
        <ConstellationBackground />

        {/* Marco de esquinas celestiales */}
        <CelestialCorners />

        {/* Gradiente radial superior */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at center, rgba(26,26,78,0.30) 0%, transparent 70%)`,
            filter: 'blur(60px)',
          }}
        />
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at center, ${glow} 0%, transparent 70%)`,
            filter: 'blur(40px)',
          }}
        />

        {/* Estrella fugaz */}
        <motion.div
          className="absolute top-16 left-10 w-32 h-px pointer-events-none"
          style={{
            background: `linear-gradient(to right, transparent, ${silver}80, transparent)`,
            transformOrigin: 'left center',
            rotate: '20deg',
          }}
          animate={{ x: [0, 200], y: [0, 100], opacity: [0, 1, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 7, ease: 'easeOut' }}
        />

        {/* Segunda estrella fugaz — lado derecho, ángulo diferente */}
        <motion.div
          className="absolute top-32 right-12 w-24 h-px pointer-events-none"
          style={{
            background: `linear-gradient(to left, transparent, ${silver}60, transparent)`,
            transformOrigin: 'right center',
            rotate: '-15deg',
          }}
          animate={{ x: [0, -160], y: [0, 80], opacity: [0, 0.8, 0] }}
          transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 11, ease: 'easeOut', delay: 4 }}
        />

        {/* HERO — Star field top */}
        <motion.div variants={itemVariants} className="relative w-full max-w-[280px] h-20 mb-2 z-10">
          <ConstellationMap />
        </motion.div>

        {/* Moon + frase temática */}
        <motion.div variants={itemVariants} className="flex flex-col items-center mb-4 relative z-10">
          <div className="mb-2">
            <CrescentMoon color={silver} />
          </div>
          <p
            className="font-cormorant italic text-[12px] tracking-[0.18em] text-center max-w-[240px]"
            style={{ color: `${dimPale}90` }}
          >
            Bajo el mismo cielo, encontramos el camino de vuelta el uno al otro.
          </p>
        </motion.div>

        {/* Órbita decorativa */}
        <motion.div variants={itemVariants} className="mb-4 relative z-10">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
          >
            <OrbitRing color={silver} />
          </motion.div>
        </motion.div>

        {/* FRASE HERO */}
        <motion.div variants={itemVariants} className="mb-6 relative z-10 text-center px-4">
          <p className="font-cormorant text-2xl md:text-3xl leading-snug" style={{ color: pale, textShadow: `0 0 30px ${silver}30` }}>
            ¡Nos casamos!{' '}
            <span className="italic" style={{ color: silver }}>
              Y te invitamos a celebrar nuestro día
            </span>
            <span style={{ color: silver }} className="text-xl">!!!</span>
          </p>
        </motion.div>

        {/* PAREJA — nombres masivos */}
        <motion.h1
          variants={itemVariants}
          className="font-cormorant text-6xl md:text-8xl text-center leading-none tracking-[0.15em] mb-1 relative z-10"
          style={{ color: pale, textShadow: `0 0 60px ${silver}40` }}
        >
          {parejaNombres}
        </motion.h1>

        {/* Subtítulo celestial */}
        <motion.p
          variants={itemVariants}
          className="font-cormorant text-[10px] uppercase tracking-[0.50em] mb-6 relative z-10 text-center"
          style={{ color: `${dimPale}50` }}
        >
          ✦ escrito en las estrellas ✦
        </motion.p>

        {/* SALUDO PERSONAL */}
        <motion.p
          variants={itemVariants}
          className="font-cormorant italic text-xl text-center mb-2 relative z-10"
          style={{ color: `${dimPale}90` }}
        >
          el universo nos dio una razón para reunirnos contigo,
        </motion.p>
        <motion.p
          variants={itemVariants}
          className="font-cormorant text-3xl text-center mb-8 relative z-10"
          style={{
            color: silver,
            filter: 'drop-shadow(0 0 8px rgba(168,184,232,0.40))',
          }}
        >
          {invitado.nombre}
        </motion.p>

        {/* DIVIDER */}
        <motion.div variants={itemVariants} className="mb-8 relative z-10">
          <MoonDivider color={silver} />
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
          <MoonDivider color={silver} />
        </motion.div>

        {/* DETALLES */}
        <motion.div variants={itemVariants} className="text-center mb-8 relative z-10">
          <p className="text-[9px] uppercase tracking-[0.3em] mb-2" style={{ color: `${dimPale}80` }}>
            ✦ noche de celebración
          </p>
          <p className="font-cormorant text-xl text-center" style={{ color: pale }}>
            {formatFechaEvento(evento.fecha_evento, evento.hora_evento)}
          </p>
        </motion.div>

        {evento.lugar_nombre && (
          <motion.div variants={itemVariants} className="text-center mb-8 relative z-10">
            <p className="text-[9px] uppercase tracking-[0.3em] mb-2" style={{ color: `${dimPale}80` }}>
              ☽ lugar
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
              <p className="font-cormorant text-xl text-center" style={{ color: pale }}>
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

        {evento.dress_code && (
          <motion.div variants={itemVariants} className="text-center mb-8 relative z-10">
            <p className="text-[9px] uppercase tracking-[0.3em] mb-2" style={{ color: `${dimPale}80` }}>
              ✦ etiqueta
            </p>
            <p className="font-cormorant text-lg" style={{ color: pale }}>{evento.dress_code}</p>
          </motion.div>
        )}

        {/* DIVIDER */}
        <motion.div variants={itemVariants} className="mb-10 relative z-10">
          <MoonDivider color={silver} />
        </motion.div>

        {/* QR — frame oscuro con glow celestial */}
        {invitado.qr_url && (
          <motion.div variants={itemVariants} className="flex flex-col items-center mb-3 relative z-10">
            <p className="font-cormorant text-2xl text-center mb-4" style={{ color: pale }}>
              Tu pase de entrada
            </p>
            <div className="relative">
              {/* Estrellas de 4 puntas en las esquinas del QR */}
              {[
                { top: -12, left: -12 },
                { top: -12, right: -12 },
                { bottom: -12, left: -12 },
                { bottom: -12, right: -12 },
              ].map((pos, i) => (
                <svg key={i} className="absolute pointer-events-none" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"
                  style={{ ...pos }}
                >
                  <path d="M8 0 L9.2 6.8 L16 8 L9.2 9.2 L8 16 L6.8 9.2 L0 8 L6.8 6.8Z" fill={silver} opacity="0.65" />
                </svg>
              ))}
              <div
                className="rounded-2xl p-4"
                style={{
                  backgroundColor: '#0D1428',
                  border: `1px solid rgba(168,184,232,0.30)`,
                  boxShadow: `0 0 30px rgba(168,184,232,0.20), 0 0 60px rgba(99,102,241,0.10)`,
                }}
              >
                <div
                  className="rounded-xl overflow-hidden"
                  style={{ border: `1px solid rgba(168,184,232,0.15)` }}
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
            </div>
          </motion.div>
        )}
        <motion.p
          variants={itemVariants}
          className="text-[10px] text-center uppercase tracking-widest mb-10 relative z-10"
          style={{ color: `${dimPale}50` }}
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

        {/* FOOTER */}
        <motion.div variants={itemVariants} className="mt-12 flex flex-col items-center gap-2 relative z-10">
          {/* Pequeña constelación de footer */}
          <svg width="80" height="20" viewBox="0 0 80 20" fill="none" aria-hidden="true">
            <line x1="10" y1="10" x2="30" y2="5" stroke={silver} strokeOpacity="0.20" strokeWidth="0.6" />
            <line x1="30" y1="5" x2="50" y2="10" stroke={silver} strokeOpacity="0.20" strokeWidth="0.6" />
            <line x1="50" y1="10" x2="70" y2="5" stroke={silver} strokeOpacity="0.18" strokeWidth="0.6" />
            <circle cx="10" cy="10" r="1.2" fill={silver} opacity="0.40" />
            <circle cx="30" cy="5" r="1.5" fill={silver} opacity="0.50" />
            <circle cx="50" cy="10" r="1.0" fill={silver} opacity="0.35" />
            <circle cx="70" cy="5" r="1.2" fill={silver} opacity="0.40" />
          </svg>
          <div className="flex items-center gap-3">
            <div className="w-1 h-1 rounded-full" style={{ backgroundColor: `${silver}40` }} />
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: `${silver}60` }} />
            <div className="w-1 h-1 rounded-full" style={{ backgroundColor: `${silver}40` }} />
          </div>
          <p className="text-[9px] uppercase tracking-widest" style={{ color: `${dimPale}30` }}>SoomosNova</p>
        </motion.div>
      </motion.div>
    </EnvelopeAnimation>
  )
}
