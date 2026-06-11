"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { galleryImages } from "@/app/cafecito/data/eventData"
import SectionWrapper from "@/app/cafecito/components/shared/SectionWrapper"
import NeuralNetwork from "@/app/cafecito/components/shared/NeuralNetwork"

export default function Gallery() {
  const [selected, setSelected] = useState<number | null>(null)

  return (
    <section id="gallery" className="relative bg-white py-20 sm:py-28 overflow-hidden">
      <NeuralNetwork color="107, 68, 35" nodeCount={25} maxDistance={160} opacity={0.04} dashSpeed={0.3} />
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-cafe-100/40 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-cafe-200/15 blur-3xl" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
        <SectionWrapper className="text-center mb-14">
          <span className="text-cafe-500 text-sm font-semibold uppercase tracking-widest">
            Galería
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-cafe-900 mt-3 mb-4">
            Así se vivió la edición anterior
          </h2>
          <p className="text-cafe-600/70 max-w-xl mx-auto text-lg">
            Momentos reales de conexión, aprendizaje y networking en Cafecito Inmobiliario.
          </p>
        </SectionWrapper>

        {/* Masonry Grid */}
        <div className="columns-2 md:columns-3 lg:columns-4 gap-3 sm:gap-4">
          {galleryImages.map((img, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="break-inside-avoid mb-3 sm:mb-4 cursor-pointer group relative overflow-hidden rounded-xl"
              onClick={() => setSelected(i)}
            >
              <img
                src={img.src}
                alt={img.alt}
                className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-cafe-900/0 group-hover:bg-cafe-900/20 transition-all duration-300" />
              {/* Magnifier icon on hover */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center text-cafe-700 text-lg shadow-lg">
                  +
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selected !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-cafe-900/95 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
            onClick={() => setSelected(null)}
          >
            <button
              onClick={() => setSelected(null)}
              className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <motion.img
              key={selected}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              src={galleryImages[selected].src}
              alt={galleryImages[selected].alt}
              className="max-h-[85vh] max-w-full object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            {/* Nav arrows */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                setSelected((prev) => (prev! - 1 + galleryImages.length) % galleryImages.length)
              }}
              className="absolute left-4 sm:left-8 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            >
              ←
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setSelected((prev) => (prev! + 1) % galleryImages.length)
              }}
              className="absolute right-4 sm:right-8 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            >
              →
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
