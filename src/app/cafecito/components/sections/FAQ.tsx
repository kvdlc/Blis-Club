"use client"

import { motion } from "framer-motion"
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"
import { faqs } from "@/app/cafecito/data/eventData"
import SectionWrapper from "@/app/cafecito/components/shared/SectionWrapper"
import NeuralNetwork from "@/app/cafecito/components/shared/NeuralNetwork"

export default function FAQ() {
  return (
    <section id="faq" className="relative bg-cafe-50 py-20 sm:py-28 overflow-hidden">
      <NeuralNetwork color="107, 68, 35" nodeCount={25} maxDistance={180} opacity={0.05} dashSpeed={0.3} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-cafe-200/10 blur-3xl" />

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6">
        <SectionWrapper className="text-center mb-14">
          <span className="text-cafe-500 text-sm font-semibold uppercase tracking-widest">
            FAQ
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-cafe-900 mt-3 mb-4">
            Todo lo que necesitas saber
          </h2>
          <p className="text-cafe-600/70 max-w-xl mx-auto text-lg">
            Respuestas a las preguntas más frecuentes sobre el evento.
          </p>
        </SectionWrapper>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Accordion type="single" collapsible className="bg-white rounded-2xl border border-cafe-200 shadow-sm px-4 sm:px-6">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  )
}
