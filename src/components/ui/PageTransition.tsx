'use client'

import { motion } from 'framer-motion'

interface PageTransitionProps {
  children: React.ReactNode
  /** Optional additional CSS classes */
  className?: string
}

/**
 * PageTransition — Framer Motion wrapper for fade + slide-up page transitions.
 * MEDIUM 27: wrap main content areas in invitation, RSVP and success screens.
 *
 * Usage:
 *   <PageTransition>
 *     <YourPageContent />
 *   </PageTransition>
 */
export function PageTransition({ children, className = '' }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
