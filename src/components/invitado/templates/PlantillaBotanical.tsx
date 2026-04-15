'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { EnvelopeAnimation, type EnvelopeTheme } from './EnvelopeAnimation'
import { formatFechaEvento, staggerVariants, itemVariants, type InvitationTemplateProps } from './types'
import { InvitacionCTA } from './InvitacionCTA'

const theme: EnvelopeTheme = {
  bg: '#060C08',
  envelopeBg: '#0C1610',
  envelopeAccent: '#6B9E6B',
  envelopeShadow: 'rgba(80,140,80,0.20)',
  sealColor: '#4A7C59',
  sealText: '#E8F5E8',
  nameColor: '#D4EDD4',
}

function LeafDivider({ color }: { color: string }) {
  return (
    <div className="flex items-center justify-center gap-2 w-full max-w-[260px]">
      <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, transparent, ${color}35)` }} />
      <svg width="24" height="16" viewBox="0 0 24 16" fill="none" aria-hidden="true">
        {/* Left leaf with vein */}
        <path d="M8 8 C5 5 2 2 3.5 8 C2 14 5 11 8 8Z" fill={color} opacity="0.62" />
        <path d="M8 8 C5.5 6 4 3.5 3.5 8Z" stroke={color} strokeWidth="0.5" strokeOpacity="0.35" fill="none" />
        {/* Stem */}
        <line x1="8" y1="8" x2="16" y2="8" stroke={color} strokeWidth="0.9" opacity="0.45" />
        {/* Right leaf with vein */}
        <path d="M16 8 C19 5 22 2 20.5 8 C22 14 19 11 16 8Z" fill={color} opacity="0.62" />
        <path d="M16 8 C18.5 6 20 3.5 20.5 8Z" stroke={color} strokeWidth="0.5" strokeOpacity="0.35" fill="none" />
      </svg>
      <div className="flex-1 h-px" style={{ background: `linear-gradient(to left, transparent, ${color}35)` }} />
    </div>
  )
}

/**
 * Proper botanical illustration — detailed branches with varied leaf shapes,
 * veins, flowing curved stems, and a botanical center motif.
 * CRITICAL 7 — 10+ distinct path elements.
 */
function BotanicalHeader() {
  const green = '#6B9E6B'
  const ltGreen = '#8ABF8A'
  return (
    <svg width="260" height="70" viewBox="0 0 260 70" fill="none" aria-hidden="true">
      {/* ── Left main stem ── */}
      <path d="M8 66 Q22 52 36 56 Q48 38 68 48 Q84 28 106 40" stroke={green} strokeWidth="1.0" strokeOpacity="0.48" fill="none" />
      {/* Left branch offshoot */}
      <path d="M36 56 Q30 42 42 46" stroke={green} strokeWidth="0.8" strokeOpacity="0.38" fill="none" />
      <path d="M48 38 Q44 26 54 34" stroke={green} strokeWidth="0.7" strokeOpacity="0.32" fill="none" />

      {/* Left leaf 1 — large ovate */}
      <path d="M22 50 C16 42 12 36 20 40 C24 34 32 40 22 50Z" fill={green} opacity="0.32" />
      {/* Leaf 1 center vein */}
      <path d="M22 50 C19 45 20 40 22 50Z" stroke={ltGreen} strokeWidth="0.45" strokeOpacity="0.40" fill="none" />

      {/* Left leaf 2 — narrower */}
      <path d="M40 44 C34 36 32 30 40 34 C46 28 50 36 40 44Z" fill={green} opacity="0.28" />
      <path d="M40 44 C37 39 39 34 40 44Z" stroke={ltGreen} strokeWidth="0.4" strokeOpacity="0.35" fill="none" />

      {/* Left leaf 3 — tiny bud */}
      <path d="M60 44 C55 38 55 32 61 36 C67 32 68 40 60 44Z" fill={green} opacity="0.22" />

      {/* Small berry cluster left */}
      <circle cx="84" cy="34" r="3" fill={green} opacity="0.38" />
      <circle cx="90" cy="30" r="2.2" fill={green} opacity="0.28" />
      <circle cx="97" cy="34" r="1.8" fill={green} opacity="0.22" />

      {/* ── Center botanical motif — stylized wildflower ── */}
      {/* Center circle */}
      <circle cx="130" cy="32" r="5" fill={green} opacity="0.52" />
      <circle cx="130" cy="32" r="2.8" fill={ltGreen} opacity="0.65" />
      {/* 6 petals */}
      <ellipse cx="130" cy="22" rx="3.5" ry="6" fill={green} opacity="0.38" />
      <ellipse cx="130" cy="22" rx="3.5" ry="6" transform="rotate(60 130 32)" fill={green} opacity="0.35" />
      <ellipse cx="130" cy="22" rx="3.5" ry="6" transform="rotate(120 130 32)" fill={green} opacity="0.32" />
      <ellipse cx="130" cy="22" rx="3.5" ry="6" transform="rotate(180 130 32)" fill={green} opacity="0.38" />
      <ellipse cx="130" cy="22" rx="3.5" ry="6" transform="rotate(240 130 32)" fill={green} opacity="0.35" />
      <ellipse cx="130" cy="22" rx="3.5" ry="6" transform="rotate(300 130 32)" fill={green} opacity="0.32" />
      {/* Stem down */}
      <path d="M130 37 Q129 52 130 66" stroke={green} strokeWidth="0.9" strokeOpacity="0.35" fill="none" />
      {/* Small leaves on center stem */}
      <path d="M130 48 C126 44 124 48 128 50Z" fill={green} opacity="0.28" />
      <path d="M130 48 C134 44 136 48 132 50Z" fill={green} opacity="0.28" />

      {/* ── Right main stem (mirrored) ── */}
      <path d="M252 66 Q238 52 224 56 Q212 38 192 48 Q176 28 154 40" stroke={green} strokeWidth="1.0" strokeOpacity="0.48" fill="none" />
      <path d="M224 56 Q230 42 218 46" stroke={green} strokeWidth="0.8" strokeOpacity="0.38" fill="none" />
      <path d="M212 38 Q216 26 206 34" stroke={green} strokeWidth="0.7" strokeOpacity="0.32" fill="none" />

      {/* Right leaf 1 */}
      <path d="M238 50 C244 42 248 36 240 40 C236 34 228 40 238 50Z" fill={green} opacity="0.32" />
      <path d="M238 50 C241 45 240 40 238 50Z" stroke={ltGreen} strokeWidth="0.45" strokeOpacity="0.40" fill="none" />

      {/* Right leaf 2 */}
      <path d="M220 44 C226 36 228 30 220 34 C214 28 210 36 220 44Z" fill={green} opacity="0.28" />
      <path d="M220 44 C223 39 221 34 220 44Z" stroke={ltGreen} strokeWidth="0.4" strokeOpacity="0.35" fill="none" />

      {/* Right leaf 3 */}
      <path d="M200 44 C205 38 205 32 199 36 C193 32 192 40 200 44Z" fill={green} opacity="0.22" />

      {/* Small berry cluster right */}
      <circle cx="176" cy="34" r="3" fill={green} opacity="0.38" />
      <circle cx="170" cy="30" r="2.2" fill={green} opacity="0.28" />
      <circle cx="163" cy="34" r="1.8" fill={green} opacity="0.22" />
    </svg>
  )
}

export function PlantillaBotanical({ invitado, evento, parejaNombres }: InvitationTemplateProps) {
  const sage = '#6B9E6B'
  const mint = '#D4EDD4'
  const dimMint = '#8AAF8A'

  return (
    <EnvelopeAnimation coupleNames={parejaNombres} theme={theme}>
      <motion.div
        variants={staggerVariants}
        initial="hidden"
        animate="visible"
        className="min-h-screen flex flex-col items-center px-6 pt-10 pb-16 relative"
        style={{ backgroundColor: '#060C08' }}
      >
        {/* Subtle texture overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 20% 20%, rgba(80,130,80,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(80,130,80,0.06) 0%, transparent 60%)',
          }}
        />

        {/* Botanical header illustration */}
        <motion.div variants={itemVariants} className="mb-4 relative z-10">
          <BotanicalHeader />
        </motion.div>

        {/* Tag line */}
        <motion.p
          variants={itemVariants}
          className="font-cormorant text-[11px] uppercase tracking-[0.3em] mb-3 relative z-10"
          style={{ color: dimMint }}
        >
          juntos en la naturaleza
        </motion.p>

        {/* Couple names — MEDIUM 25: text-4xl sm:text-5xl */}
        <motion.h1
          variants={itemVariants}
          className="font-cormorant text-4xl sm:text-5xl text-center leading-tight mb-3 relative z-10"
          style={{ color: mint }}
        >
          {parejaNombres}
        </motion.h1>

        {/* Guest */}
        <motion.p
          variants={itemVariants}
          className="text-[13px] text-center mb-7 relative z-10"
          style={{ color: dimMint }}
        >
          invitan a{' '}
          <span className="font-cormorant text-[17px]" style={{ color: sage }}>
            {invitado.nombre}
          </span>
        </motion.p>

        <motion.div variants={itemVariants} className="mb-7 relative z-10">
          <LeafDivider color={sage} />
        </motion.div>

        {/* Date */}
        <motion.div variants={itemVariants} className="text-center mb-5 relative z-10">
          <p className="text-[9px] uppercase tracking-[0.3em] mb-2" style={{ color: `${dimMint}80` }}>
            fecha de la celebración
          </p>
          <p className="font-cormorant text-xl text-center" style={{ color: mint }}>
            {formatFechaEvento(evento.fecha_evento, evento.hora_evento)}
          </p>
        </motion.div>

        {/* Venue */}
        {evento.lugar_nombre && (
          <motion.div variants={itemVariants} className="text-center mb-6 relative z-10">
            <p className="text-[9px] uppercase tracking-[0.3em] mb-2" style={{ color: `${dimMint}80` }}>
              jardín del evento
            </p>
            {evento.lugar_maps_url ? (
              <a
                href={evento.lugar_maps_url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-cormorant text-xl text-center transition-opacity hover:opacity-80"
                style={{ color: mint }}
              >
                {evento.lugar_nombre}
                {evento.lugar_direccion && (
                  <span className="block text-[13px] mt-0.5" style={{ color: dimMint }}>
                    {evento.lugar_direccion}
                  </span>
                )}
              </a>
            ) : (
          <p className="font-cormorant text-xl sm:text-2xl text-center" style={{ color: mint }}>
                {evento.lugar_nombre}
                {evento.lugar_direccion && (
                  <span className="block text-[13px] mt-0.5" style={{ color: dimMint }}>
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
            <p className="text-[9px] uppercase tracking-[0.3em] mb-2" style={{ color: `${dimMint}80` }}>
              vestimenta
            </p>
            <p className="font-cormorant text-lg" style={{ color: mint }}>{evento.dress_code}</p>
          </motion.div>
        )}

        <motion.div variants={itemVariants} className="mb-6 relative z-10">
          <LeafDivider color={sage} />
        </motion.div>

        {/* QR */}
        {invitado.qr_url && (
          <motion.div variants={itemVariants} className="mb-3 relative z-10">
            <div
              className="p-4 rounded-2xl"
              style={{
                backgroundColor: '#EEF5EE',
                boxShadow: `0 8px 40px rgba(80,140,80,0.25), 0 4px 16px rgba(0,0,0,0.4)`,
                border: `1px solid ${sage}25`,
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
          style={{ color: `${dimMint}50` }}
        >
          tu entrada al jardín
        </motion.p>

        {/* CTA — HIGH 18 BOTANICAL: organic button, leaf decoration, natural green-gold tone */}
        <motion.div variants={itemVariants} className="flex flex-col gap-3 w-full max-w-[280px] relative z-10">
          <InvitacionCTA
            token={invitado.token}
            eventoSlug={evento.slug}
            qrUrl={invitado.qr_url}
            estadoConfirmacion={invitado.estado_confirmacion}
            accentColor={sage}
            textColor={mint}
            borderColor={`${sage}35`}
            variant="botanical"
            primaryBtnStyle={{
              backgroundColor: sage,
              color: '#060C08',
              boxShadow: `0 4px 20px rgba(80,140,80,0.30)`,
              borderRadius: '24px 4px 24px 4px',
              fontSize: '14px',
              fontWeight: 600,
              padding: '14px 28px',
              textAlign: 'center',
              display: 'block',
              width: '100%',
              letterSpacing: '0.03em',
              transition: 'all 0.25s',
            }}
            secondaryBtnStyle={{
              border: `1px solid ${sage}35`,
              color: mint,
              borderRadius: '4px 24px 4px 24px',
              fontSize: '13px',
              padding: '14px 28px',
              textAlign: 'center',
              display: 'block',
              width: '100%',
              transition: 'opacity 0.2s',
            }}
          />
        </motion.div>

        {/* Footer leaf */}
        <motion.div variants={itemVariants} className="mt-12 relative z-10">
          <svg width="32" height="20" viewBox="0 0 32 20" fill="none" aria-hidden="true">
            <path d="M16 18 Q8 10 4 4 Q10 6 16 10 Q22 6 28 4 Q24 10 16 18Z"
              fill={sage} opacity="0.35" />
          </svg>
        </motion.div>
      </motion.div>
    </EnvelopeAnimation>
  )
}
