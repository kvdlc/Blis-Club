"use client"

import { useState, useEffect } from "react"

export default function LiveCounter() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const base = Math.floor(Math.random() * 12) + 8
    setCount(base)

    const interval = setInterval(() => {
      setCount((prev) => {
        const change = Math.random() > 0.6 ? (Math.random() > 0.5 ? 1 : -1) : 0
        return Math.max(6, Math.min(25, prev + change))
      })
    }, 8000)

    return () => clearInterval(interval)
  }, [])

  if (count === 0) return null

  return (
    <span className="inline-flex items-center gap-1 text-xs text-cafe-500 font-medium bg-cafe-50 rounded-full px-2.5 py-1">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
      </span>
      {count} personas viendo
    </span>
  )
}
