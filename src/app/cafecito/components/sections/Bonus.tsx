"use client"

import { motion } from "framer-motion"
import { Download } from "lucide-react"
import { bonusMaterials } from "@/app/cafecito/data/eventData"
import SectionWrapper from "@/app/cafecito/components/shared/SectionWrapper"
import NeuralNetwork from "@/app/cafecito/components/shared/NeuralNetwork"

export default function Bonus() {
  return (
    <section id="bonus" className="relative bg-cafe-50 py-20 sm:py-28 overflow-hidden">
      <NeuralNetwork color="107, 68, 35" nodeCount={20} maxDistance={200} opacity={0.04} dashSpeed={0.25} />
      <div className="absolute top-1/3 right-0 w-72 h-72 rounded-full bg-cafe-300/10 blur-3xl" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
        <SectionWrapper className="text-center mb-14" direction="scale" parallaxY={20}>
          <span className="text-cafe-500 text-sm font-semibold uppercase tracking-widest">
            Material Exclusivo
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-cafe-900 mt-3 mb-4">
            Lo que te llevas del evento
          </h2>
          <p className="text-cafe-600/70 max-w-xl mx-auto text-lg">
            Recursos descargables diseñados por cada ponente para que apliques lo aprendido desde el día 1.
          </p>
        </SectionWrapper>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {bonusMaterials.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className="group relative bg-white rounded-2xl border border-cafe-200 p-5 sm:p-6 hover:shadow-lg hover:border-cafe-300 transition-all duration-300"
            >
              {/* Icon */}
              <div className="text-4xl mb-4">{item.icon}</div>

              {/* Badge */}
              <span className="inline-block text-[10px] font-semibold uppercase tracking-wider text-cafe-500 bg-cafe-100 rounded-full px-2.5 py-1 mb-3">
                Incluido en tu pase
              </span>

              <h3 className="text-base font-bold text-cafe-800 mb-1 line-clamp-2">
                {item.title}
              </h3>
              <p className="text-xs text-cafe-500 font-medium mb-2">
                {item.speaker}
              </p>
              <p className="text-xs text-cafe-600/70 leading-relaxed line-clamp-3">
                {item.description}
              </p>

              <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-cafe-600 group-hover:text-cafe-800 transition-colors">
                <Download className="w-3.5 h-3.5" />
                Acceso en tu kit digital
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
