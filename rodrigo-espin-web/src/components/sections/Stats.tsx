"use client";

import { useEffect, useRef, useState } from "react";
import { stats, type Tone } from "@/data/campaign";
import { Container } from "@/components/ui/Layout";

const toneStyles: Record<Tone, string> = {
  brand: "text-brand",
  accent: "text-accent-dark",
  signal: "text-signal-dark",
};

function useCountUp(target: number, active: boolean, duration = 1600) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return;
    let frame = 0;
    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [active, target, duration]);

  return value;
}

function StatCard({
  value,
  suffix,
  label,
  tone,
  active,
}: {
  value: number;
  suffix: string;
  label: string;
  tone: Tone;
  active: boolean;
}) {
  const current = useCountUp(value, active);
  return (
    <div className="rounded-3xl border border-ink/10 bg-white p-7 shadow-[0_1px_0_rgba(6,26,49,0.04)]">
      <div className={`font-display text-4xl font-extrabold tracking-tight sm:text-5xl ${toneStyles[tone]}`}>
        {current}
        <span className="text-2xl sm:text-3xl">{suffix}</span>
      </div>
      <p className="mt-3 text-sm font-medium leading-relaxed text-ink/65">{label}</p>
    </div>
  );
}

export function Stats() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="bg-sand py-16 sm:py-20">
      <Container>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} active={active} />
          ))}
        </div>
      </Container>
    </div>
  );
}
