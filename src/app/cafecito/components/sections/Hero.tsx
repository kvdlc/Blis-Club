"use client"

import { useRef } from "react"
import { motion, useMotionValue, useSpring, useTransform, useScroll } from "framer-motion"
import { Play, ArrowDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import NeuralNetwork from "@/app/cafecito/components/shared/NeuralNetwork"
import { videoUrls } from "@/app/cafecito/data/eventData"

interface Props {
  onWatchVideo: () => void
  children?: React.ReactNode
}

export default function Hero({ onWatchVideo, children }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end start"] })

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const springX = useSpring(mouseX, { stiffness: 50, damping: 30 })
  const springY = useSpring(mouseY, { stiffness: 50, damping: 30 })

  const blob1X = useTransform(springX, [0, 1], [-30, 30])
  const blob1Y = useTransform(springY, [0, 1], [-30, 30])
  const blob2X = useTransform(springX, [0, 1], [25, -25])
  const blob2Y = useTransform(springY, [0, 1], [-20, 20])

  const videoScale = useTransform(scrollYProgress, [0, 1], [1, 1.15])
  const contentY = useTransform(scrollYProgress, [0, 0.5], [0, 60])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0])

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    mouseX.set(x)
    mouseY.set(y)
  }

  const scrollToSchedule = () => {
    document.querySelector("#schedule")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <section
      id="hero"
      ref={containerRef}
      className="relative min-h-dvh flex items-center justify-center overflow-hidden"
    >
      {/* Video Background with parallax */}
      <div className="absolute inset-0 z-0 overflow-hidden" ref={ref} onMouseMove={handleMouseMove}>
        <motion.video
          autoPlay
          loop
          muted
          playsInline
          poster="/images/hero-fallback.jpg"
          style={{ scale: videoScale }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 min-w-full min-h-full w-auto h-auto object-cover scale-125 sm:scale-100"
        >
          <source src={videoUrls.hero} type="video/mp4" />
        </motion.video>
      </div>

      {/* Animated Gradient Overlay */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-cafe-900/70 via-cafe-900/55 to-cafe-900/80" />

      {/* Neural network overlay */}
      <div className="absolute inset-0 z-[2]">
        <NeuralNetwork color="212, 165, 116" nodeCount={25} maxDistance={180} opacity={0.07} dashSpeed={0.3} />
      </div>

      {/* Floating Blobs with Parallax */}
      <motion.div
        style={{ x: blob1X, y: blob1Y }}
        className="absolute z-[2] top-1/4 left-[15%] w-72 h-72 rounded-full bg-cafe-400/12 blur-3xl"
      />
      <motion.div
        style={{ x: blob2X, y: blob2Y }}
        className="absolute z-[2] bottom-1/3 right-[10%] w-96 h-96 rounded-full bg-cafe-300/8 blur-3xl"
      />
      <motion.div
        className="absolute z-[2] top-[55%] left-[35%] w-56 h-56 rounded-full bg-cafe-500/8 blur-3xl animate-blob-float"
        style={{ animationDelay: "0s" }}
      />

      {/* Content */}
      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-10"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cafe-300 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cafe-300" />
          </span>
          <span className="text-white/90 text-sm font-semibold">
            Ideas que transforman la industria
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.08] mb-6 tracking-tight"
        >
          Conecta Mentes
          <br />
          <span className="bg-gradient-to-r from-cafe-200 via-cafe-300 to-amber-300 bg-clip-text text-transparent">
            para Transformar
          </span>
          <br />
          el Futuro Inmobiliario
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="text-lg sm:text-xl text-white/65 mb-10 max-w-2xl mx-auto leading-relaxed"
        >
          Capacitación presencial en Ambato — Jueves 13 de Agosto 2026
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14"
        >
          <Button
            size="lg"
            className="rounded-full px-8 animate-btn-pulse shadow-lg shadow-cafe-600/40"
            onClick={scrollToSchedule}
          >
            Ver Agenda
            <ArrowDown className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="rounded-full px-8 border-white/25 text-white hover:bg-white/10 hover:text-white hover:border-white/40 transition-all"
            onClick={onWatchVideo}
          >
            <Play className="w-4 h-4 fill-current" />
            Ver Video
          </Button>
        </motion.div>

        {/* Countdown */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.85, type: "spring", bounce: 0.25 }}
        >
          {children}
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 12, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="text-white/40"
        >
          <ArrowDown className="w-5 h-5" />
        </motion.div>
      </motion.div>
    </section>
  )
}
