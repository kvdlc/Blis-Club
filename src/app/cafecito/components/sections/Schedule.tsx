"use client"

import { useRef, useState } from "react"
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import { Clock, CheckCircle2, Users, Lightbulb, ChevronDown } from "lucide-react"
import { schedule } from "@/app/cafecito/data/eventData"
import SectionWrapper from "@/app/cafecito/components/shared/SectionWrapper"
import NeuralNetwork from "@/app/cafecito/components/shared/NeuralNetwork"
import VideoEmbed from "@/components/VideoEmbed"
import { videoUrls } from "@/app/cafecito/data/eventData"

export default function Schedule() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end end"],
  })

  const pathLength = useTransform(scrollYProgress, [0, 0.9], [0, 1])
  const [expanded, setExpanded] = useState<Set<number>>(new Set())

  const toggle = (i: number) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  return (
    <section id="schedule" className="relative bg-cafe-50 py-20 sm:py-28 overflow-hidden">
      {/* Neural network texture */}
      <NeuralNetwork color="107, 68, 35" nodeCount={30} maxDistance={200} opacity={0.06} />

      {/* Static blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-0 w-96 h-96 rounded-full bg-cafe-200/20 blur-3xl" />
        <div className="absolute bottom-1/4 left-0 w-72 h-72 rounded-full bg-cafe-300/15 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <SectionWrapper className="text-center mb-16">
          <span className="text-cafe-500 text-sm font-semibold uppercase tracking-widest">
            Agenda
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-cafe-900 mt-3 mb-4">
            Explore la Agenda Completa
          </h2>
          <p className="text-cafe-600/70 max-w-xl mx-auto text-lg">
            Una tarde diseñada para aprender, conectar y crecer en el sector inmobiliario.
          </p>
        </SectionWrapper>

        {/* Promo Video */}
        {videoUrls.pastConference && (
          <SectionWrapper delay={0.1} className="mb-16">
            <VideoEmbed
              url={videoUrls.pastConference}
              className="max-w-2xl mx-auto shadow-2xl shadow-cafe-900/10 rounded-2xl overflow-hidden"
            />
          </SectionWrapper>
        )}

        {/* Timeline */}
        <div ref={containerRef} className="relative">
          {/* SVG Line */}
          <div className="absolute left-4 sm:left-8 top-4 bottom-4 w-0.5">
            <div className="absolute inset-0 bg-cafe-200 rounded-full" />
            <motion.div
              style={{ scaleY: pathLength, originY: 0 }}
              className="absolute inset-0 bg-cafe-500 rounded-full"
            />
          </div>

          <div className="space-y-8 sm:space-y-12">
            {schedule.filter((item) => !item.isBreak).map((item, i) => {
              const Icon = item.icon
              return (
                <motion.div
                  key={item.time}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="relative pl-12 sm:pl-16"
                >
                  {/* Timeline dot */}
                  <div className="absolute left-3 sm:left-7 w-3 h-3 rounded-full border-2 border-white shadow -translate-x-1/2 z-10 bg-cafe-500" />

                  {/* Card */}
                  <div className="bg-white shadow-sm hover:shadow-lg hover:-translate-y-0.5 border border-cafe-100 p-5 sm:p-6 rounded-2xl transition-all duration-300">
                    {/* Header row */}
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-cafe-100 text-cafe-600">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 text-sm text-cafe-500 font-medium mb-1">
                          <Clock className="w-3.5 h-3.5" />
                          {item.time}
                        </div>
                        <h3 className="text-lg font-bold text-cafe-800">
                          {item.title}
                        </h3>
                        {item.description && (
                          <p className="text-cafe-600/70 mt-1 text-sm leading-relaxed">
                            {item.description}
                          </p>
                        )}

                        {/* Target audience badge */}
                        {item.targetAudience && (
                          <div className="mt-3 flex items-center gap-1.5 text-xs text-cafe-500 bg-cafe-50 rounded-lg px-3 py-1.5 w-fit">
                            <Users className="w-3 h-3" />
                            {item.targetAudience}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Toggle button for talks */}
                    {item.details && item.details.length > 0 && (
                      <>
                        <button
                          onClick={() => toggle(i)}
                          className="mt-4 ml-14 flex items-center gap-2 text-sm font-semibold text-cafe-600 hover:text-cafe-800 transition-colors group"
                        >
                          <motion.span
                            animate={{ rotate: expanded.has(i) ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <ChevronDown className="w-4 h-4" />
                          </motion.span>
                          {expanded.has(i) ? "Ocultar detalles" : "Ver lo que aprenderás"}
                        </button>

                        <AnimatePresence initial={false}>
                          {expanded.has(i) && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
                              className="overflow-hidden"
                            >
                              <div className="mt-5 ml-14 space-y-3">
                                {/* Learning objectives */}
                                <div>
                                  <h4 className="flex items-center gap-2 text-sm font-semibold text-cafe-700 mb-2">
                                    <CheckCircle2 className="w-4 h-4 text-cafe-500" />
                                    Lo que aprenderás
                                  </h4>
                                  <ul className="space-y-1.5">
                                    {item.details.map((d, j) => (
                                      <motion.li
                                        key={j}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: j * 0.06 }}
                                        className="flex items-start gap-2 text-sm text-cafe-600/80"
                                      >
                                        <span className="w-1.5 h-1.5 rounded-full bg-cafe-400 mt-1.5 shrink-0" />
                                        {d}
                                      </motion.li>
                                    ))}
                                  </ul>
                                </div>

                                {/* Methodology */}
                                {item.methodology && (
                                  <div className="bg-cafe-50/80 border border-cafe-200/60 rounded-xl p-3.5">
                                    <h4 className="flex items-center gap-2 text-xs font-semibold text-cafe-600 mb-1">
                                      <Lightbulb className="w-3.5 h-3.5 text-cafe-400" />
                                      Metodología
                                    </h4>
                                    <p className="text-xs text-cafe-600/70 leading-relaxed">
                                      {item.methodology}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
