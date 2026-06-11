"use client"

import { sponsors } from "@/app/cafecito/data/eventData"
import SectionWrapper from "@/app/cafecito/components/shared/SectionWrapper"

export default function Sponsors() {
  return (
    <section id="sponsors" className="relative bg-white py-16 sm:py-20 overflow-hidden">
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
        <SectionWrapper className="text-center mb-12">
          <span className="text-cafe-500 text-sm font-semibold uppercase tracking-widest">
            Aliados
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-cafe-900 mt-3 mb-4">
            Aliados Estratégicos
          </h2>
        </SectionWrapper>

        {/* Logo Marquee */}
        <div className="relative overflow-hidden">
          <div className="flex gap-12 animate-marquee">
            {[...sponsors, ...sponsors].map((s, i) => (
              <div
                key={`${s.name}-${i}`}
                className="flex-shrink-0 h-16 w-32 flex items-center justify-center grayscale hover:grayscale-0 opacity-50 hover:opacity-100 transition-all duration-300"
              >
                <img
                  src={s.logo}
                  alt={s.name}
                  className="max-h-12 max-w-full object-contain"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
