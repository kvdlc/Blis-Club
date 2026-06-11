"use client"

import { motion } from "framer-motion"
import { Share2, MessageCircle } from "lucide-react"
import { shareData } from "@/app/cafecito/data/eventData"
import SectionWrapper from "@/app/cafecito/components/shared/SectionWrapper"

export default function ShareSection() {
  const encodedText = encodeURIComponent(shareData.text)
  const encodedUrl = encodeURIComponent(shareData.url)
  const encodedHashtags = encodeURIComponent(shareData.hashtags)

  const shareLinks = [
    {
      name: "WhatsApp",
      href: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
      color: "bg-[#25D366] hover:bg-[#1ea952]",
      icon: MessageCircle,
    },
    {
      name: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      color: "bg-[#0A66C2] hover:bg-[#084e96]",
      icon: Share2,
    },
    {
      name: "Twitter / X",
      href: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}&hashtags=${encodedHashtags}`,
      color: "bg-[#1DA1F2] hover:bg-[#1a8cd8]",
      icon: Share2,
    },
    {
      name: "Copiar link",
      onClick: () => {
        navigator.clipboard.writeText(shareData.url)
      },
      color: "bg-cafe-600 hover:bg-cafe-700",
      icon: Share2,
    },
  ]

  return (
    <section className="relative bg-cafe-50 py-12 sm:py-16 overflow-hidden">
      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 text-center">
        <SectionWrapper>
          <h3 className="text-xl sm:text-2xl font-extrabold text-cafe-800 mb-2">
            ¿Te gusta lo que ves?
          </h3>
          <p className="text-cafe-600/70 mb-6">
            Invita a tus colegas y crezcamos juntos en esta comunidad
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {shareLinks.map((link) => {
              const Icon = link.icon
              const Comp = link.href ? "a" : "button"
              return (
                <motion.div key={link.name} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Comp
                    href={link.href}
                    target={link.href ? "_blank" : undefined}
                    rel={link.href ? "noopener noreferrer" : undefined}
                    onClick={link.onClick}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-sm font-semibold transition-colors ${link.color}`}
                  >
                    <Icon className="w-4 h-4" />
                    {link.name}
                  </Comp>
                </motion.div>
              )
            })}
          </div>
        </SectionWrapper>
      </div>
    </section>
  )
}
