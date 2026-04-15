import type { Variants } from 'framer-motion'
import type { Evento, Invitado } from '@/types/database'

export interface InvitationTemplateProps {
  invitado: Invitado
  evento: Evento
  parejaNombres: string
}

export function formatFechaEvento(fecha: string, hora: string | null): string {
  const date = new Date(fecha + 'T12:00:00')
  const fechaStr = date.toLocaleDateString('es-MX', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const capitalizada = fechaStr.charAt(0).toUpperCase() + fechaStr.slice(1)
  return hora ? `${capitalizada} · ${hora}` : capitalizada
}

/** Cubic bezier typed as tuple so Framer Motion accepts it */
export const EASE_SMOOTH = [0.4, 0, 0.2, 1] as [number, number, number, number]

export const staggerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
}

export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_SMOOTH } },
}
