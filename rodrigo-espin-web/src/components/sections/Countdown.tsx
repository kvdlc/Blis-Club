"use client";

import { useEffect, useState } from "react";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function diff(target: number): TimeLeft {
  const total = Math.max(0, target - Date.now());
  return {
    days: Math.floor(total / 86_400_000),
    hours: Math.floor((total / 3_600_000) % 24),
    minutes: Math.floor((total / 60_000) % 60),
    seconds: Math.floor((total / 1000) % 60),
  };
}

export function Countdown({ targetISO }: { targetISO: string }) {
  const target = new Date(targetISO).getTime();
  const [time, setTime] = useState<TimeLeft | null>(null);

  useEffect(() => {
    const tick = () => setTime(diff(target));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [target]);

  const items: { label: string; value: number | null }[] = [
    { label: "Días", value: time?.days ?? null },
    { label: "Horas", value: time?.hours ?? null },
    { label: "Min", value: time?.minutes ?? null },
    { label: "Seg", value: time?.seconds ?? null },
  ];

  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-2xl border border-white/10 bg-white/[0.06] px-2 py-3 text-center backdrop-blur-sm"
        >
          <div className="font-display text-2xl font-extrabold tabular-nums text-white sm:text-3xl">
            {item.value === null ? "--" : String(item.value).padStart(2, "0")}
          </div>
          <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/55 sm:text-xs">
            {item.label}
          </div>
        </div>
      ))}
    </div>
  );
}
