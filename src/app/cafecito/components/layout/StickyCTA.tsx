"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence, useScroll } from "framer-motion"
import { ArrowRight, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import LiveCounter from "./LiveCounter"

export default function StickyCTA() {
  const [visible, setVisible] = useState(false)
  const { scrollY } = useScroll()

  useEffect(() => {
    const unsubscribe = scrollY.on("change", (y) => {
      const pricingEl = document.querySelector("#pricing")
      if (!pricingEl) return
      const pricingBottom = pricingEl.getBoundingClientRect().bottom + window.scrollY
      setVisible(y > pricingBottom - 200)
    })
    return unsubscribe
  }, [scrollY])

  const scrollToPricing = () => {
    document.querySelector("#pricing")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.33, 1, 0.68, 1] }}
          className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-cafe-200/60 shadow-2xl shadow-cafe-900/10 pb-safe"
        >
          <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center gap-3">
            {/* Desktop: price + counter left, button right */}
            <div className="hidden sm:flex items-center gap-5 flex-1">
              <span className="text-cafe-800 font-bold">
                Pases desde{" "}
                <span className="text-cafe-600 text-lg">$70</span>
                <span className="text-cafe-500 text-xs"> + IVA</span>
              </span>
              <LiveCounter />
            </div>

            {/* Mobile: compact single row */}
            <div className="sm:hidden flex items-center gap-2 flex-1">
              <span className="text-cafe-800 font-bold text-xs">
                Desde $70 + IVA
              </span>
              <LiveCounter />
            </div>

            <Button
              size="sm"
              className="rounded-full px-5 shrink-0 animate-btn-pulse shadow-lg shadow-cafe-600/30"
              onClick={scrollToPricing}
            >
              Reservar Ahora
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
