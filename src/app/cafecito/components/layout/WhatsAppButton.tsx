"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { MessageCircle } from "lucide-react"

const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "593XXXXXXXXX"
const WHATSAPP_MESSAGE = encodeURIComponent(
  "Hola! Quiero más información sobre Cafecito Inmobiliario"
)

export default function WhatsAppButton() {
  const [ctaVisible, setCtaVisible] = useState(false)

  useEffect(() => {
    const check = () => {
      const pricingEl = document.querySelector("#pricing")
      if (!pricingEl) return
      const pricingBottom = pricingEl.getBoundingClientRect().bottom + window.scrollY
      setCtaVisible(window.scrollY > pricingBottom - 200)
    }
    window.addEventListener("scroll", check, { passive: true })
    check()
    return () => window.removeEventListener("scroll", check)
  }, [])

  return (
    <motion.a
      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{
        scale: 1,
        opacity: 1,
        bottom: ctaVisible ? "4.5rem" : "1.5rem",
      }}
      transition={{ delay: 1, type: "spring", bounce: 0.5 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="fixed right-6 z-50 flex items-center gap-3 group"
      aria-label="Hablar por WhatsApp"
    >
      <span className="hidden group-hover:block absolute right-16 bg-white text-cafe-800 text-sm font-medium px-4 py-2 rounded-xl shadow-lg whitespace-nowrap">
        ¿Dudas? Escríbenos
      </span>

      <span className="absolute inset-0 rounded-full animate-pulse-ring" />

      <span className="relative flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-lg shadow-[#25D366]/40 hover:bg-[#1ea952] transition-colors">
        <MessageCircle className="w-7 h-7" fill="currentColor" />
      </span>
    </motion.a>
  )
}
