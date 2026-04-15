import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ConfirmacionesTable } from '@/components/dashboard/ConfirmacionesTable'
import type { Confirmacion, Invitado } from '@/types/database'
import Link from 'next/link'

interface ConfirmacionConInvitado extends Confirmacion {
  invitado: Pick<Invitado, 'nombre' | 'email' | 'telefono'>
}

export default async function ConfirmacionesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: pareja } = await supabase
    .from('parejas')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  if (!pareja) redirect('/auth/login')

  const { data: evento } = await supabase
    .from('eventos')
    .select('id, nombre_evento')
    .eq('pareja_id', pareja.id)
    .single()

  if (!evento) {
    return (
      <div className="space-y-4">
        <h1 className="font-cormorant text-3xl text-white">Confirmaciones</h1>
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6 text-center">
          <p className="text-[#9CA3AF] mb-4">Configurá tu evento para ver las confirmaciones.</p>
          <Link
            href="/dashboard/configuracion"
            className="inline-block bg-[#C9A84C] hover:bg-[#B8974B] text-[#0A0A0A] font-semibold rounded-full py-2.5 px-6 transition-colors text-sm"
          >
            Configurar evento
          </Link>
        </div>
      </div>
    )
  }

  // Dos queries separadas para evitar el problema de tipos con el JOIN
  const { data: rawConf } = await supabase
    .from('confirmaciones')
    .select('*')
    .eq('evento_id', evento.id)
    .order('confirmed_at', { ascending: false })

  const confirmacionesBase = rawConf ?? []

  // Obtener invitados para esas confirmaciones
  const invitadoIds = [...new Set(confirmacionesBase.map((c) => c.invitado_id))]

  const { data: invitadosData } = invitadoIds.length > 0
    ? await supabase
        .from('invitados')
        .select('id, nombre, email, telefono')
        .in('id', invitadoIds)
    : { data: [] }

  const invitadosMap = new Map(
    (invitadosData ?? []).map((i) => [i.id, { nombre: i.nombre, email: i.email, telefono: i.telefono }])
  )

  const confirmaciones: ConfirmacionConInvitado[] = confirmacionesBase.map((c) => ({
    ...c,
    invitado: invitadosMap.get(c.invitado_id) ?? {
      nombre: 'Desconocido',
      email: null,
      telefono: null,
    },
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-cormorant text-3xl text-white">Confirmaciones</h1>
        <p className="text-[#9CA3AF] text-sm mt-0.5">{evento.nombre_evento}</p>
      </div>

      <ConfirmacionesTable confirmaciones={confirmaciones} eventoId={evento.id} />
    </div>
  )
}
