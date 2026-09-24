import Image from "next/image";
import { ArrowRight, MapPin, Sparkles, Wifi } from "lucide-react";
import { candidate, heroHighlights, imagenes } from "@/data/campaign";
import { Container } from "@/components/ui/Layout";
import { Reveal } from "@/components/ui/Reveal";
import { Countdown } from "./Countdown";

export function Hero() {
  return (
    <section id="inicio" className="relative overflow-hidden bg-ink text-white">
      <Image
        src={imagenes.hero}
        alt="Vista panorámica de Latacunga con el volcán Cotopaxi"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center opacity-45"
      />
      <div
        className="absolute inset-0 bg-gradient-to-br from-ink via-ink/92 to-ink/70"
        aria-hidden="true"
      />
      <div className="blueprint-grid absolute inset-0 opacity-50" aria-hidden="true" />
      <div
        className="absolute -right-24 -top-24 h-96 w-96 animate-float rounded-full bg-brand/30 blur-[120px]"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-32 left-1/4 h-96 w-96 rounded-full bg-accent/20 blur-[130px]"
        aria-hidden="true"
      />

      <Container className="relative grid items-center gap-14 pb-20 pt-32 lg:grid-cols-[1.1fr_0.9fr] lg:pb-28 lg:pt-40">
        <div>
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-white ring-1 ring-white/15">
              <MapPin className="h-3.5 w-3.5 text-accent" strokeWidth={2.25} />
              {candidate.city} · {candidate.province} · {candidate.country}
            </span>
          </Reveal>

          <Reveal delay={0.08}>
            <h1 className="mt-6 font-display text-5xl font-extrabold leading-[0.98] tracking-tight text-balance sm:text-6xl lg:text-7xl">
              {candidate.name}
            </h1>
          </Reveal>

          <Reveal delay={0.16}>
            <p className="mt-4 font-display text-2xl font-extrabold leading-tight text-accent sm:text-3xl lg:text-4xl">
              &ldquo;{candidate.slogan}&rdquo;
            </p>
          </Reveal>

          <Reveal delay={0.24}>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">
              Arquitecto y emprendedor latacungueño. {candidate.position.toLowerCase()}{" "}
              para construir, junto a ti, una ciudad conectada, segura y con
              oportunidades para todos.
            </p>
          </Reveal>

          <Reveal delay={0.3}>
            <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-2.5">
              {heroHighlights.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm font-medium text-white/85">
                  <span className="h-1.5 w-1.5 rounded-full bg-signal" />
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.38}>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href="#propuestas"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-accent px-7 py-3.5 text-sm font-bold text-ink transition hover:bg-accent-dark hover:text-white"
              >
                Conoce las propuestas
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" strokeWidth={2.5} />
              </a>
              <a
                href="#sumate"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 px-7 py-3.5 text-sm font-bold text-white transition hover:bg-white/10"
              >
                <Sparkles className="h-4 w-4 text-accent" strokeWidth={2.25} />
                Súmate a la campaña
              </a>
            </div>
          </Reveal>
        </div>

        <div>
          <Reveal delay={0.2} y={40}>
            <div className="relative mx-auto max-w-md">
              <div className="overflow-hidden rounded-[2.2rem] border border-white/12 bg-white/[0.05] p-2 backdrop-blur-sm">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[1.8rem]">
                  <Image
                    src={imagenes.retrato}
                    alt={`Retrato ilustrativo de ${candidate.name}`}
                    fill
                    priority
                    sizes="(max-width: 1024px) 90vw, 420px"
                    className="object-cover object-top"
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/10 to-transparent"
                    aria-hidden="true"
                  />
                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <p className="font-display text-2xl font-extrabold text-white">
                      {candidate.nickname}
                    </p>
                    <p className="text-sm text-white/70">Arquitecto · Emprendedor</p>
                    <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-accent/20 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-accent backdrop-blur-sm">
                      {candidate.movement}
                    </div>
                  </div>
                </div>
              </div>

              <div className="animate-float absolute -left-4 top-10 hidden items-center gap-2 rounded-2xl bg-white px-4 py-3 shadow-xl sm:flex">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-signal-soft text-signal-dark">
                  <Wifi className="h-5 w-5" strokeWidth={2.25} />
                </span>
                <span className="text-left">
                  <span className="block font-display text-sm font-extrabold text-ink">300+</span>
                  <span className="block text-[11px] text-ink/55">puntos WiFi</span>
                </span>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.32} y={30}>
            <div className="mt-6 rounded-[2rem] border border-white/12 bg-white/[0.05] p-5 backdrop-blur-sm">
              <p className="mb-3 text-center text-xs font-bold uppercase tracking-[0.18em] text-white/60">
                Cuenta regresiva · {candidate.electionLabel}
              </p>
              <Countdown targetISO={candidate.electionDateISO} />
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
