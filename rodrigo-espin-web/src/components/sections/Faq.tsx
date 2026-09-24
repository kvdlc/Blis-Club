"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { faqs } from "@/data/campaign";
import { Container, SectionHeading } from "@/components/ui/Layout";

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="preguntas" className="bg-white py-20 sm:py-28">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHeading
              eyebrow="Preguntas frecuentes"
              tone="brand"
              title="Resolvemos tus dudas"
              description="Antes de votar, pregunta. Aquí están las respuestas más comunes. Si te queda alguna, escríbenos y te contestamos."
            />
            <a
              href="#contacto"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-bold text-white transition hover:bg-brand-dark"
            >
              Tengo otra pregunta
            </a>
          </div>

          <div className="grid gap-3">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={faq.q}
                  className={`overflow-hidden rounded-2xl border transition ${
                    isOpen ? "border-brand/30 bg-brand-soft/40" : "border-ink/10 bg-sand"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left"
                  >
                    <span className="font-display text-base font-bold text-ink sm:text-lg">
                      {faq.q}
                    </span>
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition ${
                        isOpen ? "bg-brand text-white" : "bg-white text-ink"
                      }`}
                    >
                      {isOpen ? (
                        <Minus className="h-4 w-4" strokeWidth={2.75} />
                      ) : (
                        <Plus className="h-4 w-4" strokeWidth={2.75} />
                      )}
                    </span>
                  </button>
                  {isOpen ? (
                    <p className="px-5 pb-5 text-sm leading-relaxed text-ink/75 sm:text-base">
                      {faq.a}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
