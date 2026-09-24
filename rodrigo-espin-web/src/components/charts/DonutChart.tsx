"use client";

import { motion } from "framer-motion";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";

export function DonutChart({
  value,
  label,
  sublabel,
  color = "#1552d4",
  trackColor = "rgba(6,26,49,0.08)",
  size = 190,
  thickness = 18,
  decimals = 0,
  light = false,
}: {
  value: number;
  label: string;
  sublabel?: string;
  color?: string;
  trackColor?: string;
  size?: number;
  thickness?: number;
  decimals?: number;
  light?: boolean;
}) {
  const radius = (size - thickness) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={trackColor}
            strokeWidth={thickness}
          />
          <motion.circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={thickness}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            whileInView={{ strokeDashoffset: circumference * (1 - value / 100) }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <AnimatedNumber
            value={value}
            decimals={decimals}
            suffix="%"
            className={`font-display text-3xl font-extrabold tracking-tight ${
              light ? "text-white" : "text-ink"
            }`}
          />
        </div>
      </div>
      <p className={`mt-4 max-w-[16rem] font-display text-sm font-bold ${light ? "text-white" : "text-ink"}`}>
        {label}
      </p>
      {sublabel ? (
        <p className={`mt-1 max-w-[16rem] text-xs leading-relaxed ${light ? "text-white/60" : "text-ink/55"}`}>
          {sublabel}
        </p>
      ) : null}
    </div>
  );
}
