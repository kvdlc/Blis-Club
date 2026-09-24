import { Quote } from "lucide-react";
import { testimonios, type Tone } from "@/data/campaign";
import { Container, SectionHeading } from "@/components/ui/Layout";

const avatarTone: Record<Tone, string> = {
  brand: "bg-brand text-white",
  accent: "bg-accent text-ink",
  signal: "bg-signal text-white",
};

export function Voices() {
  return (
    <section id="voces" className="bg-white py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="Voces de la comunidad"
          tone="brand"
          align="center"
          title="Latacunga ya está hablando"
          description="Vecinos, dirigentes, emprendedores y estudiantes cuentan por qué se suman. Esta candidatura nace de la gente y se sostiene con la gente."
        />

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {testimonios.map((t) => (
            <figure
              key={t.name}
              className="flex h-full flex-col rounded-3xl border border-ink/10 bg-sand p-6"
            >
              <Quote className="h-7 w-7 text-accent" strokeWidth={2} />
              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-ink/80 sm:text-base">
                {t.text}
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3 border-t border-ink/10 pt-5">
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-display text-sm font-extrabold ${avatarTone[t.tone]}`}
                >
                  {t.initials}
                </span>
                <span>
                  <span className="block font-display text-sm font-bold text-ink">{t.name}</span>
                  <span className="block text-xs text-ink/60">{t.role}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </Container>
    </section>
  );
}
