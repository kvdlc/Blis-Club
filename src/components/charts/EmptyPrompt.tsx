"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

interface Props {
  emoji?: string;
  texto: string;
  cta?: string;
  href?: string;
}

export function EmptyPrompt({ emoji = "🌱", texto, cta, href }: Props) {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center text-center py-4 gap-2 px-2">
      <span className="text-2xl">{emoji}</span>
      <p className="text-xs text-zinc-500 max-w-[240px] leading-relaxed">{texto}</p>
      {cta && href && (
        <button
          onClick={() => router.push(href)}
          className="mt-1 px-3 py-1.5 rounded-xl bg-auto-500/15 border border-auto-500/30 text-auto-500 text-[10px] font-bold hover:bg-auto-500/25 transition-colors"
        >
          {cta}
        </button>
      )}
    </div>
  );
}
