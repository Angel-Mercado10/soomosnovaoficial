// domain/pago.types.ts
// Sin dependencias de Next/Supabase/Stripe — solo tipos puros del dominio.

export type PagoStatus = 'pending' | 'succeeded' | 'failed' | 'refunded'

export interface Pago {
  id: string
  evento_id: string
  pareja_id: string
  stripe_payment_intent_id: string | null
  stripe_session_id: string | null
  amount_cents: number
  currency: string
  status: PagoStatus
  is_manual: boolean
  paid_at: string | null
  raw_event: unknown | null
  created_at: string
  updated_at: string
}

export interface PagoWithRelations extends Pago {
  evento_nombre?: string
  evento_slug?: string
  pareja_nombre?: string
  pareja_email?: string
}

export interface ListPagosParams {
  page?: number
  pageSize?: number
  eventoId?: string
  status?: PagoStatus
}

export interface ListPagosResult {
  pagos: PagoWithRelations[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface RevenueTotalResult {
  total_cents: number
  count: number
}

export interface RegisterStripePaymentInput {
  stripe_payment_intent_id?: string
  stripe_session_id?: string
  evento_id: string
  pareja_id: string
  amount_cents: number
  currency: string
  status: PagoStatus
  paid_at?: string
  raw_event?: unknown
}

export interface RegisterManualPaymentInput {
  evento_id: string
  pareja_id: string
  amount_cents: number
  currency?: string
  admin_user_id: string
}
