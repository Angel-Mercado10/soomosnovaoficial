import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { InvitadosTable } from '@/components/dashboard/InvitadosTable'
import Link from 'next/link'

export default async function InvitadosPage() {
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
        <h1 className="font-cormorant text-3xl text-white">Invitados</h1>
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6 text-center">
          <p className="text-[#9CA3AF] mb-4">
            Primero configurá tu evento para gestionar invitados.
          </p>
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

  const { data: invitados } = await supabase
    .from('invitados')
    .select('*')
    .eq('evento_id', evento.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  const lista = invitados ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-cormorant text-3xl text-white">Invitados</h1>
          <p className="text-[#9CA3AF] text-sm mt-0.5">{evento.nombre_evento}</p>
        </div>
        <Link
          href="/dashboard/invitados/subir"
          className="flex items-center gap-2 bg-[#C9A84C] hover:bg-[#B8974B] text-[#0A0A0A] font-semibold rounded-full py-2.5 px-5 transition-colors text-sm whitespace-nowrap"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          Subir CSV
        </Link>
      </div>

      <InvitadosTable invitados={lista} />
    </div>
  )
}
