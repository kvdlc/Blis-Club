"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Check, Copy, ExternalLink } from "lucide-react"
import { pricingPlans, transferData } from "@/app/cafecito/data/eventData"
import SectionWrapper from "@/app/cafecito/components/shared/SectionWrapper"
import NeuralNetwork from "@/app/cafecito/components/shared/NeuralNetwork"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "593XXXXXXXXX"

function PricingCard({
  plan,
  index,
  onSelect,
}: {
  plan: (typeof pricingPlans)[0]
  index: number
  onSelect: (plan: (typeof pricingPlans)[0]) => void
}) {
  const isHighlighted = plan.highlighted

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.15 }}
      className={`relative rounded-2xl p-6 sm:p-8 flex flex-col ${
        isHighlighted
          ? "bg-cafe-800 text-white border-2 border-cafe-500 shadow-2xl shadow-cafe-800/30 scale-[1.02]"
          : "bg-white border border-cafe-200 shadow-sm hover:shadow-md"
      }`}
    >
      {/* Shimmer effect on highlighted */}
      {isHighlighted && (
        <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
          <div className="absolute top-0 -left-full w-1/2 h-full bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
        </div>
      )}

      {/* Gradient border on highlighted */}
      {isHighlighted && (
        <div
          className="absolute inset-0 rounded-2xl -z-10"
          style={{
            background:
              "conic-gradient(from var(--gradient-angle, 0deg), #6B4423, #D4A574, #8B5E3C, #6B4423)",
            animation: "gradient-spin 5s linear infinite",
            padding: 2,
            margin: -2,
            borderRadius: "inherit",
            mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            maskComposite: "exclude",
            WebkitMaskComposite: "xor",
          } as React.CSSProperties}
        />
      )}

      {/* Name */}
      <div className="flex items-center justify-between mb-2">
        <span
          className={`text-sm font-semibold uppercase tracking-widest ${
            isHighlighted ? "text-cafe-300" : "text-cafe-500"
          }`}
        >
          {plan.name}
        </span>
        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-0.5">
          PRE VENTA
        </span>
      </div>

      {/* Price */}
      <div className="mb-1">
        <span className={`text-4xl sm:text-5xl font-extrabold ${isHighlighted ? "" : "text-cafe-800"}`}>
          ${plan.price}
        </span>
        {plan.iva && (
          <span
            className={`text-sm ml-1 ${
              isHighlighted ? "text-cafe-300" : "text-cafe-500"
            }`}
          >
            + IVA
          </span>
        )}
      </div>

      {/* Deadline */}
      <p className="text-xs text-amber-600/80 font-medium mb-4">
        Hasta 1 de Julio
      </p>

      {/* Description */}
      <p
        className={`text-sm mb-6 ${
          isHighlighted ? "text-cafe-200/80" : "text-cafe-600/70"
        }`}
      >
        {plan.description}
      </p>

      {/* Features */}
      <ul className="space-y-3 mb-8 flex-1">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-3 text-sm">
            <Check
              className={`w-4 h-4 mt-0.5 shrink-0 ${
                isHighlighted ? "text-cafe-300" : "text-cafe-500"
              }`}
            />
            <span className={isHighlighted ? "text-cafe-100" : "text-cafe-700"}>
              {f}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Button
        variant={isHighlighted ? "accent" : "default"}
        size="lg"
        className={`w-full ${isHighlighted ? "" : "animate-btn-pulse shadow-lg shadow-cafe-600/25"}`}
        onClick={() => onSelect(plan)}
      >
        {plan.cta}
      </Button>
    </motion.div>
  )
}

interface Props {
  onVideo: () => void
}

export default function Pricing({ onVideo }: Props) {
  const [selectedPlan, setSelectedPlan] = useState<(typeof pricingPlans)[0] | null>(null)
  const [copied, setCopied] = useState(false)

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleWhatsApp = (planName: string) => {
    const msg = encodeURIComponent(
      `Hola! Acabo de hacer la transferencia para el pase *${planName}* de Cafecito Inmobiliario. Adjunto mi comprobante.`
    )
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank")
    setSelectedPlan(null)
  }

  return (
    <section id="pricing" className="relative bg-white py-20 sm:py-28 overflow-hidden">
      <NeuralNetwork color="107, 68, 35" nodeCount={28} maxDistance={150} opacity={0.04} dashSpeed={0.35} />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full bg-cafe-100/60 blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-80 h-80 rounded-full bg-cafe-200/20 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
        <SectionWrapper className="text-center mb-16">
          <span className="text-cafe-500 text-sm font-semibold uppercase tracking-widest">
            Inversión
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-cafe-900 mt-3 mb-4">
            Accede al evento con nuestros pases
          </h2>
          <p className="text-cafe-600/70 max-w-xl mx-auto text-lg">
            Elige el pase que mejor se adapte a ti y asegura tu cupo hoy.
          </p>
        </SectionWrapper>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto items-start">
          {pricingPlans.map((plan, i) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              index={i}
              onSelect={setSelectedPlan}
            />
          ))}
        </div>
      </div>

      {/* Transfer Modal */}
      <Dialog open={!!selectedPlan} onOpenChange={() => setSelectedPlan(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedPlan?.highlighted && "⭐ "}
              Pase {selectedPlan?.name}
            </DialogTitle>
            <DialogDescription>
              Realiza la transferencia bancaria y envía tu comprobante para confirmar.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Bank info */}
            <div className="bg-cafe-50 rounded-xl p-4 space-y-2 text-sm">
              {[
                { label: "Banco", value: transferData.bank },
                { label: "Tipo", value: transferData.accountType },
                { label: "Número", value: transferData.accountNumber },
                { label: "Titular", value: transferData.holder },
                { label: "Cédula", value: transferData.idNumber },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between">
                  <span className="text-cafe-500 font-medium">{label}:</span>
                  <button
                    onClick={() => handleCopy(value)}
                    className="text-cafe-800 font-semibold flex items-center gap-1 hover:text-cafe-600 transition-colors"
                  >
                    {value}
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            {/* Amount */}
            <div className="text-center py-2">
              <span className="text-sm text-cafe-500">Total a transferir:</span>
              <div className="text-3xl font-extrabold text-cafe-700">
                ${selectedPlan?.price ?? 0}
                <span className="text-base font-medium text-cafe-500 ml-1">+ IVA</span>
              </div>
            </div>

            {/* Instructions */}
            <p className="text-xs text-cafe-500/80 text-center leading-relaxed">
              {transferData.instructions}
            </p>

            {/* Copied toast */}
            {copied && (
              <motion.p
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center text-xs text-green-600 font-medium"
              >
                ¡Copiado!
              </motion.p>
            )}

            {/* WhatsApp Button */}
            <Button
              variant="whatsapp"
              size="lg"
              className="w-full"
              onClick={() => handleWhatsApp(selectedPlan?.name ?? "")}
            >
              <ExternalLink className="w-4 h-4" />
              Enviar comprobante por WhatsApp
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  )
}
