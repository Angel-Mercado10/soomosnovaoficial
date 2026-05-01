'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'

interface DeleteEventoButtonProps {
  eventoId: string
  onAction: (eventoId: string) => Promise<{ success: boolean; error?: string }>
  /** Si es true, después de eliminar redirige al listado. */
  redirectAfter?: boolean
}

export function DeleteEventoButton({ eventoId, onAction, redirectAfter = false }: DeleteEventoButtonProps) {
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
        if (redirectAfter) {
          router.push('/admin/eventos')
        } else {
          router.refresh()
        }
      } else {
        alert(result.error ?? 'No fue posible eliminar el evento. Intente de nuevo.')
      }
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="inline-flex items-center gap-2 bg-red-500/10 text-red-400 border border-red-500/20 font-semibold text-sm px-5 py-2.5 rounded-lg hover:bg-red-500/20 hover:border-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {isPending ? (
        <>
          <span className="inline-block w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
          Eliminando...
        </>
      ) : (
        'Eliminar evento'
      )}
    </button>
  )
}
