"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

const navLinks = [
  { label: "Agenda", href: "#schedule" },
  { label: "Speakers", href: "#speakers" },
  { label: "Precios", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const handleNavClick = (href: string) => {
    setIsOpen(false)
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? "bg-white/80 backdrop-blur-xl border-b border-cafe-200/60 shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <a
            href="#hero"
            onClick={(e) => {
              e.preventDefault()
              handleNavClick("#hero")
            }}
            className="flex items-center gap-3 group"
          >
            <div className="w-9 h-9 rounded-lg bg-cafe-600 flex items-center justify-center text-white font-extrabold text-sm shadow-md shadow-cafe-600/30 transition-transform group-hover:scale-105">
              CI
            </div>
            <span
              className={`font-bold text-sm transition-colors hidden sm:block ${
                scrolled ? "text-cafe-700" : "text-white"
              }`}
            >
              Cafecito
              <br />
              Inmobiliario
            </span>
          </a>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  scrolled
                    ? "text-cafe-700 hover:text-cafe-900 hover:bg-cafe-50"
                    : "text-white/90 hover:text-white hover:bg-white/10"
                }`}
              >
                {link.label}
              </button>
            ))}
            <Button
              size="sm"
              className="ml-3 animate-btn-pulse shadow-lg shadow-cafe-600/30"
              onClick={() => handleNavClick("#pricing")}
            >
              Comprar Ticket
            </Button>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`md:hidden p-2 rounded-lg transition-colors ${
              scrolled
                ? "text-cafe-700 hover:bg-cafe-50"
                : "text-white hover:bg-white/10"
            }`}
            aria-label="Menú"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden bg-white/95 backdrop-blur-xl border-b border-cafe-200 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => handleNavClick(link.href)}
                  className="block w-full text-left px-4 py-3 rounded-lg text-cafe-700 font-medium hover:bg-cafe-50 transition-colors"
                >
                  {link.label}
                </button>
              ))}
              <Button
                className="w-full mt-2"
                onClick={() => handleNavClick("#pricing")}
              >
                Comprar Ticket
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
