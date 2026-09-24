import { candidate, ejes, navItems, socials } from "@/data/campaign";
import { Container } from "@/components/ui/Layout";

export function SiteFooter() {
  const year = new Date().getFullYear();
  const temas = ejes.slice(0, 6);

  return (
    <footer className="border-t border-white/10 bg-ink text-white">
      <Container className="py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-end justify-center overflow-hidden rounded-t-full border border-white/25 bg-white/10">
                <span className="mb-1.5 font-display text-sm font-extrabold text-white">RE</span>
              </span>
              <span className="flex flex-col leading-none">
                <span className="font-display text-base font-extrabold text-white">
                  {candidate.name}
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
                  Alcalde de Latacunga
                </span>
              </span>
            </div>
            <p className="mt-5 max-w-sm font-display text-lg font-bold text-white/90">
              &ldquo;{candidate.slogan}&rdquo;
            </p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/60">
              {candidate.movement}. Una candidatura ciudadana por una Latacunga
              conectada, segura y con oportunidades para todos.
            </p>
          </div>

          <div>
            <h3 className="font-display text-sm font-bold uppercase tracking-[0.14em] text-white/50">
              Navegación
            </h3>
            <ul className="mt-4 grid gap-2.5">
              {navItems.map((item) => (
                <li key={item.href}>
                  <a href={item.href} className="text-sm text-white/75 transition hover:text-accent">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm font-bold uppercase tracking-[0.14em] text-white/50">
              Propuestas
            </h3>
            <ul className="mt-4 grid gap-2.5">
              {temas.map((eje) => (
                <li key={eje.id}>
                  <a href="#propuestas" className="text-sm text-white/75 transition hover:text-accent">
                    {eje.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm font-bold uppercase tracking-[0.14em] text-white/50">
              Contacto
            </h3>
            <ul className="mt-4 grid gap-2.5 text-sm text-white/75">
              <li>{candidate.address}</li>
              <li>
                <a href={`tel:${candidate.phone.replace(/\s/g, "")}`} className="transition hover:text-accent">
                  {candidate.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${candidate.email}`} className="transition hover:text-accent">
                  {candidate.email}
                </a>
              </li>
            </ul>
            <div className="mt-4 flex flex-wrap gap-2">
              {socials.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold text-white/80 transition hover:border-accent hover:text-accent"
                >
                  {social.name}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-8 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {candidate.movement}. Todos los derechos reservados.
          </p>
          <p className="text-white/40">
            Sitio de campaña con fines informativos. {candidate.list} ·{" "}
            {candidate.electionLabel}.
          </p>
        </div>
      </Container>
    </footer>
  );
}
