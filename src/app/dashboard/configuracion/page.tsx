import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { EventoConfigForm } from '@/components/dashboard/EventoConfigForm'

export default async function ConfiguracionPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: pareja } = await supabase
    .from('parejas')
    .select('*')
    .eq('auth_user_id', user.id)
    .single()

  if (!pareja) redirect('/auth/login')

  const { data: evento } = await supabase
    .from('eventos')
    .select('*')
    .eq('pareja_id', pareja.id)
    .single()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-cormorant text-3xl text-white">Configuración del evento</h1>
        <p className="text-[#9CA3AF] text-sm mt-0.5">
          {evento ? 'Editá los datos de tu boda' : 'Configurá los datos de tu boda'}
        </p>
      </div>

      <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6">
        <EventoConfigForm
          evento={evento ?? null}
          parejaId={pareja.id}
          nombre1={pareja.nombre_1}
          nombre2={pareja.nombre_2}
        />
      </div>
    </div>
  )
}
