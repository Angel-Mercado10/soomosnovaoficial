import type { Metadata } from 'next'
import { RegistroForm } from '@/components/auth/RegistroForm'

export const metadata: Metadata = {
  title: 'Crear cuenta — SoomosNova',
  description: 'Registrate y comenzá a gestionar tu boda con SoomosNova.',
}

export default function RegistroPage() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-cormorant text-4xl text-white">
            Soomos<span className="text-[#C9A84C]">Nova</span>
          </h1>
          <p className="text-[#9CA3AF] mt-2 text-sm">
            Creá tu cuenta y configurá el evento de tu boda
          </p>
        </div>
        <RegistroForm />
        <p className="text-center text-[#9CA3AF] text-sm mt-6">
          ¿Ya tenés cuenta?{' '}
          <a href="/auth/login" className="text-[#C9A84C] hover:underline">
            Iniciá sesión
          </a>
        </p>
      </div>
    </main>
  )
}
