"use client";

import { motion } from "framer-motion";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";

export interface BarItem {
  label: string;
  value: number;
  color?: string;
  note?: string;
}

export function BarList({
  items,
  suffix = "%",
  max = 100,
  light = false,
}: {
  items: BarItem[];
  suffix?: string;
  max?: number;
  light?: boolean;
}) {
  return (
    <ul className="grid gap-5">
      {items.map((item, index) => {
        const pct = Math.min(100, (item.value / max) * 100);
        return (
          <li key={item.label}>
            <div className="flex items-end justify-between gap-4">
              <span
                className={`font-display text-sm font-bold ${
                  light ? "text-white" : "text-ink"
                }`}
              >
                {item.label}
              </span>
              <span className={`font-display text-sm font-extrabold ${light ? "text-white" : "text-ink"}`}>
                <AnimatedNumber value={item.value} suffix={suffix} />
              </span>
            </div>
            <div
              className={`mt-2 h-3 w-full overflow-hidden rounded-full ${
                light ? "bg-white/12" : "bg-ink/8"
              }`}
            >
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: item.color ?? "#1552d4" }}
                initial={{ width: 0 }}
                whileInView={{ width: `${pct}%` }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 1.3, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
            {item.note ? (
              <p className={`mt-1.5 text-xs ${light ? "text-white/55" : "text-ink/50"}`}>
                {item.note}
              </p>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
