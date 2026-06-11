"use client"

import { motion, useInView, useScroll, useTransform } from "framer-motion"
import { useRef, type ReactNode } from "react"

interface Props {
  children: ReactNode
  className?: string
  delay?: number
  direction?: "up" | "left" | "right" | "scale"
  parallaxY?: number
}

const directions = {
  up: { opacity: 0, y: 60 },
  left: { opacity: 0, x: -60 },
  right: { opacity: 0, x: 60 },
  scale: { opacity: 0, scale: 0.85, y: 20 },
}

export default function SectionWrapper({
  children,
  className = "",
  delay = 0,
  direction = "up",
  parallaxY,
}: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-60px" })
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })

  const y = parallaxY ? useTransform(scrollYProgress, [0, 1], [parallaxY, -parallaxY]) : 0
  const initial = directions[direction]

  return (
    <motion.div
      ref={ref}
      initial={initial}
      animate={isInView ? { opacity: 1, x: 0, y: 0, scale: 1 } : initial}
      transition={{
        duration: 0.8,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className={className}
      style={parallaxY ? { y } : undefined}
    >
      {children}
    </motion.div>
  )
}
