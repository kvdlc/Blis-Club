import { HandCoins, ShieldCheck } from "lucide-react";
import { donationTiers, transparencia, type Tone } from "@/data/campaign";
import { Container, SectionHeading } from "@/components/ui/Layout";

const tierTone: Record<Tone, string> = {
  brand: "border-brand/25 bg-brand-soft/50",
  accent: "border-accent/30 bg-accent-soft/60",
  signal: "border-signal/25 bg-signal-soft/50",
};

export function Donate() {
  return (
    <section id="apoya" className="bg-sand py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="Apoya la campaña"
          tone="accent"
          align="center"
          title="Tu aporte construye esta candidatura"
          description="Una campaña ciudadana se financia con aportes honestos y transparentes. Cada contribución se invierte en llegar a más barrios y parroquias con el mensaje de El Arqui."
        />

        <div className="mx-auto mt-12 grid max-w-4xl gap-5 sm:grid-cols-3">
          {donationTiers.map((tier) => (
            <div
              key={tier.amount}
              className={`flex flex-col rounded-3xl border p-7 text-center ${tierTone[tier.tone]}`}
            >
              <span className="font-display text-4xl font-extrabold text-ink">{tier.amount}</span>
              <h3 className="mt-3 font-display text-lg font-bold text-ink">{tier.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-ink/70">{tier.text}</p>
              <a
                href="#contacto"
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-bold text-white transition hover:bg-brand"
              >
                <HandCoins className="h-4 w-4" strokeWidth={2.25} />
                Aportar
              </a>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-12 max-w-4xl rounded-3xl border border-ink/10 bg-white p-7 sm:p-8">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-signal-soft text-signal-dark">
              <ShieldCheck className="h-5 w-5" strokeWidth={2} />
            </span>
            <h3 className="font-display text-lg font-bold text-ink">
              Compromiso de transparencia
            </h3>
          </div>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {transparencia.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm leading-relaxed text-ink/75">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-signal" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
