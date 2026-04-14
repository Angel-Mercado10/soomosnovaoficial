'use client'

import { useState } from 'react'
import type { Invitado } from '@/types/database'

type FiltroConfirmacion = 'todos' | 'confirmado' | 'pendiente' | 'rechazo' | 'pendiente_decision' | 'error'

interface InvitadosTableProps {
  invitados: Invitado[]
}

const BADGE_STYLES: Record<string, string> = {
  confirmado: 'bg-green-500/15 text-green-400 border-green-500/20',
  rechazo: 'bg-red-500/15 text-red-400 border-red-500/20',
  pendiente: 'bg-gray-500/15 text-[#9CA3AF] border-gray-500/20',
  pendiente_decision: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
}

const BADGE_LABELS: Record<string, string> = {
  confirmado: 'Confirmado',
  rechazo: 'Rechazo',
  pendiente: 'Pendiente',
  pendiente_decision: 'Pendiente decisión',
}

const ENVIO_BADGE_STYLES: Record<string, string> = {
  pendiente_envio: 'bg-gray-500/15 text-[#9CA3AF] border-gray-500/20',
  enviado: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  error_envio: 'bg-red-500/15 text-red-400 border-red-500/20',
}

const ENVIO_LABELS: Record<string, string> = {
  pendiente_envio: 'Sin enviar',
  enviado: 'Enviado',
  error_envio: 'Error',
}

const FILTROS: { value: FiltroConfirmacion; label: string }[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'confirmado', label: 'Confirmados' },
  { value: 'pendiente', label: 'Pendientes' },
  { value: 'rechazo', label: 'Rechazos' },
  { value: 'pendiente_decision', label: 'Pendiente decisión' },
  { value: 'error', label: 'Error envío' },
]

export function InvitadosTable({ invitados }: InvitadosTableProps) {
  const [filtro, setFiltro] = useState<FiltroConfirmacion>('todos')
  const [busqueda, setBusqueda] = useState('')

  const filtrados = invitados.filter((inv) => {
    const matchFiltro =
      filtro === 'todos' ||
      (filtro === 'error' ? inv.estado_envio === 'error_envio' : inv.estado_confirmacion === filtro)
    const matchBusqueda =
      busqueda === '' || inv.nombre.toLowerCase().includes(busqueda.toLowerCase())
    return matchFiltro && matchBusqueda
  })

  return (
    <div className="space-y-4">
      {/* Filtros y búsqueda */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="flex-1 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#9CA3AF] focus:outline-none focus:border-[#C9A84C]/50 transition-colors"
        />
        <div className="flex gap-2 flex-wrap">
          {FILTROS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFiltro(f.value)}
              className={`px-3 py-2 rounded-full text-xs font-medium transition-colors border ${
                filtro === f.value
                  ? 'bg-[#C9A84C]/10 text-[#C9A84C] border-[#C9A84C]/30'
                  : 'text-[#9CA3AF] border-[#2A2A2A] hover:border-[#3A3A3A] hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contador */}
      <p className="text-[#9CA3AF] text-sm">
        Mostrando <span className="text-white font-medium">{filtrados.length}</span> de{' '}
        {invitados.length} invitados
      </p>

      {/* Tabla */}
      <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2A2A2A]">
                <th className="text-left px-4 py-3 text-[#9CA3AF] font-medium">Nombre</th>
                <th className="text-left px-4 py-3 text-[#9CA3AF] font-medium hidden sm:table-cell">
                  Contacto
                </th>
                <th className="text-left px-4 py-3 text-[#9CA3AF] font-medium">Estado envío</th>
                <th className="text-left px-4 py-3 text-[#9CA3AF] font-medium">Confirmación</th>
                <th className="text-left px-4 py-3 text-[#9CA3AF] font-medium">QR</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-[#9CA3AF]">
                    No hay invitados para el filtro seleccionado
                  </td>
                </tr>
              ) : (
                filtrados.map((inv) => (
                  <tr
                    key={inv.id}
                    className="border-b border-[#2A2A2A] last:border-0 hover:bg-[#222222] transition-colors"
                  >
                    <td className="px-4 py-3 text-white font-medium">{inv.nombre}</td>
                    <td className="px-4 py-3 text-[#9CA3AF] hidden sm:table-cell">
                      {inv.email ?? inv.telefono ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                          ENVIO_BADGE_STYLES[inv.estado_envio] ?? ''
                        }`}
                      >
                        {ENVIO_LABELS[inv.estado_envio] ?? inv.estado_envio}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                          BADGE_STYLES[inv.estado_confirmacion] ?? ''
                        }`}
                      >
                        {BADGE_LABELS[inv.estado_confirmacion] ?? inv.estado_confirmacion}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {inv.qr_url ? (
                        <a
                          href={inv.qr_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[#C9A84C] hover:text-[#B8974B] text-xs transition-colors"
                          download={`qr-${inv.nombre.replace(/\s+/g, '-').toLowerCase()}.png`}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="7" height="7" />
                            <rect x="14" y="3" width="7" height="7" />
                            <rect x="3" y="14" width="7" height="7" />
                            <rect x="14" y="14" width="3" height="3" />
                          </svg>
                          Ver QR
                        </a>
                      ) : (
                        <span className="text-[#9CA3AF] text-xs">Sin QR</span>
                      )}
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
