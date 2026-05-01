import 'server-only'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Json } from '@/types/database'
import type { PagosRepository } from './pagos.repository'
import type {
  Pago,
  PagoWithRelations,
  RegisterStripePaymentInput,
  RegisterManualPaymentInput,
  ListPagosParams,
  ListPagosResult,
  RevenueTotalResult,
} from '../domain/pago.types'

export class SupabasePagosRepository implements PagosRepository {
  private get db() {
    return createAdminClient()
  }

  async upsertStripePayment(input: RegisterStripePaymentInput): Promise<Pago> {
    const supabase = this.db

    // Determinar clave de idempotencia
    const conflictColumn = input.stripe_payment_intent_id
      ? 'stripe_payment_intent_id'
      : undefined

    const row = {
      evento_id: input.evento_id,
      pareja_id: input.pareja_id,
      stripe_payment_intent_id: input.stripe_payment_intent_id ?? null,
      stripe_session_id: input.stripe_session_id ?? null,
      amount_cents: input.amount_cents,
      currency: input.currency,
      status: input.status,
      is_manual: false,
      paid_at: input.paid_at ?? null,
      raw_event: (input.raw_event ?? null) as Json | null,
    }

    let data: Pago | null = null
    let error: unknown = null

    if (conflictColumn) {
      // Upsert por payment_intent_id
      const result = await supabase
        .from('pagos')
        .upsert(row, {
          onConflict: 'stripe_payment_intent_id',
          ignoreDuplicates: false,
        })
        .select()
        .single()
      data = result.data as Pago
      error = result.error
    } else if (input.stripe_session_id) {
      // Upsert por session_id (parcial unique)
      const { data: existing } = await supabase
        .from('pagos')
        .select('id')
        .eq('stripe_session_id', input.stripe_session_id)
        .maybeSingle()

      if (existing?.id) {
        const result = await supabase
          .from('pagos')
          .update({ status: input.status, paid_at: input.paid_at ?? null, raw_event: (input.raw_event ?? null) as Json | null })
          .eq('id', existing.id)
          .select()
          .single()
        data = result.data as Pago
        error = result.error
      } else {
        const result = await supabase
          .from('pagos')
          .insert(row)
          .select()
          .single()
        data = result.data as Pago
        error = result.error
      }
    } else {
      // Sin clave de idempotencia — insertar
      const result = await supabase
        .from('pagos')
        .insert(row)
        .select()
        .single()
      data = result.data as Pago
      error = result.error
    }

    if (error || !data) {
      throw new Error(`Error al persistir pago: ${JSON.stringify(error)}`)
    }

    return data
  }

  async createManualPayment(input: RegisterManualPaymentInput): Promise<Pago> {
    const supabase = this.db
    const { data, error } = await supabase
      .from('pagos')
      .insert({
        evento_id: input.evento_id,
        pareja_id: input.pareja_id,
        amount_cents: input.amount_cents,
        currency: input.currency ?? 'mxn',
        status: 'succeeded',
        is_manual: true,
        paid_at: new Date().toISOString(),
        raw_event: { admin_user_id: input.admin_user_id, source: 'manual' } as Json,
      })
      .select()
      .single()

    if (error || !data) {
      throw new Error(`Error al crear pago manual: ${JSON.stringify(error)}`)
    }

    return data as Pago
  }

  async listPagos(params: ListPagosParams): Promise<ListPagosResult> {
    const supabase = this.db
    const page = params.page ?? 1
    const pageSize = params.pageSize ?? 25
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    let query = supabase
      .from('pagos')
      .select(
        `
        *,
        eventos!inner(nombre_evento, slug),
        parejas!inner(nombre_1, nombre_2, email)
      `,
        { count: 'exact' }
      )
      .order('created_at', { ascending: false })
      .range(from, to)

    if (params.eventoId) {
      query = query.eq('evento_id', params.eventoId)
    }
    if (params.status) {
      query = query.eq('status', params.status)
    }

    const { data, error, count } = await query

    if (error) {
      throw new Error(`Error al listar pagos: ${error.message}`)
    }

    const pagos: PagoWithRelations[] = (data ?? []).map((row) => {
      const r = row as Record<string, unknown>
      const evento = r.eventos as Record<string, string> | null
      const pareja = r.parejas as Record<string, string> | null
      return {
        id: r.id as string,
        evento_id: r.evento_id as string,
        pareja_id: r.pareja_id as string,
        stripe_payment_intent_id: r.stripe_payment_intent_id as string | null,
        stripe_session_id: r.stripe_session_id as string | null,
        amount_cents: r.amount_cents as number,
        currency: r.currency as string,
        status: r.status as Pago['status'],
        is_manual: r.is_manual as boolean,
        paid_at: r.paid_at as string | null,
        raw_event: r.raw_event ?? null,
        created_at: r.created_at as string,
        updated_at: r.updated_at as string,
        evento_nombre: evento?.nombre_evento,
        evento_slug: evento?.slug,
        pareja_nombre: pareja ? `${pareja.nombre_1} & ${pareja.nombre_2}` : undefined,
        pareja_email: pareja?.email,
      }
    })

    const total = count ?? 0
    return {
      pagos,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    }
  }

  async getPagosByEvento(eventoId: string): Promise<PagoWithRelations[]> {
    const supabase = this.db
    const { data, error } = await supabase
      .from('pagos')
      .select('*')
      .eq('evento_id', eventoId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Error al obtener pagos del evento: ${error.message}`)
    }

    return (data ?? []) as PagoWithRelations[]
  }

  async getRevenueTotal(): Promise<RevenueTotalResult> {
    const supabase = this.db
    const { data, error } = await supabase
      .from('pagos')
      .select('amount_cents')
      .eq('status', 'succeeded')

    if (error) {
      throw new Error(`Error al obtener revenue total: ${error.message}`)
    }

    const rows = data ?? []
    const total_cents = rows.reduce((acc, r) => acc + (r.amount_cents ?? 0), 0)
    return { total_cents, count: rows.length }
  }

  async markEventoPagado(eventoId: string): Promise<void> {
    const supabase = this.db
    const { error } = await supabase
      .from('eventos')
      .update({ estado_pago: 'pagado' })
      .eq('id', eventoId)

    if (error) {
      throw new Error(`Error al marcar evento pagado: ${error.message}`)
    }
  }

  async markEventoPendiente(eventoId: string): Promise<void> {
    const supabase = this.db
    const { error } = await supabase
      .from('eventos')
      .update({ estado_pago: 'pendiente' })
      .eq('id', eventoId)

    if (error) {
      throw new Error(`Error al marcar evento pendiente: ${error.message}`)
    }
  }
}

// Singleton ligero para uso en server actions / use-cases
let _repo: SupabasePagosRepository | null = null
export function getPagosRepository(): SupabasePagosRepository {
  if (!_repo) _repo = new SupabasePagosRepository()
  return _repo
}
