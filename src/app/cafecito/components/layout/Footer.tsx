"use client"

import { Linkedin, Instagram, Youtube } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-cafe-900 text-cafe-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cafe-400 flex items-center justify-center text-cafe-900 font-extrabold text-sm">
              CI
            </div>
            <div>
              <p className="font-bold text-white">Cafecito Inmobiliario</p>
              <p className="text-sm text-cafe-400">
                Conecta mentes para transformar el futuro
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {[
              { icon: Instagram, href: "#", label: "Instagram" },
              { icon: Linkedin, href: "#", label: "LinkedIn" },
              { icon: Youtube, href: "#", label: "YouTube" },
            ].map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-full bg-cafe-800 hover:bg-cafe-700 text-cafe-300 hover:text-cafe-100 transition-all hover:scale-110"
                aria-label={label}
              >
                <Icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-cafe-800 text-center text-sm text-cafe-500">
          <p>&copy; {new Date().getFullYear()} Cafecito Inmobiliario. Todos los derechos reservados.</p>
          <p className="mt-1">Ambato, Ecuador</p>
        </div>
      </div>
    </footer>
  )
}
