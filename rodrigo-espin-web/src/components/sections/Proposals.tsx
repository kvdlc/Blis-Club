import { ArrowUpRight, Check } from "lucide-react";
import { ejes, promesasRapidas, type Eje, type Tone } from "@/data/campaign";
import { Container, SectionHeading } from "@/components/ui/Layout";
import { Icon } from "@/components/ui/Icon";

const toneRing: Record<Tone, string> = {
  brand: "bg-brand-soft text-brand-dark",
  accent: "bg-accent-soft text-accent-dark",
  signal: "bg-signal-soft text-signal-dark",
};

function FeaturedCard({ eje }: { eje: Eje }) {
  return (
    <a
      href={`#${eje.id}`}
      className="group relative col-span-full overflow-hidden rounded-[2rem] bg-ink p-8 text-white transition hover:bg-ink-900 sm:p-10"
    >
      <div className="blueprint-grid absolute inset-0 opacity-60" aria-hidden="true" />
      <div
        className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-signal/25 blur-[90px]"
        aria-hidden="true"
      />
      <div className="relative grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-center">
        <div>
          <div className="flex items-center gap-3">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-signal/20 text-signal">
              <Icon name={eje.icon} className="h-6 w-6" />
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-white/80">
              Propuesta estrella
            </span>
          </div>
          <h3 className="mt-5 font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
            {eje.title}
          </h3>
          <p className="mt-2 font-display text-lg font-bold text-signal">{eje.tagline}</p>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-white/75">
            {eje.description}
          </p>
          <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-accent">
            Ver el plan completo
            <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={2.5} />
          </span>
        </div>
        <ul className="grid gap-2.5">
          {eje.compromisos.map((item) => (
            <li
              key={item}
              className="flex items-start gap-2.5 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm leading-relaxed text-white/85"
            >
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-signal" strokeWidth={2.75} />
              {item}
            </li>
          ))}
          <li className="mt-1 flex items-center justify-between rounded-2xl bg-accent/15 px-4 py-3">
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-accent">
              {eje.meta.label}
            </span>
            <span className="font-display text-sm font-extrabold text-white">{eje.meta.value}</span>
          </li>
        </ul>
      </div>
    </a>
  );
}

function EjeCard({ eje }: { eje: Eje }) {
  return (
    <article className="group flex h-full flex-col rounded-3xl border border-ink/10 bg-white p-6 transition hover:-translate-y-1 hover:border-brand/30 hover:shadow-xl hover:shadow-ink/5">
      <div className="flex items-center justify-between">
        <span className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${toneRing[eje.tone]}`}>
          <Icon name={eje.icon} className="h-6 w-6" />
        </span>
        <span className="font-display text-2xl font-extrabold text-ink/10">{eje.number}</span>
      </div>
      <h3 className="mt-5 font-display text-xl font-bold leading-snug text-ink">{eje.title}</h3>
      <p className="mt-1.5 text-sm font-semibold text-brand">{eje.tagline}</p>
      <p className="mt-3 text-sm leading-relaxed text-ink/70">{eje.description}</p>

      <ul className="mt-5 grid gap-2">
        {eje.compromisos.map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm leading-relaxed text-ink/75">
            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-signal" strokeWidth={3} />
            {item}
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-5">
        <div className="flex items-center justify-between rounded-2xl bg-sand px-4 py-2.5">
          <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink/50">
            {eje.meta.label}
          </span>
          <span className="font-display text-xs font-extrabold text-ink">{eje.meta.value}</span>
        </div>
      </div>
    </article>
  );
}

export function Proposals() {
  const [featured, ...rest] = ejes;

  return (
    <section id="propuestas" className="bg-sand py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="Plan de trabajo"
          tone="brand"
          title="18 ejes para transformar Latacunga"
          description="Un plan serio, medible y con metas claras. No son promesas sueltas: es una hoja de ruta para los primeros años de gobierno, construida con vecinos, dirigentes, emprendedores y comunidades rurales."
        />

        <div className="mt-8 flex flex-wrap gap-2.5">
          {promesasRapidas.map((promesa) => (
            <span
              key={promesa}
              className="inline-flex items-center gap-2 rounded-full border border-ink/12 bg-white px-4 py-2 text-xs font-semibold text-ink/75"
            >
              <Check className="h-3.5 w-3.5 text-signal" strokeWidth={3} />
              {promesa}
            </span>
          ))}
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <FeaturedCard eje={featured} />
          {rest.map((eje) => (
            <EjeCard key={eje.id} eje={eje} />
          ))}
        </div>
      </Container>
    </section>
  );
}
