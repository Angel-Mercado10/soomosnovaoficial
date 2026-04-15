'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface CompletarPerfilFormProps {
  userId: string
  userEmail: string
}

/**
 * Formulario de fallback cuando el trigger de Supabase no creó la pareja.
 * Se muestra en el dashboard cuando el usuario está autenticado pero no
 * tiene registro en la tabla `parejas`.
 */
export function CompletarPerfilForm({ userId, userEmail }: CompletarPerfilFormProps) {
  const router = useRouter()
  const [nombre1, setNombre1] = useState('')
  const [nombre2, setNombre2] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!nombre1.trim() || !nombre2.trim()) {
      setError('Ambos nombres son obligatorios.')
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()

      const { error: insertError } = await supabase
        .from('parejas')
        .insert({
          auth_user_id: userId,
          nombre_1: nombre1.trim(),
          nombre_2: nombre2.trim(),
          email: userEmail,
        })

      if (insertError) {
        // Si ya existe (duplicate key), recargar el dashboard
        if (insertError.code === '23505') {
          router.refresh()
          return
        }
        setError('No se pudo guardar el perfil. Intentá de nuevo o contactá a soporte.')
        return
      }

      router.refresh()
    } catch {
      setError('Error inesperado. Recargá la página e intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-[#C9A84C] text-3xl mb-4 select-none">✦</div>
          <h1 className="font-cormorant text-4xl text-white">
            Completá tu perfil
          </h1>
          <p className="text-[#9CA3AF] mt-2 text-sm max-w-xs mx-auto">
            Para continuar, necesitamos los nombres de ambos integrantes de la pareja.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6 space-y-4"
        >
          <div>
            <label htmlFor="nombre1" className="block text-sm text-[#9CA3AF] mb-1">
              Tu nombre
            </label>
            <input
              id="nombre1"
              type="text"
              required
              value={nombre1}
              onChange={(e) => setNombre1(e.target.value)}
              placeholder="Ana"
              className="w-full bg-[#111111] border border-[#2A2A2A] rounded-lg px-4 py-3 text-white placeholder-[#4A4A4A] focus:outline-none focus:border-[#C9A84C] transition-colors"
            />
          </div>

          <div>
            <label htmlFor="nombre2" className="block text-sm text-[#9CA3AF] mb-1">
              Nombre de tu pareja
            </label>
            <input
              id="nombre2"
              type="text"
              required
              value={nombre2}
              onChange={(e) => setNombre2(e.target.value)}
              placeholder="Luis"
              className="w-full bg-[#111111] border border-[#2A2A2A] rounded-lg px-4 py-3 text-white placeholder-[#4A4A4A] focus:outline-none focus:border-[#C9A84C] transition-colors"
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
            {loading ? 'Guardando...' : 'Guardar y continuar'}
          </button>
        </form>
      </div>
    </main>
  )
}
