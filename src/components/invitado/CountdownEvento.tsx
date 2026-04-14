'use client'

import { useEffect, useState } from 'react'

interface CountdownEventoProps {
  fechaEvento: string
  horaEvento: string | null
}

interface TimeLeft {
  dias: number
  horas: number
  minutos: number
  segundos: number
}

function calcularTiempo(fechaEvento: string, horaEvento: string | null): TimeLeft {
  const hora = horaEvento ?? '00:00'
  const target = new Date(`${fechaEvento}T${hora}:00`)
  const now = new Date()
  const diff = target.getTime() - now.getTime()

  if (diff <= 0) {
    return { dias: 0, horas: 0, minutos: 0, segundos: 0 }
  }

  return {
    dias: Math.floor(diff / (1000 * 60 * 60 * 24)),
    horas: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutos: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    segundos: Math.floor((diff % (1000 * 60)) / 1000),
  }
}

function UnitBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-[12px] w-16 h-16 flex items-center justify-center">
        <span className="font-cormorant text-3xl text-[#C9A84C] leading-none">
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <span className="text-[#9CA3AF] text-xs mt-1.5 uppercase tracking-widest">
        {label}
      </span>
    </div>
  )
}

export default function CountdownEvento({
  fechaEvento,
  horaEvento,
}: CountdownEventoProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() =>
    calcularTiempo(fechaEvento, horaEvento)
  )
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const timer = setInterval(() => {
      setTimeLeft(calcularTiempo(fechaEvento, horaEvento))
    }, 1000)
    return () => clearInterval(timer)
  }, [fechaEvento, horaEvento])

  const yaPaso =
    timeLeft.dias === 0 &&
    timeLeft.horas === 0 &&
    timeLeft.minutos === 0 &&
    timeLeft.segundos === 0

  if (!mounted) return null // Evita hydration mismatch

  if (yaPaso) {
    return (
      <p className="text-[#C9A84C] text-sm text-center">¡El gran día ya llegó!</p>
    )
  }

  return (
    <div className="flex gap-4 justify-center">
      <UnitBox value={timeLeft.dias} label="días" />
      <UnitBox value={timeLeft.horas} label="horas" />
      <UnitBox value={timeLeft.minutos} label="min" />
      <UnitBox value={timeLeft.segundos} label="seg" />
    </div>
  )
}
