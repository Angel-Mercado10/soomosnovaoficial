'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { EnvelopeAnimation, type EnvelopeTheme } from './EnvelopeAnimation'
import { formatFechaEvento, staggerVariants, itemVariants, type InvitationTemplateProps } from './types'
import { InvitacionCTA } from './InvitacionCTA'
import CountdownEvento from '@/components/invitado/CountdownEvento'

const theme: EnvelopeTheme = {
  bg: '#080605',
  envelopeBg: '#110D08',
  envelopeAccent: '#D4A017',
  envelopeShadow: 'rgba(212,160,23,0.20)',
  sealColor: '#D4A017',
  sealText: '#080605',
  nameColor: '#F5E6C8',
}

function GeometricDivider({ color }: { color: string }) {
  return (
    <div className="flex items-center justify-center gap-2 w-full max-w-[260px]">
      <div className="flex-1 h-px" style={{ backgroundColor: `${color}30` }} />
      <div
        className="w-2 h-2 rotate-45"
        style={{ backgroundColor: color, opacity: 0.7 }}
      />
      <div
        className="w-1 h-1 rotate-45"
        style={{ backgroundColor: color, opacity: 0.45 }}
      />
      <div
        className="w-2 h-2 rotate-45"
        style={{ backgroundColor: color, opacity: 0.7 }}
      />
      <div className="flex-1 h-px" style={{ backgroundColor: `${color}30` }} />
    </div>
  )
}

/**
 * Art Déco sunburst / fan header — CRITICAL 7.
 * Proper fan rays with layered arcs, tick marks, corner chevrons and central diamond.
 */
function ArtDecoSunburst() {
  const gold = '#D4A017'
  // 9 symmetrical fan rays emanating from center-bottom focal point
  const rays = [
    'M130 52 L68 2',
    'M130 52 L85 0',
    'M130 52 L104 0',
    'M130 52 L124 0',
    'M130 52 L130 0',
    'M130 52 L136 0',
    'M130 52 L156 0',
    'M130 52 L175 0',
    'M130 52 L192 2',
  ]
  return (
    <svg width="280" height="64" viewBox="0 0 280 64" fill="none" aria-hidden="true">
      {/* Fan rays */}
      {rays.map((d, i) => (
        <path key={i} d={d} stroke={gold} strokeOpacity={0.30 - i * 0.005} strokeWidth="0.8" />
      ))}
      {/* Outer arc */}
      <path d="M68 2 Q130 22 192 2" stroke={gold} strokeOpacity="0.22" strokeWidth="0.9" fill="none" />
      {/* Inner arc */}
      <path d="M88 16 Q130 30 172 16" stroke={gold} strokeOpacity="0.16" strokeWidth="0.7" fill="none" />
      {/* Innermost arc */}
      <path d="M108 30 Q130 38 152 30" stroke={gold} strokeOpacity="0.12" strokeWidth="0.6" fill="none" />
      {/* Central sunburst diamond */}
      <rect x="126" y="48" width="8" height="8" transform="rotate(45 130 52)" fill={gold} opacity="0.88" />
      <rect x="128" y="50" width="4" height="4" transform="rotate(45 130 52)" fill={gold} opacity="0.50" />
      {/* Horizontal rule */}
      <line x1="0" y1="60" x2="112" y2="60" stroke={gold} strokeOpacity="0.28" strokeWidth="0.8" />
      <line x1="148" y1="60" x2="280" y2="60" stroke={gold} strokeOpacity="0.28" strokeWidth="0.8" />
      {/* Corner chevrons */}
      <path d="M0 4 L7 4 L7 11" stroke={gold} strokeOpacity="0.45" strokeWidth="0.9" fill="none" />
      <path d="M280 4 L273 4 L273 11" stroke={gold} strokeOpacity="0.45" strokeWidth="0.9" fill="none" />
      <path d="M0 56 L7 56 L7 49" stroke={gold} strokeOpacity="0.35" strokeWidth="0.8" fill="none" />
      <path d="M280 56 L273 56 L273 49" stroke={gold} strokeOpacity="0.35" strokeWidth="0.8" fill="none" />
      {/* Tick marks along rule */}
      {[40, 60, 80, 100, 160, 180, 200, 220].map((x) => (
        <line key={x} x1={x} y1="57" x2={x} y2="63" stroke={gold} strokeOpacity="0.20" strokeWidth="0.6" />
      ))}
      {/* Small flanking diamonds */}
      <rect x="108" y="56" width="5" height="5" transform="rotate(45 110.5 58.5)" fill={gold} opacity="0.42" />
      <rect x="165" y="56" width="5" height="5" transform="rotate(45 167.5 58.5)" fill={gold} opacity="0.42" />
    </svg>
  )
}

