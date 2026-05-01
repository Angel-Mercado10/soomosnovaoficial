'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'

interface MarkAsPaidButtonProps {
  eventoId: string
  onAction: (eventoId: string) => Promise<{ success: boolean; error?: string }>
}

export function MarkAsPaidButton({ eventoId, onAction }: MarkAsPaidButtonProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleClick() {
    startTransition(async () => {
      const result = await onAction(eventoId)
      if (result.success) {
        router.refresh()
      } else {
        alert(result.error ?? 'Error al marcar como pagado.')
      }
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="inline-flex items-center gap-2 bg-[#C9A84C] text-[#0A0A0A] font-semibold text-sm px-5 py-2.5 rounded-lg hover:bg-[#B8943E] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {isPending ? (
        <>
          <span className="inline-block w-4 h-4 border-2 border-[#0A0A0A]/30 border-t-[#0A0A0A] rounded-full animate-spin" />
          Procesando...
        </>
      ) : (
        'Marcar como pagado manualmente'
      )}
    </button>
  )
}
