"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useInView, useSpring } from "framer-motion"
import { Users, CalendarDays, Clock, Mic } from "lucide-react"
import { eventInfo } from "@/app/cafecito/data/eventData"
import SectionWrapper from "@/app/cafecito/components/shared/SectionWrapper"
import NeuralNetwork from "@/app/cafecito/components/shared/NeuralNetwork"
import VideoEmbed from "@/components/VideoEmbed"
import { videoUrls } from "@/app/cafecito/data/eventData"

interface MetricProps {
  icon: React.ComponentType<{ className?: string }>
  value: number
  suffix: string
  label: string
}

function AnimatedCounter({ target }: { target: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })
  const spring = useSpring(0, { stiffness: 50, damping: 20 })
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (isInView) spring.set(target)
  }, [isInView, target, spring])

  useEffect(() => {
    const unsubscribe = spring.on("change", (v) => setDisplay(Math.floor(v)))
    return unsubscribe
  }, [spring])

  return (
    <span ref={ref} className="tabular-nums">
      {display}
    </span>
  )
}

function Metric({ icon: Icon, value, suffix, label }: MetricProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, type: "spring" }}
      className="text-center"
    >
      <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-cafe-100 flex items-center justify-center text-cafe-600">
        <Icon className="w-6 h-6" />
      </div>
      <div className="text-3xl sm:text-4xl font-extrabold text-cafe-700 mb-1">
        <AnimatedCounter target={value} />
        {suffix}
      </div>
      <p className="text-sm text-cafe-500 font-medium">{label}</p>
    </motion.div>
  )
}

export default function About() {
  const metrics = [
    { icon: Mic, value: eventInfo.metrics.speakers, suffix: "+", label: "Ponentes" },
    { icon: CalendarDays, value: eventInfo.metrics.days, suffix: "", label: "Día" },
    { icon: Clock, value: eventInfo.metrics.hours, suffix: "", label: "Horas" },
    { icon: Users, value: eventInfo.metrics.attendees, suffix: "+", label: "Asistentes" },
  ]

  return (
    <section id="about" className="relative bg-cafe-50 py-20 sm:py-28 overflow-hidden">
      <NeuralNetwork color="180, 120, 60" nodeCount={25} maxDistance={200} opacity={0.05} dashSpeed={0.5} />
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-cafe-300/10 blur-3xl" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <SectionWrapper direction="left">
            <span className="text-cafe-500 text-sm font-semibold uppercase tracking-widest">
              Sobre el Evento
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-cafe-900 mt-3 mb-6">
              Cafecito Inmobiliario —{eventInfo.city}
            </h2>
            <p className="text-cafe-700/80 leading-relaxed mb-4">
              Un evento pensado para desarrolladores, constructores, arquitectos, 
              ingenieros, brokers y agentes inmobiliarios que quieren mantenerse a la 
              vanguardia del sector.
            </p>
            <p className="text-cafe-700/80 leading-relaxed mb-4">
              {eventInfo.date}. {eventInfo.venue} — la ubicación exacta se confirmará 
              días antes del evento a todos los inscritos.
            </p>
            <p className="text-cafe-700/80 leading-relaxed">
              Cuatro expertos compartirán casos reales, estrategias aplicables y 
              contactos que transformarán tu forma de hacer negocios inmobiliarios.
            </p>
          </SectionWrapper>

          <SectionWrapper direction="right" delay={0.2}>
            <div className="grid grid-cols-2 gap-6">
              {metrics.map((m) => (
                <Metric key={m.label} {...m} />
              ))}
            </div>
            {videoUrls.interviews && (
              <div className="mt-8">
                <VideoEmbed
                  url={videoUrls.interviews}
                  className="shadow-2xl shadow-cafe-900/10 rounded-2xl overflow-hidden"
                />
              </div>
            )}
          </SectionWrapper>
        </div>
      </div>
    </section>
  )
}
