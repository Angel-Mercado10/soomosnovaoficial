'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import type { Invitado, Evento } from '@/types/database'
import type { Json } from '@/types/database'

interface RSVPFormProps {
  invitado: Invitado
  evento: Evento
  /** Si true, el invitado ya confirmó antes y está cambiando su respuesta */
  isReconfirmation?: boolean
}

type AsistenciaOpt = 'si' | 'no' | 'talvez' | null

interface FormState {
  asiste: AsistenciaOpt
  opcion_menu: string
  lleva_acompanante: boolean
}

interface RSVPResponse {
  success: boolean
  invitado?: Invitado
  evento?: Evento
  error?: string
}

interface ConfirmacionExitosa {
  invitado: Invitado
  evento: Evento
}

function parseOpcionesMenu(opciones: Json): string[] {
  if (Array.isArray(opciones)) {
    return opciones.filter((o): o is string => typeof o === 'string')
  }
  return []
}

function BotonAsistencia({
  label,
  value,
  selected,
  onClick,
}: {
  label: string
  value: AsistenciaOpt
  selected: AsistenciaOpt
  onClick: (v: AsistenciaOpt) => void
}) {
  const isSelected = selected === value
  return (
    <button
      type="button"
      onClick={() => onClick(value)}
      className={`flex-1 py-3 px-4 rounded-full text-sm font-medium border transition-colors ${
        isSelected
          ? 'bg-[#C9A84C] border-[#C9A84C] text-[#0A0A0A]'
          : 'bg-transparent border-[#2A2A2A] text-[#9CA3AF] hover:border-[#C9A84C]/40 hover:text-white'
      }`}
    >
      {label}
    </button>
  )
}

// ─── Canvas confetti hook — CRITICAL 8 (no external dependencies) ────────────
interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  color: string
  size: number
  rotation: number
  rotSpeed: number
  opacity: number
  shape: 'rect' | 'circle'
}

function useConfetti(active: boolean) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number | null>(null)

  const COLORS = ['#C9A84C', '#E8D080', '#FFFFFF', '#F5E6C8', '#D4A017', '#FFF0D0']

  const createParticles = useCallback(
    (canvas: HTMLCanvasElement): Particle[] => {
      return Array.from({ length: 120 }, () => ({
        x: canvas.width * (0.3 + Math.random() * 0.4),
        y: canvas.height * 0.40,
        vx: (Math.random() - 0.5) * 14,
        vy: -(Math.random() * 12 + 5),
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: Math.random() * 7 + 3,
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 9,
        opacity: 1,
        shape: Math.random() > 0.4 ? 'rect' : 'circle',
      }))
    },
    [], // eslint-disable-line react-hooks/exhaustive-deps
  )

  useEffect(() => {
    if (!active) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles = createParticles(canvas)
    const startTime = performance.now()
    const DURATION = 3200

    const animate = (now: number) => {
      const elapsed = now - startTime
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (const p of particles) {
        p.x += p.vx
        p.vy += 0.38 // gravity
        p.y += p.vy
        p.rotation += p.rotSpeed
        if (elapsed > DURATION - 900) {
          p.opacity = Math.max(0, 1 - (elapsed - (DURATION - 900)) / 900)
        }
        ctx.save()
        ctx.globalAlpha = p.opacity
        ctx.translate(p.x, p.y)
        ctx.rotate((p.rotation * Math.PI) / 180)
        ctx.fillStyle = p.color
        if (p.shape === 'circle') {
          ctx.beginPath()
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2)
          ctx.fill()
        } else {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2)
        }
        ctx.restore()
      }

      if (elapsed < DURATION) {
        animRef.current = requestAnimationFrame(animate)
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
    }

    animRef.current = requestAnimationFrame(animate)
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [active, createParticles])

  return canvasRef
}

// ─── Animated checkmark SVG — CRITICAL 8 ────────────────────────────────────
function AnimatedCheckmark() {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 280, damping: 20, delay: 0.1 }}
    >
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center"
        style={{
          backgroundColor: 'rgba(201,168,76,0.12)',
          border: '2px solid rgba(201,168,76,0.45)',
          boxShadow: '0 0 32px rgba(201,168,76,0.20)',
        }}
      >
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <motion.path
            d="M6 16 L13 23 L26 9"
            stroke="#C9A84C"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.6, delay: 0.3, ease: 'easeInOut' }}
          />
        </svg>
      </div>
    </motion.div>
  )
}

