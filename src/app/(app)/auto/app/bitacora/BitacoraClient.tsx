"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Vehicle, FuelLog, MaintenanceLog, VehicleUpgrade } from "@/types/database";
import {
  ChevronDown, Gauge, Droplets, Wrench, ShoppingBag, Shield, FileDown,
  Plus, Trash2, Save, X, RotateCw, TrendingDown, TrendingUp, BarChart3,
} from "lucide-react";
import { DatePicker } from "@/components/DatePicker";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from "recharts";

/* ═══════════════════════════ Tipos y datos ═══════════════════════ */
type TimelineItem = { type: "fuel"; data: FuelLog } | { type: "maintenance"; data: MaintenanceLog };

const maintTypes = [
  { value: "preventivo", label: "Preventivo", icon: "🔧" },
  { value: "correctivo", label: "Correctivo", icon: "🛠️" },
  { value: "lavado", label: "Lavado", icon: "🧽" },
  { value: "inspeccion", label: "Inspección", icon: "🔍" },
  { value: "otro", label: "Otro", icon: "📌" },
];

const upgradeCats = [
  { value: "estetico", label: "Estético", icon: "🎨" },
  { value: "tecnologico", label: "Tecnológico", icon: "📱" },
  { value: "performance", label: "Performance", icon: "⚡" },
  { value: "seguridad", label: "Seguridad", icon: "🛡️" },
  { value: "confort", label: "Confort", icon: "🛋️" },
  { value: "otro", label: "Otro", icon: "📌" },
];

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
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-auto-600/15 flex items-center justify-center text-lg">
          <Gauge className="w-5 h-5 text-auto-400" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-zinc-200">Bitácora</h1>
          <p className="text-xs text-zinc-400">{vehicle.marca} {vehicle.modelo} · {vehicle.kilometraje.toLocaleString("es-PE")} km</p>
        </div>
      </div>

      <div className="space-y-2">
        <TimelineSection fuelLogs={fuelLogs} maintenances={maintenances} vehicleId={vehicle.id} />
        <FinanceChartsSection fuelLogs={fuelLogs} maintenances={maintenances} />
        <WarrantySection vehicle={vehicle} maintenances={maintenances} />
        <UpgradesSection vehicleId={vehicle.id} initialUpgrades={upgrades} />
        <TireRotationSection />
        <CarfaxExportSection vehicle={vehicle} fuelLogs={fuelLogs} maintenances={maintenances} upgrades={upgrades} />
      </div>
    </div>
  );
}

