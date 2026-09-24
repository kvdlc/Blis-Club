import Image from "next/image";
import { Check, MapPin, Wifi } from "lucide-react";
import { imagenes, internetGratis } from "@/data/campaign";
import { Container, Eyebrow, SectionHeading } from "@/components/ui/Layout";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";

export function InternetGratis() {
  return (
    <section id="internet-gratis" className="relative bg-white py-20 sm:py-28">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-end">
          <SectionHeading
            eyebrow="Propuesta estrella 01"
            tone="signal"
            title="Internet gratis para toda Latacunga"
            description="Una red municipal de WiFi gratuito, estable y con soporte real. Para estudiar, emprender, hacer trámites y estar comunicados, sin importar el barrio ni la parroquia donde vivas."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-ink/10 bg-sand p-6">
              <Wifi className="h-7 w-7 text-signal-dark" strokeWidth={1.9} />
              <p className="mt-3 font-display text-3xl font-extrabold text-ink">300+</p>
              <p className="text-sm text-ink/65">puntos de WiFi comunitario proyectados</p>
            </div>
            <div className="rounded-3xl border border-ink/10 bg-sand p-6">
              <MapPin className="h-7 w-7 text-brand" strokeWidth={1.9} />
              <p className="mt-3 font-display text-3xl font-extrabold text-ink">12</p>
              <p className="text-sm text-ink/65">parroquias conectadas al plan digital</p>
            </div>
          </div>
        </div>

        <div className="mt-12 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="grid gap-4">
            {internetGratis.intro.map((paragraph) => (
              <p key={paragraph} className="text-base leading-relaxed text-ink/75 sm:text-lg">
                {paragraph}
              </p>
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {internetGratis.features.map((feature) => (
              <div key={feature.title} className="rounded-3xl border border-ink/10 bg-sand p-5">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-signal-soft text-signal-dark">
                  <Icon name={feature.icon} className="h-5 w-5" />
                </span>
                <h3 className="mt-3 font-display text-base font-bold text-ink">{feature.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink/70">{feature.text}</p>
              </div>
            ))}
          </div>
        </div>

        <Reveal className="mt-10">
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[2rem] border border-ink/10 sm:aspect-[21/9]">
            <Image
              src={imagenes.wifi}
              alt="Vecinos de Latacunga conectados a internet en una plaza"
              fill
              sizes="(max-width: 1024px) 100vw, 1200px"
              className="object-cover"
            />
            <div
              className="absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/40 to-transparent"
              aria-hidden="true"
            />
            <div className="absolute inset-0 flex items-end p-6 sm:p-10">
              <p className="max-w-lg font-display text-xl font-extrabold leading-snug text-white sm:text-2xl">
                Internet en la plaza para el estudiante, en el mercado para la
                comerciante y en la parroquia para el agricultor.
              </p>
            </div>
          </div>
        </Reveal>

        <div className="mt-16">
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <Eyebrow tone="signal">¿Dónde habrá internet gratis?</Eyebrow>
            <span className="h-px flex-1 bg-ink/10" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {internetGratis.zonas.map((zona) => (
              <div key={zona.nombre} className="rounded-3xl border border-ink/10 bg-white p-6">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display text-base font-bold leading-snug text-ink">
                    {zona.nombre}
                  </h3>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${
                      zona.tipo === "Rural"
                        ? "bg-accent-soft text-accent-dark"
                        : "bg-brand-soft text-brand-dark"
                    }`}
                  >
                    {zona.tipo}
                  </span>
                </div>
                <ul className="mt-4 grid gap-2">
                  {zona.puntos.map((punto) => (
                    <li key={punto} className="flex items-center gap-2 text-sm text-ink/75">
                      <Wifi className="h-3.5 w-3.5 shrink-0 text-signal" strokeWidth={2.5} />
                      {punto}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="relative mt-16 overflow-hidden rounded-[2rem] bg-ink p-8 text-white sm:p-10">
          <div className="blueprint-grid absolute inset-0 opacity-60" aria-hidden="true" />
          <div className="relative">
            <div className="flex flex-wrap items-center gap-3">
              <Eyebrow tone="light">Hoja de ruta</Eyebrow>
              <span className="h-px flex-1 bg-white/15" />
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {internetGratis.fases.map((fase, index) => (
                <div key={fase.fase}>
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-signal/20 font-display text-sm font-extrabold text-signal">
                      {index + 1}
                    </span>
                    <span className="font-display text-sm font-bold uppercase tracking-[0.14em] text-white/70">
                      {fase.fase}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-white/80">{fase.detalle}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="flex items-center gap-2 text-sm text-white/70">
                <Check className="h-4 w-4 text-signal" strokeWidth={2.75} />
                Meta: el 100% de las parroquias con un punto digital al final del período.
              </p>
              <a
                href="#sumate"
                className="inline-flex items-center justify-center rounded-full bg-accent px-6 py-3 text-sm font-bold text-ink transition hover:bg-accent-dark hover:text-white"
              >
                Quiero internet en mi barrio
              </a>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
