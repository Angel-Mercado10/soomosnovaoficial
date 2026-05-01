import 'server-only'
import Link from 'next/link'
import { getStripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Confirmación de pago — SoomosNova',
}

interface Props {
  searchParams: Promise<{ session_id?: string }>
}

function ErrorView({ message }: { message: string }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-red-400/10 border border-red-400/30 flex items-center justify-center">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="font-cormorant text-3xl text-white">No se pudo verificar su pago</h1>
          <p className="text-[#9CA3AF] text-sm">{message}</p>
        </div>
        <Link
          href="/dashboard"
          className="inline-block border border-[#C9A84C] text-[#C9A84C] font-semibold text-sm px-8 py-3 rounded-full hover:bg-[#C9A84C]/10 transition-colors"
        >
          Ir al panel
        </Link>
      </div>
    </div>
  )
}

function PendingView() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-amber-400/10 border border-amber-400/30 flex items-center justify-center">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="font-cormorant text-3xl text-white">Estamos confirmando su pago</h1>
          <p className="text-[#9CA3AF] text-sm">
            Su pago está siendo procesado. En unos momentos su evento quedará activado.
            Por favor, revise su panel en breve.
          </p>
        </div>
        <div className="text-[#C9A84C] text-lg">✦</div>
        <Link
          href="/dashboard"
          className="inline-block border border-[#C9A84C] text-[#C9A84C] font-semibold text-sm px-8 py-3 rounded-full hover:bg-[#C9A84C]/10 transition-colors"
        >
          Ir al panel
        </Link>
      </div>
    </div>
  )
}

function SuccessView() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/30 flex items-center justify-center">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="font-cormorant text-4xl text-white">
            Su evento ha sido activado correctamente.
          </h1>
          <p className="text-[#9CA3AF] text-sm">
            Ya puede enviar las invitaciones a sus invitados.
          </p>
        </div>
        <div className="text-[#C9A84C] text-lg">✦</div>
        <Link
          href="/dashboard"
          className="inline-block bg-[#C9A84C] text-[#0A0A0A] font-semibold text-sm px-8 py-3 rounded-full hover:bg-[#B8943E] transition-colors"
        >
          Ir al panel
        </Link>
      </div>
    </div>
  )
}

export default async function PagoExitoPage({ searchParams }: Props) {
  const { session_id } = await searchParams

  if (!session_id) {
    return <ErrorView message="No se recibió un identificador de sesión de pago válido." />
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <ErrorView message="Debe iniciar sesión para verificar este pago." />
  }

  const { data: pareja } = await supabase
    .from('parejas')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  if (!pareja) {
    return <ErrorView message="No fue posible validar la cuenta asociada a este pago." />
  }

  let stripe
  try {
    stripe = getStripe()
  } catch {
    return <ErrorView message="El sistema de pagos no está disponible en este momento." />
  }

  let session
  try {
    session = await stripe.checkout.sessions.retrieve(session_id)
  } catch {
    return <ErrorView message="No fue posible verificar su sesión de pago. Si realizó el pago, su evento se activará en breve." />
  }

  if (session.metadata?.pareja_id !== pareja.id) {
    return <ErrorView message="La sesión de pago no corresponde a su cuenta." />
  }

  if (session.payment_status !== 'paid') {
    return <PendingView />
  }

  return <SuccessView />
}
