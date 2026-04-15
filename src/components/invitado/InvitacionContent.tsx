'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import type { Evento, Invitado } from '@/types/database'
import { InvitacionCTA } from './templates/InvitacionCTA'

interface InvitacionContentProps {
  invitado: Invitado
  evento: Evento
  parejaNombres: string
}

function formatFechaEvento(fecha: string, hora: string | null): string {
  const date = new Date(fecha + 'T12:00:00')
  const fechaStr = date.toLocaleDateString('es-AR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const capitalizada = fechaStr.charAt(0).toUpperCase() + fechaStr.slice(1)
  return hora ? `${capitalizada} · ${hora}` : capitalizada
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
}

export default function InvitacionContent({
  invitado,
  evento,
  parejaNombres,
}: InvitacionContentProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-4 py-12"
    >
      {/* Ornamento superior */}
      <motion.div variants={itemVariants} className="mb-8 text-[#C9A84C] text-2xl select-none">
        ✦
      </motion.div>

      {/* Nombres de la pareja */}
      <motion.h1
        variants={itemVariants}
        className="font-cormorant text-5xl md:text-7xl text-white text-center leading-tight mb-2"
      >
        {parejaNombres}
      </motion.h1>

      {/* Invitación personal */}
      <motion.p variants={itemVariants} className="text-[#9CA3AF] text-base text-center mb-8">
        invitan a{' '}
        <span className="text-[#C9A84C] font-medium">{invitado.nombre}</span>
      </motion.p>

      {/* Separador */}
      <motion.div
        variants={itemVariants}
        className="w-16 h-px bg-[#C9A84C]/40 mb-8"
      />

      {/* Fecha y hora */}
      <motion.div variants={itemVariants} className="text-center mb-4">
        <p className="text-[#9CA3AF] text-xs uppercase tracking-widest mb-1">Fecha y hora</p>
        <p className="text-white text-base">
          {formatFechaEvento(evento.fecha_evento, evento.hora_evento)}
        </p>
      </motion.div>

      {/* Lugar */}
      {evento.lugar_nombre && (
        <motion.div variants={itemVariants} className="text-center mb-8">
          <p className="text-[#9CA3AF] text-xs uppercase tracking-widest mb-1">Lugar</p>
          {evento.lugar_maps_url ? (
            <a
              href={evento.lugar_maps_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#C9A84C] hover:underline text-base"
            >
              {evento.lugar_nombre}
              {evento.lugar_direccion && (
                <span className="block text-[#9CA3AF] text-sm mt-0.5 no-underline">
                  {evento.lugar_direccion}
                </span>
              )}
            </a>
          ) : (
            <p className="text-white text-base">
              {evento.lugar_nombre}
              {evento.lugar_direccion && (
                <span className="block text-[#9CA3AF] text-sm mt-0.5">
                  {evento.lugar_direccion}
                </span>
              )}
            </p>
          )}
        </motion.div>
      )}

      {/* QR del invitado */}
      {invitado.qr_url && (
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-[12px] p-4 mb-4 shadow-lg"
        >
          <Image
            src={invitado.qr_url}
            alt={`QR de entrada para ${invitado.nombre}`}
            width={200}
            height={200}
            className="block"
            priority
          />
        </motion.div>
      )}

      {/* Instrucción QR */}
      <motion.p
        variants={itemVariants}
        className="text-[#9CA3AF] text-xs text-center mb-8 max-w-xs"
      >
        Guardá este QR — lo necesitarás a la entrada
      </motion.p>

      {/* CTAs */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row gap-3 w-full max-w-xs"
      >
        <InvitacionCTA
          token={invitado.token}
          eventoSlug={evento.slug}
          qrUrl={invitado.qr_url}
          estadoConfirmacion={invitado.estado_confirmacion}
          accentColor="#C9A84C"
          textColor="#FFFFFF"
          borderColor="#2A2A2A"
          primaryBtnClass="flex-1 text-center bg-[#C9A84C] hover:bg-[#b8943e] text-[#0A0A0A] font-semibold text-sm px-6 py-3 rounded-full transition-colors"
          secondaryBtnClass="flex-1 text-center bg-transparent border border-[#2A2A2A] hover:border-[#C9A84C]/40 text-white text-sm px-6 py-3 rounded-full transition-colors"
        />
      </motion.div>

      {/* Footer ornamento */}
      <motion.div
        variants={itemVariants}
        className="mt-12 text-[#9CA3AF]/30 text-xs text-center"
      >
        SoomosNova
      </motion.div>
    </motion.div>
  )
}
