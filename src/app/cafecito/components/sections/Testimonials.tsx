"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Star, ChevronLeft, ChevronRight } from "lucide-react"
import { testimonials, videoUrls } from "@/app/cafecito/data/eventData"
import SectionWrapper from "@/app/cafecito/components/shared/SectionWrapper"
import NeuralNetwork from "@/app/cafecito/components/shared/NeuralNetwork"
import VideoEmbed from "@/components/VideoEmbed"

export default function Testimonials() {
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(1)

  const next = useCallback(() => {
    setDirection(1)
    setCurrent((p) => (p + 1) % testimonials.length)
  }, [])

  const prev = useCallback(() => {
    setDirection(-1)
    setCurrent((p) => (p - 1 + testimonials.length) % testimonials.length)
  }, [])

  // Auto-scroll every 5s
  useEffect(() => {
    const t = setInterval(next, 5000)
    return () => clearInterval(t)
  }, [next])

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -300 : 300, opacity: 0 }),
  }

  const t = testimonials[current]

  return (
    <section id="testimonials" className="relative bg-cafe-50 py-20 sm:py-28 overflow-hidden">
      <NeuralNetwork color="140, 100, 50" nodeCount={22} maxDistance={200} opacity={0.04} dashSpeed={0.25} />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-10 w-72 h-72 rounded-full bg-cafe-300/15 blur-3xl" />
        <div className="absolute bottom-10 left-10 w-80 h-80 rounded-full bg-cafe-200/20 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6">
        <SectionWrapper className="text-center mb-14">
          <span className="text-cafe-500 text-sm font-semibold uppercase tracking-widest">
            Testimonios
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-cafe-900 mt-3 mb-4">
            Lo que dicen nuestros asistentes
          </h2>
          <p className="text-cafe-600/70 max-w-xl mx-auto text-lg">
            Profesionales que ya vivieron la experiencia Cafecito Inmobiliario.
          </p>
        </SectionWrapper>

        {/* Carousel */}
        <div className="relative flex items-center justify-center">
          <button
            onClick={prev}
            className="hidden sm:flex absolute left-0 z-10 w-12 h-12 items-center justify-center rounded-full bg-white shadow-md border border-cafe-200 text-cafe-500 hover:text-cafe-700 hover:shadow-lg transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="relative w-full max-w-2xl min-h-[260px] overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={current}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="bg-white rounded-2xl border border-cafe-200 p-8 sm:p-10 shadow-lg text-center"
              >
                {/* Avatar */}
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-cafe-200 overflow-hidden">
                  <img
                    src={t.image}
                    alt={t.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>

                {/* Stars */}
                <div className="flex justify-center gap-1 mb-4">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 + i * 0.08, type: "spring" }}
                    >
                      <Star className="w-5 h-5 text-amber-400" fill="currentColor" />
                    </motion.div>
                  ))}
                </div>

                {/* Quote */}
                <p className="text-cafe-700 text-lg leading-relaxed mb-6 italic">
                  &ldquo;{t.text}&rdquo;
                </p>

                {/* Author */}
                <p className="font-bold text-cafe-800">{t.name}</p>
                <p className="text-sm text-cafe-500">{t.company}</p>
              </motion.div>
            </AnimatePresence>
          </div>

          <button
            onClick={next}
            className="hidden sm:flex absolute right-0 z-10 w-12 h-12 items-center justify-center rounded-full bg-white shadow-md border border-cafe-200 text-cafe-500 hover:text-cafe-700 hover:shadow-lg transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setDirection(i > current ? 1 : -1)
                setCurrent(i)
              }}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                i === current
                  ? "bg-cafe-600 w-8"
                  : "bg-cafe-300 hover:bg-cafe-400"
              }`}
            />
          ))}
        </div>

        {/* Testimonials Video */}
        {videoUrls.testimonials && (
          <SectionWrapper delay={0.3} className="mt-14">
            <VideoEmbed
              url={videoUrls.testimonials}
              className="max-w-2xl mx-auto shadow-2xl shadow-cafe-900/10 rounded-2xl overflow-hidden"
            />
          </SectionWrapper>
        )}
      </div>
    </section>
  )
}
