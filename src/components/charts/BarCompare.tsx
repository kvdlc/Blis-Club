"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { CHART } from "@/lib/chart-theme";

export interface BarSeries { key: string; label: string; color: string; }
export interface BarRow { label: string; [k: string]: string | number; }

interface Props {
  data: BarRow[];
  series: BarSeries[];
  height?: number;
  stacked?: boolean;
  suffix?: string;
}

export function BarCompare({ data, series, height = 160, stacked = false, suffix = "" }: Props) {
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 9, fill: CHART.axis }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 9, fill: CHART.axis }} axisLine={false} tickLine={false} width={40} />
          <Tooltip
            contentStyle={{ background: "#18181b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 11 }}
            formatter={(v: number, n: string) => [`${v.toLocaleString("es-PE")}${suffix}`, n]}
          />
          <Legend wrapperStyle={{ fontSize: 10, color: CHART.axis }} />
          {series.map((s) => (
            <Bar key={s.key} dataKey={s.key} name={s.label} stackId={stacked ? "a" : undefined}
              fill={s.color} radius={stacked ? 0 : [4, 4, 0, 0]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
