import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SubirInvitadosForm } from '@/components/dashboard/SubirInvitadosForm'
import Link from 'next/link'

export default async function SubirInvitadosPage() {
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
        <h1 className="font-cormorant text-3xl text-white">Subir invitados</h1>
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6 text-center">
          <p className="text-[#9CA3AF] mb-4">
            Primero configurá tu evento para poder subir invitados.
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

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-[#9CA3AF] text-sm mb-3">
          <Link href="/dashboard/invitados" className="hover:text-white transition-colors">
            Invitados
          </Link>
          <span>/</span>
          <span className="text-white">Subir</span>
        </div>
        <h1 className="font-cormorant text-3xl text-white">Subir invitados</h1>
        <p className="text-[#9CA3AF] text-sm mt-0.5">{evento.nombre_evento}</p>
      </div>

      <SubirInvitadosForm />
    </div>
  )
}
