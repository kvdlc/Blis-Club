"use client"

import { motion } from "framer-motion"
import { useCountdown } from "@/app/cafecito/hooks/useCountdown"
import { EVENT_DATE } from "@/app/cafecito/data/eventData"

interface CountdownUnitProps {
  value: number
  label: string
  delay: number
}

function CountdownUnit({ value, label, delay }: CountdownUnitProps) {
  const padded = String(value).padStart(2, "0")
  const digits = padded.split("")

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay, type: "spring", bounce: 0.4 }}
      className="flex flex-col items-center gap-1"
    >
      <div className="flex gap-1">
        {digits.map((digit, i) => (
          <motion.span
            key={`${label}-${i}-${digit}`}
            initial={{ rotateX: -90 }}
            animate={{ rotateX: 0 }}
            transition={{ duration: 0.3, type: "spring" }}
            className="inline-flex items-center justify-center w-10 h-14 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-lg bg-cafe-800/70 backdrop-blur-sm border border-cafe-600/30 text-white text-2xl sm:text-3xl md:text-4xl font-extrabold tabular-nums shadow-lg"
          >
            {digit}
          </motion.span>
        ))}
      </div>
      <span className="text-xs sm:text-sm text-cafe-300/80 font-medium uppercase tracking-wider">
        {label}
      </span>
    </motion.div>
  )
}

function Separator() {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.6 }}
      className="text-3xl md:text-4xl text-cafe-400 font-light self-start mt-2"
    >
      :
    </motion.span>
  )
}

export default function CountdownBanner() {
  const { days, hours, minutes, seconds } = useCountdown(EVENT_DATE)

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3 md:gap-4">
      <CountdownUnit value={days} label="Días" delay={0.2} />
      <Separator />
      <CountdownUnit value={hours} label="Horas" delay={0.35} />
      <Separator />
      <CountdownUnit value={minutes} label="Min" delay={0.5} />
      <Separator />
      <CountdownUnit value={seconds} label="Seg" delay={0.65} />
    </div>
  )
}
