'use client'
import { useCallback } from 'react'

interface Particle {
  x: number; y: number; vx: number; vy: number
  color: string; size: number; opacity: number; rotation: number; rotationSpeed: number
}

export function useConfetti() {
  const fire = useCallback(() => {
    const canvas = document.createElement('canvas')
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999'
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    document.body.appendChild(canvas)
    const ctx = canvas.getContext('2d')!
    const colors = ['#C9A84C', '#ffffff', '#f0d080', '#e8c55a', '#fff8e7']
    const particles: Particle[] = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: -10,
      vx: (Math.random() - 0.5) * 4,
      vy: Math.random() * 3 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 4,
      opacity: 1,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
    }))
    let frame = 0
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.rotation += p.rotationSpeed
        if (frame > 60) p.opacity -= 0.015
        ctx.save()
        ctx.globalAlpha = Math.max(0, p.opacity)
        ctx.translate(p.x, p.y)
        ctx.rotate((p.rotation * Math.PI) / 180)
        ctx.fillStyle = p.color
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2)
        ctx.restore()
      })
      frame++
      if (frame < 120) requestAnimationFrame(animate)
      else { canvas.remove() }
    }
    animate()
    navigator.vibrate?.(200)
  }, [])
  return { fire }
}
