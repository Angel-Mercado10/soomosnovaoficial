import 'server-only'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

/**
 * Cliente admin de Supabase con service_role key.
 * SOLO para uso en API Routes del servidor.
 * NUNCA exportar ni usar en Client Components.
 * Bypasea RLS — usar con extremo cuidado.
 */
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
