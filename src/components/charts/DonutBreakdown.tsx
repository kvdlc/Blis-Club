"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

export interface DonutSlice { name: string; value: number; color: string; }

interface Props {
  data: DonutSlice[];
  height?: number;
  centerLabel?: string;
  centerValue?: string;
  formatValue?: (v: number) => string;
}

export function DonutBreakdown({ data, height = 160, centerLabel, centerValue, formatValue }: Props) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const filtered = data.filter((d) => d.value > 0);
  const fmt = (v: number) => formatValue ? formatValue(v) : v.toLocaleString("es-PE");

  return (
    <div className="flex items-center gap-3">
      <div className="relative shrink-0" style={{ width: height, height: height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={filtered.length ? filtered : [{ name: "Sin datos", value: 1, color: "rgba(255,255,255,0.08)" }]}
              dataKey="value" innerRadius="62%" outerRadius="88%" paddingAngle={2} strokeWidth={0}>
              {(filtered.length ? filtered : [{ name: "Sin datos", value: 1, color: "rgba(255,255,255,0.08)" }]).map((s, i) => (
                <Cell key={i} fill={s.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: "#18181b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 11 }}
              formatter={(v: number, n: string) => [fmt(v), n]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {centerValue && <span className="text-lg font-black text-zinc-100 tabular-nums">{centerValue}</span>}
          {centerLabel && <span className="text-[9px] text-zinc-500">{centerLabel}</span>}
        </div>
      </div>
      <div className="flex-1 space-y-1.5">
        {filtered.length === 0 && <p className="text-[10px] text-zinc-500">Sin datos todavía</p>}
        {filtered.map((s) => (
          <div key={s.name} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
            <span className="text-[10px] text-zinc-400 flex-1">{s.name}</span>
            <span className="text-[10px] font-bold text-zinc-200">{fmt(s.value)}</span>
            <span className="text-[9px] text-zinc-500">{total > 0 ? Math.round((s.value / total) * 100) : 0}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
