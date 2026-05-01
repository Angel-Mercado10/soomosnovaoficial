import 'server-only'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Overview — Admin SoomosNova',
}

interface StatCardProps {
  label: string
  value: number | string
  sub?: string
  accent?: boolean
}

function StatCard({ label, value, sub, accent }: StatCardProps) {
  return (
    <div
      className={`rounded-xl border p-5 ${
        accent
          ? 'bg-[#C9A84C]/5 border-[#C9A84C]/20'
          : 'bg-[#111111] border-[#1E1E1E]'
      }`}
    >
      <p className="text-[#9CA3AF] text-xs uppercase tracking-wider mb-1">{label}</p>
      <p
        className={`text-3xl font-semibold ${accent ? 'text-[#C9A84C]' : 'text-white'}`}
      >
        {value}
      </p>
      {sub && <p className="text-[#9CA3AF] text-xs mt-1">{sub}</p>}
    </div>
  )
}

export default async function AdminOverviewPage() {
  const supabase = createAdminClient()

  // Consultas paralelas para métricas globales
  const [
    { count: totalParejas },
    { count: totalEventos },
    { count: eventosPagados },
    { count: eventosPendientes },
    { data: recentEventos },
    { data: recentParejas },
  ] = await Promise.all([
    supabase
      .from('parejas')
      .select('id', { count: 'exact', head: true })
      .is('deleted_at', null),
    supabase
      .from('eventos')
      .select('id', { count: 'exact', head: true })
      .is('deleted_at', null),
    supabase
      .from('eventos')
      .select('id', { count: 'exact', head: true })
      .eq('estado_pago', 'pagado')
      .is('deleted_at', null),
    supabase
      .from('eventos')
      .select('id', { count: 'exact', head: true })
      .eq('estado_pago', 'pendiente')
      .is('deleted_at', null),
    // Últimos 5 eventos (demos/pendientes primero)
    supabase
      .from('eventos')
      .select('id, nombre_evento, estado_pago, fecha_evento, template, pareja_id, created_at')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(5),
    // Últimas 5 parejas
    supabase
      .from('parejas')
      .select('id, nombre_1, nombre_2, email, plan, created_at')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const conversionRate =
    totalEventos && totalEventos > 0
      ? Math.round(((eventosPagados ?? 0) / totalEventos) * 100)
      : 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-cormorant text-4xl text-white">
          Panel <span className="text-[#C9A84C]">Admin</span>
        </h1>
        <p className="text-[#9CA3AF] text-sm mt-1">
          Vista global del sistema — datos en tiempo real vía service_role.
        </p>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Parejas" value={totalParejas ?? 0} sub="registradas" />
        <StatCard label="Eventos" value={totalEventos ?? 0} sub="totales" />
        <StatCard
          label="Pagados / Activos"
          value={eventosPagados ?? 0}
          sub={`${conversionRate}% conversión`}
          accent
        />
        <StatCard
          label="Demos / Pendientes"
          value={eventosPendientes ?? 0}
          sub="sin pago"
        />
      </div>

      {/* Sección demos / eventos pendientes */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-medium">
            Demos y eventos pendientes de pago
          </h2>
          <Link
            href="/admin/demos"
            className="text-xs text-[#C9A84C] hover:underline"
          >
            Ver todos →
          </Link>
        </div>
        <div className="bg-[#111111] border border-[#1E1E1E] rounded-xl overflow-hidden">
          {recentEventos && recentEventos.filter((e) => e.estado_pago === 'pendiente').length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1E1E1E]">
                  <th className="text-left px-5 py-3 text-[#9CA3AF] font-normal">Evento</th>
                  <th className="text-left px-5 py-3 text-[#9CA3AF] font-normal hidden md:table-cell">
                    Fecha
                  </th>
                  <th className="text-left px-5 py-3 text-[#9CA3AF] font-normal">Estado</th>
                  <th className="text-left px-5 py-3 text-[#9CA3AF] font-normal hidden lg:table-cell">
                    Template
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentEventos
                  .filter((e) => e.estado_pago === 'pendiente')
                  .map((evento) => (
                    <tr
                      key={evento.id}
                      className="border-b border-[#1A1A1A] last:border-0 hover:bg-[#161616] transition-colors"
                    >
                      <td className="px-5 py-3 text-white">{evento.nombre_evento}</td>
                      <td className="px-5 py-3 text-[#9CA3AF] hidden md:table-cell">
                        {new Date(evento.fecha_evento).toLocaleDateString('es-AR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-5 py-3">
                        <span className="inline-flex items-center gap-1.5 text-xs bg-amber-400/10 text-amber-400 border border-amber-400/20 rounded-full px-2.5 py-1">
                          Pendiente
                        </span>
                      </td>
                      <td className="px-5 py-3 text-[#9CA3AF] hidden lg:table-cell capitalize">
                        {evento.template}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          ) : (
            <p className="text-[#9CA3AF] text-sm px-5 py-6">
              No hay eventos pendientes de pago recientes.
            </p>
          )}
        </div>
      </section>

      {/* Sección parejas recientes */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-medium">Parejas recientes</h2>
          <Link
            href="/admin/parejas"
            className="text-xs text-[#C9A84C] hover:underline"
          >
            Ver todas →
          </Link>
        </div>
        <div className="bg-[#111111] border border-[#1E1E1E] rounded-xl overflow-hidden">
          {recentParejas && recentParejas.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1E1E1E]">
                  <th className="text-left px-5 py-3 text-[#9CA3AF] font-normal">Pareja</th>
                  <th className="text-left px-5 py-3 text-[#9CA3AF] font-normal hidden md:table-cell">
                    Email
                  </th>
                  <th className="text-left px-5 py-3 text-[#9CA3AF] font-normal">Plan</th>
                  <th className="text-left px-5 py-3 text-[#9CA3AF] font-normal hidden lg:table-cell">
                    Registrada
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentParejas.map((pareja) => (
                  <tr
                    key={pareja.id}
                    className="border-b border-[#1A1A1A] last:border-0 hover:bg-[#161616] transition-colors"
                  >
                    <td className="px-5 py-3 text-white">
                      {pareja.nombre_1} &amp; {pareja.nombre_2}
                    </td>
                    <td className="px-5 py-3 text-[#9CA3AF] hidden md:table-cell">
                      {pareja.email}
                    </td>
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
                    <td className="px-5 py-3 text-[#9CA3AF] hidden lg:table-cell">
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
          ) : (
            <p className="text-[#9CA3AF] text-sm px-5 py-6">
              No hay parejas registradas aún.
            </p>
          )}
        </div>
      </section>
    </div>
  )
}
