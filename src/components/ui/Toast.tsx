'use client'

import { useEffect, useRef } from 'react'
import type { Toast } from '@/hooks/useToast'

interface ToastItemProps {
  toast: Toast
  onRemove: (id: string) => void
}

function ToastIcon({ type }: { type: Toast['type'] }) {
  if (type === 'success') {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0 text-green-400">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    )
  }
  if (type === 'error') {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0 text-red-400">
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    )
  }
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0 text-[#C9A84C]">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  )
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      onRemove(toast.id)
    }, toast.duration ?? 4000)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [toast.id, toast.duration, onRemove])

  const borderColor =
    toast.type === 'success'
      ? 'border-green-800'
      : toast.type === 'error'
        ? 'border-red-800'
        : 'border-[#C9A84C]/30'

  return (
    <div
      className={`
        flex items-start gap-3 min-w-[280px] max-w-[360px]
        bg-[#1A1A1A] border ${borderColor} rounded-xl px-4 py-3
        shadow-xl shadow-black/40
        animate-slide-in-right
      `}
      role="alert"
      aria-live="polite"
    >
      <ToastIcon type={toast.type} />
      <p className="text-white text-sm leading-snug flex-1">{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className="shrink-0 text-[#9CA3AF] hover:text-white transition-colors"
        aria-label="Cerrar notificación"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  )
}

interface ToastContainerProps {
  toasts: Toast[]
  onRemove: (id: string) => void
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null

  return (
    <div
      className="fixed top-4 right-4 z-[9999] flex flex-col gap-2"
      aria-label="Notificaciones"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  )
}
