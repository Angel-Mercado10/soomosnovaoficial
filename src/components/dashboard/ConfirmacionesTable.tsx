'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Confirmacion, Invitado } from '@/types/database'

type FiltroAsiste = 'todos' | 'confirmados' | 'rechazos'

interface ConfirmacionConInvitado extends Confirmacion {
  invitado: Pick<Invitado, 'nombre' | 'email' | 'telefono'>
}

interface ConfirmacionesTableProps {
  confirmaciones: ConfirmacionConInvitado[]
  /** evento_id para la suscripción Realtime */
  eventoId: string
}

const FILTROS: { value: FiltroAsiste; label: string }[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'confirmados', label: 'Confirmados' },
  { value: 'rechazos', label: 'Rechazos' },
]

export function ConfirmacionesTable({ confirmaciones: initialConfirmaciones, eventoId }: ConfirmacionesTableProps) {
  const [confirmaciones, setConfirmaciones] = useState<ConfirmacionConInvitado[]>(initialConfirmaciones)
  const [filtro, setFiltro] = useState<FiltroAsiste>('todos')

  // ── Realtime: suscribirse a cambios en confirmaciones e invitados ────────────
  useEffect(() => {
    const supabase = createClient()
    let debounceTimer: ReturnType<typeof setTimeout> | null = null

    const fetchConfirmaciones = async () => {
      // Obtener confirmaciones del evento
      const { data: rawConf } = await supabase
        .from('confirmaciones')
        .select('*')
        .eq('evento_id', eventoId)
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
        (invitadosData ?? []).map((i) => [
          i.id,
          { nombre: i.nombre, email: i.email, telefono: i.telefono },
        ])
      )

      const actualizadas: ConfirmacionConInvitado[] = confirmacionesBase.map((c) => ({
        ...c,
        invitado: invitadosMap.get(c.invitado_id) ?? {
          nombre: 'Desconocido',
          email: null,
          telefono: null,
        },
      }))

      setConfirmaciones(actualizadas)
    }

    const debouncedFetch = () => {
      if (debounceTimer) clearTimeout(debounceTimer)
      debounceTimer = setTimeout(fetchConfirmaciones, 500)
    }

    // Canal Realtime para cambios en confirmaciones del evento
    const channel = supabase
      .channel(`confirmaciones-table-${eventoId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'confirmaciones',
          filter: `evento_id=eq.${eventoId}`,
        },
        () => {
          debouncedFetch()
        }
      )
      .subscribe()

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer)
      supabase.removeChannel(channel)
    }
  }, [eventoId])

  const filtradas = confirmaciones.filter((c) => {
    if (filtro === 'confirmados') return c.asiste === true
    if (filtro === 'rechazos') return c.asiste === false
    return true
  })

  // Opciones de menú únicas derivadas de los datos reales
  const menuOpciones = confirmaciones.reduce<string[]>((acc, c) => {
    if (c.opcion_menu !== null && c.opcion_menu !== undefined && !acc.includes(c.opcion_menu)) {
      acc.push(c.opcion_menu)
    }
    return acc
  }, [])

  // Contadores por menú
  const conteosMenu = menuOpciones.reduce<Record<string, number>>((acc, opcion) => {
    acc[opcion] = confirmaciones.filter(
      (c) => c.asiste && c.opcion_menu?.toLowerCase() === opcion.toLowerCase()
    ).length
    return acc
  }, {})

  return (
    <div className="space-y-6">
      {/* Cards de menú */}
      <div className="grid grid-cols-3 gap-4">
        {menuOpciones.map((opcion) => (
          <div
            key={opcion}
            className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-4 text-center"
          >
            <p className="font-cormorant text-3xl text-[#C9A84C] font-semibold">
              {conteosMenu[opcion] ?? 0}
            </p>
            <p className="text-[#9CA3AF] text-xs mt-1">{opcion}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex gap-2">
        {FILTROS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFiltro(f.value)}
            className={`px-4 py-2 rounded-full text-xs font-medium transition-colors border ${
              filtro === f.value
                ? 'bg-[#C9A84C]/10 text-[#C9A84C] border-[#C9A84C]/30'
                : 'text-[#9CA3AF] border-[#2A2A2A] hover:border-[#3A3A3A] hover:text-white'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Tabla */}
      <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2A2A2A]">
                <th className="text-left px-4 py-3 text-[#9CA3AF] font-medium">Nombre</th>
                <th className="text-left px-4 py-3 text-[#9CA3AF] font-medium">Asiste</th>
                <th className="text-left px-4 py-3 text-[#9CA3AF] font-medium hidden md:table-cell">
                  Menú
                </th>
                <th className="text-left px-4 py-3 text-[#9CA3AF] font-medium hidden md:table-cell">
                  Acompañante
                </th>
                <th className="text-left px-4 py-3 text-[#9CA3AF] font-medium hidden lg:table-cell">
                  Confirmado el
                </th>
              </tr>
            </thead>
            <tbody>
              {filtradas.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-[#9CA3AF]">
                    No hay confirmaciones para el filtro seleccionado
                  </td>
                </tr>
              ) : (
                filtradas.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-[#2A2A2A] last:border-0 hover:bg-[#222222] transition-colors"
                  >
                    <td className="px-4 py-3 text-white font-medium">{c.invitado.nombre}</td>
                    <td className="px-4 py-3">
                      {c.asiste ? (
                        <span className="inline-flex items-center gap-1 text-green-400 text-xs">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          Sí
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-400 text-xs">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                          No
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[#9CA3AF] hidden md:table-cell">
                      {c.opcion_menu ?? '—'}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {c.lleva_acompanante ? (
                        <span className="text-blue-400 text-xs">
                          Sí{c.nombre_acompanante ? `: ${c.nombre_acompanante}` : ''}
                        </span>
                      ) : (
                        <span className="text-[#9CA3AF] text-xs">No</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[#9CA3AF] text-xs hidden lg:table-cell">
                      {new Date(c.confirmed_at).toLocaleDateString('es-AR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
