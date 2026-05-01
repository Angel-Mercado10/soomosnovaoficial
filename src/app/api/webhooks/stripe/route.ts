import 'server-only'
import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { getStripe } from '@/lib/stripe'
import Stripe from 'stripe'
import { registerStripePayment } from '@/features/pagos/application/register-stripe-payment.use-case'
import { getPagosRepository } from '@/features/pagos/infrastructure/supabase-pagos.repository'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const headersList = await headers()
  const sig = headersList.get('stripe-signature')

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Webhook no configurado' }, { status: 400 })
  }

  let stripe: Stripe
  try {
    stripe = getStripe()
  } catch {
    return NextResponse.json({ error: 'Stripe no configurado' }, { status: 500 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch {
    return NextResponse.json({ error: 'Firma inválida' }, { status: 400 })
  }

  const repo = getPagosRepository()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const eventoId = session.metadata?.evento_id
        const parejaId = session.metadata?.pareja_id

        if (!eventoId || !parejaId) {
          console.warn('[Webhook] checkout.session.completed sin metadata evento_id/pareja_id', {
            session_id: session.id,
          })
          break
        }

        const paymentIntentId =
          typeof session.payment_intent === 'string' ? session.payment_intent : null
        const isPaid = session.payment_status === 'paid'

        await registerStripePayment(
          {
            stripe_payment_intent_id: paymentIntentId ?? undefined,
            stripe_session_id: session.id,
            evento_id: eventoId,
            pareja_id: parejaId,
            amount_cents: session.amount_total ?? 299900,
            currency: session.currency ?? 'mxn',
            status: isPaid ? 'succeeded' : 'pending',
            paid_at: isPaid ? new Date().toISOString() : undefined,
            raw_event: event as unknown,
          },
          repo
        )
        break
      }

      case 'payment_intent.succeeded': {
        const pi = event.data.object as Stripe.PaymentIntent
        const eventoId = pi.metadata?.evento_id
        const parejaId = pi.metadata?.pareja_id

        if (!eventoId || !parejaId) {
          console.warn('[Webhook] payment_intent.succeeded sin metadata', { pi_id: pi.id })
          break
        }

        await registerStripePayment(
          {
            stripe_payment_intent_id: pi.id,
            evento_id: eventoId,
            pareja_id: parejaId,
            amount_cents: pi.amount,
            currency: pi.currency,
            status: 'succeeded',
            paid_at: new Date().toISOString(),
            raw_event: event as unknown,
          },
          repo
        )
        break
      }

      case 'payment_intent.payment_failed': {
        const pi = event.data.object as Stripe.PaymentIntent
        const eventoId = pi.metadata?.evento_id
        const parejaId = pi.metadata?.pareja_id

        if (!eventoId || !parejaId) {
          console.warn('[Webhook] payment_intent.payment_failed sin metadata', { pi_id: pi.id })
          break
        }

        // failed: persistir pago, NO cambiar estado evento (manejado en use-case)
        await registerStripePayment(
          {
            stripe_payment_intent_id: pi.id,
            evento_id: eventoId,
            pareja_id: parejaId,
            amount_cents: pi.amount,
            currency: pi.currency,
            status: 'failed',
            raw_event: event as unknown,
          },
          repo
        )
        break
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge
        const pi = typeof charge.payment_intent === 'string' ? charge.payment_intent : null
        const eventoId = charge.metadata?.evento_id
        const parejaId = charge.metadata?.pareja_id

        if (!eventoId || !parejaId) {
          console.warn('[Webhook] charge.refunded sin metadata', { charge_id: charge.id })
          break
        }

        // refunded: actualizar pago + marcar evento pendiente (use-case lo maneja)
        await registerStripePayment(
          {
            stripe_payment_intent_id: pi ?? undefined,
            evento_id: eventoId,
            pareja_id: parejaId,
            amount_cents: charge.amount,
            currency: charge.currency,
            status: 'refunded',
            raw_event: event as unknown,
          },
          repo
        )
        break
      }

      default:
        // Evento no manejado — ignorar silenciosamente
        break
    }
  } catch (err) {
    console.error('[Webhook] Error procesando evento:', event.type, err)
    return NextResponse.json({ error: 'Error interno al procesar evento' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
