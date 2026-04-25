'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'

export interface EnvelopeTheme {
  bg: string
  envelopeBg: string
  envelopeAccent: string
  envelopeShadow: string
  sealColor: string
  sealText: string
  nameColor: string
}

interface EnvelopeAnimationProps {
  coupleNames: string
  theme: EnvelopeTheme
  children: React.ReactNode
}

type Phase = 'entering' | 'idle' | 'opening' | 'risen' | 'content'

export function EnvelopeAnimation({ coupleNames, theme, children }: EnvelopeAnimationProps) {
  const [phase, setPhase] = useState<Phase>('entering')
  const prefersReduced = useReducedMotion()
  const currentPhase: Phase = prefersReduced ? 'content' : phase

  useEffect(() => {
    if (prefersReduced) {
      return
    }
    const t0 = setTimeout(() => setPhase('idle'), 700)
    const t1 = setTimeout(() => setPhase('opening'), 2000)
    const t2 = setTimeout(() => setPhase('risen'), 2900)
    const t3 = setTimeout(() => setPhase('content'), 3400)
    return () => {
      clearTimeout(t0)
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [prefersReduced])

  const handleTap = () => {
    if (currentPhase === 'idle') {
      setPhase('opening')
      setTimeout(() => setPhase('risen'), 900)
      setTimeout(() => setPhase('content'), 1400)
    }
  }

  const showEnvelope =
    currentPhase === 'entering' ||
    currentPhase === 'idle' ||
    currentPhase === 'opening' ||
    currentPhase === 'risen'
  const isOpening = currentPhase === 'opening' || currentPhase === 'risen'

  const firstInitial = coupleNames.split('&')[0]?.trim()?.[0] ?? '♡'
  const secondInitial = coupleNames.split('&')[1]?.trim()?.[0] ?? ''
  const sealInitials = secondInitial ? `${firstInitial}${secondInitial}` : firstInitial

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ backgroundColor: theme.bg }}
    >
      {/* Envelope stage */}
      <AnimatePresence mode="wait">
        {showEnvelope && (
          <motion.div
            key="envelope-stage"
            initial={{ opacity: 0, scale: 0.85, y: 32 }}
            animate={{
              opacity: currentPhase === 'risen' ? 0 : 1,
              scale: currentPhase === 'risen' ? 0.92 : 1,
              y: currentPhase === 'risen' ? -16 : 0,
            }}
            exit={{ opacity: 0, scale: 0.9, y: -24 }}
            transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
            className="flex flex-col items-center gap-6"
          >
            {/* Envelope wrapper with perspective for flap 3D */}
            <div
              className="relative cursor-pointer select-none"
              style={{ perspective: '1100px' }}
              onClick={handleTap}
            >
              {/* Envelope body */}
              <div
                className="relative rounded-sm overflow-hidden"
                style={{
                  width: 320,
                  height: 210,
                  backgroundColor: theme.envelopeBg,
                  border: `1px solid ${theme.envelopeAccent}30`,
                  boxShadow: `0 24px 64px ${theme.envelopeShadow}, 0 4px 16px rgba(0,0,0,0.4)`,
                }}
              >
                {/* Bottom-left inner fold triangle */}
                <div
                  className="absolute bottom-0 left-0 pointer-events-none"
                  style={{
                    width: 0,
                    height: 0,
                    borderStyle: 'solid',
                    borderWidth: '0 0 105px 160px',
                    borderColor: `transparent transparent ${theme.envelopeAccent}12 transparent`,
                  }}
                />
                {/* Bottom-right inner fold triangle */}
                <div
                  className="absolute bottom-0 right-0 pointer-events-none"
                  style={{
                    width: 0,
                    height: 0,
                    borderStyle: 'solid',
                    borderWidth: '0 160px 105px 0',
                    borderColor: `transparent ${theme.envelopeAccent}12 transparent transparent`,
                  }}
                />
                {/* Bottom V fold (front center line) */}
                <div
                  className="absolute bottom-0 left-0 right-0 flex justify-center pointer-events-none"
                >
                  <div
                    className="w-0 h-0"
                    style={{
                      borderStyle: 'solid',
                      borderWidth: '0 160px 75px 160px',
                      borderColor: `transparent transparent ${theme.envelopeAccent}08 transparent`,
                    }}
                  />
                </div>

                {/* Envelope center content: names + instruction */}
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pb-4">
                  <div style={{ color: theme.envelopeAccent }} className="text-lg mb-2 leading-none">
                    ✦
                  </div>
                  <p
                    className="font-cormorant text-[22px] font-light text-center leading-snug px-8"
                    style={{ color: theme.nameColor }}
                  >
                    {coupleNames}
                  </p>
                  {currentPhase === 'idle' && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.45 }}
                      transition={{ delay: 0.3 }}
                      className="text-[10px] uppercase tracking-widest mt-2"
                      style={{ color: theme.nameColor }}
                    >
                      toca para abrir
                    </motion.p>
                  )}
                </div>

                {/* Wax seal — HIGH 19: 64px mobile, 80px desktop, centered with depth shadow */}
                <motion.div
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30"
                  animate={
                    currentPhase === 'opening'
                      ? {
                          scale: [1, 1.15, 0.9, 1.05, 0],
                          opacity: [1, 1, 1, 0.6, 0],
                          rotate: [0, -6, 4, -2, 0],
                        }
                      : { scale: 1, opacity: 1 }
                  }
                  transition={
                    currentPhase === 'opening'
                      ? { duration: 0.7, ease: 'easeInOut' }
                      : {}
                  }
                >
                  <div
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: theme.sealColor,
                      border: `1px solid ${theme.envelopeAccent}40`,
                      boxShadow: `0 4px 16px ${theme.sealColor}80, 0 2px 6px rgba(0,0,0,0.50)`,
                    }}
                  >
                    <span
                      className="font-cormorant text-sm sm:text-base font-semibold tracking-tight"
                      style={{ color: theme.sealText }}
                    >
                      {sealInitials}
                    </span>
                  </div>
                </motion.div>
              </div>

              {/* Top flap — 3D opening animation */}
              <motion.div
                className="absolute inset-x-0 top-0"
                style={{
                  height: 105,
                  transformOrigin: 'top center',
                  transformStyle: 'preserve-3d',
                  backfaceVisibility: 'hidden',
                  backgroundColor: theme.envelopeBg,
                  border: `1px solid ${theme.envelopeAccent}30`,
                  clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
                  zIndex: 20,
                  boxShadow: isOpening ? 'none' : `0 2px 8px rgba(0,0,0,0.3)`,
                }}
                animate={{
                  rotateX: isOpening ? -175 : 0,
                }}
                transition={{
                  duration: 0.75,
                  ease: [0.4, 0, 0.15, 1],
                }}
              >
                {/* Flap accent line */}
                <div
                  className="absolute inset-x-0 bottom-0 h-px"
                  style={{ backgroundColor: `${theme.envelopeAccent}20` }}
                />
              </motion.div>
            </div>

            {/* Shine hint line below envelope */}
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{
                scaleX: currentPhase === 'idle' ? 1 : 0,
                opacity: currentPhase === 'idle' ? 0.35 : 0,
              }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="w-16 h-px origin-center"
              style={{ backgroundColor: theme.envelopeAccent }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Invitation content — fades in after envelope exits */}
      <AnimatePresence>
        {currentPhase === 'content' && (
          <motion.div
            key="invitation-content"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
            className="w-full"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
