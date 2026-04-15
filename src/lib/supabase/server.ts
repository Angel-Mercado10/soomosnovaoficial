import 'server-only'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

/**
 * Cliente de Supabase para Server Components, Server Actions y API Routes.
 * Lee y escribe cookies para mantener la sesión del usuario autenticado.
 * Usa la anon key — respeta las políticas RLS.
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // setAll puede fallar en Server Components de solo lectura.
            // El middleware se encarga de refrescar la sesión en esos casos.
          }
        },
      },
    }
  )
}
