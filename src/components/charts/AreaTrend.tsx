"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { CHART } from "@/lib/chart-theme";

interface Point { label: string; value: number; [k: string]: string | number; }

interface Props {
  data: Point[];
  dataKey?: string;
  color?: string;
  color2?: string;
  height?: number;
  suffix?: string;
  // Cuando es true, el gradiente del área va de violeta→cián→emerald (aurora)
  aurora?: boolean;
  valueFormat?: (v: number) => string;
}

export function AreaTrend({ data, dataKey = "value", color = CHART.emerald, color2 = CHART.teal, height = 130, suffix = "", aurora = true, valueFormat }: Props) {
  const fmt = (v: number) => valueFormat ? valueFormat(v) : `${v.toLocaleString("es-PE")}${suffix}`;
  const gid = `area-${dataKey}-${aurora ? "aurora" : color}`;
  const stops = aurora
    ? [
        { offset: "0%", c: CHART.violet },
        { offset: "45%", c: CHART.cyan },
        { offset: "100%", c: CHART.emerald },
      ]
    : [
        { offset: "0%", c: color },
        { offset: "100%", c: color2 },
      ];
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
              {stops.map((s, i) => <stop key={i} offset={s.offset} stopColor={s.c} stopOpacity={aurora ? 0.42 : 0.5} />)}
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 9, fill: CHART.axis }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 9, fill: CHART.axis }} axisLine={false} tickLine={false} width={40}
            tickFormatter={(v: number) => valueFormat ? valueFormat(v) : String(v)} />
          <Tooltip
            contentStyle={{ background: "#18181b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 11 }}
            formatter={(v: number) => [fmt(v), ""]}
          />
          <Area type="monotone" dataKey={dataKey} stroke={aurora ? CHART.cyan : color} strokeWidth={2}
            fill={`url(#${gid})`} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
