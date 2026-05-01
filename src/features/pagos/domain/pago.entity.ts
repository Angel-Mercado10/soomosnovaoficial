// domain/pago.entity.ts
// Lógica de negocio pura del dominio — sin dependencias externas.

import type { Pago, PagoStatus } from './pago.types'

export function isPagoSucceeded(pago: Pick<Pago, 'status'>): boolean {
  return pago.status === 'succeeded'
}

export function isPagoFailed(pago: Pick<Pago, 'status'>): boolean {
  return pago.status === 'failed'
}

export function isPagoRefunded(pago: Pick<Pago, 'status'>): boolean {
  return pago.status === 'refunded'
}

export function shouldMarkEventoPagado(status: PagoStatus): boolean {
  return status === 'succeeded'
}

export function formatAmountMXN(amount_cents: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(amount_cents / 100)
}
