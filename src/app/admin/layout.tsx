import 'server-only'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

export const metadata = {
  title: 'Admin — SoomosNova',
  robots: { index: false, follow: false },
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // ── Verificación 1: sesión activa (via cookie/SSR) ────────────────────────
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // ── Verificación 2: role super_admin via adminClient ─────────────────────
  // Lee app_metadata directamente desde el servidor — no desde el JWT del cliente.
  // app_metadata SÓLO puede ser escrito por service role / admin API; el usuario no puede modificarlo.
  const adminSupabase = createAdminClient()
  const { data: authUser, error } = await adminSupabase.auth.admin.getUserById(user.id)

  if (error || !authUser?.user) {
    redirect('/auth/login')
  }

  // Verificamos app_metadata — escrito exclusivamente por service role / admin API.
  // user_metadata puede ser modificado por el usuario; NO debe usarse para autorización.
  const role = (authUser.user.app_metadata as Record<string, unknown>)?.role as string | undefined
  if (role !== 'super_admin') {
    // Usuario real sin permisos → su dashboard
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
