import 'server-only'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Parejas — Admin SoomosNova',
}

export default async function AdminParejasPage() {
  const supabase = createAdminClient()

  const { data: parejas, error } = await supabase
    .from('parejas')
    .select('id, nombre_1, nombre_2, email, telefono, plan, created_at')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  // Contar eventos por pareja
  const { data: eventosCount } = await supabase
    .from('eventos')
    .select('pareja_id')
    .is('deleted_at', null)

  const eventosPerPareja = new Map<string, number>()
  for (const e of eventosCount ?? []) {
    eventosPerPareja.set(e.pareja_id, (eventosPerPareja.get(e.pareja_id) ?? 0) + 1)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-cormorant text-3xl text-white">
          <span className="text-[#C9A84C]">Parejas</span> registradas
        </h1>
        <p className="text-[#9CA3AF] text-sm mt-1">
          {parejas?.length ?? 0} parejas en el sistema.
        </p>
      </div>

      {error && (
        <p className="text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-5 py-4 text-sm">
          Error al cargar datos: {error.message}
        </p>
      )}

      <div className="bg-[#111111] border border-[#1E1E1E] rounded-xl overflow-hidden">
        {parejas && parejas.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1E1E1E]">
                  <th className="text-left px-5 py-3 text-[#9CA3AF] font-normal">Pareja</th>
                  <th className="text-left px-5 py-3 text-[#9CA3AF] font-normal">Email</th>
                  <th className="text-left px-5 py-3 text-[#9CA3AF] font-normal">Plan</th>
                  <th className="text-left px-5 py-3 text-[#9CA3AF] font-normal">Eventos</th>
                  <th className="text-left px-5 py-3 text-[#9CA3AF] font-normal">Registrada</th>
                </tr>
              </thead>
              <tbody>
                {parejas.map((pareja) => (
                  <tr
                    key={pareja.id}
                    className="border-b border-[#1A1A1A] last:border-0 hover:bg-[#161616] transition-colors"
                  >
                    <td className="px-5 py-3 text-white font-medium">
                      {pareja.nombre_1} &amp; {pareja.nombre_2}
                    </td>
                    <td className="px-5 py-3 text-[#9CA3AF]">{pareja.email}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex text-xs rounded-full px-2.5 py-1 border ${
                          pareja.plan === 'premium'
                            ? 'bg-[#C9A84C]/10 text-[#C9A84C] border-[#C9A84C]/20'
                            : pareja.plan === 'starter'
                            ? 'bg-blue-400/10 text-blue-400 border-blue-400/20'
                            : 'bg-[#2A2A2A] text-[#9CA3AF] border-[#2A2A2A]'
                        }`}
                      >
                        {pareja.plan}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-[#9CA3AF]">
                      {eventosPerPareja.get(pareja.id) ?? 0}
                    </td>
                    <td className="px-5 py-3 text-[#9CA3AF]">
                      {new Date(pareja.created_at).toLocaleDateString('es-AR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-[#9CA3AF] text-sm px-5 py-8 text-center">
            No hay parejas registradas aún.
          </p>
        )}
      </div>
    </div>
  )
}
