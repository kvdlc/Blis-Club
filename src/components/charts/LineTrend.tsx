"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { CHART } from "@/lib/chart-theme";

interface Point { label: string; value: number; [k: string]: string | number; }

interface Props {
  data: Point[];
  dataKey?: string;
  color?: string;
  height?: number;
  suffix?: string;
}

export function LineTrend({ data, dataKey = "value", color = CHART.teal, height = 130, suffix = "" }: Props) {
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 9, fill: CHART.axis }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 9, fill: CHART.axis }} axisLine={false} tickLine={false} width={36} domain={["auto", "auto"]} />
          <Tooltip
            contentStyle={{ background: "#18181b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 11 }}
            formatter={(v: number) => [`${v.toLocaleString("es-PE")}${suffix}`, ""]}
          />
          <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={{ r: 2, fill: color }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
