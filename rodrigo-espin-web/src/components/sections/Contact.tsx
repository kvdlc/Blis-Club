import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { candidate, socials } from "@/data/campaign";
import { Container, SectionHeading } from "@/components/ui/Layout";

const socialPaths: Record<(typeof socials)[number]["icon"], string> = {
  facebook:
    "M14 9h3l.5-3H14V4.2c0-.8.3-1.4 1.5-1.4H18V.1C17.4.1 16.3 0 15.2 0 12.6 0 11 1.6 11 4.4V6H8v3h3v9h3V9Z",
  instagram:
    "M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.3 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.3 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.8-.3-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.3-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4C8.4 2.2 8.8 2.2 12 2.2Zm0 3.6A6.2 6.2 0 1 0 18.2 12 6.2 6.2 0 0 0 12 5.8Zm0 10.2A4 4 0 1 1 16 12a4 4 0 0 1-4 4Zm6.4-10.4a1.44 1.44 0 1 1-1.44-1.44 1.44 1.44 0 0 1 1.44 1.44Z",
  twitter:
    "M18.9 2h3.3l-7.2 8.2L23.5 22h-6.6l-5.2-6.8L5.8 22H2.5l7.7-8.8L1.5 2h6.8l4.7 6.2L18.9 2Zm-1.2 18h1.8L7.4 3.9H5.5L17.7 20Z",
  youtube:
    "M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8ZM9.6 15.6V8.4l6.3 3.6-6.3 3.6Z",
  tiktok:
    "M16.6 5.8a5 5 0 0 1-1-.6 4.6 4.6 0 0 1-1.4-2.2H11.4v11.6a2.3 2.3 0 1 1-1.8-2.2V9.6a5.4 5.4 0 1 0 4.5 5.3V9.2a7.4 7.4 0 0 0 4.3 1.4V7.8a4.6 4.6 0 0 1-1.8-.4v-1.6Z",
};

function SocialIcon({ icon, className }: { icon: keyof typeof socialPaths; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d={socialPaths[icon]} />
    </svg>
  );
}

export function Contact() {
  const cards = [
    { icon: <MapPin className="h-5 w-5" />, label: "Casa de campaña", value: candidate.address },
    { icon: <Phone className="h-5 w-5" />, label: "Teléfono", value: candidate.phone, href: `tel:${candidate.phone.replace(/\s/g, "")}` },
    { icon: <Mail className="h-5 w-5" />, label: "Correo", value: candidate.email, href: `mailto:${candidate.email}` },
    { icon: <MessageCircle className="h-5 w-5" />, label: "WhatsApp", value: candidate.whatsapp, href: `https://wa.me/${candidate.whatsapp.replace(/[^0-9]/g, "")}` },
  ];

  return (
    <section id="contacto" className="relative overflow-hidden bg-ink text-white">
      <div className="blueprint-grid absolute inset-0 opacity-60" aria-hidden="true" />
      <div
        className="absolute -bottom-24 left-1/3 h-80 w-80 rounded-full bg-accent/20 blur-[130px]"
        aria-hidden="true"
      />
      <Container className="relative py-20 sm:py-28">
        <SectionHeading
          eyebrow="Contacto"
          tone="light"
          light
          title="Hablemos de tu barrio y de Latacunga"
          description="Escríbenos, llámanos o visita la casa de campaña. Tu propuesta, tu reclamo y tu idea son bienvenidos. El Arqui te acolita."
        />

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <div key={card.label} className="rounded-3xl border border-white/12 bg-white/[0.05] p-6">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/15 text-accent">
                {card.icon}
              </span>
              <p className="mt-4 text-xs font-bold uppercase tracking-[0.14em] text-white/50">
                {card.label}
              </p>
              {card.href ? (
                <a
                  href={card.href}
                  className="mt-1 block text-sm font-medium leading-relaxed text-white transition hover:text-accent"
                >
                  {card.value}
                </a>
              ) : (
                <p className="mt-1 text-sm font-medium leading-relaxed text-white">{card.value}</p>
              )}
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-6 rounded-3xl border border-white/12 bg-white/[0.05] p-7 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-display text-xl font-extrabold text-white">
              Sigue la campaña en redes
            </p>
            <p className="mt-1 text-sm text-white/65">{candidate.hashtag}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {socials.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.name}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 text-white transition hover:border-accent hover:bg-accent hover:text-ink"
              >
                <SocialIcon icon={social.icon} className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
