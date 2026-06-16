"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Vehicle, FuelLog, MaintenanceLog, VehicleUpgrade } from "@/types/database";
import {
  ChevronDown, Gauge, Droplets, Wrench, ShoppingBag, Shield, FileDown,
  Plus, Trash2, X, RotateCw, TrendingUp, BarChart3, Fuel, ScrollText,
  Sparkles, CheckCircle2, Circle, AlertTriangle, Calendar,
  Palette, Smartphone, Zap, Armchair, Pin, Ban,
} from "lucide-react";
import { DatePicker } from "@/components/DatePicker";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from "recharts";

/* ═══════════════════════════ Tipos y datos ═══════════════════════ */
const maintTypes = [
  { value: "preventivo", label: "Preventivo", icon: "🔧" },
  { value: "correctivo", label: "Correctivo", icon: "🛠️" },
  { value: "lavado", label: "Lavado", icon: "🧽" },
  { value: "inspeccion", label: "Inspección", icon: "🔍" },
  { value: "otro", label: "Otro", icon: "📌" },
];

const maintIconMap: Record<string, React.ReactNode> = {
  "🔧": <Wrench className="w-3.5 h-3.5 text-auto-500" />,
  "🛠️": <Wrench className="w-3.5 h-3.5 text-amber-400" />,
  "🧽": <Droplets className="w-3.5 h-3.5 text-blue-400" />,
  "🔍": <Gauge className="w-3.5 h-3.5 text-violet-400" />,
  "📌": <Pin className="w-3.5 h-3.5 text-zinc-400" />,
};

const upgradeCats = [
  { value: "estetico", label: "Estético", icon: "🎨" },
  { value: "tecnologico", label: "Tecnológico", icon: "📱" },
  { value: "performance", label: "Performance", icon: "⚡" },
  { value: "seguridad", label: "Seguridad", icon: "🛡️" },
  { value: "confort", label: "Confort", icon: "🛋️" },
  { value: "otro", label: "Otro", icon: "📌" },
];

const upgradeIconMap: Record<string, React.ReactNode> = {
  "🎨": <Palette className="w-3.5 h-3.5 inline text-violet-400" />,
  "📱": <Smartphone className="w-3.5 h-3.5 inline text-blue-400" />,
  "⚡": <Zap className="w-3.5 h-3.5 inline text-amber-400" />,
  "🛡️": <Shield className="w-3.5 h-3.5 inline text-emerald-400" />,
  "🛋️": <Armchair className="w-3.5 h-3.5 inline text-orange-400" />,
  "📌": <Pin className="w-3.5 h-3.5 inline text-zinc-400" />,
};

type TimelineItem = { type: "fuel"; data: FuelLog } | { type: "maintenance"; data: MaintenanceLog };

interface Props {
  userId: string;
  vehicle: Vehicle | null;
  fuelLogs: FuelLog[];
  maintenances: MaintenanceLog[];
  upgrades: VehicleUpgrade[];
}

export default function BitacoraClient({ userId, vehicle, fuelLogs, maintenances, upgrades }: Props) {
  const router = useRouter();

  if (!vehicle) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-400">Registra un vehículo primero.</p>
        <button onClick={() => router.push("/auto/app/perfil/vehiculo/nuevo")}
          className="mt-3 px-4 py-2 rounded-xl bg-auto-600 text-white text-sm font-bold">
          Agregar vehículo
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-auto-600/10 border border-auto-600/20 flex items-center justify-center">
          <Gauge className="w-5 h-5 text-auto-500" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-zinc-100">Bitácora</h1>
          <p className="text-xs text-zinc-500">{vehicle.marca} {vehicle.modelo} · {vehicle.kilometraje.toLocaleString("es-PE")} km</p>
        </div>
      </div>

      <TimelineSection fuelLogs={fuelLogs} maintenances={maintenances} vehicleId={vehicle.id} />
      <FinanceChartsSection fuelLogs={fuelLogs} maintenances={maintenances} />
      <WarrantySection vehicle={vehicle} maintenances={maintenances} />
      <UpgradesSection vehicleId={vehicle.id} initialUpgrades={upgrades} />
      <TireRotationSection />
      <CarfaxExportSection vehicle={vehicle} fuelLogs={fuelLogs} maintenances={maintenances} upgrades={upgrades} />
    </div>
  );
}

