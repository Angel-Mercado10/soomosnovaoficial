'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// El username admin se mapea a un email interno vía variable de entorno.
// NEXT_PUBLIC_ADMIN_EMAIL se incluye en el bundle del cliente (es público por convención de Next.js).
// No es un secreto — el email está visible en el cliente; la seguridad real está en la contraseña y en app_metadata.
const ADMIN_USERNAME = 'SoomosAdmin99'
const ADMIN_EMAIL_ALIAS = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? null

function resolveEmail(input: string): string {
  const trimmed = input.trim()
  if (
    ADMIN_EMAIL_ALIAS &&
    trimmed.toLowerCase() === ADMIN_USERNAME.toLowerCase()
  ) {
    return ADMIN_EMAIL_ALIAS
  }
  return trimmed.toLowerCase()
}

export function LoginForm() {
  const router = useRouter()
  // Acepta email o username
  const [emailOrUsername, setEmailOrUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const supabase = createClient()
      const resolvedEmail = resolveEmail(emailOrUsername)

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: resolvedEmail,
        password,
      })

      if (signInError) {
        setError('Credenciales incorrectas.')
        return
      }

      // Redirigir según rol.
      // Nota: esta redirección es solo UX (el servidor re-verifica en layout).
      // Usamos app_metadata — único campo no modificable por el usuario en Supabase.
      const appMeta = data.user?.app_metadata as Record<string, unknown> | undefined
      const role = appMeta?.role as string | undefined
      if (role === 'super_admin') {
        router.push('/admin')
      } else {
        router.push('/dashboard')
      }
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm text-[#9CA3AF] mb-1">
          Email o usuario
        </label>
        <input
          id="email"
          type="text"
          required
          value={emailOrUsername}
          onChange={(e) => setEmailOrUsername(e.target.value)}
          placeholder="ana@ejemplo.com"
          autoComplete="username"
          className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-4 py-3 text-white placeholder-[#4A4A4A] focus:outline-none focus:border-[#C9A84C] transition-colors"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm text-[#9CA3AF] mb-1">
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Tu contraseña"
          className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-4 py-3 text-white placeholder-[#4A4A4A] focus:outline-none focus:border-[#C9A84C] transition-colors"
        />
      </div>

      {error && (
        <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#C9A84C] hover:bg-[#B8974B] disabled:opacity-50 disabled:cursor-not-allowed text-[#0A0A0A] font-semibold rounded-full py-3 px-6 transition-colors"
      >
        {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
      </button>
    </form>
  )
}
