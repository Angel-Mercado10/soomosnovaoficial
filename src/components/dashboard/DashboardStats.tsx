'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface StatsData {
  total: number
  confirmados: number
  pendientes: number
  rechazos: number
}

interface DashboardStatsProps {
  eventoId: string
  initialStats: StatsData
}

export function DashboardStats({ eventoId, initialStats }: DashboardStatsProps) {
  const [stats, setStats] = useState<StatsData>(initialStats)

  useEffect(() => {
    const supabase = createClient()

    const fetchStats = async () => {
      const { data, error } = await supabase
        .from('invitados')
        .select('estado_confirmacion')
        .eq('evento_id', eventoId)
        .is('deleted_at', null)

      if (error || !data) return

      const total = data.length
      const confirmados = data.filter((i) => i.estado_confirmacion === 'confirmado').length
      const rechazos = data.filter((i) => i.estado_confirmacion === 'rechazo').length
      const pendientes = data.filter(
        (i) => i.estado_confirmacion === 'pendiente' || i.estado_confirmacion === 'pendiente_decision'
      ).length

      setStats({ total, confirmados, pendientes, rechazos })
    }

    // Canal Realtime para cambios en invitados
    const channel = supabase
      .channel(`dashboard-stats-${eventoId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'invitados',
          filter: `evento_id=eq.${eventoId}`,
        },
        () => {
          fetchStats()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [eventoId])

  const cards = [
    { label: 'Total invitados', value: stats.total, color: 'text-[#C9A84C]' },
    { label: 'Confirmados', value: stats.confirmados, color: 'text-green-400' },
    { label: 'Pendientes', value: stats.pendientes, color: 'text-yellow-400' },
    { label: 'Rechazos', value: stats.rechazos, color: 'text-red-400' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-4 text-center"
        >
          <p className={`font-cormorant text-4xl font-semibold ${card.color}`}>
            {card.value}
          </p>
          <p className="text-[#9CA3AF] text-xs mt-1">{card.label}</p>
        </div>
      ))}
    </div>
  )
}

interface NoEventoCTAProps {
  parejaNombres: string
}

export function NoEventoCTA({ parejaNombres }: NoEventoCTAProps) {
  return (
    <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-8 text-center max-w-lg mx-auto">
      <div className="w-16 h-16 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/20 flex items-center justify-center mx-auto mb-4">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1.5">
          <path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
        </svg>
      </div>
      <h2 className="font-cormorant text-2xl text-white mb-2">
        Configurá su evento
      </h2>
      <p className="text-[#9CA3AF] text-sm mb-6">
        Hola {parejaNombres}. Todavía no configuraron los datos de la boda. Completenlos para comenzar a gestionar sus invitados.
      </p>
      <Link
        href="/dashboard/configuracion"
        className="inline-block bg-[#C9A84C] hover:bg-[#B8974B] text-[#0A0A0A] font-semibold rounded-full py-3 px-8 transition-colors text-sm"
      >
        Configurar evento
      </Link>
    </div>
  )
}
