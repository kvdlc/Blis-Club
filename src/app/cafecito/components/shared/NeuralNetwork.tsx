"use client"

import { useEffect, useRef } from "react"

interface Point {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  pulse: number
}

interface Props {
  className?: string
  color?: string
  nodeCount?: number
  maxDistance?: number
  speed?: number
  opacity?: number
  dashSpeed?: number
}

export default function NeuralNetwork({
  className = "",
  color = "107, 68, 35",
  nodeCount = 40,
  maxDistance = 180,
  speed = 0.3,
  opacity = 0.12,
  dashSpeed = 0.4,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pointsRef = useRef<Point[]>([])
  const animRef = useRef<number>(0)
  const dashOffset = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resize = () => {
      const rect = canvas.parentElement!.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      // Reset points on resize
      const w = rect.width
      const h = rect.height
      pointsRef.current = Array.from({ length: nodeCount }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * speed,
        vy: (Math.random() - 0.5) * speed,
        radius: Math.random() * 2.5 + 1,
        pulse: Math.random() * Math.PI * 2,
      }))
    }

    resize()
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(canvas.parentElement!)

    const animate = () => {
      const points = pointsRef.current
      const w = canvas.width / (window.devicePixelRatio || 1)
      const h = canvas.height / (window.devicePixelRatio || 1)

      ctx.clearRect(0, 0, w, h)

      // Update points
      for (const p of points) {
        p.x += p.vx
        p.y += p.vy
        p.pulse += 0.02

        if (p.x < -20) p.x = w + 20
        if (p.x > w + 20) p.x = -20
        if (p.y < -20) p.y = h + 20
        if (p.y > h + 20) p.y = -20
      }

      dashOffset.current += dashSpeed

      // Draw lines
      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const dx = points[i].x - points[j].x
          const dy = points[i].y - points[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < maxDistance) {
            const alpha = (1 - dist / maxDistance) * opacity
            ctx.beginPath()
            ctx.strokeStyle = `rgba(${color}, ${alpha})`
            ctx.lineWidth = 0.5
            ctx.setLineDash([4, 8])
            ctx.lineDashOffset = dashOffset.current + i + j
            ctx.moveTo(points[i].x, points[i].y)
            ctx.lineTo(points[j].x, points[j].y)
            ctx.stroke()
          }
        }
      }

      // Draw nodes
      for (const p of points) {
        const pulseScale = 1 + Math.sin(p.pulse) * 0.4
        ctx.beginPath()
        ctx.fillStyle = `rgba(${color}, ${opacity * 2})`
        ctx.arc(p.x, p.y, p.radius * pulseScale, 0, Math.PI * 2)
        ctx.fill()

        // Glow
        ctx.beginPath()
        ctx.fillStyle = `rgba(${color}, ${opacity * 0.6})`
        ctx.arc(p.x, p.y, p.radius * pulseScale * 2.5, 0, Math.PI * 2)
        ctx.fill()
      }

      animRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animRef.current)
      resizeObserver.disconnect()
    }
  }, [color, nodeCount, maxDistance, speed, opacity, dashSpeed])

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
    />
  )
}

// Lazy wrapper that avoids canvas SSR issues
export function NeuralNetworkBg(props: Props) {
  return <NeuralNetwork {...props} />
}
