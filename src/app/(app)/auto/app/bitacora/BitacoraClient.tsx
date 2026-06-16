"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Vehicle, FuelLog, MaintenanceLog, VehicleUpgrade } from "@/types/database";
import {
  ChevronDown, Gauge, Droplets, Wrench, ShoppingBag, Shield, FileDown,
  Plus, Trash2, Save, X, RotateCw, TrendingDown, TrendingUp,
} from "lucide-react";

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
        <p className="text-zinc-500">Registra un vehículo primero.</p>
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
        <div className="w-10 h-10 rounded-xl bg-auto-100 flex items-center justify-center text-lg">
          <Gauge className="w-5 h-5 text-auto-600" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-zinc-800">Bitácora</h1>
          <p className="text-xs text-zinc-500">{vehicle.marca} {vehicle.modelo} · {vehicle.kilometraje.toLocaleString("es-PE")} km</p>
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
    <div className="card-soft rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl">📜</span>
          <div>
            <p className="text-sm font-bold text-zinc-800">Línea de Tiempo</p>
            <p className="text-[10px] text-zinc-400">{timeline.length} eventos registrados</p>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-zinc-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-2">
          {/* Botones de agregar */}
          <div className="flex gap-2 mb-2">
          <button onClick={() => { setAddingFuel(false); setAddingMaint(false); }} className="flex-1 py-2 rounded-xl border-2 border-dashed border-zinc-200 text-[10px] font-bold text-zinc-400 hover:border-auto-300 hover:text-auto-500 flex items-center justify-center gap-1">
            <Plus className="w-3 h-3" /> Carga combustible
          </button>
          <button onClick={() => { setAddingMaint(!addingMaint); setAddingFuel(false); }}
              className="flex-1 py-2 rounded-xl border-2 border-dashed border-zinc-200 text-[10px] font-bold text-zinc-400 hover:border-auto-300 hover:text-auto-500 flex items-center justify-center gap-1">
              <Plus className="w-3 h-3" /> Mantenimiento
            </button>
          </div>

          {/* Form carga combustible */}
          {addingFuel && <AddFuelForm vehicleId={vehicleId} onDone={(f) => { if (f) setFuelLogsState([f, ...fuelLogsState]); setAddingFuel(false); }} />}

          {/* Form mantenimiento */}
          {addingMaint && <AddMaintForm vehicleId={vehicleId} onDone={(m) => { if (m) setMaintsState([m, ...maintsState]); setAddingMaint(false); }} />}

          {/* Timeline items */}
          {timeline.length === 0 ? (
            <p className="text-xs text-zinc-400 text-center py-4">Sin eventos registrados. Agrega tu primera carga o mantenimiento.</p>
          ) : (
            <div className="relative pl-6 space-y-3">
              <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-zinc-200 rounded" />
              {timeline.slice(0, 20).map((item, i) => (
                <div key={`${item.type}-${item.data.id}`} className="relative">
                  <div className={`absolute left-[-18px] top-1.5 w-3 h-3 rounded-full border-2 ${
                    item.type === "fuel" ? "bg-amber-100 border-amber-400" : "bg-blue-100 border-blue-400"
                  }`} />
                  <div className="bg-zinc-50 rounded-xl p-2.5">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-zinc-800">
                          {item.type === "fuel" ? (
                            <>⛽ {(item.data as FuelLog).litros} L · S/ {(item.data as FuelLog).precio_por_galon}/gal</>
                          ) : (
                            <>{maintTypes.find((t) => t.value === (item.data as MaintenanceLog).tipo)?.icon} {(item.data as MaintenanceLog).titulo}</>
                          )}
                        </p>
                        <p className="text-[10px] text-zinc-400">
                          {new Date(item.data.fecha + "T12:00:00").toLocaleDateString("es-PE")}
                          {item.type === "fuel" && ` · ${(item.data as FuelLog).odometro.toLocaleString("es-PE")} km`}
                          {item.type === "maintenance" && (item.data as MaintenanceLog).taller && ` · ${(item.data as MaintenanceLog).taller}`}
                        </p>
                      </div>
                      {(item.type === "fuel" ? (item.data as FuelLog).precio_por_galon * ((item.data as FuelLog).litros / 3.78541) : (item.data as MaintenanceLog).costo) ? (
                        <span className="text-[10px] font-bold text-zinc-600 shrink-0 ml-2">
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
    <div className="bg-amber-50 rounded-xl p-3 space-y-2">
      <div className="grid grid-cols-4 gap-1.5">
        <input type="number" step="0.1" value={form.litros} onChange={(e) => setForm({ ...form, litros: e.target.value })} placeholder="Litros" className="px-2 py-1.5 rounded-lg border border-zinc-200 text-xs bg-white" />
        <input type="number" step="0.01" value={form.precio_por_galon} onChange={(e) => setForm({ ...form, precio_por_galon: e.target.value })} placeholder="S/ gal" className="px-2 py-1.5 rounded-lg border border-zinc-200 text-xs bg-white" />
        <input type="number" value={form.odometro} onChange={(e) => setForm({ ...form, odometro: e.target.value })} placeholder="Odom." className="px-2 py-1.5 rounded-lg border border-zinc-200 text-xs bg-white" />
        <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} className="px-1 py-1.5 rounded-lg border border-zinc-200 text-xs bg-white">
          <option value="regular">Regular</option>
          <option value="premium">Premium</option>
          <option value="diesel">Diésel</option>
          <option value="glp">GLP</option>
          <option value="gnv">GNV</option>
        </select>
      </div>
      <input type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} className="w-full px-2 py-1.5 rounded-lg border border-zinc-200 text-xs bg-white" />
      <div className="flex gap-1.5">
        <button onClick={handleSubmit} disabled={saving} className="flex-1 px-3 py-1.5 rounded-lg bg-auto-600 text-white text-xs font-bold">{saving ? "..." : "Guardar"}</button>
        <button onClick={() => onDone(null!)} className="px-3 py-1.5 rounded-lg bg-zinc-200 text-zinc-600 text-xs"><X className="w-3.5 h-3.5" /></button>
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
    <div className="bg-blue-50 rounded-xl p-3 space-y-2">
      <input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} placeholder="Título del mantenimiento" className="w-full px-2 py-1.5 rounded-lg border border-zinc-200 text-xs bg-white" />
      <div className="grid grid-cols-2 gap-1.5">
        <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} className="px-2 py-1.5 rounded-lg border border-zinc-200 text-xs bg-white">
          {maintTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <input type="number" step="0.01" value={form.costo} onChange={(e) => setForm({ ...form, costo: e.target.value })} placeholder="S/ costo" className="px-2 py-1.5 rounded-lg border border-zinc-200 text-xs bg-white" />
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        <input type="number" value={form.odometro} onChange={(e) => setForm({ ...form, odometro: e.target.value })} placeholder="Odómetro" className="px-2 py-1.5 rounded-lg border border-zinc-200 text-xs bg-white" />
        <input value={form.taller} onChange={(e) => setForm({ ...form, taller: e.target.value })} placeholder="Taller" className="px-2 py-1.5 rounded-lg border border-zinc-200 text-xs bg-white" />
      </div>
      <input type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} className="w-full px-2 py-1.5 rounded-lg border border-zinc-200 text-xs bg-white" />
      <div className="flex gap-1.5">
        <button onClick={handleSubmit} disabled={saving} className="flex-1 px-3 py-1.5 rounded-lg bg-auto-600 text-white text-xs font-bold">Guardar</button>
        <button onClick={() => onDone(null!)} className="px-3 py-1.5 rounded-lg bg-zinc-200 text-zinc-600 text-xs"><X className="w-3.5 h-3.5" /></button>
      </div>
    </div>
  );
}

/* ═══════════════════════════ 2. Gráficos Financieros ═══════════════════════ */
function FinanceChartsSection({ fuelLogs, maintenances }: { fuelLogs: FuelLog[]; maintenances: MaintenanceLog[] }) {
  const [open, setOpen] = useState(false);

  // Calcular gastos últimos 12 meses
  const ahora = Date.now();
  const doceMeses = 12 * 30 * 24 * 60 * 60 * 1000;

  const gastoCombustible = fuelLogs
    .filter((f) => new Date(f.fecha).getTime() > ahora - doceMeses)
    .reduce((sum, f) => sum + f.precio_por_galon * (f.litros / 3.78541), 0);

  const gastoMantenimiento = maintenances
    .filter((m) => new Date(m.fecha).getTime() > ahora - doceMeses)
    .reduce((sum, m) => sum + (m.costo || 0), 0);

  const gastoTotal = gastoCombustible + gastoMantenimiento;
  const maxGasto = Math.max(gastoCombustible, gastoMantenimiento, 1);

  return (
    <div className="card-soft rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl">📈</span>
          <div>
            <p className="text-sm font-bold text-zinc-800">Gráficos Financieros</p>
            <p className="text-[10px] text-zinc-400">Últimos 12 meses</p>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-zinc-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="px-4 pb-4">
          {gastoTotal === 0 ? (
            <p className="text-xs text-zinc-400 text-center py-4">Sin datos de gastos. Registra cargas y mantenimientos.</p>
          ) : (
            <div className="space-y-3">
              <div className="text-center">
                <p className="text-xs text-zinc-400">Gasto total 12 meses</p>
                <p className="text-3xl font-black text-auto-600">S/ {Math.round(gastoTotal).toLocaleString("es-PE")}</p>
                <p className="text-[10px] text-zinc-400">S/ {Math.round(gastoTotal / 12).toLocaleString("es-PE")}/mes promedio</p>
              </div>

              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="font-bold text-zinc-700">Combustible</span>
                    <span className="font-bold text-zinc-800">S/ {Math.round(gastoCombustible).toLocaleString("es-PE")}</span>
                  </div>
                  <div className="h-4 bg-zinc-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(gastoCombustible / maxGasto) * 100}%` }} />
                  </div>
                  <p className="text-[10px] text-zinc-400 mt-0.5">{gastoTotal > 0 ? Math.round((gastoCombustible / gastoTotal) * 100) : 0}% del total</p>
                </div>

                {gastoMantenimiento > 0 && (
                  <div>
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="font-bold text-zinc-700">Mantenimiento</span>
                      <span className="font-bold text-zinc-800">S/ {Math.round(gastoMantenimiento).toLocaleString("es-PE")}</span>
                    </div>
                    <div className="h-4 bg-zinc-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(gastoMantenimiento / maxGasto) * 100}%` }} />
                    </div>
                    <p className="text-[10px] text-zinc-400 mt-0.5">{gastoTotal > 0 ? Math.round((gastoMantenimiento / gastoTotal) * 100) : 0}% del total</p>
                  </div>
                )}
              </div>
            </div>
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
    <div className="card-soft rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl">🛡️</span>
          <div>
            <p className="text-sm font-bold text-zinc-800">Control de Garantía</p>
            <p className="text-[10px] text-zinc-400">{kmRestantes.toLocaleString("es-PE")} km restantes</p>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-zinc-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3">
          <div>
            <div className="flex justify-between text-[10px] mb-1">
              <span className="font-bold text-zinc-600">Garantía: {garantiaKm.toLocaleString("es-PE")} km</span>
              <span className="font-bold text-zinc-600">{vehicle.kilometraje.toLocaleString("es-PE")} km actual</span>
            </div>
            <div className="h-4 bg-zinc-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${kmPct > 90 ? "bg-red-500" : kmPct > 70 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${kmPct}%` }} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-zinc-50 rounded-xl p-3 text-center">
              <p className="text-[10px] text-zinc-400">Km restantes</p>
              <p className="text-sm font-bold text-zinc-800">{kmRestantes.toLocaleString("es-PE")}</p>
            </div>
            <div className="bg-zinc-50 rounded-xl p-3 text-center">
              <p className="text-[10px] text-zinc-400">En concesionaria</p>
              <p className="text-sm font-bold text-zinc-800">{enConcesionaria} visitas</p>
            </div>
          </div>

          <p className="text-[10px] text-zinc-400 text-center">
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
    <div className="card-soft rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl">✨</span>
          <div>
            <p className="text-sm font-bold text-zinc-800">Upgrades y Accesorios</p>
            <p className="text-[10px] text-zinc-400">{upgrades.length} mejoras · S/ {Math.round(totalUpgrades).toLocaleString("es-PE")}</p>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-zinc-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-2">
          {upgrades.map((u) => {
            const cat = upgradeCats.find((c) => c.value === u.categoria);
            return (
              <div key={u.id} className="flex items-center justify-between bg-zinc-50 rounded-xl p-2.5">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-zinc-800">{cat?.icon} {u.nombre}</p>
                  <p className="text-[10px] text-zinc-400">{cat?.label}{u.costo ? ` · S/ ${u.costo.toLocaleString("es-PE")}` : ""}</p>
                </div>
                <button onClick={() => handleDelete(u.id)} className="text-zinc-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            );
          })}

          {adding ? (
            <div className="bg-auto-50 rounded-xl p-3 space-y-2">
              <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Nombre de la mejora" className="w-full px-2 py-1.5 rounded-lg border border-zinc-200 text-xs bg-white" />
              <div className="grid grid-cols-2 gap-1.5">
                <select value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} className="px-2 py-1.5 rounded-lg border border-zinc-200 text-xs bg-white">
                  {upgradeCats.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
                <input type="number" step="0.01" value={form.costo} onChange={(e) => setForm({ ...form, costo: e.target.value })} placeholder="S/ costo" className="px-2 py-1.5 rounded-lg border border-zinc-200 text-xs bg-white" />
              </div>
              <div className="flex gap-1.5">
                <button onClick={handleAdd} disabled={saving} className="flex-1 px-3 py-1.5 rounded-lg bg-auto-600 text-white text-xs font-bold">Guardar</button>
                <button onClick={() => setAdding(false)} className="px-3 py-1.5 rounded-lg bg-zinc-200 text-zinc-600 text-xs"><X className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ) : (
            <button onClick={() => setAdding(true)} className="w-full py-2 rounded-xl border-2 border-dashed border-zinc-200 text-[10px] font-bold text-zinc-400 hover:border-auto-300 hover:text-auto-500 flex items-center justify-center gap-1">
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

  const posLabels: { key: Position; label: string; top: string; left: string }[] = [
    { key: "DI", label: "Del. Izq.", top: "10%", left: "20%" },
    { key: "DD", label: "Del. Der.", top: "10%", left: "60%" },
    { key: "TI", label: "Tras. Izq.", top: "65%", left: "20%" },
    { key: "TD", label: "Tras. Der.", top: "65%", left: "60%" },
  ];

  return (
    <div className="card-soft rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl">🔄</span>
          <div>
            <p className="text-sm font-bold text-zinc-800">Rotación de Neumáticos</p>
            <p className="text-[10px] text-zinc-400">Distribución actual del chasis</p>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-zinc-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3">
          {/* Chasis visual */}
          <div className="relative w-full max-w-[240px] mx-auto aspect-[2/3] bg-zinc-100 rounded-2xl border-2 border-zinc-200">
            {/* Silueta de auto */}
            <div className="absolute inset-4 border-2 border-zinc-300 rounded-xl" />
            {posLabels.map((pos) => (
              <div
                key={pos.key}
                className="absolute -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white border-2 border-zinc-300 flex items-center justify-center shadow-sm"
                style={{ top: pos.top, left: pos.left }}
              >
                <div>
                  <p className="text-lg font-black text-auto-600">{tires[pos.key]}</p>
                  <p className="text-[8px] text-zinc-400 -mt-1">{pos.label.split(".")[0]}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <button onClick={rotate} className="flex-1 py-2.5 rounded-xl bg-auto-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-auto-700 transition-colors">
              <RotateCw className="w-3.5 h-3.5" /> Rotar (cruzado)
            </button>
            <button onClick={reset} className="px-4 py-2.5 rounded-xl bg-zinc-100 text-zinc-500 text-xs font-medium hover:bg-zinc-200 transition-colors">
              Reiniciar
            </button>
          </div>
          <p className="text-[10px] text-zinc-400 text-center">Patrón: DI → TD → DD → TI → DI</p>
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
    <div className="card-soft rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl">📄</span>
          <div>
            <p className="text-sm font-bold text-zinc-800">Reporte Carfax</p>
            <p className="text-[10px] text-zinc-400">{totalEvents} eventos exportables</p>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-zinc-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3">
          <p className="text-xs text-zinc-600">
            Genera un reporte PDF con todo el historial de mantenimientos, cargas de combustible y mejoras para presentar a futuros compradores o para tu control personal.
          </p>

          <div className="grid grid-cols-3 gap-2 mb-2">
            <div className="bg-zinc-50 rounded-xl p-2 text-center">
              <p className="text-lg font-black text-amber-600">{fuelLogs.length}</p>
              <p className="text-[9px] text-zinc-400">Cargas</p>
            </div>
            <div className="bg-zinc-50 rounded-xl p-2 text-center">
              <p className="text-lg font-black text-blue-600">{maintenances.length}</p>
              <p className="text-[9px] text-zinc-400">Mantenimientos</p>
            </div>
            <div className="bg-zinc-50 rounded-xl p-2 text-center">
              <p className="text-lg font-black text-violet-600">{upgrades.length}</p>
              <p className="text-[9px] text-zinc-400">Mejoras</p>
            </div>
          </div>

          <button
            onClick={() => window.open("/auto/app/bitacora/carfax", "_blank")}
            className="w-full py-3 rounded-xl bg-auto-600 text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-auto-700 transition-colors disabled:opacity-50"
            disabled={totalEvents === 0}>
            <FileDown className="w-4 h-4" />
            Exportar reporte PDF
          </button>
          <p className="text-[10px] text-zinc-400 text-center">Se abrirá en una nueva pestaña. Usa Ctrl+P para guardar como PDF.</p>
        </div>
      )}
    </div>
  );
}
