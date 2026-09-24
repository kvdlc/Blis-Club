"use client";

import { useState, type FormEvent } from "react";
import { Check, Send } from "lucide-react";
import { volunteerRoles } from "@/data/campaign";
import { Container, SectionHeading } from "@/components/ui/Layout";
import { Icon } from "@/components/ui/Icon";

const inputClass =
  "w-full rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-accent focus:bg-white/[0.09]";

export function Join() {
  const [sent, setSent] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSent(true);
  }

  return (
    <section id="sumate" className="relative overflow-hidden bg-ink text-white">
      <div className="blueprint-grid absolute inset-0 opacity-60" aria-hidden="true" />
      <div
        className="absolute -right-24 top-1/4 h-80 w-80 rounded-full bg-brand/25 blur-[120px]"
        aria-hidden="true"
      />
      <Container className="relative py-20 sm:py-28">
        <div className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
          <div>
            <SectionHeading
              eyebrow="Súmate"
              tone="light"
              light
              title="Esta campaña la hacemos contigo"
              description="No necesitas experiencia política. Necesitas ganas de que Latacunga cambie. Elige cómo quieres ayudar y nos ponemos en contacto contigo."
            />

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {volunteerRoles.map((role) => (
                <div
                  key={role.title}
                  className="rounded-2xl border border-white/12 bg-white/[0.05] p-5"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 text-accent">
                    <Icon name={role.icon} className="h-5 w-5" />
                  </span>
                  <h3 className="mt-3 font-display text-base font-bold text-white">{role.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-white/70">{role.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/12 bg-white/[0.04] p-6 backdrop-blur-sm sm:p-8">
            {sent ? (
              <div className="flex h-full min-h-[28rem] flex-col items-center justify-center text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-signal/20 text-signal">
                  <Check className="h-8 w-8" strokeWidth={2.75} />
                </span>
                <h3 className="mt-5 font-display text-2xl font-extrabold text-white">
                  ¡Gracias por sumarte!
                </h3>
                <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/70">
                  Recibimos tus datos. Un miembro del equipo de Rodrigo Espín se
                  pondrá en contacto contigo muy pronto. ¡Bienvenido a El Arqui!
                </p>
                <button
                  type="button"
                  onClick={() => setSent(false)}
                  className="mt-6 rounded-full border border-white/25 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"
                >
                  Enviar otra respuesta
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-2">
                    <span className="text-xs font-bold uppercase tracking-[0.12em] text-white/60">
                      Nombre completo
                    </span>
                    <input required name="nombre" placeholder="Tu nombre" className={inputClass} />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-xs font-bold uppercase tracking-[0.12em] text-white/60">
                      Teléfono / WhatsApp
                    </span>
                    <input required name="telefono" placeholder="099 000 0000" className={inputClass} />
                  </label>
                </div>

                <label className="grid gap-2">
                  <span className="text-xs font-bold uppercase tracking-[0.12em] text-white/60">
                    Correo electrónico
                  </span>
                  <input
                    required
                    type="email"
                    name="email"
                    placeholder="tucorreo@ejemplo.com"
                    className={inputClass}
                  />
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-2">
                    <span className="text-xs font-bold uppercase tracking-[0.12em] text-white/60">
                      Barrio o parroquia
                    </span>
                    <input required name="sector" placeholder="Ej.: San Buenaventura" className={inputClass} />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-xs font-bold uppercase tracking-[0.12em] text-white/60">
                      ¿Cómo quieres ayudar?
                    </span>
                    <select required name="rol" defaultValue="" className={`${inputClass} text-ink`}>
                      <option value="" disabled>
                        Elige una opción
                      </option>
                      {volunteerRoles.map((role) => (
                        <option key={role.title} value={role.title}>
                          {role.title}
                        </option>
                      ))}
                      <option value="Otro">Otro / cuéntame</option>
                    </select>
                  </label>
                </div>

                <label className="grid gap-2">
                  <span className="text-xs font-bold uppercase tracking-[0.12em] text-white/60">
                    Mensaje (opcional)
                  </span>
                  <textarea
                    name="mensaje"
                    rows={3}
                    placeholder="Cuéntanos qué necesita tu barrio"
                    className={inputClass}
                  />
                </label>

                <label className="flex items-start gap-3 text-xs leading-relaxed text-white/65">
                  <input
                    required
                    type="checkbox"
                    name="acepto"
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/30 bg-transparent accent-accent"
                  />
                  Autorizo que el equipo de campaña de Rodrigo Espín se comunique
                  conmigo para coordinar actividades de voluntariado.
                </label>

                <button
                  type="submit"
                  className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-accent px-7 py-3.5 text-sm font-bold text-ink transition hover:bg-accent-dark hover:text-white"
                >
                  <Send className="h-4 w-4" strokeWidth={2.5} />
                  Quiero sumarme
                </button>
              </form>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