/* ═══════════════════════════ 1. Línea de Tiempo ═══════════════════════ */
function TimelineSection({ fuelLogs, maintenances, vehicleId }: {
  fuelLogs: FuelLog[]; maintenances: MaintenanceLog[]; vehicleId: string;
}) {
  const [addingFuel, setAddingFuel] = useState(false);
  const [addingMaint, setAddingMaint] = useState(false);
  const [fuelLogsState, setFuelLogsState] = useState(fuelLogs);
  const [maintsState, setMaintsState] = useState(maintenances);

  const timeline: TimelineItem[] = [
    ...fuelLogsState.map((f) => ({ type: "fuel" as const, data: f })),
    ...maintsState.map((m) => ({ type: "maintenance" as const, data: m })),
  ].sort((a, b) => new Date(b.data.fecha).getTime() - new Date(a.data.fecha).getTime());

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-zinc-300 flex items-center gap-2">
          <ScrollText className="w-4 h-4 text-auto-500" /> Línea de Tiempo
        </h2>
        <div className="flex gap-1.5">
          <button onClick={() => { setAddingFuel(!addingFuel); setAddingMaint(false); }} className="px-2.5 py-1.5 rounded-lg bg-auto-600/10 border border-auto-600/20 text-[10px] font-bold text-auto-500 hover:bg-auto-600/20 transition-colors flex items-center gap-1">
            <Fuel className="w-3 h-3" /> Carga
          </button>
          <button onClick={() => { setAddingMaint(!addingMaint); setAddingFuel(false); }}
            className="px-2.5 py-1.5 rounded-lg bg-auto-600/10 border border-auto-600/20 text-[10px] font-bold text-auto-500 hover:bg-auto-600/20 transition-colors flex items-center gap-1">
            <Wrench className="w-3 h-3" /> Servicio
          </button>
        </div>
      </div>

      {addingFuel && <AddFuelForm vehicleId={vehicleId} onDone={(f) => { if (f) setFuelLogsState([f, ...fuelLogsState]); setAddingFuel(false); }} />}
      {addingMaint && <AddMaintForm vehicleId={vehicleId} onDone={(m) => { if (m) setMaintsState([m, ...maintsState]); setAddingMaint(false); }} />}

      <div className="space-y-2">
        {timeline.length === 0 ? (
          <p className="text-xs text-zinc-500 text-center py-4">Sin eventos registrados. Agrega tu primera carga o mantenimiento.</p>
        ) : (
          timeline.slice(0, 10).map((item) => (
            <div key={`${item.type}-${item.data.id}`} className={`card-auto-dark rounded-2xl p-3 flex items-center gap-3 border-l-2 ${item.type === "fuel" ? "border-l-amber-500" : "border-l-blue-500"}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.type === "fuel" ? "bg-amber-500/10 border border-amber-500/20" : "bg-blue-500/10 border border-blue-500/20"}`}>
                {item.type === "fuel" ? <Fuel className="w-5 h-5 text-amber-400" /> : <Wrench className="w-5 h-5 text-blue-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-zinc-100">
                  {item.type === "fuel" ? (
                    <>{(item.data as FuelLog).litros} L · S/ {(item.data as FuelLog).precio_por_galon}/gal</>
                  ) : (
                    <>{(item.data as MaintenanceLog).titulo}</>
                  )}
                </p>
                <p className="text-[10px] text-zinc-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(item.data.fecha + "T12:00:00").toLocaleDateString("es-PE")}
                  {item.type === "fuel" && ` · ${(item.data as FuelLog).odometro.toLocaleString("es-PE")} km`}
                </p>
              </div>
              <span className="text-xs font-bold text-zinc-300 shrink-0">
                S/ {Math.round(
                  item.type === "fuel"
                    ? (item.data as FuelLog).precio_por_galon * ((item.data as FuelLog).litros / 3.78541)
                    : (item.data as MaintenanceLog).costo || 0
                ).toLocaleString("es-PE")}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════ Forms ═══════════════════════ */
function AddFuelForm({ vehicleId, onDone }: { vehicleId: string; onDone: (f: FuelLog | null) => void }) {
  const [form, setForm] = useState({ litros: "", precio_por_galon: "", odometro: "", fecha: new Date().toISOString().split("T")[0], tipo: "regular" });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    const l = parseFloat(form.litros);
    const p = parseFloat(form.precio_por_galon);
    const o = parseInt(form.odometro);
    if (!l || !p || !o) return;
    setSaving(true);
    const supabase = createClient();
    const { data } = await supabase.from("fuel_logs").insert({
      vehicle_id: vehicleId, litros: l, precio_por_galon: p, odometro: o, fecha: form.fecha, tipo_combustible: form.tipo,
    }).select().single();
    if (data) {
      await supabase.from("vehicles").update({ kilometraje: o }).eq("id", vehicleId);
    }
    setSaving(false);
    if (data) onDone(data as FuelLog);
  };

  return (
    <div className="card-auto-dark rounded-2xl p-4 space-y-2 border border-amber-500/20">
      <div className="grid grid-cols-4 gap-1.5">
        <input type="number" step="0.1" value={form.litros} onChange={(e) => setForm({ ...form, litros: e.target.value })} placeholder="Litros" className="px-2 py-1.5 rounded-lg border border-white/10 text-xs bg-white/5 text-zinc-200" />
        <input type="number" step="0.01" value={form.precio_por_galon} onChange={(e) => setForm({ ...form, precio_por_galon: e.target.value })} placeholder="S/ gal" className="px-2 py-1.5 rounded-lg border border-white/10 text-xs bg-white/5 text-zinc-200" />
        <input type="number" value={form.odometro} onChange={(e) => setForm({ ...form, odometro: e.target.value })} placeholder="Odom." className="px-2 py-1.5 rounded-lg border border-white/10 text-xs bg-white/5 text-zinc-200" />
        <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} className="px-1 py-1.5 rounded-lg border border-white/10 text-xs bg-white/5 text-zinc-200">
          <option value="regular">Regular</option>
          <option value="premium">Premium</option>
          <option value="diesel">Diésel</option>
          <option value="glp">GLP</option>
          <option value="gnv">GNV</option>
        </select>
      </div>
      <DatePicker colorTheme="auto" value={form.fecha} onChange={(d) => setForm({ ...form, fecha: d })} />
      <div className="flex gap-1.5">
        <button onClick={handleSubmit} disabled={saving} className="flex-1 px-3 py-1.5 rounded-lg bg-auto-600 text-white text-xs font-bold">{saving ? "..." : "Guardar"}</button>
        <button onClick={() => onDone(null!)} className="px-3 py-1.5 rounded-lg bg-white/10 text-zinc-400 text-xs"><X className="w-3.5 h-3.5" /></button>
      </div>
    </div>
  );
}

function AddMaintForm({ vehicleId, onDone }: { vehicleId: string; onDone: (m: MaintenanceLog | null) => void }) {
  const [form, setForm] = useState({ tipo: "preventivo", titulo: "", costo: "", odometro: "", taller: "", fecha: new Date().toISOString().split("T")[0] });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!form.titulo) return;
    setSaving(true);
    const supabase = createClient();
    const { data } = await supabase.from("maintenance_logs").insert({
      vehicle_id: vehicleId, tipo: form.tipo, titulo: form.titulo,
      costo: form.costo ? parseFloat(form.costo) : null,
      odometro: form.odometro ? parseInt(form.odometro) : null,
      taller: form.taller || null, fecha: form.fecha,
    }).select().single();
    if (data && form.odometro) {
      await supabase.from("vehicles").update({ kilometraje: parseInt(form.odometro) }).eq("id", vehicleId);
    }
    setSaving(false);
    if (data) onDone(data as MaintenanceLog);
  };

  return (
    <div className="card-auto-dark rounded-2xl p-4 space-y-2 border border-blue-500/20">
      <input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} placeholder="Título del mantenimiento" className="w-full px-2 py-1.5 rounded-lg border border-white/10 text-xs bg-white/5 text-zinc-200" />
      <div className="grid grid-cols-2 gap-1.5">
        <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} className="px-2 py-1.5 rounded-lg border border-white/10 text-xs bg-white/5 text-zinc-200">
          {maintTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <input type="number" step="0.01" value={form.costo} onChange={(e) => setForm({ ...form, costo: e.target.value })} placeholder="S/ costo" className="px-2 py-1.5 rounded-lg border border-white/10 text-xs bg-white/5 text-zinc-200" />
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        <input type="number" value={form.odometro} onChange={(e) => setForm({ ...form, odometro: e.target.value })} placeholder="Odómetro" className="px-2 py-1.5 rounded-lg border border-white/10 text-xs bg-white/5 text-zinc-200" />
        <input value={form.taller} onChange={(e) => setForm({ ...form, taller: e.target.value })} placeholder="Taller" className="px-2 py-1.5 rounded-lg border border-white/10 text-xs bg-white/5 text-zinc-200" />
      </div>
      <DatePicker colorTheme="auto" value={form.fecha} onChange={(d) => setForm({ ...form, fecha: d })} />
      <div className="flex gap-1.5">
        <button onClick={handleSubmit} disabled={saving} className="flex-1 px-3 py-1.5 rounded-lg bg-auto-600 text-white text-xs font-bold">Guardar</button>
        <button onClick={() => onDone(null!)} className="px-3 py-1.5 rounded-lg bg-white/10 text-zinc-400 text-xs"><X className="w-3.5 h-3.5" /></button>
      </div>
    </div>
  );
}

/* ═══════════════════════════ 2. Gráficos Financieros ═══════════════════════ */
const MESES_CORTOS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

function FinanceChartsSection({ fuelLogs, maintenances }: { fuelLogs: FuelLog[]; maintenances: MaintenanceLog[] }) {
  const [showRendimiento, setShowRendimiento] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showProyeccion, setShowProyeccion] = useState(false);

  const monthlyData = (() => {
    const ahora = new Date();
    const months: { key: string; label: string; combustible: number; mantenimiento: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
      months.push({ key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`, label: MESES_CORTOS[d.getMonth()], combustible: 0, mantenimiento: 0 });
    }
    fuelLogs.forEach((f) => {
      const m = `${new Date(f.fecha).getFullYear()}-${String(new Date(f.fecha).getMonth() + 1).padStart(2, "0")}`;
      const entry = months.find((x) => x.key === m);
      if (entry) entry.combustible += Math.round(f.precio_por_galon * (f.litros / 3.78541));
    });
    maintenances.forEach((m) => {
      const key = `${new Date(m.fecha).getFullYear()}-${String(new Date(m.fecha).getMonth() + 1).padStart(2, "0")}`;
      const entry = months.find((x) => x.key === key);
      if (entry) entry.mantenimiento += Math.round(m.costo || 0);
    });
    return months;
  })();

  const gastoTotal = monthlyData.reduce((s, m) => s + m.combustible + m.mantenimiento, 0);

  const rendimientoData = (() => {
    if (fuelLogs.length < 2) return [];
    const sorted = [...fuelLogs].sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
    const puntos: { fecha: string; kmgal: number; odometro: number }[] = [];
    for (let i = 1; i < sorted.length; i++) {
      const km = sorted[i].odometro - sorted[i - 1].odometro;
      const gal = sorted[i - 1].litros / 3.78541;
      if (km > 0 && gal > 0) {
        puntos.push({ fecha: new Date(sorted[i].fecha).toLocaleDateString("es-PE", { day: "numeric", month: "short" }), kmgal: Math.round(km / gal), odometro: sorted[i].odometro });
      }
    }
    return puntos;
  })();

  const heatmapData = (() => {
    const ahora = new Date();
    const yearStart = new Date(ahora.getFullYear(), 0, 1);
    const cells: { date: Date; gasto: number; level: number }[] = [];
    const gastosPorFecha: Record<string, number> = {};
    fuelLogs.forEach((f) => { gastosPorFecha[f.fecha] = (gastosPorFecha[f.fecha] || 0) + Math.round(f.precio_por_galon * (f.litros / 3.78541)); });
    maintenances.forEach((m) => { gastosPorFecha[m.fecha] = (gastosPorFecha[m.fecha] || 0) + Math.round(m.costo || 0); });
    const startDay = yearStart.getDay();
    const mondayStart = startDay === 0 ? 6 : startDay - 1;
    for (let d = -mondayStart; d < 365; d++) {
      const date = new Date(ahora.getFullYear(), 0, d + 1);
      const key = date.toISOString().split("T")[0];
      const gasto = gastosPorFecha[key] || 0;
      cells.push({ date, gasto, level: gasto === 0 ? 0 : gasto < 50 ? 1 : gasto < 150 ? 2 : gasto < 300 ? 3 : 4 });
    }
    return cells;
  })();

  const proyeccionAnual = (() => {
    if (monthlyData.length === 0) return 0;
    const recent = monthlyData.slice(-3);
    const avg = recent.reduce((s, m) => s + m.combustible + m.mantenimiento, 0) / recent.length;
    return Math.round(avg * 12);
  })();

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-bold text-zinc-300 flex items-center gap-2">
        <BarChart3 className="w-4 h-4 text-auto-500" /> Gráficos Financieros
      </h2>
      <div className="card-auto-dark rounded-2xl p-4 space-y-4">
        {gastoTotal === 0 ? (
          <p className="text-xs text-zinc-500 text-center py-4">Sin datos de gastos. Registra cargas y mantenimientos.</p>
        ) : (
          <>
            <div>
              <p className="text-[10px] font-extrabold text-zinc-400 mb-2">Gasto mensual (12 meses)</p>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="label" tick={{ fontSize: 9, fill: "#a1a1aa" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 9, fill: "#a1a1aa" }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)", fontSize: 11 }} />
                    <Bar dataKey="combustible" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} name="Combustible" />
                    <Bar dataKey="mantenimiento" stackId="a" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Mantenimiento" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <button onClick={() => setShowRendimiento(!showRendimiento)} className="w-full text-left py-2 border-t border-white/5">
              <p className="text-[10px] font-extrabold text-zinc-400 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Rendimiento histórico {rendimientoData.length > 0 ? `(${rendimientoData.length} puntos)` : ""}
                <span className="ml-auto text-[9px] text-zinc-500">{showRendimiento ? "▲" : "▼"}</span>
              </p>
            </button>
            {showRendimiento && rendimientoData.length > 0 && (
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={rendimientoData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="fecha" tick={{ fontSize: 8, fill: "#a1a1aa" }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                    <YAxis tick={{ fontSize: 9, fill: "#a1a1aa" }} axisLine={false} tickLine={false} domain={["auto", "auto"]} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)", fontSize: 11 }} formatter={(v: number) => [`${v} km/gal`, "Rendimiento"]} />
                    <Line type="monotone" dataKey="kmgal" stroke="#10b981" strokeWidth={2} dot={{ r: 2, fill: "#10b981" }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            <button onClick={() => setShowHeatmap(!showHeatmap)} className="w-full text-left py-2 border-t border-white/5">
              <p className="text-[10px] font-extrabold text-zinc-400 flex items-center gap-1">
                <BarChart3 className="w-3 h-3" /> Mapa de gasto anual <span className="ml-auto text-[9px] text-zinc-500">{showHeatmap ? "▲" : "▼"}</span>
              </p>
            </button>
            {showHeatmap && (
              <div>
                <div className="flex gap-0.5 mb-1">
                  {["L", "M", "X", "J", "V", "S", "D"].map((d, i) => (
                    <span key={i} className="text-[8px] text-zinc-500 w-3.5 text-center">{d}</span>
                  ))}
                </div>
                <div className="grid grid-cols-[repeat(53,1fr)] gap-[1px]">
                  {heatmapData.map((cell, i) => (
                    <div key={i} title={`${cell.date.toLocaleDateString("es-PE")}: S/ ${cell.gasto}`}
                      className={`aspect-square rounded-[1px] ${
                        cell.level === 0 ? "bg-white/5" : cell.level === 1 ? "bg-auto-200" : cell.level === 2 ? "bg-auto-500" : cell.level === 3 ? "bg-auto-600" : "bg-auto-700"
                      }`} />
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-2 justify-center">
                  <span className="text-[8px] text-zinc-500">Menos</span>
                  {[0, 1, 2, 3, 4].map((l) => (
                    <div key={l} className={`w-2.5 h-2.5 rounded-sm ${l === 0 ? "bg-white/5" : l === 1 ? "bg-auto-200" : l === 2 ? "bg-auto-500" : l === 3 ? "bg-auto-600" : "bg-auto-700"}`} />
                  ))}
                  <span className="text-[8px] text-zinc-500">Más</span>
                </div>
              </div>
            )}

            <button onClick={() => setShowProyeccion(!showProyeccion)} className="w-full text-left py-2 border-t border-white/5">
              <p className="text-[10px] font-extrabold text-zinc-400 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Proyección anual <span className="ml-auto text-[9px] text-zinc-500">{showProyeccion ? "▲" : "▼"}</span>
              </p>
            </button>
            {showProyeccion && (
              <div className="bg-auto-600/10 rounded-2xl p-3 border border-auto-600/20">
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center">
                    <p className="text-[10px] text-zinc-500">Gasto estimado</p>
                    <p className="text-lg font-black text-auto-500">S/ {proyeccionAnual.toLocaleString("es-PE")}</p>
                    <p className="text-[9px] text-zinc-500">próximos 12 meses</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-zinc-500">Por mes</p>
                    <p className="text-lg font-black text-zinc-100">S/ {Math.round(proyeccionAnual / 12).toLocaleString("es-PE")}</p>
                    <p className="text-[9px] text-zinc-500">promedio proyectado</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-zinc-500">Tendencia</p>
                    <p className={`text-lg font-black ${proyeccionAnual > 0 ? "text-amber-400" : "text-zinc-500"}`}>{proyeccionAnual > 0 ? "→" : "—"}</p>
                    <p className="text-[9px] text-zinc-500">basado en 3 meses</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════ 3. Control de Garantía ═══════════════════════ */
function WarrantySection({ vehicle, maintenances }: { vehicle: Vehicle; maintenances: MaintenanceLog[] }) {
  const garantiaKm = 60000;
  const kmRestantes = Math.max(0, garantiaKm - vehicle.kilometraje);
  const kmPct = Math.min(100, (vehicle.kilometraje / garantiaKm) * 100);
  const enConcesionaria = maintenances.filter((m) => m.tipo === "preventivo" && m.taller).length;

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-bold text-zinc-300 flex items-center gap-2">
        <Shield className="w-4 h-4 text-auto-500" /> Control de Garantía
      </h2>
      <div className="card-auto-dark rounded-2xl p-4 space-y-3">
        <div>
          <div className="flex justify-between text-[10px] mb-1">
            <span className="font-bold text-zinc-400">Garantía: {garantiaKm.toLocaleString("es-PE")} km</span>
            <span className="font-bold text-zinc-400">{vehicle.kilometraje.toLocaleString("es-PE")} km actual</span>
          </div>
          <div className="h-4 bg-white/5 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${kmPct > 90 ? "bg-red-500" : kmPct > 70 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${kmPct}%` }} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <p className="text-[10px] text-zinc-500">Km restantes</p>
            <p className="text-sm font-bold text-zinc-100">{kmRestantes.toLocaleString("es-PE")}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <p className="text-[10px] text-zinc-500">En concesionaria</p>
            <p className="text-sm font-bold text-zinc-100">{enConcesionaria} visitas</p>
          </div>
        </div>
        <p className="text-[10px] text-zinc-500 text-center">
          {kmPct > 90 ? <span className="text-red-400 flex items-center gap-1 justify-center"><AlertTriangle className="w-3 h-3" /> La garantía está por vencer por kilometraje.</span> :
           kmPct > 70 ? <span className="text-amber-400 flex items-center gap-1 justify-center"><AlertTriangle className="w-3 h-3" /> Acercándote al límite de garantía.</span> :
           <span className="text-emerald-400 flex items-center gap-1 justify-center"><CheckCircle2 className="w-3 h-3" /> Aún dentro del período de garantía.</span>}
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════ 4. Upgrades ═══════════════════════ */
function UpgradesSection({ vehicleId, initialUpgrades }: { vehicleId: string; initialUpgrades: VehicleUpgrade[] }) {
  const [upgrades, setUpgrades] = useState(initialUpgrades);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ categoria: "estetico", nombre: "", costo: "", fecha: new Date().toISOString().split("T")[0] });
  const [saving, setSaving] = useState(false);

  const totalUpgrades = upgrades.reduce((sum, u) => sum + (u.costo || 0), 0);

  const handleAdd = async () => {
    if (!form.nombre) return;
    setSaving(true);
    const { data } = await createClient().from("vehicle_upgrades").insert({
      vehicle_id: vehicleId, categoria: form.categoria, nombre: form.nombre,
      costo: form.costo ? parseFloat(form.costo) : null, fecha: form.fecha,
    }).select().single();
    setSaving(false);
    if (data) { setUpgrades([data as VehicleUpgrade, ...upgrades]); setAdding(false); setForm({ categoria: "estetico", nombre: "", costo: "", fecha: new Date().toISOString().split("T")[0] }); }
  };

  const handleDelete = async (id: string) => {
    const { error } = await createClient().from("vehicle_upgrades").delete().eq("id", id);
    if (!error) setUpgrades(upgrades.filter((u) => u.id !== id));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-zinc-300 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-auto-500" /> Upgrades y Accesorios
        </h2>
        <button onClick={() => setAdding(!adding)} className="w-8 h-8 rounded-full bg-auto-600/10 border border-auto-600/20 flex items-center justify-center text-auto-500 hover:bg-auto-600/20 transition-colors">
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {adding && (
        <div className="card-auto-dark rounded-2xl p-4 space-y-2">
          <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Nombre de la mejora" className="w-full px-2 py-1.5 rounded-lg border border-white/10 text-xs bg-white/5 text-zinc-200" />
          <div className="grid grid-cols-2 gap-1.5">
            <select value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} className="px-2 py-1.5 rounded-lg border border-white/10 text-xs bg-white/5 text-zinc-200">
              {upgradeCats.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            <input type="number" step="0.01" value={form.costo} onChange={(e) => setForm({ ...form, costo: e.target.value })} placeholder="S/ costo" className="px-2 py-1.5 rounded-lg border border-white/10 text-xs bg-white/5 text-zinc-200" />
          </div>
          <div className="flex gap-1.5">
            <button onClick={handleAdd} disabled={saving} className="flex-1 px-3 py-1.5 rounded-lg bg-auto-600 text-white text-xs font-bold">Guardar</button>
            <button onClick={() => setAdding(false)} className="px-3 py-1.5 rounded-lg bg-white/10 text-zinc-400 text-xs"><X className="w-3.5 h-3.5" /></button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        {upgrades.length === 0 && !adding && (
          <p className="text-xs text-zinc-500 text-center py-4 col-span-2">No hay upgrades registrados</p>
        )}
        {upgrades.map((u) => {
          const cat = upgradeCats.find((c) => c.value === u.categoria);
          return (
            <div key={u.id} className="card-auto-dark rounded-2xl p-3 flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-auto-600/10 border border-auto-600/20 flex items-center justify-center">
                  {upgradeIconMap[cat?.icon || "📌"]}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-zinc-100 truncate">{u.nombre}</p>
                  <p className="text-[10px] text-zinc-500">{cat?.label}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-auto-500">{u.costo ? `S/ ${u.costo.toLocaleString("es-PE")}` : "—"}</span>
                <button onClick={() => handleDelete(u.id)} className="w-6 h-6 rounded-lg hover:bg-red-600/10 flex items-center justify-center text-zinc-500 hover:text-red-500 transition-colors">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════ 5. Rotación de Neumáticos ═══════════════════════ */
function TireRotationSection() {
  type Position = "DI" | "DD" | "TI" | "TD";
  const initial: Record<Position, string> = { DI: "A", DD: "B", TI: "C", TD: "D" };
  const [tires, setTires] = useState<Record<Position, string>>(() => {
    try { const saved = localStorage.getItem("blis_tire_positions"); return saved ? JSON.parse(saved) : { ...initial }; } catch { return { ...initial }; }
  });

  const rotate = () => {
    const newTires = { DI: tires.TI, DD: tires.DI, TI: tires.TD, TD: tires.DD };
    setTires(newTires);
    localStorage.setItem("blis_tire_positions", JSON.stringify(newTires));
  };

  const reset = () => {
    setTires({ ...initial });
    localStorage.setItem("blis_tire_positions", JSON.stringify(initial));
  };

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-bold text-zinc-300 flex items-center gap-2">
        <RotateCw className="w-4 h-4 text-auto-500" /> Rotación de Neumáticos
      </h2>
      <div className="card-auto-dark rounded-2xl p-4 space-y-3">
        <div className="bg-white/5 rounded-2xl p-3">
          <div className="aspect-[3/2] rounded-xl border-2 border-white/10 bg-white/5 relative flex flex-col">
            <div className="flex-1 flex items-center justify-around px-2">
              <TireCircle label={tires.DI} name="Del. Izq." color="bg-auto-600/10 text-auto-500 border-auto-300" />
              <TireCircle label={tires.DD} name="Del. Der." color="bg-auto-600/10 text-auto-500 border-auto-300" />
            </div>
            <div className="h-px mx-8 bg-white/10" />
            <div className="flex-1 flex items-center justify-around px-2">
              <TireCircle label={tires.TI} name="Tras. Izq." color="bg-white/10 text-zinc-400 border-white/15" />
              <TireCircle label={tires.TD} name="Tras. Der." color="bg-white/10 text-zinc-400 border-white/15" />
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={rotate} className="flex-1 py-2.5 rounded-xl bg-auto-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-auto-500 transition-colors">
            <RotateCw className="w-3.5 h-3.5" /> Rotar (cruzado)
          </button>
          <button onClick={reset} className="px-4 py-2.5 rounded-xl bg-white/5 text-zinc-400 text-xs font-medium hover:bg-white/10 transition-colors">
            Reiniciar
          </button>
        </div>
        <p className="text-[10px] text-zinc-500 text-center">Patrón: TI → DI → DD → TD → TI</p>
      </div>
    </div>
  );
}

function TireCircle({ label, name, color }: { label: string; name: string; color: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center shadow-sm ${color}`}>
        <span className="text-base font-black">{label}</span>
      </div>
      <span className="text-[9px] text-zinc-400">{name}</span>
    </div>
  );
}

/* ═══════════════════════════ 6. Exportación Carfax ═══════════════════════ */
function CarfaxExportSection({ vehicle, fuelLogs, maintenances, upgrades }: {
  vehicle: Vehicle; fuelLogs: FuelLog[]; maintenances: MaintenanceLog[]; upgrades: VehicleUpgrade[];
}) {
  const totalEvents = fuelLogs.length + maintenances.length;

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-bold text-zinc-300 flex items-center gap-2">
        <FileDown className="w-4 h-4 text-auto-500" /> Reporte Carfax
      </h2>
      <div className="card-auto-dark rounded-2xl p-4 space-y-3">
        <p className="text-xs text-zinc-400">
          Genera un reporte PDF con todo el historial de mantenimientos, cargas de combustible y mejoras.
        </p>
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white/5 rounded-xl p-2 text-center">
            <p className="text-lg font-black text-amber-400">{fuelLogs.length}</p>
            <p className="text-[9px] text-zinc-500">Cargas</p>
          </div>
          <div className="bg-white/5 rounded-xl p-2 text-center">
            <p className="text-lg font-black text-blue-400">{maintenances.length}</p>
            <p className="text-[9px] text-zinc-500">Mantenimientos</p>
          </div>
          <div className="bg-white/5 rounded-xl p-2 text-center">
            <p className="text-lg font-black text-violet-400">{upgrades.length}</p>
            <p className="text-[9px] text-zinc-500">Mejoras</p>
          </div>
        </div>
        <button
          onClick={() => window.open("/auto/app/bitacora/carfax", "_blank")}
          className="w-full py-3 rounded-xl bg-auto-600 text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-auto-500 transition-colors disabled:opacity-50"
          disabled={totalEvents === 0}>
          <FileDown className="w-4 h-4" />
          Exportar reporte PDF
        </button>
      </div>
    </div>
  );
}
