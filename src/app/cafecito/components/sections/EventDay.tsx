"use client"

import { motion } from "framer-motion"
import { MapPin, Clock, Package, Car } from "lucide-react"
import { eventDayInfo, eventInfo } from "@/app/cafecito/data/eventData"
import SectionWrapper from "@/app/cafecito/components/shared/SectionWrapper"
import NeuralNetwork from "@/app/cafecito/components/shared/NeuralNetwork"

export default function EventDay() {
  return (
    <section id="event-day" className="relative bg-cafe-900 py-20 sm:py-28 overflow-hidden">
      <NeuralNetwork color="212, 165, 116" nodeCount={30} maxDistance={180} opacity={0.06} dashSpeed={0.35} />
      <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-cafe-700/20 blur-3xl" />
      <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-cafe-600/10 blur-3xl" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
        <SectionWrapper className="text-center mb-14">
          <span className="text-cafe-300 text-sm font-semibold uppercase tracking-widest">
            Información del Evento
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mt-3 mb-4">
            Todo listo para el gran día
          </h2>
          <p className="text-cafe-200/70 max-w-xl mx-auto text-lg">
            {eventInfo.date}. Llega preparado y vive la experiencia completa.
          </p>
        </SectionWrapper>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Map + Venue */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="rounded-2xl overflow-hidden border border-cafe-700/50 shadow-xl">
              <iframe
                src={eventDayInfo.mapEmbedUrl}
                width="100%"
                height="300"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación del evento"
              />
            </div>
            <div className="flex items-start gap-3 bg-cafe-800/50 rounded-xl p-4 border border-cafe-700/30">
              <MapPin className="w-5 h-5 text-cafe-300 mt-0.5 shrink-0" />
              <div>
                <p className="text-white font-semibold">{eventInfo.city}</p>
                <p className="text-cafe-300/70 text-sm">{eventInfo.venue}</p>
                <p className="text-cafe-400/60 text-xs mt-1">
                  Se confirmará dirección exacta días antes del evento
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-cafe-800/50 rounded-xl p-4 border border-cafe-700/30">
              <Car className="w-5 h-5 text-cafe-300 mt-0.5 shrink-0" />
              <div>
                <p className="text-white font-semibold">Estacionamiento disponible</p>
                <p className="text-cafe-300/70 text-sm">
                  El auditorio cuenta con parqueadero para todos los asistentes sin costo adicional.
                </p>
              </div>
            </div>
          </motion.div>

          {/* What to bring + Express schedule */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            {/* What to bring */}
            <div className="bg-cafe-800/50 rounded-2xl p-5 sm:p-6 border border-cafe-700/30">
              <h3 className="flex items-center gap-2 text-white font-bold text-lg mb-4">
                <Package className="w-5 h-5 text-cafe-300" />
                Qué llevar
              </h3>
              <ul className="space-y-2.5">
                {eventDayInfo.thingsToBring.map((item, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-start gap-3 text-sm text-cafe-200/80"
                  >
                    <span className="text-base shrink-0">{item.icon}</span>
                    {item.label}
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Express schedule */}
            <div className="bg-cafe-800/50 rounded-2xl p-5 sm:p-6 border border-cafe-700/30">
              <h3 className="flex items-center gap-2 text-white font-bold text-lg mb-4">
                <Clock className="w-5 h-5 text-cafe-300" />
                Cronograma Express
              </h3>
              <div className="space-y-2">
                {eventDayInfo.expressSchedule.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center gap-3 text-sm"
                  >
                    <span className="text-cafe-300 font-bold w-12 shrink-0">{item.time}</span>
                    <span className="text-cafe-200/70">{item.label}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
