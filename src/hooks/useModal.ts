'use client'

import { useState, useCallback } from 'react'
import type { ModalState } from '@/types'

export function useModal(onConfirmCallback: () => void): ModalState {
  const [isOpen, setIsOpen] = useState(false)

  const onConfirm = useCallback(() => {
    onConfirmCallback()
    setIsOpen(false)
  }, [onConfirmCallback])

  const onClose = useCallback(() => {
    setIsOpen(false)
  }, [])

  return { isOpen, onConfirm, onClose }
}

export function useModalState(): { isOpen: boolean; open: () => void; close: () => void } {
  const [isOpen, setIsOpen] = useState(false)

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])

  return { isOpen, open, close }
}
