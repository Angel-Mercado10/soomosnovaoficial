'use client'

import Link from 'next/link'
import type { Invitado } from '@/types/database'

type EstadoConfirmacion = Invitado['estado_confirmacion']

/** Template variant — controls the "Confirmar" button style when no primaryBtnClass/primaryBtnStyle override is provided */
export type InvitacionCTAVariant = 'clasica' | 'art-deco' | 'celestial' | 'botanical' | 'romantica'

interface InvitacionCTAProps {
  token: string
  eventoSlug: string
  qrUrl: string | null
  estadoConfirmacion: EstadoConfirmacion
  /** Color de acento del template (ej: '#C9A84C') */
  accentColor: string
  /** Color de texto primario del template (ej: '#FFFFFF') */
  textColor: string
  /** Color de borde secundario (ej: '#2A2A2A') */
  borderColor: string
  /** Template variant — applies preset button styles per template when no primaryBtnClass/Style override provided */
  variant?: InvitacionCTAVariant
  /** Estilo opcional del botón primario (override completo) */
  primaryBtnStyle?: React.CSSProperties
  /** Clase CSS opcional para el botón primario */
  primaryBtnClass?: string
  /** Estilo opcional del botón secundario */
  secondaryBtnStyle?: React.CSSProperties
  /** Clase CSS opcional para el botón secundario */
  secondaryBtnClass?: string
}

/** Per-variant Tailwind class for the primary "Confirmar" button */
const variantBtnClass: Record<InvitacionCTAVariant, string> = {
  'clasica':
    'text-center border border-[#C9A84C] text-[#C9A84C] hover:bg-[#C9A84C] hover:text-black px-8 py-3 rounded-sm font-cormorant text-lg tracking-widest transition-colors',
  'art-deco':
    'text-center bg-[#C9A84C] text-black px-10 py-3 uppercase tracking-[0.3em] text-sm font-bold transition-opacity hover:opacity-90',
  'celestial':
    'text-center bg-gradient-to-r from-[#1a1a3e] to-[#2a2a5e] border border-[#6366f1]/40 text-white px-8 py-3 rounded-full shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all hover:opacity-90',
  'botanical':
    'text-center border border-[#7a9e7e] text-[#7a9e7e] hover:bg-[#7a9e7e]/10 px-8 py-3 rounded-lg transition-colors',
  'romantica':
    'text-center bg-gradient-to-r from-[#c4687a] to-[#d4889a] text-white px-8 py-3 rounded-full transition-all hover:opacity-90',
}

/**
 * CTA condicional de la invitación.
 *
 * - pendiente / pendiente_decision → botón "Confirmar asistencia"
 * - confirmado → badge "Ya confirmaste" + link QR + link evento
 * - rechazo → mensaje "Gracias por avisarnos" + link cambiar respuesta
 */
export function InvitacionCTA({
  token,
  eventoSlug,
  qrUrl,
  estadoConfirmacion,
  accentColor,
  textColor,
  borderColor,
  variant,
  primaryBtnStyle,
  primaryBtnClass,
  secondaryBtnStyle,
  secondaryBtnClass,
}: InvitacionCTAProps) {
  const isPending =
    estadoConfirmacion === 'pendiente' || estadoConfirmacion === 'pendiente_decision'
  const isConfirmado = estadoConfirmacion === 'confirmado'
  const isRechazo = estadoConfirmacion === 'rechazo'

  // Resolve primary button class: explicit override > variant preset > default
  const resolvedPrimaryBtnClass =
    primaryBtnClass ??
    (variant ? variantBtnClass[variant] : undefined) ??
    'text-center font-semibold text-sm px-6 py-3.5 rounded-full transition-all hover:opacity-90'

  // === PENDIENTE: CTA normal ===
  if (isPending) {
    return (
      <div className="flex flex-col gap-3 w-full max-w-[280px]">
        <Link
          href={`/rsvp/${token}`}
          className={resolvedPrimaryBtnClass}
          style={
            // primaryBtnStyle always wins if provided; variant uses only Tailwind classes (no inline style)
            primaryBtnStyle ??
            (primaryBtnClass || variant
              ? undefined
              : { backgroundColor: accentColor, color: '#0A0A0A' })
          }
        >
          Confirmar asistencia
        </Link>
        <Link
          href={`/evento/${eventoSlug}`}
          className={
            secondaryBtnClass ??
            'text-center text-sm px-6 py-3.5 rounded-full transition-all hover:opacity-80'
          }
          style={
            secondaryBtnStyle ?? {
              border: `1px solid ${borderColor}`,
              color: textColor,
            }
          }
        >
          Ver detalles del evento
        </Link>
      </div>
    )
  }

  // === CONFIRMADO: badge + QR + evento ===
  if (isConfirmado) {
    return (
      <div className="flex flex-col items-center gap-3 w-full max-w-[280px]">
        {/* Badge de confirmación */}
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
          style={{
            backgroundColor: `${accentColor}18`,
            border: `1px solid ${accentColor}40`,
            color: accentColor,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Ya confirmaste tu asistencia
        </div>

        {/* Descarga QR si existe */}
        {qrUrl && (
          <a
            href={qrUrl}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="w-full text-center font-semibold text-sm px-6 py-3.5 rounded-full transition-all hover:opacity-90"
            style={
              primaryBtnStyle ?? {
                backgroundColor: accentColor,
                color: '#0A0A0A',
              }
            }
          >
            Descargar QR de entrada
          </a>
        )}

        <Link
          href={`/evento/${eventoSlug}`}
          className={
            secondaryBtnClass ??
            'w-full text-center text-sm px-6 py-3.5 rounded-full transition-all hover:opacity-80'
          }
          style={
            secondaryBtnStyle ?? {
              border: `1px solid ${borderColor}`,
              color: textColor,
            }
          }
        >
          Ver detalles del evento
        </Link>

        <a
          href={`/rsvp/${token}?cambiar=1`}
          className="text-xs transition-colors hover:opacity-80 underline underline-offset-2"
          style={{ color: `${accentColor}80` }}
        >
          Cambiar mi respuesta
        </a>
      </div>
    )
  }

  // === RECHAZO: agradecimiento + cambiar respuesta ===
  if (isRechazo) {
    return (
      <div className="flex flex-col items-center gap-3 w-full max-w-[280px]">
        {/* Badge de rechazo */}
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-full text-sm"
          style={{
            backgroundColor: `${borderColor}30`,
            border: `1px solid ${borderColor}`,
            color: textColor,
            opacity: 0.8,
          }}
        >
          Gracias por avisarnos
        </div>

        <p
          className="text-xs text-center max-w-[220px]"
          style={{ color: `${textColor}60` }}
        >
          Si cambió de opinión, puede actualizar su respuesta.
        </p>

        <a
          href={`/rsvp/${token}?cambiar=1`}
          className={
            secondaryBtnClass ??
            'w-full text-center text-sm px-6 py-3.5 rounded-full transition-all hover:opacity-80'
          }
          style={
            secondaryBtnStyle ?? {
              border: `1px solid ${borderColor}`,
              color: textColor,
            }
          }
        >
          Cambiar mi respuesta
        </a>

        <Link
          href={`/evento/${eventoSlug}`}
          className="text-xs transition-colors hover:opacity-80 underline underline-offset-2"
          style={{ color: `${accentColor}80` }}
        >
          Ver detalles del evento
        </Link>
      </div>
    )
  }

  // Fallback (no debería llegarse aquí)
  return null
}
