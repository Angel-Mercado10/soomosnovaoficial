'use client'

import { useEffect, useState, useRef } from 'react'

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
  // Normalizar hora: el DB puede devolver "HH:MM", "HH:MM:SS" o null.
  // Tomamos solo los primeros 5 caracteres para garantizar formato "HH:MM".
  const horaRaw = horaEvento ?? '00:00'
  const hora = horaRaw.length >= 5 ? horaRaw.slice(0, 5) : horaRaw
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
  // Client-only state: null until mounted to avoid hydration mismatch
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null)
  const mounted = useRef(false)

  useEffect(() => {
    mounted.current = true

    const tick = () => {
      setTimeLeft(calcularTiempo(fechaEvento, horaEvento))
    }

    // Initial tick via setTimeout to satisfy react-hooks/set-state-in-effect
    const initial = setTimeout(tick, 0)
    const timer = setInterval(tick, 1000)

    return () => {
      clearTimeout(initial)
      clearInterval(timer)
    }
  }, [fechaEvento, horaEvento])

  if (!timeLeft) return null

  const yaPaso =
    timeLeft.dias === 0 &&
    timeLeft.horas === 0 &&
    timeLeft.minutos === 0 &&
    timeLeft.segundos === 0

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
