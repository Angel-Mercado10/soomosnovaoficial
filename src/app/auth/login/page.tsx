import type { Metadata } from 'next'
import { LoginForm } from '@/components/auth/LoginForm'

export const metadata: Metadata = {
  title: 'Iniciar sesión — SoomosNova',
  description: 'Accedé a tu panel de gestión de bodas en SoomosNova.',
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-cormorant text-4xl text-white">
            Soomos<span className="text-[#C9A84C]">Nova</span>
          </h1>
          <p className="text-[#9CA3AF] mt-2 text-sm">
            Accedé al panel de tu boda
          </p>
        </div>
        <LoginForm />
        <p className="text-center text-[#9CA3AF] text-sm mt-6">
          ¿No tenés cuenta?{' '}
          <a href="/auth/registro" className="text-[#C9A84C] hover:underline">
            Registrate gratis
          </a>
        </p>
      </div>
    </main>
  )
}
