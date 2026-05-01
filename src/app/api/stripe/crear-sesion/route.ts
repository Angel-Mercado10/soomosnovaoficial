import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getStripe } from '@/lib/stripe'

function formatearFecha(fecha: string): string {
  const date = new Date(fecha + 'T12:00:00')
  return date.toLocaleDateString('es-MX', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export async function POST(_req: NextRequest) {
  void _req
  // ── Autenticación ────────────────────────────────────────────────────────────
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const admin = createAdminClient()

  // ── Buscar pareja autenticada ────────────────────────────────────────────────
  const { data: pareja } = await admin
    .from('parejas')
    .select('id')
    .eq('auth_user_id', user.id)
    .is('deleted_at', null)
    .single()

  if (!pareja) {
    return NextResponse.json({ error: 'Pareja no encontrada' }, { status: 404 })
  }

  // ── Buscar evento de la pareja ───────────────────────────────────────────────
  const { data: evento } = await admin
    .from('eventos')
    .select('id, pareja_id, nombre_evento, fecha_evento, hora_evento, estado_pago')
    .eq('pareja_id', pareja.id)
    .is('deleted_at', null)
    .single()

  if (!evento) {
    return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 })
  }

  if (evento.estado_pago === 'pagado') {
    return NextResponse.json({ error: 'El evento ya está activado' }, { status: 400 })
  }

  let stripe
  try {
    stripe = getStripe()
  } catch {
    return NextResponse.json({ error: 'Stripe no configurado' }, { status: 500 })
  }

  // ── Crear sesión de Stripe Checkout ─────────────────────────────────────────
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'mxn',
          product_data: {
            name: 'SoomosNova — Activación de evento',
            description: `${evento.nombre_evento} · ${formatearFecha(evento.fecha_evento)}`,
          },
          unit_amount: 299900, // $2,999 MXN en centavos
        },
        quantity: 1,
      },
    ],
    metadata: {
      evento_id: evento.id,
      pareja_id: evento.pareja_id,
    },
    payment_intent_data: {
      metadata: {
        evento_id: evento.id,
        pareja_id: evento.pareja_id,
      },
    },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/pago/exito?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/pago/cancelado`,
  })

  // ── Guardar stripe_session_id en el evento ───────────────────────────────────
  await admin
    .from('eventos')
    .update({ stripe_session_id: session.id })
    .eq('id', evento.id)

  return NextResponse.json({ url: session.url })
}
