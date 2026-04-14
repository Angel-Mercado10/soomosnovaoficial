import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'

export default async function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: pareja } = await supabase
    .from('parejas')
    .select('*')
    .eq('auth_user_id', user.id)
    .single()

  if (!pareja) {
    redirect('/auth/login')
  }

  return <DashboardLayout pareja={pareja}>{children}</DashboardLayout>
}
