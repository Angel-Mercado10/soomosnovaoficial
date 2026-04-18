import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  // En Next.js App Router el body raw llega sin parsear — req.text() lo obtiene directamente.
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Webhook no configurado' }, { status: 400 })
  }

  let stripe
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

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const eventoId = session.metadata?.evento_id

    if (eventoId) {
      const admin = createAdminClient()
      await admin
        .from('eventos')
        .update({ estado_pago: 'pagado' })
        .eq('id', eventoId)
    }
  }

  return NextResponse.json({ received: true })
}
