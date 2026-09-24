import Image from "next/image";
import { Check } from "lucide-react";
import {
  aboutParagraphs,
  banderas,
  candidate,
  formacion,
  imagenes,
  trayectoria,
} from "@/data/campaign";
import { Container, Eyebrow, SectionHeading } from "@/components/ui/Layout";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";

export function About() {
  return (
    <section id="sobre-rodrigo" className="bg-sand py-20 sm:py-28">
      <Container>
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <Reveal>
              <div className="relative mx-auto max-w-sm">
                <div className="overflow-hidden rounded-[2rem] border border-ink/10 bg-white p-2">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[1.6rem]">
                    <Image
                      src={imagenes.planos}
                      alt="Arquitecto revisando planos y un modelo de ciudad"
                      fill
                      sizes="(max-width: 1024px) 90vw, 384px"
                      className="object-cover"
                    />
                    <div
                      className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent"
                      aria-hidden="true"
                    />
                    <div className="absolute inset-x-0 bottom-0 p-5">
                      <p className="font-display text-lg font-extrabold text-white">
                        {candidate.name}
                      </p>
                      <p className="text-sm text-white/70">Arquitecto · Emprendedor</p>
                    </div>
                  </div>

                  <Stagger className="mt-4 grid gap-2 pb-2">
                    {banderas.map((bandera) => (
                      <StaggerItem
                        key={bandera}
                        className="flex items-center gap-2 rounded-xl bg-sand px-3.5 py-2.5 text-sm font-semibold text-ink/80"
                      >
                        <Check className="h-4 w-4 shrink-0 text-signal" strokeWidth={2.75} />
                        {bandera}
                      </StaggerItem>
                    ))}
                  </Stagger>
                </div>

                <div className="mt-5 rounded-2xl border border-ink/10 bg-white p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink/50">
                    Formación
                  </p>
                  <ul className="mt-3 grid gap-2">
                    {formacion.map((item) => (
                      <li key={item} className="flex gap-2 text-sm leading-relaxed text-ink/75">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>
          </div>

          <div>
            <Reveal>
              <SectionHeading
                eyebrow="Sobre Rodrigo Espín"
                tone="brand"
                title="Un arquitecto que construye ciudad con la gente"
                description="Rodrigo Espín no llega a la política a improvisar. Llega con planos, presupuesto y palabra. Conoce Latacunga porque la ha caminado, la ha construido y la ha vivido."
              />
            </Reveal>

            <Stagger className="mt-8 grid gap-4">
              {aboutParagraphs.map((paragraph) => (
                <StaggerItem key={paragraph}>
                  <p className="text-base leading-relaxed text-ink/75 sm:text-lg">{paragraph}</p>
                </StaggerItem>
              ))}
            </Stagger>

            <div className="mt-12">
              <div className="mb-6 flex items-center gap-3">
                <Eyebrow tone="accent">Trayectoria</Eyebrow>
                <span className="h-px flex-1 bg-ink/10" />
              </div>

              <ol className="relative border-l-2 border-dashed border-ink/15 pl-7">
                {trayectoria.map((item, index) => (
                  <Reveal key={item.title} delay={index * 0.08}>
                    <li className="relative pb-8 last:pb-0">
                      <span className="absolute -left-[2.4rem] top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-brand bg-sand">
                        <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                      </span>
                      <span className="text-xs font-bold uppercase tracking-[0.16em] text-brand">
                        {item.year}
                      </span>
                      <h3 className="mt-1 font-display text-lg font-bold text-ink">{item.title}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-ink/70">{item.text}</p>
                    </li>
                  </Reveal>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
