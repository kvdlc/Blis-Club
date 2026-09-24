import { ArrowRight, Newspaper } from "lucide-react";
import { noticias, type Tone } from "@/data/campaign";
import { Container, SectionHeading } from "@/components/ui/Layout";

const categoryTone: Record<Tone, string> = {
  brand: "bg-brand-soft text-brand-dark",
  accent: "bg-accent-soft text-accent-dark",
  signal: "bg-signal-soft text-signal-dark",
};

export function News() {
  const [lead, ...rest] = noticias;

  return (
    <section id="noticias" className="bg-sand py-20 sm:py-28">
      <Container>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow="Noticias y novedades"
            tone="signal"
            title="Lo que está pasando en la campaña"
            description="Recorridos, propuestas y encuentros con la comunidad. Sigue de cerca el camino hacia la Alcaldía de Latacunga."
          />
          <a
            href="#sumate"
            className="inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-ink/15 px-6 py-3 text-sm font-bold text-ink transition hover:bg-ink hover:text-white"
          >
            <Newspaper className="h-4 w-4" strokeWidth={2.25} />
            Recibe las novedades
          </a>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          <article className="group relative flex flex-col justify-between overflow-hidden rounded-[2rem] bg-ink p-8 text-white sm:p-10">
            <div className="blueprint-grid absolute inset-0 opacity-50" aria-hidden="true" />
            <div className="relative">
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-accent/20 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-accent">
                  {lead.category}
                </span>
                <span className="text-xs text-white/55">{lead.date}</span>
              </div>
              <h3 className="mt-5 font-display text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl">
                {lead.title}
              </h3>
              <p className="mt-4 text-base leading-relaxed text-white/75">{lead.excerpt}</p>
            </div>
            <span className="relative mt-8 inline-flex items-center gap-2 text-sm font-bold text-accent">
              Leer la nota completa
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" strokeWidth={2.5} />
            </span>
          </article>

          <div className="grid gap-5">
            {rest.map((item) => (
              <article
                key={item.title}
                className="flex items-start gap-5 rounded-3xl border border-ink/10 bg-white p-6 transition hover:border-brand/30"
              >
                <span
                  className={`mt-1 hidden shrink-0 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] sm:inline-block ${categoryTone[item.tone]}`}
                >
                  {item.category}
                </span>
                <div>
                  <p className="text-xs text-ink/50">{item.date}</p>
                  <h3 className="mt-1 font-display text-lg font-bold leading-snug text-ink">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink/70">{item.excerpt}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
