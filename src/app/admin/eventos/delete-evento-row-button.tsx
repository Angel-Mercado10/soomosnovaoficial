'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'

interface DeleteEventoRowButtonProps {
  eventoId: string
  onAction: (eventoId: string) => Promise<{ success: boolean; error?: string }>
}

export function DeleteEventoRowButton({ eventoId, onAction }: DeleteEventoRowButtonProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleClick() {
    const confirmed = window.confirm(
      'Esta acción ocultará el evento del sistema administrativo. No se eliminarán los registros asociados.\n\n¿Desea continuar?'
    )
    if (!confirmed) return

    startTransition(async () => {
      const result = await onAction(eventoId)
      if (result.success) {
        router.refresh()
      } else {
        alert(result.error ?? 'No fue posible eliminar el evento. Intente de nuevo.')
      }
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="text-xs text-red-400/70 hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {isPending ? 'Eliminando...' : 'Eliminar'}
    </button>
  )
}
