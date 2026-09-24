"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { candidate, navItems } from "@/data/campaign";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 w-full transition-colors duration-300 ${
        scrolled || open
          ? "border-b border-ink/10 bg-sand shadow-[0_10px_30px_-22px_rgba(6,26,49,0.5)]"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-3.5 sm:px-8 lg:px-12">
        <a href="#inicio" className="flex items-center gap-3" aria-label="Inicio">
          <span
            className={`flex h-11 w-11 items-end justify-center overflow-hidden rounded-t-full border ${
              scrolled || open
                ? "border-ink/20 bg-ink text-white"
                : "border-white/25 bg-white/10 text-white"
            }`}
          >
            <span className="mb-1.5 font-display text-sm font-extrabold tracking-tight">
              RE
            </span>
          </span>
          <span className="flex flex-col leading-none whitespace-nowrap">
            <span
              className={`font-display text-base font-extrabold tracking-tight ${
                scrolled || open ? "text-ink" : "text-white"
              }`}
            >
              {candidate.name}
            </span>
            <span
              className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${
                scrolled || open ? "text-brand" : "text-accent"
              }`}
            >
              Alcalde de Latacunga
            </span>
          </span>
        </a>

        <nav className="hidden items-center gap-1 xl:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                scrolled
                  ? "text-ink/70 hover:bg-ink/5 hover:text-ink"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href="#sumate"
            className={`hidden rounded-full px-5 py-2.5 text-sm font-bold transition sm:inline-flex ${
              scrolled
                ? "bg-brand text-white hover:bg-brand-dark"
                : "bg-accent text-ink hover:bg-accent-dark hover:text-white"
            }`}
          >
            Súmate
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
            className={`inline-flex h-11 w-11 items-center justify-center rounded-full border transition xl:hidden ${
              scrolled || open
                ? "border-ink/15 text-ink"
                : "border-white/25 text-white"
            }`}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-ink/10 bg-sand xl:hidden">
          <nav className="mx-auto flex w-full max-w-7xl flex-col px-5 py-3 sm:px-8">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-3 text-base font-semibold text-ink/80 transition hover:bg-ink/5 hover:text-ink"
              >
                {item.label}
              </a>
            ))}
            <a
              href="#sumate"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-full bg-brand px-5 py-3 text-center text-base font-bold text-white"
            >
              Súmate a la campaña
            </a>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
