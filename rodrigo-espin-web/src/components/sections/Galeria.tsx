import Image from "next/image";
import { MapPin } from "lucide-react";
import { galeria, type Tone } from "@/data/campaign";
import { Container, SectionHeading } from "@/components/ui/Layout";
import { Reveal } from "@/components/ui/Reveal";

const tagTone: Record<Tone, string> = {
  brand: "bg-brand text-white",
  accent: "bg-accent text-ink",
  signal: "bg-signal text-white",
};

export function Galeria() {
  return (
    <section id="latacunga" className="bg-sand py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="Nuestra ciudad"
          tone="signal"
          title="Latacunga que se ve bien"
          description="Una ciudad con identidad, cultura, mercado y campo. Estas son las Latacungas que queremos potenciar: la que camina, la que produce y la que celebra."
        />

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {galeria.map((item, index) => (
            <Reveal
              key={item.title}
              delay={index * 0.08}
              className={item.wide ? "sm:col-span-2" : ""}
            >
              <article className="group relative flex h-full min-h-[280px] flex-col justify-end overflow-hidden rounded-[2rem] bg-ink">
                <Image
                  src={item.src}
                  alt={item.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition duration-700 ease-out group-hover:scale-[1.07]"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-ink via-ink/45 to-transparent"
                  aria-hidden="true"
                />
                <div className="relative p-6 sm:p-7">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${tagTone[item.tone]}`}
                  >
                    <MapPin className="h-3 w-3" strokeWidth={2.5} />
                    {item.tag}
                  </span>
                  <h3 className="mt-3 font-display text-xl font-extrabold leading-snug text-white sm:text-2xl">
                    {item.title}
                  </h3>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/75">{item.text}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <p className="mt-5 text-xs text-ink/45">
          Imágenes ilustrativas de referencia generadas con IA para el diseño de campaña.
        </p>
      </Container>
    </section>
  );
}
