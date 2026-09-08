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
  aurora?: boolean;
}

export function LineTrend({ data, dataKey = "value", color = CHART.teal, height = 130, suffix = "", aurora = true }: Props) {
  const gid = `line-${dataKey}-${aurora ? "aurora" : color}`;
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="1" y2="0">
              {aurora ? (
                <>
                  <stop offset="0%" stopColor={CHART.violet} />
                  <stop offset="50%" stopColor={CHART.cyan} />
                  <stop offset="100%" stopColor={CHART.emerald} />
                </>
              ) : (
                <>
                  <stop offset="0%" stopColor={color} />
                  <stop offset="100%" stopColor={color} />
                </>
              )}
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 9, fill: CHART.axis }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 9, fill: CHART.axis }} axisLine={false} tickLine={false} width={36} domain={["auto", "auto"]} />
          <Tooltip
            contentStyle={{ background: "#18181b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 11 }}
            formatter={(v: number) => [`${v.toLocaleString("es-PE")}${suffix}`, ""]}
          />
          <Line type="monotone" dataKey={dataKey} stroke={`url(#${gid})`} strokeWidth={2.2} dot={{ r: 2.5, fill: CHART.cyan }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
