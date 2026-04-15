'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type FormState = {
  nombre1: string
  nombre2: string
  email: string
  password: string
  confirmPassword: string
}

export function RegistroForm() {
  const router = useRouter()
  const [form, setForm] = useState<FormState>({
    nombre1: '',
    nombre2: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (form.password !== form.confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }

    if (form.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            nombre_1: form.nombre1.trim(),
            nombre_2: form.nombre2.trim(),
          },
        },
      })

      if (signUpError) {
        const mensajes: Record<string, string> = {
          'User already registered': 'Ya existe una cuenta con ese email.',
          'Email rate limit exceeded': 'Demasiados intentos. Esperá unos minutos.',
          'Password should be at least 6 characters': 'La contraseña debe tener al menos 8 caracteres.',
        }
        setError(mensajes[signUpError.message] ?? 'Error al crear la cuenta. Intentá de nuevo.')
        return
      }

      if (data.user) {
        // Si hay sesión activa (email confirmation deshabilitado), crear la pareja
        // como fallback explícito — no depender solo del trigger on_auth_user_created.
        // Si el trigger ya la creó, el INSERT fallará por unique constraint y se ignora.
        if (data.session) {
          try {
            const { error: parejaError } = await supabase
              .from('parejas')
              .insert({
                auth_user_id: data.user.id,
                nombre_1: form.nombre1.trim(),
                nombre_2: form.nombre2.trim(),
                email: form.email.trim(),
              })
              .select('id')
              .single()

            // Si el error es duplicate (trigger ya creó la pareja), no es crítico
            if (parejaError && parejaError.code !== '23505') {
              // Error real al crear la pareja — informar al usuario
              setError(
                'Tu cuenta fue creada, pero hubo un error al guardar tu perfil. ' +
                'Intentá iniciar sesión y completar el perfil desde el dashboard.'
              )
              return
            }
          } catch {
            // Silencioso — el trigger pudo haberla creado correctamente
          }

          router.push('/dashboard')
          router.refresh()
        } else {
          router.push('/auth/verify-email')
        }
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="nombre1" className="block text-sm text-[#9CA3AF] mb-1">
            Tu nombre
          </label>
          <input
            id="nombre1"
            name="nombre1"
            type="text"
            required
            value={form.nombre1}
            onChange={handleChange}
            placeholder="Ana"
            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-4 py-3 text-white placeholder-[#4A4A4A] focus:outline-none focus:border-[#C9A84C] transition-colors"
          />
        </div>
        <div>
          <label htmlFor="nombre2" className="block text-sm text-[#9CA3AF] mb-1">
            Nombre de tu pareja
          </label>
          <input
            id="nombre2"
            name="nombre2"
            type="text"
            required
            value={form.nombre2}
            onChange={handleChange}
            placeholder="Luis"
            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-4 py-3 text-white placeholder-[#4A4A4A] focus:outline-none focus:border-[#C9A84C] transition-colors"
          />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm text-[#9CA3AF] mb-1">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          value={form.email}
          onChange={handleChange}
          placeholder="ana@ejemplo.com"
          className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-4 py-3 text-white placeholder-[#4A4A4A] focus:outline-none focus:border-[#C9A84C] transition-colors"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm text-[#9CA3AF] mb-1">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          value={form.password}
          onChange={handleChange}
          placeholder="Mínimo 8 caracteres"
          className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-4 py-3 text-white placeholder-[#4A4A4A] focus:outline-none focus:border-[#C9A84C] transition-colors"
        />
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm text-[#9CA3AF] mb-1">
          Confirmar contraseña
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          value={form.confirmPassword}
          onChange={handleChange}
          placeholder="Repetí la contraseña"
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
        {loading ? 'Creando cuenta...' : 'Crear cuenta gratuita'}
      </button>
    </form>
  )
}
