import { diagnostico } from "@/data/campaign";
import { Container, SectionHeading } from "@/components/ui/Layout";
import { Icon } from "@/components/ui/Icon";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { Reveal } from "@/components/ui/Reveal";
import { DonutChart } from "@/components/charts/DonutChart";
import { TrendChart } from "@/components/charts/TrendChart";
import { BarList } from "@/components/charts/BarList";

const toneStyle: Record<string, string> = {
  brand: "bg-brand-soft text-brand-dark",
  accent: "bg-accent-soft text-accent-dark",
  signal: "bg-signal-soft text-signal-dark",
};

export function Diagnostico() {
  return (
    <section id="diagnostico" className="bg-white py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="Diagnóstico"
          tone="accent"
          title="La radiografía de Latacunga"
          description="Estos gráficos resumen la realidad que encontramos en los barrios y las parroquias. Cada dato se convierte en una propuesta con meta y plazo."
        />

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {diagnostico.intro.map((paragraph, i) => (
            <Reveal key={paragraph} delay={i * 0.1}>
              <p className="text-base leading-relaxed text-ink/75 sm:text-lg">{paragraph}</p>
            </Reveal>
          ))}
        </div>

        <div className="mt-14 grid gap-10 sm:grid-cols-3">
          {diagnostico.donuts.map((donut, i) => (
            <Reveal key={donut.label} delay={i * 0.12}>
              <DonutChart
                value={donut.value}
                label={donut.label}
                sublabel={donut.sublabel}
                color={donut.color}
              />
            </Reveal>
          ))}
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <Reveal className="rounded-[2rem] border border-ink/10 bg-sand p-6 sm:p-8">
            <h3 className="font-display text-xl font-bold text-ink">{diagnostico.trend.title}</h3>
            <div className="mt-6">
              <TrendChart
                points={diagnostico.trend.points}
                color="#0fb5a3"
                suffix="%"
                max={100}
                caption={diagnostico.trend.caption}
              />
            </div>
          </Reveal>

          <Reveal delay={0.15} className="rounded-[2rem] border border-ink/10 bg-sand p-6 sm:p-8">
            <h3 className="font-display text-xl font-bold text-ink">{diagnostico.bars.title}</h3>
            <div className="mt-7">
              <BarList items={diagnostico.bars.items} suffix="%" max={100} />
            </div>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {diagnostico.kpis.map((kpi, i) => (
            <Reveal
              key={kpi.label}
              delay={i * 0.1}
              className="flex items-center gap-4 rounded-3xl border border-ink/10 bg-white p-6"
            >
              <span className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${toneStyle[kpi.tone]}`}>
                <Icon name={kpi.icon} className="h-6 w-6" />
              </span>
              <div>
                <p className="font-display text-2xl font-extrabold text-ink">
                  <AnimatedNumber value={kpi.value} suffix={kpi.suffix} />
                </p>
                <p className="text-sm text-ink/65">{kpi.label}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <p className="mt-8 max-w-3xl text-xs leading-relaxed text-ink/50">
          {diagnostico.disclaimer}
        </p>
      </Container>
    </section>
  );
}
