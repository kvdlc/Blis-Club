"use client";

import { useEffect, useState } from "react";

function computeTarget(): number {
  try {
    const saved = localStorage.getItem("kids_offer_end");
    if (saved) return parseInt(saved, 10);
    const end = Date.now() + 3 * 24 * 60 * 60 * 1000;
    localStorage.setItem("kids_offer_end", String(end));
    return end;
  } catch {
    return Date.now() + 3 * 24 * 60 * 60 * 1000;
  }
}

export function Countdown() {
  const [mounted, setMounted] = useState(false);
  const [end, setEnd] = useState(0);
  const [now, setNow] = useState(0);

  useEffect(() => {
    setEnd(computeTarget());
    setNow(Date.now());
    setMounted(true);
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const diff = Math.max(0, end - now);
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);

  const box = (v: number, l: string) => (
    <div className="flex flex-col items-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl font-black text-violet-700 shadow-md sm:h-16 sm:w-16 sm:text-3xl">
        {mounted ? String(v).padStart(2, "0") : "--"}
      </span>
      <span className="mt-1 text-[10px] font-bold uppercase tracking-widest text-violet-100">{l}</span>
    </div>
  );

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3">
      {box(d, "días")}
      {box(h, "horas")}
      {box(m, "min")}
      {box(s, "seg")}
    </div>
  );
}
