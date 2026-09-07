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
  valueFormat?: (v: number) => string;
}

export function AreaTrend({ data, dataKey = "value", color = CHART.emerald, color2 = CHART.teal, height = 130, suffix = "", valueFormat }: Props) {
  const fmt = (v: number) => valueFormat ? valueFormat(v) : `${v.toLocaleString("es-PE")}${suffix}`;
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
          <defs>
            <linearGradient id={`area-${color}-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.5} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
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
          <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2}
            fill={`url(#area-${color}-${dataKey})`} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
