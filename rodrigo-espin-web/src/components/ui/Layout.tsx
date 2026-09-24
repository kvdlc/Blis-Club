import type { ReactNode } from "react";

export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12 ${className}`}>
      {children}
    </div>
  );
}

export function Eyebrow({
  children,
  tone = "brand",
  className = "",
}: {
  children: ReactNode;
  tone?: "brand" | "accent" | "signal" | "light";
  className?: string;
}) {
  const tones: Record<string, string> = {
    brand: "bg-brand-soft text-brand-dark",
    accent: "bg-accent-soft text-accent-dark",
    signal: "bg-signal-soft text-signal-dark",
    light: "bg-white/10 text-white ring-1 ring-white/20",
  };
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.16em] ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  tone = "brand",
  light = false,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  tone?: "brand" | "accent" | "signal" | "light";
  light?: boolean;
}) {
  return (
    <div
      className={`flex max-w-3xl flex-col gap-4 ${
        align === "center" ? "mx-auto items-center text-center" : "items-start"
      }`}
    >
      {eyebrow ? <Eyebrow tone={tone}>{eyebrow}</Eyebrow> : null}
      <h2
        className={`font-display text-3xl font-extrabold leading-[1.08] tracking-tight text-balance sm:text-4xl lg:text-5xl ${
          light ? "text-white" : "text-ink"
        }`}
      >
        {title}
      </h2>
      {description ? (
        <p className={`text-base leading-relaxed sm:text-lg ${light ? "text-white/75" : "text-ink/70"}`}>
          {description}
        </p>
      ) : null}
    </div>
  );
}
