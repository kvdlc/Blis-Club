import { CalendarDays, Clock, MapPin } from "lucide-react";
import { agenda } from "@/data/campaign";
import { Container, SectionHeading } from "@/components/ui/Layout";

export function Agenda() {
  return (
    <section id="agenda" className="bg-sand py-20 sm:py-28">
      <Container>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow="Agenda de campaña"
            tone="accent"
            title="El Arqui está en el barrio"
            description="Casa abierta, recorridos, mingas y asambleas. Esta campaña se hace en las calles y en las parroquias. Acompáñanos en la próxima actividad."
          />
          <a
            href="#sumate"
            className="inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-ink/15 px-6 py-3 text-sm font-bold text-ink transition hover:bg-ink hover:text-white"
          >
            <CalendarDays className="h-4 w-4" strokeWidth={2.25} />
            Invita la campaña a tu barrio
          </a>
        </div>

        <div className="mt-12 grid gap-3">
          {agenda.map((item) => (
            <article
              key={item.title}
              className="group grid items-center gap-4 rounded-3xl border border-ink/10 bg-white p-5 transition hover:border-accent/40 hover:shadow-lg hover:shadow-ink/5 sm:grid-cols-[auto_1fr_auto]"
            >
              <div className="flex h-16 w-16 flex-col items-center justify-center rounded-2xl bg-ink text-white">
                <span className="font-display text-xl font-extrabold leading-none">{item.day}</span>
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-accent">
                  {item.month}
                </span>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-lg font-bold text-ink">{item.title}</h3>
                  <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-accent-dark">
                    {item.tag}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink/65">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-brand" strokeWidth={2.25} />
                    {item.place}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-brand" strokeWidth={2.25} />
                    {item.time}
                  </span>
                </div>
              </div>

              <a
                href="#sumate"
                className="justify-self-start rounded-full bg-sand px-5 py-2.5 text-sm font-bold text-ink transition group-hover:bg-brand group-hover:text-white sm:justify-self-end"
              >
                Asistiré
              </a>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