function ArtDecoFrame() {
  const gold = '#D4A017'
  return (
    <svg width="280" height="12" viewBox="0 0 280 12" fill="none" aria-hidden="true">
      {/* Center diamond */}
      <rect x="126" y="4" width="8" height="8" transform="rotate(45 130 8)" fill={gold} opacity="0.80" />
      {/* Flanking lines */}
      <line x1="0" y1="8" x2="118" y2="8" stroke={gold} strokeOpacity="0.28" strokeWidth="0.8" />
      <line x1="142" y1="8" x2="280" y2="8" stroke={gold} strokeOpacity="0.28" strokeWidth="0.8" />
      {/* Corner accents */}
      <rect x="2" y="4" width="5" height="5" transform="rotate(45 4.5 6.5)" fill={gold} opacity="0.42" />
      <rect x="273" y="4" width="5" height="5" transform="rotate(45 275.5 6.5)" fill={gold} opacity="0.42" />
      {/* Inner tick marks */}
      {[40, 60, 80, 100, 160, 180, 200, 220].map((x) => (
        <line key={x} x1={x} y1="5" x2={x} y2="11" stroke={gold} strokeOpacity="0.20" strokeWidth="0.6" />
      ))}
    </svg>
  )
}

export function PlantillaArtDeco({ invitado, evento, parejaNombres }: InvitationTemplateProps) {
  const gold = '#D4A017'
  const cream = '#F5E6C8'
  const dimCream = '#BFA97A'

  // Año del evento para la frase temática
  const anioEvento = evento.fecha_evento ? new Date(evento.fecha_evento).getFullYear() : new Date().getFullYear()

  return (
    <EnvelopeAnimation coupleNames={parejaNombres} theme={theme}>
      <motion.div
        variants={staggerVariants}
        initial="hidden"
        animate="visible"
        className="min-h-screen flex flex-col items-center px-6 pt-12 pb-16 relative overflow-hidden"
        style={{
          backgroundColor: '#080605',
          // Patrón geométrico de rombos como profundidad
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolygon points='10,2 18,10 10,18 2,10' fill='none' stroke='rgba(212,160,23,0.06)' stroke-width='0.5'/%3E%3C/svg%3E")`,
        }}
      >
        {/* HERO — ArtDecoSunburst con rotación lenta */}
        <motion.div variants={itemVariants} className="mb-5 relative z-10">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
          >
            <ArtDecoSunburst />
          </motion.div>
        </motion.div>

        {/* Frase temática */}
        <motion.p
          variants={itemVariants}
          className="font-cormorant text-[11px] uppercase tracking-[0.35em] mb-4 text-center relative z-10"
          style={{ color: `${gold}70` }}
        >
          Est. {anioEvento} — Una velada de gala
        </motion.p>

        {/* Crown ornament */}
        <motion.div variants={itemVariants} className="mb-4 flex items-center gap-2 relative z-10">
          <div className="w-6 h-px" style={{ backgroundColor: `${gold}50` }} />
          <svg width="24" height="20" viewBox="0 0 24 20" fill="none" aria-hidden="true">
            <path d="M12 2L14 8H20L15 12L17 18L12 14L7 18L9 12L4 8H10L12 2Z"
              fill={gold} opacity="0.8" />
          </svg>
          <div className="w-6 h-px" style={{ backgroundColor: `${gold}50` }} />
        </motion.div>

        {/* PAREJA — nombres masivos */}
        <motion.h1
          variants={itemVariants}
          className="font-cormorant text-6xl md:text-8xl italic text-center leading-none tracking-[0.15em] mb-6 relative z-10"
          style={{ color: cream }}
        >
          {parejaNombres}
        </motion.h1>

        {/* SALUDO PERSONAL — todo uppercase Art Déco */}
        <motion.p
          variants={itemVariants}
          className="text-[11px] uppercase tracking-[0.28em] text-center mb-2 relative z-10"
          style={{ color: dimCream }}
        >
          solicitan su distinguida presencia
        </motion.p>
        <motion.p
          variants={itemVariants}
          className="font-cormorant text-2xl uppercase tracking-[0.25em] text-center mb-8 relative z-10"
          style={{ color: gold }}
        >
          {invitado.nombre}
        </motion.p>

        {/* DIVIDER */}
        <motion.div variants={itemVariants} className="mb-8 relative z-10">
          <GeometricDivider color={gold} />
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
          <GeometricDivider color={gold} />
        </motion.div>

        {/* DETALLES — stacked con líneas divisoras entre cada dato */}
        {/* Fecha */}
        <motion.div variants={itemVariants} className="w-full max-w-[280px] mb-0 relative z-10">
          <div className="pt-5 pb-5 border-t" style={{ borderColor: `${gold}20` }}>
            <p className="text-[9px] uppercase tracking-[0.3em] mb-2 text-center" style={{ color: `${gold}80` }}>
              en la celebración
            </p>
            <p className="font-cormorant text-xl text-center" style={{ color: cream }}>
              {formatFechaEvento(evento.fecha_evento, evento.hora_evento)}
            </p>
          </div>
        </motion.div>

        {/* Venue */}
        {evento.lugar_nombre && (
          <motion.div variants={itemVariants} className="w-full max-w-[280px] mb-0 relative z-10">
            <div className="pt-5 pb-5 border-t" style={{ borderColor: `${gold}20` }}>
              <p className="text-[9px] uppercase tracking-[0.3em] mb-2 text-center" style={{ color: `${gold}80` }}>
                lugar
              </p>
              {evento.lugar_maps_url ? (
                <a
                  href={evento.lugar_maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-cormorant text-xl text-center block transition-opacity hover:opacity-80"
                  style={{ color: cream }}
                >
                  {evento.lugar_nombre}
                  {evento.lugar_direccion && (
                    <span className="block text-[13px] mt-0.5" style={{ color: dimCream }}>
                      {evento.lugar_direccion}
                    </span>
                  )}
                </a>
              ) : (
                <p className="font-cormorant text-xl text-center" style={{ color: cream }}>
                  {evento.lugar_nombre}
                  {evento.lugar_direccion && (
                    <span className="block text-[13px] mt-0.5" style={{ color: dimCream }}>
                      {evento.lugar_direccion}
                    </span>
                  )}
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* Dress code */}
        {evento.dress_code && (
          <motion.div variants={itemVariants} className="w-full max-w-[280px] mb-6 relative z-10">
            <div className="pt-5 pb-5 border-t border-b" style={{ borderColor: `${gold}20` }}>
              <p className="text-[9px] uppercase tracking-[0.3em] mb-2 text-center" style={{ color: `${gold}80` }}>
                etiqueta
              </p>
              <p className="font-cormorant text-xl text-center" style={{ color: cream }}>
                {evento.dress_code}
              </p>
            </div>
          </motion.div>
        )}

        {/* DIVIDER si no hubo dress code */}
        {!evento.dress_code && (
          <motion.div variants={itemVariants} className="mb-6 relative z-10">
            <GeometricDivider color={gold} />
          </motion.div>
        )}

        {/* QR — cuadrado perfecto, doble borde geométrico */}
        {invitado.qr_url && (
          <motion.div variants={itemVariants} className="flex flex-col items-center mb-3 relative z-10">
            <p className="font-cormorant text-2xl text-center mb-4 tracking-[0.08em]" style={{ color: cream }}>
              Código de Acceso
            </p>
            <div
              style={{
                backgroundColor: '#FFFFFF',
                border: `2px solid ${gold}`,
                boxShadow: `0 0 0 5px #080605, 0 0 0 7px ${gold}50`,
                padding: '12px',
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
          style={{ color: `${dimCream}60` }}
        >
          presentar en la entrada
        </motion.p>

        {/* CTA */}
        <motion.div variants={itemVariants} className="flex flex-col gap-3 w-full max-w-[280px] relative z-10">
          <InvitacionCTA
            token={invitado.token}
            eventoSlug={evento.slug}
            qrUrl={invitado.qr_url}
            estadoConfirmacion={invitado.estado_confirmacion}
            accentColor={gold}
            textColor={cream}
            borderColor={`${gold}35`}
            variant="art-deco"
            primaryBtnStyle={{
              backgroundColor: gold,
              color: '#080605',
              border: `1px solid ${gold}`,
              borderRadius: '2px',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              fontSize: '11px',
              fontWeight: 700,
              padding: '14px 24px',
              textAlign: 'center',
              display: 'block',
              width: '100%',
              transition: 'opacity 0.2s',
            }}
            secondaryBtnStyle={{
              border: `1px solid ${gold}35`,
              color: cream,
              borderRadius: '2px',
              letterSpacing: '0.10em',
              textTransform: 'uppercase',
              fontSize: '11px',
              padding: '14px 24px',
              textAlign: 'center',
              display: 'block',
              width: '100%',
              transition: 'opacity 0.2s',
            }}
          />
        </motion.div>

        {/* FOOTER */}
        <motion.div variants={itemVariants} className="mt-12 relative z-10">
          <ArtDecoFrame />
        </motion.div>
        <motion.p
          variants={itemVariants}
          className="text-[9px] uppercase tracking-widest mt-3 relative z-10"
          style={{ color: `${dimCream}30` }}
        >
          SoomosNova
        </motion.p>
      </motion.div>
    </EnvelopeAnimation>
  )
}
