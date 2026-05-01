// infrastructure/pagos.repository.ts
// Interfaz del repositorio — sin implementación concreta.

import type {
  Pago,
  PagoWithRelations,
  RegisterStripePaymentInput,
  RegisterManualPaymentInput,
  ListPagosParams,
  ListPagosResult,
  RevenueTotalResult,
} from '../domain/pago.types'

export interface PagosRepository {
  /**
   * Upsert de pago Stripe: idempotente por stripe_payment_intent_id.
   * Si no existe payment_intent, usa stripe_session_id.
   */
  upsertStripePayment(input: RegisterStripePaymentInput): Promise<Pago>

  /**
   * Crea un pago manual (is_manual=true, status=succeeded).
   */
  createManualPayment(input: RegisterManualPaymentInput): Promise<Pago>

  /**
   * Lista pagos con paginación y relaciones.
   */
  listPagos(params: ListPagosParams): Promise<ListPagosResult>

  /**
   * Historial de pagos de un evento.
   */
  getPagosByEvento(eventoId: string): Promise<PagoWithRelations[]>

  /**
   * Total de ingresos (solo pagos succeeded).
   */
  getRevenueTotal(): Promise<RevenueTotalResult>

  /**
   * Marca el evento como pagado.
   */
  markEventoPagado(eventoId: string): Promise<void>

  /**
   * Marca el evento como pendiente (para refunds).
   */
  markEventoPendiente(eventoId: string): Promise<void>
}