// ─── Framer Motion variants for success stagger — CRITICAL 8 ─────────────────
const successContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
}
const successItem = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] },
  },
}
const qrSlide = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, delay: 0.50, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] },
  },
}

export default function RSVPForm({ invitado, evento, isReconfirmation = false }: RSVPFormProps) {
  const [form, setForm] = useState<FormState>({
    asiste: null,
    opcion_menu: '',
    lleva_acompanante: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmado, setConfirmado] = useState<ConfirmacionExitosa | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const confettiCanvasRef = useConfetti(showConfetti)

  const opcionesMenu = parseOpcionesMenu(evento.opciones_menu)
  const mostrarMenu = form.asiste === 'si' && opcionesMenu.length > 0
  const mostrarAcompanante = form.asiste === 'si' && evento.permite_acompanante

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.asiste) {
      setError('Por favor indicá si vas a asistir')
      return
    }
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/rsvp/confirmar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: invitado.token,
          asiste: form.asiste === 'si',
          opcion_menu: form.asiste === 'si' ? form.opcion_menu || null : null,
          lleva_acompanante:
            form.asiste === 'si' && evento.permite_acompanante
              ? form.lleva_acompanante
              : false,
          pendiente_decision: form.asiste === 'talvez',
        }),
      })

      const data: RSVPResponse = await res.json()

      if (!res.ok || !data.success) {
        setError(data.error ?? 'Ocurrió un error. Intentá de nuevo.')
        return
      }

      if (data.invitado && data.evento) {
        setConfirmado({ invitado: data.invitado, evento: data.evento })

        // Celebration for attending guests — CRITICAL 8
        if (form.asiste === 'si') {
          setShowConfetti(true)
          // Haptic feedback for mobile — CRITICAL 8
          if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(200)
          }
          setTimeout(() => setShowConfetti(false), 3500)
        }
      }
    } catch {
      setError('Error de red. Verificá tu conexión e intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  // ─── Pantalla de confirmación exitosa — CRITICAL 8 ──────────────────────────
  if (confirmado) {
    const isAttending = form.asiste === 'si'

    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
        {/* Confetti canvas overlay — CRITICAL 8 */}
        {showConfetti && (
          <canvas
            ref={confettiCanvasRef}
            className="fixed inset-0 pointer-events-none z-50"
            aria-hidden="true"
          />
        )}

        <AnimatePresence>
          <motion.div
            key="success-screen"
            variants={successContainer}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center max-w-sm w-full"
          >
            {/* Animated icon — CRITICAL 8 */}
            <motion.div variants={successItem} className="mb-6">
              {isAttending ? (
                <AnimatedCheckmark />
              ) : (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 250, damping: 20, delay: 0.1 }}
                  className="text-[#C9A84C] text-3xl"
                >
                  ✦
                </motion.div>
              )}
            </motion.div>

            {/* Title — stagger — CRITICAL 8 */}
            <motion.h1 variants={successItem} className="font-cormorant text-4xl text-white text-center mb-2">
              {isAttending
                ? '¡Nos vemos en tu gran día!'
                : form.asiste === 'talvez'
                  ? 'Anotamos tu respuesta'
                  : 'Gracias por avisarnos'}
            </motion.h1>

            {/* Subtitle — stagger */}
            <motion.p variants={successItem} className="text-[#9CA3AF] text-center mb-8 max-w-sm">
              {isAttending
                ? `${confirmado.invitado.nombre}, tu asistencia fue confirmada. Guardá este QR para ingresar.`
                : `Recibimos tu respuesta, ${confirmado.invitado.nombre}. La pareja lo tendrá en cuenta.`}
            </motion.p>

            {/* QR slide up — CRITICAL 8 */}
            {isAttending && confirmado.invitado.qr_url && (
              <motion.div
                variants={qrSlide}
                className="bg-white rounded-[12px] p-4 mb-6 shadow-[0_8px_40px_rgba(201,168,76,0.18)]"
              >
                <Image
                  src={confirmado.invitado.qr_url}
                  alt="Tu QR de entrada"
                  width={200}
                  height={200}
                />
              </motion.div>
            )}

            {/* Download button */}
            {isAttending && confirmado.invitado.qr_url && (
              <motion.a
                variants={successItem}
                href={confirmado.invitado.qr_url}
                download={`qr-${confirmado.invitado.nombre.replace(/\s+/g, '-').toLowerCase()}.png`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#C9A84C] hover:bg-[#b8943e] text-[#0A0A0A] font-semibold text-sm px-6 py-3 rounded-full transition-colors mb-4"
              >
                Descargar QR
              </motion.a>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    )
  }

  // ─── Formulario RSVP ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-[#C9A84C] text-2xl text-center mb-6 select-none">✦</div>
        <h1 className="font-cormorant text-4xl text-white text-center mb-2">
          {isReconfirmation ? 'Cambiar tu respuesta' : 'Confirmá tu asistencia'}
        </h1>
        <p className="text-[#9CA3AF] text-center text-sm mb-8">
          Hola <span className="text-white">{invitado.nombre}</span> — completá el
          formulario en menos de un minuto.
        </p>

        {/* Warning de reconfirmación */}
        {isReconfirmation && (
          <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3 mb-6">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#F59E0B"
              strokeWidth="2"
              className="shrink-0 mt-0.5"
              aria-hidden="true"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <p className="text-amber-400 text-sm leading-relaxed">
              Estás por cambiar tu respuesta anterior. Esta acción quedará registrada.
            </p>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className={`bg-[#1A1A1A] border border-[#2A2A2A] rounded-[12px] p-6 space-y-6 transition-opacity ${loading ? 'opacity-80' : 'opacity-100'}`}
        >
          {/* ¿Asistirás? */}
          <div>
            <p className="text-white text-sm font-medium mb-3">¿Vas a asistir?</p>
            <div className="flex gap-2">
              <BotonAsistencia label="Sí" value="si" selected={form.asiste} onClick={(v) => setForm((f) => ({ ...f, asiste: v }))} />
              <BotonAsistencia label="No" value="no" selected={form.asiste} onClick={(v) => setForm((f) => ({ ...f, asiste: v }))} />
              <BotonAsistencia label="Tal vez" value="talvez" selected={form.asiste} onClick={(v) => setForm((f) => ({ ...f, asiste: v }))} />
            </div>
          </div>

          {/* Opción de menú */}
          {mostrarMenu && (
            <div>
              <p className="text-white text-sm font-medium mb-3">Opción de menú</p>
              <div className="flex flex-col gap-2">
                {opcionesMenu.map((opcion) => (
                  <button
                    key={opcion}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, opcion_menu: opcion }))}
                    className={`w-full text-left py-3 px-4 rounded-[12px] text-sm border transition-colors ${
                      form.opcion_menu === opcion
                        ? 'bg-[#C9A84C]/10 border-[#C9A84C]/40 text-white'
                        : 'bg-[#111111] border-[#2A2A2A] text-[#9CA3AF] hover:border-[#C9A84C]/20 hover:text-white'
                    }`}
                  >
                    {opcion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ¿Llevás acompañante? */}
          {mostrarAcompanante && (
            <div>
              <p className="text-white text-sm font-medium mb-3">¿Llevás acompañante?</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, lleva_acompanante: true }))}
                  className={`flex-1 py-3 px-4 rounded-full text-sm font-medium border transition-colors ${
                    form.lleva_acompanante
                      ? 'bg-[#C9A84C] border-[#C9A84C] text-[#0A0A0A]'
                      : 'bg-transparent border-[#2A2A2A] text-[#9CA3AF] hover:border-[#C9A84C]/40 hover:text-white'
                  }`}
                >
                  Sí
                </button>
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, lleva_acompanante: false }))}
                  className={`flex-1 py-3 px-4 rounded-full text-sm font-medium border transition-colors ${
                    !form.lleva_acompanante
                      ? 'bg-[#C9A84C] border-[#C9A84C] text-[#0A0A0A]'
                      : 'bg-transparent border-[#2A2A2A] text-[#9CA3AF] hover:border-[#C9A84C]/40 hover:text-white'
                  }`}
                >
                  No
                </button>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          {/* Submit */}
          <div className={loading ? 'animate-pulse' : ''}>
            <button
              type="submit"
              disabled={loading || !form.asiste}
              className="w-full flex items-center justify-center gap-2 bg-[#C9A84C] hover:bg-[#b8943e] disabled:opacity-40 disabled:cursor-not-allowed text-[#0A0A0A] font-semibold text-sm px-6 py-3 rounded-full transition-colors"
            >
              {loading && (
                <svg
                  className="animate-spin"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  aria-hidden="true"
                >
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
              )}
              {loading ? 'Enviando...' : 'Confirmar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
