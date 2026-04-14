import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Confirmá tu email — SoomosNova',
  description: 'Revisá tu email para confirmar tu cuenta en SoomosNova.',
}

export default function VerifyEmailPage() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <h1 className="font-cormorant text-4xl text-white mb-4">
          Soomos<span className="text-[#C9A84C]">Nova</span>
        </h1>

        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-8 space-y-4">
          <div className="text-[#C9A84C] text-5xl mb-2">✉</div>

          <h2 className="font-cormorant text-2xl text-white">
            Revisá tu email
          </h2>

          <p className="text-[#9CA3AF] text-sm leading-relaxed">
            Te enviamos un enlace de confirmación. Hacé clic en el enlace del email para activar tu cuenta y acceder a SoomosNova.
          </p>

          <p className="text-[#9CA3AF] text-xs">
            Si no lo encontrás, revisá la carpeta de spam.
          </p>
        </div>

        <p className="text-[#9CA3AF] text-sm mt-6">
          ¿Ya confirmaste?{' '}
          <Link href="/auth/login" className="text-[#C9A84C] hover:underline">
            Iniciá sesión
          </Link>
        </p>
      </div>
    </main>
  )
}