/* ═══════════════════════════ 1. Línea de Tiempo ═══════════════════════ */
function TimelineSection({ fuelLogs, maintenances, vehicleId }: {
  fuelLogs: FuelLog[]; maintenances: MaintenanceLog[]; vehicleId: string;
}) {
  const [open, setOpen] = useState(false);
  const [addingFuel, setAddingFuel] = useState(false);
  const [addingMaint, setAddingMaint] = useState(false);
  const [fuelLogsState, setFuelLogsState] = useState(fuelLogs);
  const [maintsState, setMaintsState] = useState(maintenances);

  // Merge and sort
  const timeline: TimelineItem[] = [
    ...fuelLogsState.map((f) => ({ type: "fuel" as const, data: f })),
    ...maintsState.map((m) => ({ type: "maintenance" as const, data: m })),
  ].sort((a, b) => new Date(b.data.fecha).getTime() - new Date(a.data.fecha).getTime());

  return (
    <div className="card-auto-dark rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl">📜</span>
          <div>
            <p className="text-sm font-bold text-zinc-200">Línea de Tiempo</p>
            <p className="text-[10px] text-zinc-500">{timeline.length} eventos registrados</p>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-zinc-500 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-2">
          {/* Botones de agregar */}
          <div className="flex gap-2 mb-2">
          <button onClick={() => { setAddingFuel(!addingFuel); setAddingMaint(false); }} className="flex-1 py-2 rounded-xl border-2 border-dashed border-white/10 text-[10px] font-bold text-zinc-500 hover:border-auto-300 hover:text-auto-500 flex items-center justify-center gap-1">
            <Plus className="w-3 h-3" /> Carga combustible
          </button>
          <button onClick={() => { setAddingMaint(!addingMaint); setAddingFuel(false); }}
              className="flex-1 py-2 rounded-xl border-2 border-dashed border-white/10 text-[10px] font-bold text-zinc-500 hover:border-auto-300 hover:text-auto-500 flex items-center justify-center gap-1">
              <Plus className="w-3 h-3" /> Mantenimiento
            </button>
          </div>

          {/* Form carga combustible */}
          {addingFuel && <AddFuelForm vehicleId={vehicleId} onDone={(f) => { if (f) setFuelLogsState([f, ...fuelLogsState]); setAddingFuel(false); }} />}

          {/* Form mantenimiento */}
          {addingMaint && <AddMaintForm vehicleId={vehicleId} onDone={(m) => { if (m) setMaintsState([m, ...maintsState]); setAddingMaint(false); }} />}

          {/* Timeline items */}
          {timeline.length === 0 ? (
            <p className="text-xs text-zinc-500 text-center py-4">Sin eventos registrados. Agrega tu primera carga o mantenimiento.</p>
          ) : (
            <div className="relative pl-6 space-y-3">
              <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-white/10 rounded" />
              {timeline.slice(0, 20).map((item, i) => (
                <div key={`${item.type}-${item.data.id}`} className="relative">
                  <div className={`absolute left-[-18px] top-1.5 w-3 h-3 rounded-full border-2 ${
                    item.type === "fuel" ? "bg-amber-100 border-amber-400" : "bg-blue-100 border-blue-400"
                  }`} />
                  <div className="bg-white/5 rounded-xl p-2.5">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-zinc-200">
                          {item.type === "fuel" ? (
                            <>⛽ {(item.data as FuelLog).litros} L · S/ {(item.data as FuelLog).precio_por_galon}/gal</>
                          ) : (
                            <>{maintTypes.find((t) => t.value === (item.data as MaintenanceLog).tipo)?.icon} {(item.data as MaintenanceLog).titulo}</>
                          )}
                        </p>
                        <p className="text-[10px] text-zinc-500">
                          {new Date(item.data.fecha + "T12:00:00").toLocaleDateString("es-PE")}
                          {item.type === "fuel" && ` · ${(item.data as FuelLog).odometro.toLocaleString("es-PE")} km`}
                          {item.type === "maintenance" && (item.data as MaintenanceLog).taller && ` · ${(item.data as MaintenanceLog).taller}`}
                        </p>
                      </div>
                      {(item.type === "fuel" ? (item.data as FuelLog).precio_por_galon * ((item.data as FuelLog).litros / 3.78541) : (item.data as MaintenanceLog).costo) ? (
                        <span className="text-[10px] font-bold text-zinc-400 shrink-0 ml-2">
                          S/ {Math.round(
                            item.type === "fuel"
                              ? (item.data as FuelLog).precio_por_galon * ((item.data as FuelLog).litros / 3.78541)
                              : (item.data as MaintenanceLog).costo!
                          ).toLocaleString("es-PE")}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════ Forms de agregar ═══════════════════════ */
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
    // Actualizar kilometraje del vehículo al valor más reciente
    if (data) {
      await supabase.from("vehicles").update({ kilometraje: o }).eq("id", vehicleId);
    }
    setSaving(false);
    if (data) onDone(data as FuelLog);
  };

  return (
    <div className="bg-amber-600/10 rounded-xl p-3 space-y-2">
      <div className="grid grid-cols-4 gap-1.5">
        <input type="number" step="0.1" value={form.litros} onChange={(e) => setForm({ ...form, litros: e.target.value })} placeholder="Litros" className="px-2 py-1.5 rounded-lg border border-white/10 text-xs bg-white" />
        <input type="number" step="0.01" value={form.precio_por_galon} onChange={(e) => setForm({ ...form, precio_por_galon: e.target.value })} placeholder="S/ gal" className="px-2 py-1.5 rounded-lg border border-white/10 text-xs bg-white" />
        <input type="number" value={form.odometro} onChange={(e) => setForm({ ...form, odometro: e.target.value })} placeholder="Odom." className="px-2 py-1.5 rounded-lg border border-white/10 text-xs bg-white" />
        <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} className="px-1 py-1.5 rounded-lg border border-white/10 text-xs bg-white">
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
    // Actualizar kilometraje si se ingresó
    if (data && form.odometro) {
      await supabase.from("vehicles").update({ kilometraje: parseInt(form.odometro) }).eq("id", vehicleId);
    }
    setSaving(false);
    if (data) onDone(data as MaintenanceLog);
  };

  return (
    <div className="bg-blue-600/10 rounded-xl p-3 space-y-2">
      <input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} placeholder="Título del mantenimiento" className="w-full px-2 py-1.5 rounded-lg border border-white/10 text-xs bg-white" />
      <div className="grid grid-cols-2 gap-1.5">
        <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} className="px-2 py-1.5 rounded-lg border border-white/10 text-xs bg-white">
          {maintTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <input type="number" step="0.01" value={form.costo} onChange={(e) => setForm({ ...form, costo: e.target.value })} placeholder="S/ costo" className="px-2 py-1.5 rounded-lg border border-white/10 text-xs bg-white" />
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        <input type="number" value={form.odometro} onChange={(e) => setForm({ ...form, odometro: e.target.value })} placeholder="Odómetro" className="px-2 py-1.5 rounded-lg border border-white/10 text-xs bg-white" />
        <input value={form.taller} onChange={(e) => setForm({ ...form, taller: e.target.value })} placeholder="Taller" className="px-2 py-1.5 rounded-lg border border-white/10 text-xs bg-white" />
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
  const [open, setOpen] = useState(false);
  const [showRendimiento, setShowRendimiento] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showProyeccion, setShowProyeccion] = useState(false);

  // ── A1: Datos mensuales para barras ──
  const monthlyData = (() => {
    const ahora = new Date();
    const months: { key: string; label: string; combustible: number; mantenimiento: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
      months.push({
        key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
        label: MESES_CORTOS[d.getMonth()],
        combustible: 0,
        mantenimiento: 0,
      });
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

  // ── A2: Rendimiento en el tiempo ──
  const rendimientoData = (() => {
    if (fuelLogs.length < 2) return [];
    const sorted = [...fuelLogs].sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
    const puntos: { fecha: string; kmgal: number; odometro: number }[] = [];
    for (let i = 1; i < sorted.length; i++) {
      const km = sorted[i].odometro - sorted[i - 1].odometro;
      const gal = sorted[i - 1].litros / 3.78541;
      if (km > 0 && gal > 0) {
        puntos.push({
          fecha: new Date(sorted[i].fecha).toLocaleDateString("es-PE", { day: "numeric", month: "short" }),
          kmgal: Math.round(km / gal),
          odometro: sorted[i].odometro,
        });
      }
    }
    return puntos;
  })();

  // ── A3: Heatmap de gasto anual ──
  const heatmapData = (() => {
    const ahora = new Date();
    const yearStart = new Date(ahora.getFullYear(), 0, 1);
    const cells: { date: Date; gasto: number; level: number }[] = [];
    const gastosPorFecha: Record<string, number> = {};

    fuelLogs.forEach((f) => {
      const key = f.fecha;
      gastosPorFecha[key] = (gastosPorFecha[key] || 0) + Math.round(f.precio_por_galon * (f.litros / 3.78541));
    });
    maintenances.forEach((m) => {
      const key = m.fecha;
      gastosPorFecha[key] = (gastosPorFecha[key] || 0) + Math.round(m.costo || 0);
    });

    const startDay = yearStart.getDay();
    const mondayStart = startDay === 0 ? 6 : startDay - 1;
    for (let d = -mondayStart; d < 365; d++) {
      const date = new Date(ahora.getFullYear(), 0, d + 1);
      const key = date.toISOString().split("T")[0];
      const gasto = gastosPorFecha[key] || 0;
      cells.push({
        date,
        gasto,
        level: gasto === 0 ? 0 : gasto < 50 ? 1 : gasto < 150 ? 2 : gasto < 300 ? 3 : 4,
      });
    }
    return cells;
  })();

  // ── A4: Proyección anual ──
  const proyeccionAnual = (() => {
    if (monthlyData.length === 0) return 0;
    const recent = monthlyData.slice(-3);
    const avg = recent.reduce((s, m) => s + m.combustible + m.mantenimiento, 0) / recent.length;
    return Math.round(avg * 12);
  })();

  return (
    <div className="card-auto-dark rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl">📈</span>
          <div>
            <p className="text-sm font-bold text-zinc-200">Gráficos Financieros</p>
            <p className="text-[10px] text-zinc-500">{gastoTotal > 0 ? `S/ ${gastoTotal.toLocaleString("es-PE")} en 12 meses` : "Últimos 12 meses"}</p>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-zinc-500 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3">
          {gastoTotal === 0 ? (
            <p className="text-xs text-zinc-500 text-center py-4">Sin datos de gastos. Registra cargas y mantenimientos.</p>
          ) : (
            <>
              {/* ── A1: Barras mensuales ── */}
              <div>
                <p className="text-[10px] font-extrabold text-zinc-400 mb-2">Gasto mensual (12 meses)</p>
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                      <XAxis dataKey="label" tick={{ fontSize: 9, fill: "#a1a1aa" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 9, fill: "#a1a1aa" }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e4e4e7", fontSize: 11 }} />
                      <Bar dataKey="combustible" stackId="a" fill="#be0b3c" radius={[0, 0, 0, 0]} name="Combustible" />
                      <Bar dataKey="mantenimiento" stackId="a" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Mantenimiento" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* ── A2: Línea de rendimiento ── */}
              <button onClick={() => setShowRendimiento(!showRendimiento)} className="w-full text-left">
                <p className="text-[10px] font-extrabold text-zinc-400 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Rendimiento histórico {rendimientoData.length > 0 ? `(${rendimientoData.length} puntos)` : ""}
                  <span className="ml-auto text-[9px] text-zinc-500">{showRendimiento ? "▲" : "▼"}</span>
                </p>
              </button>
              {showRendimiento && rendimientoData.length > 0 && (
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={rendimientoData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                      <XAxis dataKey="fecha" tick={{ fontSize: 8, fill: "#a1a1aa" }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                      <YAxis tick={{ fontSize: 9, fill: "#a1a1aa" }} axisLine={false} tickLine={false} domain={["auto", "auto"]} />
                      <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e4e4e7", fontSize: 11 }}
                        formatter={(v: number) => [`${v} km/gal`, "Rendimiento"]} />
                      <Line type="monotone" dataKey="kmgal" stroke="#be0b3c" strokeWidth={2} dot={{ r: 2, fill: "#be0b3c" }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
              {showRendimiento && rendimientoData.length === 0 && (
                <p className="text-[10px] text-zinc-500 text-center py-2">Necesitas 2+ cargas para ver rendimiento histórico.</p>
              )}

              {/* ── A3: Heatmap ── */}
              <button onClick={() => setShowHeatmap(!showHeatmap)} className="w-full text-left">
                <p className="text-[10px] font-extrabold text-zinc-400 flex items-center gap-1">
                  🔥 Mapa de gasto anual <span className="ml-auto text-[9px] text-zinc-500">{showHeatmap ? "▲" : "▼"}</span>
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
                      <div
                        key={i}
                        title={`${cell.date.toLocaleDateString("es-PE")}: S/ ${cell.gasto}`}
                        className={`aspect-square rounded-[1px] ${
                          cell.level === 0 ? "bg-white/5" :
                          cell.level === 1 ? "bg-auto-200" :
                          cell.level === 2 ? "bg-auto-400" :
                          cell.level === 3 ? "bg-auto-600/100" :
                          "bg-auto-700"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2 mt-2 justify-center">
                    <span className="text-[8px] text-zinc-500">Menos</span>
                    {[0, 1, 2, 3, 4].map((l) => (
                      <div key={l} className={`w-2.5 h-2.5 rounded-sm ${
                        l === 0 ? "bg-white/5" : l === 1 ? "bg-auto-200" : l === 2 ? "bg-auto-400" : l === 3 ? "bg-auto-600/100" : "bg-auto-700"
                      }`} />
                    ))}
                    <span className="text-[8px] text-zinc-500">Más</span>
                  </div>
                </div>
              )}

              {/* ── A4: Proyección anual ── */}
              <button onClick={() => setShowProyeccion(!showProyeccion)} className="w-full text-left">
                <p className="text-[10px] font-extrabold text-zinc-400 flex items-center gap-1">
                  📊 Proyección anual <span className="ml-auto text-[9px] text-zinc-500">{showProyeccion ? "▲" : "▼"}</span>
                </p>
              </button>
              {showProyeccion && (
                <div className="bg-auto-600/10 rounded-2xl p-3">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center">
                      <p className="text-[10px] text-zinc-500">Gasto estimado</p>
                      <p className="text-lg font-black text-auto-400">S/ {proyeccionAnual.toLocaleString("es-PE")}</p>
                      <p className="text-[9px] text-zinc-500">próximos 12 meses</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-zinc-500">Por mes</p>
                      <p className="text-lg font-black text-zinc-200">S/ {Math.round(proyeccionAnual / 12).toLocaleString("es-PE")}</p>
                      <p className="text-[9px] text-zinc-500">promedio proyectado</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-zinc-500">Tendencia</p>
                      <p className={`text-lg font-black ${proyeccionAnual > 0 ? "text-amber-600" : "text-zinc-500"}`}>
                        {proyeccionAnual > 0 ? "→" : "—"}
                      </p>
                      <p className="text-[9px] text-zinc-500">basado en 3 meses</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════ 3. Control de Garantía ═══════════════════════ */
function WarrantySection({ vehicle, maintenances }: { vehicle: Vehicle; maintenances: MaintenanceLog[] }) {
  const [open, setOpen] = useState(false);

  // Simular garantía: 3 años o 60,000 km
  const garantiaKm = 60000;
  const garantiaMeses = 36;
  const kmRestantes = Math.max(0, garantiaKm - vehicle.kilometraje);
  const kmPct = Math.min(100, (vehicle.kilometraje / garantiaKm) * 100);

  // Mantenimientos en concesionaria (preventivo con taller)
  const enConcesionaria = maintenances.filter((m) => m.tipo === "preventivo" && m.taller).length;

  return (
    <div className="card-auto-dark rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl">🛡️</span>
          <div>
            <p className="text-sm font-bold text-zinc-200">Control de Garantía</p>
            <p className="text-[10px] text-zinc-500">{kmRestantes.toLocaleString("es-PE")} km restantes</p>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-zinc-500 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3">
          <div>
            <div className="flex justify-between text-[10px] mb-1">
              <span className="font-bold text-zinc-400">Garantía: {garantiaKm.toLocaleString("es-PE")} km</span>
              <span className="font-bold text-zinc-400">{vehicle.kilometraje.toLocaleString("es-PE")} km actual</span>
            </div>
            <div className="h-4 bg-white/5 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${kmPct > 90 ? "bg-red-600/100" : kmPct > 70 ? "bg-amber-600/100" : "bg-emerald-600/100"}`} style={{ width: `${kmPct}%` }} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <p className="text-[10px] text-zinc-500">Km restantes</p>
              <p className="text-sm font-bold text-zinc-200">{kmRestantes.toLocaleString("es-PE")}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <p className="text-[10px] text-zinc-500">En concesionaria</p>
              <p className="text-sm font-bold text-zinc-200">{enConcesionaria} visitas</p>
            </div>
          </div>

          <p className="text-[10px] text-zinc-500 text-center">
            {kmPct > 90 ? "⚠️ La garantía está por vencer por kilometraje." :
             kmPct > 70 ? "🟡 Acercándote al límite de garantía." :
             "✅ Aún dentro del período de garantía."}
          </p>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════ 4. Upgrades ═══════════════════════ */
function UpgradesSection({ vehicleId, initialUpgrades }: { vehicleId: string; initialUpgrades: VehicleUpgrade[] }) {
  const [open, setOpen] = useState(false);
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
    <div className="card-auto-dark rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl">✨</span>
          <div>
            <p className="text-sm font-bold text-zinc-200">Upgrades y Accesorios</p>
            <p className="text-[10px] text-zinc-500">{upgrades.length} mejoras · S/ {Math.round(totalUpgrades).toLocaleString("es-PE")}</p>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-zinc-500 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-2">
          {upgrades.map((u) => {
            const cat = upgradeCats.find((c) => c.value === u.categoria);
            return (
              <div key={u.id} className="flex items-center justify-between bg-white/5 rounded-xl p-2.5">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-zinc-200">{cat?.icon} {u.nombre}</p>
                  <p className="text-[10px] text-zinc-500">{cat?.label}{u.costo ? ` · S/ ${u.costo.toLocaleString("es-PE")}` : ""}</p>
                </div>
                <button onClick={() => handleDelete(u.id)} className="text-zinc-500 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            );
          })}

          {adding ? (
            <div className="bg-auto-600/10 rounded-xl p-3 space-y-2">
              <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Nombre de la mejora" className="w-full px-2 py-1.5 rounded-lg border border-white/10 text-xs bg-white" />
              <div className="grid grid-cols-2 gap-1.5">
                <select value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} className="px-2 py-1.5 rounded-lg border border-white/10 text-xs bg-white">
                  {upgradeCats.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
                <input type="number" step="0.01" value={form.costo} onChange={(e) => setForm({ ...form, costo: e.target.value })} placeholder="S/ costo" className="px-2 py-1.5 rounded-lg border border-white/10 text-xs bg-white" />
              </div>
              <div className="flex gap-1.5">
                <button onClick={handleAdd} disabled={saving} className="flex-1 px-3 py-1.5 rounded-lg bg-auto-600 text-white text-xs font-bold">Guardar</button>
                <button onClick={() => setAdding(false)} className="px-3 py-1.5 rounded-lg bg-white/10 text-zinc-400 text-xs"><X className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ) : (
            <button onClick={() => setAdding(true)} className="w-full py-2 rounded-xl border-2 border-dashed border-white/10 text-[10px] font-bold text-zinc-500 hover:border-auto-300 hover:text-auto-500 flex items-center justify-center gap-1">
              <Plus className="w-3 h-3" /> Agregar mejora
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════ 5. Rotación de Neumáticos ═══════════════════════ */
function TireRotationSection() {
  const [open, setOpen] = useState(false);
  // Posiciones: DL=delante izq, DR=delante der, TL=tras izq, TR=tras der
  type Position = "DI" | "DD" | "TI" | "TD";
  const initial: Record<Position, string> = { DI: "A", DD: "B", TI: "C", TD: "D" };
  const [tires, setTires] = useState<Record<Position, string>>(() => {
    try {
      const saved = localStorage.getItem("blis_tire_positions");
      return saved ? JSON.parse(saved) : { ...initial };
    } catch { return { ...initial }; }
  });

  const rotate = () => {
    // Rotación cruzada: DI → TD → DD → TI → DI
    const newTires = {
      DI: tires.TI,
      DD: tires.DI,
      TI: tires.TD,
      TD: tires.DD,
    };
    setTires(newTires);
    localStorage.setItem("blis_tire_positions", JSON.stringify(newTires));
  };

  const reset = () => {
    setTires({ ...initial });
    localStorage.setItem("blis_tire_positions", JSON.stringify(initial));
  };

  return (
    <div className="card-auto-dark rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl">🔄</span>
          <div>
            <p className="text-sm font-bold text-zinc-200">Rotación de Neumáticos</p>
            <p className="text-[10px] text-zinc-500">Distribución actual del chasis</p>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-zinc-500 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3">
          {/* Chasis visual — grid 2x2 */}
          <div className="bg-white/5 rounded-2xl p-3">
            <div className="aspect-[3/2] rounded-xl border-2 border-white/10 bg-white/5 relative flex flex-col">
              {/* Fila delantera */}
              <div className="flex-1 flex items-center justify-around px-2">
                <TireCircle label={tires.DI} name="Del. Izq." color="bg-auto-600/15 text-auto-400 border-auto-300" />
                <TireCircle label={tires.DD} name="Del. Der." color="bg-auto-600/15 text-auto-400 border-auto-300" />
              </div>
              {/* Separador visual */}
              <div className="h-px mx-8 bg-white/10" />
              {/* Fila trasera */}
              <div className="flex-1 flex items-center justify-around px-2">
                <TireCircle label={tires.TI} name="Tras. Izq." color="bg-white/10 text-zinc-400 border-white/15" />
                <TireCircle label={tires.TD} name="Tras. Der." color="bg-white/10 text-zinc-400 border-white/15" />
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={rotate} className="flex-1 py-2.5 rounded-xl bg-auto-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-auto-700 transition-colors">
              <RotateCw className="w-3.5 h-3.5" /> Rotar (cruzado)
            </button>
            <button onClick={reset} className="px-4 py-2.5 rounded-xl bg-white/5 text-zinc-400 text-xs font-medium hover:bg-white/10 transition-colors">
              Reiniciar
            </button>
          </div>
          <p className="text-[10px] text-zinc-500 text-center">Patrón: TI → DI → DD → TD → TI</p>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════ 6. Exportación Carfax ═══════════════════════ */
function CarfaxExportSection({ vehicle, fuelLogs, maintenances, upgrades }: {
  vehicle: Vehicle; fuelLogs: FuelLog[]; maintenances: MaintenanceLog[]; upgrades: VehicleUpgrade[];
}) {
  const [open, setOpen] = useState(false);

  const totalEvents = fuelLogs.length + maintenances.length;

  return (
    <div className="card-auto-dark rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl">📄</span>
          <div>
            <p className="text-sm font-bold text-zinc-200">Reporte Carfax</p>
            <p className="text-[10px] text-zinc-500">{totalEvents} eventos exportables</p>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-zinc-500 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3">
          <p className="text-xs text-zinc-400">
            Genera un reporte PDF con todo el historial de mantenimientos, cargas de combustible y mejoras para presentar a futuros compradores o para tu control personal.
          </p>

          <div className="grid grid-cols-3 gap-2 mb-2">
            <div className="bg-white/5 rounded-xl p-2 text-center">
              <p className="text-lg font-black text-amber-600">{fuelLogs.length}</p>
              <p className="text-[9px] text-zinc-500">Cargas</p>
            </div>
            <div className="bg-white/5 rounded-xl p-2 text-center">
              <p className="text-lg font-black text-blue-600">{maintenances.length}</p>
              <p className="text-[9px] text-zinc-500">Mantenimientos</p>
            </div>
            <div className="bg-white/5 rounded-xl p-2 text-center">
              <p className="text-lg font-black text-violet-600">{upgrades.length}</p>
              <p className="text-[9px] text-zinc-500">Mejoras</p>
            </div>
          </div>

          <button
            onClick={() => window.open("/auto/app/bitacora/carfax", "_blank")}
            className="w-full py-3 rounded-xl bg-auto-600 text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-auto-700 transition-colors disabled:opacity-50"
            disabled={totalEvents === 0}>
            <FileDown className="w-4 h-4" />
            Exportar reporte PDF
          </button>
          <p className="text-[10px] text-zinc-500 text-center">Se abrirá en una nueva pestaña. Usa Ctrl+P para guardar como PDF.</p>
        </div>
      )}
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
