import { HandHeart } from "lucide-react";
import { candidate, significados } from "@/data/campaign";
import { Container } from "@/components/ui/Layout";
import { Icon } from "@/components/ui/Icon";

export function SloganMeaning() {
  return (
    <section id="el-arqui" className="relative overflow-hidden bg-ink text-white">
      <div className="blueprint-grid absolute inset-0 opacity-60" aria-hidden="true" />
      <div
        className="absolute -left-24 top-1/3 h-80 w-80 rounded-full bg-signal/20 blur-[120px]"
        aria-hidden="true"
      />
      <Container className="relative py-20 sm:py-28">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-white ring-1 ring-white/15">
              <HandHeart className="h-3.5 w-3.5 text-accent" strokeWidth={2.5} />
              El significado
            </span>
            <p className="mt-6 font-display text-3xl font-extrabold leading-[1.05] tracking-tight text-balance sm:text-4xl lg:text-5xl">
              &ldquo;{candidate.slogan}&rdquo;
            </p>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">
              No es solo una frase de campaña. Es una forma de gobernar: al lado
              de la gente, con planos en la mano y con la palabra como
              compromiso. Así trabaja {candidate.nickname}.
            </p>
            <div className="mt-8 rounded-2xl border border-white/12 bg-white/[0.05] p-5">
              <p className="text-sm leading-relaxed text-white/80">
                <span className="font-bold text-accent">Acolitar</span> es
                acompañar, empujar y no dejar solo a nadie. Es el compromiso de
                un alcalde que camina el barrio y cumple lo que firma.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {significados.map((item) => (
              <div
                key={item.title}
                className="rounded-3xl border border-white/12 bg-white/[0.05] p-6 transition hover:border-accent/40 hover:bg-white/[0.08]"
              >
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/15 text-accent">
                  <Icon name={item.icon} className="h-6 w-6" />
                </span>
                <h3 className="mt-4 font-display text-lg font-bold text-white">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/70">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
