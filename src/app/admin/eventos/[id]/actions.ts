'use server'

import 'server-only'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { registerManualPayment } from '@/features/pagos/application/register-manual-payment.use-case'
import { getPagosRepository } from '@/features/pagos/infrastructure/supabase-pagos.repository'

async function getAdminUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const adminClient = createAdminClient()
  const { data: authUser } = await adminClient.auth.admin.getUserById(user.id)
  const role = (authUser?.user?.app_metadata as Record<string, unknown>)?.role
  if (role !== 'super_admin') return null

  return user
}

export async function deleteEventoAction(eventoId: string): Promise<{ success: boolean; error?: string }> {
  const user = await getAdminUser()
  if (!user) {
    redirect('/auth/login')
  }

  const adminClient = createAdminClient()

  const { error } = await adminClient
    .from('eventos')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', eventoId)
    .is('deleted_at', null)

  if (error) {
    console.error('[deleteEventoAction] Error:', error)
    return { success: false, error: 'No fue posible eliminar el evento. Intente de nuevo.' }
  }

  revalidatePath('/admin/eventos')
  revalidatePath(`/admin/eventos/${eventoId}`)

  return { success: true }
}

export async function markEventoAsPaidAction(eventoId: string): Promise<{ success: boolean; error?: string }> {
  const user = await getAdminUser()
  if (!user) {
    redirect('/auth/login')
  }

  // Obtener pareja_id del evento
  const adminClient = createAdminClient()
  const { data: evento, error: eventoError } = await adminClient
    .from('eventos')
    .select('id, pareja_id, estado_pago')
    .eq('id', eventoId)
    .single()

  if (eventoError || !evento) {
    return { success: false, error: 'Evento no encontrado.' }
  }

  if (evento.estado_pago === 'pagado') {
    return { success: false, error: 'El evento ya se encuentra marcado como pagado.' }
  }

  try {
    const repo = getPagosRepository()
    await registerManualPayment(
      {
        evento_id: eventoId,
        pareja_id: evento.pareja_id,
        amount_cents: 299900,
        currency: 'mxn',
        admin_user_id: user.id,
      },
      repo
    )

    revalidatePath(`/admin/eventos/${eventoId}`)
    revalidatePath('/admin/eventos')
    revalidatePath('/admin/pagos')

    return { success: true }
  } catch (err) {
    console.error('[markEventoAsPaidAction] Error:', err)
    return { success: false, error: 'No fue posible registrar el pago. Intente de nuevo.' }
  }
}
