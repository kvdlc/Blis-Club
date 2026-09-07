"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getCountryConfig, getCurrentCountryCode } from "@/lib/countries";
import type { Vehicle, FuelLog, MaintenanceLog, VehicleUpgrade } from "@/types/database";
import {
  ChevronDown, Gauge, Droplets, Wrench, ShoppingBag, Shield, FileDown,
  Plus, Trash2, X, RotateCw, TrendingUp, BarChart3, Fuel, ScrollText,
  Sparkles, CheckCircle2, Circle, AlertTriangle, Calendar,
  Palette, Smartphone, Zap, Armchair, Pin, Ban,
} from "lucide-react";
import { DatePicker } from "@/components/DatePicker";
import { BitacoraCharts } from "./BitacoraCharts";
import { useMoney } from "@/lib/money";

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
  "📌": <Pin className="w-3.5 h-3.5 text-zinc-500" />,
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
  "📌": <Pin className="w-3.5 h-3.5 inline text-zinc-500" />,
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
        <p className="text-zinc-500">Registra un vehículo primero.</p>
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
      <BitacoraCharts fuelLogs={fuelLogs} maintenances={maintenances} upgrades={upgrades} />
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
  const { money } = useMoney();
  const [countryCode, setCountryCode] = useState<string | null>(null);
  const [addingFuel, setAddingFuel] = useState(false);
  const [addingMaint, setAddingMaint] = useState(false);
  const [fuelLogsState, setFuelLogsState] = useState(fuelLogs);
  const [maintsState, setMaintsState] = useState(maintenances);

  useEffect(() => { getCurrentCountryCode().then((c) => setCountryCode(c)); }, []);

  const esGalon = getCountryConfig(countryCode).fuelUnit === "galon";
  const GAL = 3.78541;
  const volLabel = (litros: number) => esGalon ? `${(litros / GAL).toFixed(2)} gal` : `${litros} L`;
  const precioLabel = (p: number) => esGalon ? money(p) : money(p / GAL);

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
      </div>

      {/* Botones grandes de registro */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => { setAddingFuel(!addingFuel); setAddingMaint(false); }}
          className={`flex flex-col items-center gap-1.5 rounded-2xl px-4 py-4 border transition-all active:scale-[0.98] ${
            addingFuel
              ? "bg-amber-500/20 border-amber-500/40"
              : "bg-amber-500/10 border-amber-500/25 hover:bg-amber-500/20"
          }`}
        >
          <Fuel className="w-6 h-6 text-amber-400" />
          <span className="text-xs font-extrabold text-zinc-100">Cargar combustible</span>
          <span className="text-[10px] text-zinc-500">Registra una carga</span>
        </button>
        <button
          onClick={() => { setAddingMaint(!addingMaint); setAddingFuel(false); }}
          className={`flex flex-col items-center gap-1.5 rounded-2xl px-4 py-4 border transition-all active:scale-[0.98] ${
            addingMaint
              ? "bg-blue-500/20 border-blue-500/40"
              : "bg-blue-500/10 border-blue-500/25 hover:bg-blue-500/20"
          }`}
        >
          <Wrench className="w-6 h-6 text-blue-400" />
          <span className="text-xs font-extrabold text-zinc-100">Registrar servicio</span>
          <span className="text-[10px] text-zinc-500">Mantenimiento u otro</span>
        </button>
      </div>

      {addingFuel && <AddFuelForm vehicleId={vehicleId} onDone={(f) => { if (f) setFuelLogsState([f, ...fuelLogsState]); setAddingFuel(false); }} />}
      {addingMaint && <AddMaintForm vehicleId={vehicleId} onDone={(m) => { if (m) setMaintsState([m, ...maintsState]); setAddingMaint(false); }} />}

      <div className="space-y-2">
        {timeline.length === 0 ? (
          <p className="text-xs text-zinc-500 text-center py-4">Sin eventos registrados. Agrega tu primera carga o mantenimiento.</p>
        ) : (
          timeline.slice(0, 10).map((item) => (
            <div key={`${item.type}-${item.data.id}`} className={`bg-zinc-900 border border-white/10 shadow-sm rounded-2xl p-3 flex items-center gap-3 border-l-2 ${item.type === "fuel" ? "border-l-amber-500" : "border-l-blue-500"}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.type === "fuel" ? "bg-amber-500/10 border border-amber-500/20" : "bg-blue-500/10 border border-blue-500/20"}`}>
                {item.type === "fuel" ? <Fuel className="w-5 h-5 text-amber-400" /> : <Wrench className="w-5 h-5 text-blue-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-zinc-100">
                  {item.type === "fuel" ? (
                    <>{volLabel((item.data as FuelLog).litros)} · {precioLabel((item.data as FuelLog).precio_por_galon)}{esGalon ? "/gal" : "/L"}</>
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
                {money(Math.round(
                  item.type === "fuel"
                    ? (item.data as FuelLog).precio_por_galon * ((item.data as FuelLog).litros / 3.78541)
                    : (item.data as MaintenanceLog).costo || 0
                ))}
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
  const [countryCode, setCountryCode] = useState<string | null>(null);
  const [form, setForm] = useState({ cantidad: "", precio_por_galon: "", odometro: "", fecha: new Date().toISOString().split("T")[0], tipo: "90" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getCurrentCountryCode().then((code) => {
      setCountryCode(code);
      const cfg = getCountryConfig(code);
      setForm((f) => ({ ...f, tipo: cfg.fuelTypes[0]?.value || "90" }));
    });
  }, []);

  const cfg = getCountryConfig(countryCode);
  const esGalon = cfg.fuelUnit === "galon";
  const unidadLabel = esGalon ? "galones" : "litros";
  const unidadShort = esGalon ? "gal" : "L";
  // El precio local es por la unidad del país (galón o litro). Canonizamos a precio por galón.
  const precioUnit = esGalon ? "galón" : "litro";
  const GAL = 3.78541;

  const handleSubmit = async () => {
    const cant = parseFloat(form.cantidad); // en unidad local (gal o L)
    const precioLocal = parseFloat(form.precio_por_galon);
    const o = parseInt(form.odometro);
    if (!cant || !precioLocal || !o) return;

    // Canonizar a litros y precio por galón
    const litros = esGalon ? cant * GAL : cant;
    const precioPorGalon = esGalon ? precioLocal : precioLocal * GAL;

    setSaving(true);
    const supabase = createClient();
    const { data } = await supabase.from("fuel_logs").insert({
      vehicle_id: vehicleId, litros, precio_por_galon: precioPorGalon, odometro: o, fecha: form.fecha, tipo_combustible: form.tipo,
    }).select().single();
    if (data) {
      await supabase.from("vehicles").update({ kilometraje: o }).eq("id", vehicleId);
    }
    setSaving(false);
    if (data) onDone(data as FuelLog);
  };

  return (
    <div className="bg-zinc-900 border border-white/10 shadow-sm rounded-2xl p-4 space-y-2 border border-amber-500/20">
      <p className="text-[10px] font-bold text-zinc-400">
        Unidad: {esGalon ? "Estás en un país de galones" : "Estás en un país de litros"} · ingresa en {unidadLabel}
      </p>
      <div className="grid grid-cols-4 gap-1.5">
        <input type="number" step="0.1" value={form.cantidad} onChange={(e) => setForm({ ...form, cantidad: e.target.value })} placeholder={unidadShort} className="px-2 py-1.5 rounded-lg border border-white/10 text-xs bg-zinc-800 text-zinc-200" />
        <input type="number" step="0.01" value={form.precio_por_galon} onChange={(e) => setForm({ ...form, precio_por_galon: e.target.value })} placeholder={`${cfg.currency}/${unidadShort}`} className="px-2 py-1.5 rounded-lg border border-white/10 text-xs bg-zinc-800 text-zinc-200" />
        <input type="number" value={form.odometro} onChange={(e) => setForm({ ...form, odometro: e.target.value })} placeholder="Odom." className="px-2 py-1.5 rounded-lg border border-white/10 text-xs bg-zinc-800 text-zinc-200" />
        <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} className="px-1 py-1.5 rounded-lg border border-white/10 text-xs bg-zinc-800 text-zinc-200">
          {cfg.fuelTypes.map((ft) => <option key={ft.value} value={ft.value}>{ft.label}</option>)}
        </select>
      </div>
      <p className="text-[9px] text-zinc-500">Cantidad en {unidadLabel} · Precio por {precioUnit} ({cfg.currency})</p>
      <DatePicker colorTheme="auto" value={form.fecha} onChange={(d) => setForm({ ...form, fecha: d })} />
      <div className="flex gap-1.5">
        <button onClick={handleSubmit} disabled={saving} className="flex-1 px-3 py-1.5 rounded-lg bg-auto-600 text-white text-xs font-bold">{saving ? "..." : "Guardar"}</button>
        <button onClick={() => onDone(null!)} className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-500 text-xs"><X className="w-3.5 h-3.5" /></button>
      </div>
    </div>
  );
}

function AddMaintForm({ vehicleId, onDone }: { vehicleId: string; onDone: (m: MaintenanceLog | null) => void }) {
  const { symbol } = useMoney();
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
    <div className="bg-zinc-900 border border-white/10 shadow-sm rounded-2xl p-4 space-y-2 border border-blue-500/20">
      <input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} placeholder="Título del mantenimiento" className="w-full px-2 py-1.5 rounded-lg border border-white/10 text-xs bg-zinc-800 text-zinc-200" />
      <div className="grid grid-cols-2 gap-1.5">
        <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} className="px-2 py-1.5 rounded-lg border border-white/10 text-xs bg-zinc-800 text-zinc-200">
          {maintTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <input type="number" step="0.01" value={form.costo} onChange={(e) => setForm({ ...form, costo: e.target.value })} placeholder={`${symbol} costo`} className="px-2 py-1.5 rounded-lg border border-white/10 text-xs bg-zinc-800 text-zinc-200" />
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        <input type="number" value={form.odometro} onChange={(e) => setForm({ ...form, odometro: e.target.value })} placeholder="Odómetro" className="px-2 py-1.5 rounded-lg border border-white/10 text-xs bg-zinc-800 text-zinc-200" />
        <input value={form.taller} onChange={(e) => setForm({ ...form, taller: e.target.value })} placeholder="Taller" className="px-2 py-1.5 rounded-lg border border-white/10 text-xs bg-zinc-800 text-zinc-200" />
      </div>
      <DatePicker colorTheme="auto" value={form.fecha} onChange={(d) => setForm({ ...form, fecha: d })} />
      <div className="flex gap-1.5">
        <button onClick={handleSubmit} disabled={saving} className="flex-1 px-3 py-1.5 rounded-lg bg-auto-600 text-white text-xs font-bold">Guardar</button>
        <button onClick={() => onDone(null!)} className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-500 text-xs"><X className="w-3.5 h-3.5" /></button>
      </div>
    </div>
  );
}

/* ═══════════════════════════ 2. Gráficos Financieros ═══════════════════════ */
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
      <div className="bg-zinc-900 border border-white/10 shadow-sm rounded-2xl p-4 space-y-3">
        <div>
          <div className="flex justify-between text-[10px] mb-1">
            <span className="font-bold text-zinc-500">Garantía: {garantiaKm.toLocaleString("es-PE")} km</span>
            <span className="font-bold text-zinc-500">{vehicle.kilometraje.toLocaleString("es-PE")} km actual</span>
          </div>
          <div className="h-4 bg-zinc-800 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${kmPct > 90 ? "bg-red-500" : kmPct > 70 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${kmPct}%` }} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-zinc-800 rounded-xl p-3 text-center">
            <p className="text-[10px] text-zinc-500">Km restantes</p>
            <p className="text-sm font-bold text-zinc-100">{kmRestantes.toLocaleString("es-PE")}</p>
          </div>
          <div className="bg-zinc-800 rounded-xl p-3 text-center">
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
  const { money, symbol } = useMoney();
  const [upgrades, setUpgrades] = useState(initialUpgrades);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({
    categoria: "estetico", nombre: "", costo: "",
    fecha: new Date().toISOString().split("T")[0],
    conMantenimiento: false, fecha_mantenimiento: "",
    conVencimiento: false, fecha_vencimiento: "",
    conKm: false, duracion_km: "",
  });
  const [saving, setSaving] = useState(false);

  const totalUpgrades = upgrades.reduce((sum, u) => sum + (u.costo || 0), 0);

  const handleAdd = async () => {
    if (!form.nombre) return;
    setSaving(true);
    const { data } = await createClient().from("vehicle_upgrades").insert({
      vehicle_id: vehicleId, categoria: form.categoria, nombre: form.nombre,
      costo: form.costo ? parseFloat(form.costo) : null, fecha: form.fecha,
      fecha_mantenimiento: form.conMantenimiento ? form.fecha_mantenimiento || null : null,
      fecha_vencimiento: form.conVencimiento ? form.fecha_vencimiento || null : null,
      ciclo: form.conKm ? "km" : (form.conVencimiento ? "tiempo" : null),
      duracion_km: form.conKm && form.duracion_km ? parseInt(form.duracion_km) : null,
    }).select().single();
    setSaving(false);
    if (data) {
      setUpgrades([data as VehicleUpgrade, ...upgrades]);
      setAdding(false);
      setForm({ categoria: "estetico", nombre: "", costo: "", fecha: new Date().toISOString().split("T")[0], conMantenimiento: false, fecha_mantenimiento: "", conVencimiento: false, fecha_vencimiento: "", conKm: false, duracion_km: "" });
    }
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
        <div className="bg-zinc-900 border border-white/10 shadow-sm rounded-2xl p-4 space-y-2">
          <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Nombre del accesorio" className="w-full px-2 py-1.5 rounded-lg border border-white/10 text-xs bg-zinc-800 text-zinc-200" />
          <div className="grid grid-cols-2 gap-1.5">
            <select value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} className="px-2 py-1.5 rounded-lg border border-white/10 text-xs bg-zinc-800 text-zinc-200">
              {upgradeCats.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            <input type="number" step="0.01" value={form.costo} onChange={(e) => setForm({ ...form, costo: e.target.value })} placeholder={`${symbol} costo`} className="px-2 py-1.5 rounded-lg border border-white/10 text-xs bg-zinc-800 text-zinc-200" />
          </div>

          {/* Fecha de compra (siempre) */}
          <label className="block"><span className="text-[10px] font-bold text-zinc-500">Fecha de compra</span>
            <DatePicker colorTheme="auto" value={form.fecha} onChange={(d) => setForm({ ...form, fecha: d })} />
          </label>

          {/* Checkbox Mantenimiento */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.conMantenimiento} onChange={(e) => setForm({ ...form, conMantenimiento: e.target.checked })} className="accent-auto-500" />
            <span className="text-[11px] text-zinc-300">Mantenimiento</span>
          </label>
          {form.conMantenimiento && (
            <label className="block"><span className="text-[10px] font-bold text-zinc-500">Fecha de próximo mantenimiento</span>
              <DatePicker colorTheme="auto" value={form.fecha_mantenimiento} onChange={(d) => setForm({ ...form, fecha_mantenimiento: d })} />
            </label>
          )}

          {/* Checkbox Vencimiento */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.conVencimiento} onChange={(e) => setForm({ ...form, conVencimiento: e.target.checked })} className="accent-auto-500" />
            <span className="text-[11px] text-zinc-300">Vencimiento (vida útil)</span>
          </label>
          {form.conVencimiento && (
            <label className="block"><span className="text-[10px] font-bold text-zinc-500">Fecha de vencimiento</span>
              <DatePicker colorTheme="auto" value={form.fecha_vencimiento} onChange={(d) => setForm({ ...form, fecha_vencimiento: d })} />
            </label>
          )}

          {/* Checkbox Por km */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.conKm} onChange={(e) => setForm({ ...form, conKm: e.target.checked })} className="accent-auto-500" />
            <span className="text-[11px] text-zinc-300">Duración por kilómetros</span>
          </label>
          {form.conKm && (
            <input type="number" min="0" value={form.duracion_km} onChange={(e) => setForm({ ...form, duracion_km: e.target.value })} placeholder="Ej: 40000 km" className="w-full px-2 py-1.5 rounded-lg border border-white/10 text-xs bg-zinc-800 text-zinc-200" />
          )}

          <div className="flex gap-1.5">
            <button onClick={handleAdd} disabled={saving} className="flex-1 px-3 py-1.5 rounded-lg bg-auto-600 text-white text-xs font-bold">Guardar</button>
            <button onClick={() => setAdding(false)} className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-500 text-xs"><X className="w-3.5 h-3.5" /></button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        {upgrades.length === 0 && !adding && (
          <p className="text-xs text-zinc-500 text-center py-4 col-span-2">No hay upgrades registrados</p>
        )}
        {upgrades.map((u) => {
          const cat = upgradeCats.find((c) => c.value === u.categoria);
          const vidaLabel = u.ciclo === "km" && u.duracion_km ? ` · ${u.duracion_km.toLocaleString("es-PE")} km` : (u.fecha_vencimiento ? ` · vence ${new Date(u.fecha_vencimiento + "T12:00:00").toLocaleDateString("es-PE")}` : "");
          const mantLabel = u.fecha_mantenimiento ? ` · mant. ${new Date(u.fecha_mantenimiento + "T12:00:00").toLocaleDateString("es-PE")}` : "";
          return (
            <div key={u.id} className="bg-zinc-900 border border-white/10 shadow-sm rounded-2xl p-3 flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-auto-600/10 border border-auto-600/20 flex items-center justify-center">
                  {upgradeIconMap[cat?.icon || "📌"]}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-zinc-100 truncate">{u.nombre}</p>
                  <p className="text-[10px] text-zinc-500">{cat?.label} · {new Date(u.fecha + "T12:00:00").toLocaleDateString("es-PE")}{vidaLabel}{mantLabel}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-auto-500">{u.costo ? money(u.costo) : "—"}</span>
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
      <div className="bg-zinc-900 border border-white/10 shadow-sm rounded-2xl p-4 space-y-3">
        <div className="bg-zinc-800 rounded-2xl p-3">
          <div className="aspect-[3/2] rounded-xl border-2 border-white/10 bg-zinc-800 relative flex flex-col">
            <div className="flex-1 flex items-center justify-around px-2">
              <TireCircle label={tires.DI} name="Del. Izq." color="bg-auto-600/10 text-auto-500 border-auto-300" />
              <TireCircle label={tires.DD} name="Del. Der." color="bg-auto-600/10 text-auto-500 border-auto-300" />
            </div>
            <div className="h-px mx-8 bg-zinc-800" />
            <div className="flex-1 flex items-center justify-around px-2">
              <TireCircle label={tires.TI} name="Tras. Izq." color="bg-zinc-800 text-zinc-500 border-white/10" />
              <TireCircle label={tires.TD} name="Tras. Der." color="bg-zinc-800 text-zinc-500 border-white/10" />
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={rotate} className="flex-1 py-2.5 rounded-xl bg-auto-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-auto-500 transition-colors">
            <RotateCw className="w-3.5 h-3.5" /> Rotar (cruzado)
          </button>
          <button onClick={reset} className="px-4 py-2.5 rounded-xl bg-zinc-800 text-zinc-500 text-xs font-medium hover:bg-zinc-800 transition-colors">
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
      <span className="text-[9px] text-zinc-500">{name}</span>
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
      <div className="bg-zinc-900 border border-white/10 shadow-sm rounded-2xl p-4 space-y-3">
        <p className="text-xs text-zinc-500">
          Genera un reporte PDF con todo el historial de mantenimientos, cargas de combustible y mejoras.
        </p>
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-zinc-800 rounded-xl p-2 text-center">
            <p className="text-lg font-black text-amber-400">{fuelLogs.length}</p>
            <p className="text-[9px] text-zinc-500">Cargas</p>
          </div>
          <div className="bg-zinc-800 rounded-xl p-2 text-center">
            <p className="text-lg font-black text-blue-400">{maintenances.length}</p>
            <p className="text-[9px] text-zinc-500">Mantenimientos</p>
          </div>
          <div className="bg-zinc-800 rounded-xl p-2 text-center">
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
