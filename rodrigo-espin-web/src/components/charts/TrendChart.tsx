"use client";

import { motion } from "framer-motion";
import { useId } from "react";

export interface TrendPoint {
  label: string;
  value: number;
}

export function TrendChart({
  points,
  color = "#0fb5a3",
  suffix = "%",
  max,
  caption,
}: {
  points: TrendPoint[];
  color?: string;
  suffix?: string;
  max?: number;
  caption?: string;
}) {
  const id = useId().replace(/:/g, "");
  const W = 660;
  const H = 300;
  const padX = 44;
  const padTop = 28;
  const padBottom = 48;
  const innerW = W - padX * 2;
  const innerH = H - padTop - padBottom;

  const maxValue = max ?? Math.ceil(Math.max(...points.map((p) => p.value)) / 10) * 10;
  const stepX = points.length > 1 ? innerW / (points.length - 1) : 0;

  const coords = points.map((p, i) => ({
    ...p,
    x: padX + stepX * i,
    y: padTop + innerH - (p.value / maxValue) * innerH,
  }));

  const linePath = coords
    .map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
    .join(" ");

  const areaPath = `${linePath} L ${coords[coords.length - 1].x.toFixed(1)} ${(
    padTop + innerH
  ).toFixed(1)} L ${coords[0].x.toFixed(1)} ${(padTop + innerH).toFixed(1)} Z`;

  const gridLines = 4;

  return (
    <figure className="w-full">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img">
        <defs>
          <linearGradient id={`area-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {Array.from({ length: gridLines + 1 }).map((_, i) => {
          const y = padTop + (innerH / gridLines) * i;
          const val = Math.round(maxValue - (maxValue / gridLines) * i);
          return (
            <g key={i}>
              <line
                x1={padX}
                y1={y}
                x2={W - padX}
                y2={y}
                stroke="rgba(6,26,49,0.09)"
                strokeWidth="1"
                strokeDasharray={i === gridLines ? "0" : "4 6"}
              />
              <text x={padX - 12} y={y + 4} textAnchor="end" fontSize="13" fill="rgba(6,26,49,0.45)">
                {val}
                {suffix}
              </text>
            </g>
          );
        })}

        <motion.path
          d={areaPath}
          fill={`url(#area-${id})`}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 1.2, delay: 0.4 }}
        />

        <motion.path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
        />

        {coords.map((c, i) => (
          <motion.g
            key={c.label}
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.35, delay: 0.9 + i * 0.06 }}
          >
            <circle cx={c.x} cy={c.y} r="6" fill="#fff" stroke={color} strokeWidth="3.5" />
            <text x={c.x} y={c.y - 16} textAnchor="middle" fontSize="13" fontWeight="700" fill="#061a31">
              {c.value}
              {suffix}
            </text>
            <text
              x={c.x}
              y={H - padBottom + 26}
              textAnchor="middle"
              fontSize="13"
              fill="rgba(6,26,49,0.55)"
            >
              {c.label}
            </text>
          </motion.g>
        ))}
      </svg>
      {caption ? <figcaption className="mt-2 text-xs text-ink/50">{caption}</figcaption> : null}
    </figure>
  );
}
