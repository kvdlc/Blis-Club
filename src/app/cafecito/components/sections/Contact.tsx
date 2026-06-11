"use client"

import { motion } from "framer-motion"
import { MapPin, ExternalLink } from "lucide-react"
import { eventInfo } from "@/app/cafecito/data/eventData"
import SectionWrapper from "@/app/cafecito/components/shared/SectionWrapper"
import NeuralNetwork from "@/app/cafecito/components/shared/NeuralNetwork"
import { Button } from "@/components/ui/button"

const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "593XXXXXXXXX"

export default function Contact() {
  const notionFormUrl =
    process.env.NEXT_PUBLIC_NOTION_FORM_URL || ""

  const handleWhatsApp = () => {
    const msg = encodeURIComponent(
      "Hola! Quiero más información sobre Cafecito Inmobiliario"
    )
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank")
  }

  return (
    <section id="contact" className="relative bg-cafe-900 py-20 sm:py-28 overflow-hidden">
      <NeuralNetwork color="212, 165, 116" nodeCount={35} maxDistance={200} opacity={0.08} dashSpeed={0.4} />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-cafe-600/15 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-cafe-700/10 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6">
        <SectionWrapper className="text-center mb-14">
          <span className="text-cafe-300 text-sm font-semibold uppercase tracking-widest">
            Contacto
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mt-3 mb-4">
            ¿Listo para ser parte?
          </h2>
          <p className="text-cafe-200/70 max-w-xl mx-auto text-lg">
            {eventInfo.date}. {eventInfo.city}. El lugar está confirmado — te revelaremos 
            el auditorio días antes.
          </p>
        </SectionWrapper>

        {/* Location */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-center gap-2 text-cafe-300 mb-10"
        >
          <MapPin className="w-5 h-5" />
          <span className="font-medium">{eventInfo.city}</span>
        </motion.div>

        {/* Notion Form */}
        {notionFormUrl && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mb-10 rounded-2xl overflow-hidden bg-white shadow-2xl"
          >
            <iframe
              src={notionFormUrl}
              className="w-full h-[500px]"
              loading="lazy"
              title="Formulario de contacto"
            />
          </motion.div>
        )}

        {/* WhatsApp CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <Button
            variant="whatsapp"
            size="xl"
            className="rounded-full animate-btn-glow"
            onClick={handleWhatsApp}
          >
            <ExternalLink className="w-5 h-5" />
            Hablar con nosotros por WhatsApp
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
