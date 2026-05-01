'use client'

/**
 * WhatsAppSupportLink
 *
 * Reemplaza los links directos de soporte que van a wa.me.
 * Muestra un modal de preview antes de abrir WhatsApp.
 */

import { useState } from 'react'
import { WhatsAppPreviewModal } from '@/components/ui/WhatsAppPreviewModal'

interface Props {
  message: string
  label: string
  className?: string
}

export function WhatsAppSupportLink({ message, label, className }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={className}
      >
        {label}
      </button>
      <WhatsAppPreviewModal
        isOpen={open}
        onClose={() => setOpen(false)}
        message={message}
      />
    </>
  )
}
