"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getCountryConfig, getCurrentCountryCode } from "@/lib/countries";
import type { Vehicle, FuelLog, MaintenanceLog, VehicleUpgrade, VehicleSpecs } from "@/types/database";
import {
  ChevronDown, Gauge, Droplets, Wrench, ShoppingBag, Shield, FileDown,
  Trash2, X, RotateCw, Fuel, ScrollText, CheckCircle2, AlertTriangle, Calendar,
  MoreVertical, Pencil, Search,
} from "lucide-react";
import { DatePicker } from "@/components/DatePicker";
import { PlacePicker } from "./PlacePicker";
import { BitacoraCharts } from "./BitacoraCharts";
import { useMoney } from "@/lib/money";
import { formatoRestante } from "@/lib/dates";
import { partProduct, PART_CATEGORIA_LABEL, searchProducts, type PartProduct } from "@/lib/auto-parts";

/* ═══════════════════════════ Tipos y datos ═══════════════════════ */
const maintTypes = [
  { value: "cambio_aceite", label: "Cambio de aceite", icon: "🛢️" },
  { value: "preventivo", label: "Preventivo", icon: "🔧" },
  { value: "correctivo", label: "Correctivo", icon: "🛠️" },
  { value: "lavado", label: "Lavado", icon: "🧽" },
  { value: "inspeccion", label: "Inspección", icon: "🔍" },
  { value: "otro", label: "Otro", icon: "📌" },
];

type TimelineItem =
  | { type: "fuel"; data: FuelLog }
  | { type: "maintenance"; data: MaintenanceLog }
  | { type: "part"; data: VehicleUpgrade };

interface Props {
  userId: string;
  vehicle: Vehicle | null;
  fuelLogs: FuelLog[];
  maintenances: MaintenanceLog[];
  upgrades: VehicleUpgrade[];
}

const GAL = 3.78541;
const MESES_LARGO = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

const itemKey = (item: TimelineItem) => `${item.type}-${item.data.id}`;

/** Suma el costo de un evento en la moneda local. */
function eventCost(item: TimelineItem): number {
  if (item.type === "fuel") {
    const f = item.data as FuelLog;
    return f.precio_por_galon * (f.litros / GAL);
  }
  if (item.type === "maintenance") return (item.data as MaintenanceLog).costo || 0;
  return (item.data as VehicleUpgrade).costo || 0;
}

function itemFecha(item: TimelineItem): string {
  return item.data.fecha;
}

function itemLabel(item: TimelineItem): string {
  if (item.type === "fuel") {
    const f = item.data as FuelLog;
    const tipo = f.tipo_combustible ? ` (${f.tipo_combustible})` : "";
    return `Combustible${tipo}`;
  }
  if (item.type === "maintenance") return (item.data as MaintenanceLog).titulo || "Mantenimiento";
  const u = item.data as VehicleUpgrade;
  return u.nombre || "Repuesto / accesorio";
}

function itemIcon(item: TimelineItem) {
  if (item.type === "fuel") return { icon: <Fuel className="w-5 h-5 text-cyan-400" />, chip: "bg-cyan-500/10 border border-cyan-500/20", border: "border-l-cyan-500" };
  if (item.type === "maintenance") {
    const m = item.data as MaintenanceLog;
    const esAceite = m.tipo === "cambio_aceite";
    return { icon: esAceite ? <Droplets className="w-5 h-5 text-violet-400" /> : <Wrench className="w-5 h-5 text-blue-400" />, chip: esAceite ? "bg-violet-500/10 border border-violet-500/20" : "bg-blue-500/10 border border-blue-500/20", border: esAceite ? "border-l-violet-500" : "border-l-blue-500" };
  }
  return { icon: <ShoppingBag className="w-5 h-5 text-violet-400" />, chip: "bg-violet-500/10 border border-violet-500/20", border: "border-l-violet-500" };
}

/** Estado de vida útil de un repuesto: por km y/o por fecha. */
function partLife(u: VehicleUpgrade, currentKm: number): { km: string | null; fecha: string | null; nivel: "ok" | "aviso" | "vencido" } {
  let km: string | null = null;
  let fecha: string | null = null;
  let nivel: "ok" | "aviso" | "vencido" = "ok";

  if (u.ciclo === "km" && u.duracion_km) {
    const base = u.odometro ?? currentKm;
    const limite = base + u.duracion_km;
    const restante = limite - currentKm;
    if (restante <= 0) { km = "vencido por km"; nivel = "vencido"; }
    else if (restante <= 3000) { km = `${restante.toLocaleString("es-PE")} km restantes`; nivel = "aviso"; }
    else km = `vence en ${restante.toLocaleString("es-PE")} km`;
  }
  if (u.fecha_vencimiento) {
    const vencido = u.fecha_vencimiento < new Date().toISOString().slice(0, 10);
    if (vencido) { fecha = "vencido por fecha"; nivel = "vencido"; }
    else {
      const dias = Math.ceil((new Date(u.fecha_vencimiento + "T12:00:00").getTime() - Date.now()) / 86400000);
      fecha = dias <= 0 ? "vence hoy" : dias <= 15 ? `vence en ${dias} días` : `vence ${formatoRestante(u.fecha_vencimiento)}`;
      if (nivel !== "vencido" && dias <= 30) nivel = "aviso";
    }
  }
  return { km, fecha, nivel };
}

export default function BitacoraClient({ userId, vehicle, fuelLogs, maintenances, upgrades }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const add = searchParams.get("add");
    if (add) router.replace(window.location.pathname, { scroll: false });
  }, [searchParams, router]);

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

      <TimelineSection fuelLogs={fuelLogs} maintenances={maintenances} upgrades={upgrades} vehicleId={vehicle.id} currentKm={vehicle.kilometraje} />
      <BitacoraCharts fuelLogs={fuelLogs} maintenances={maintenances} upgrades={upgrades} />
      <WarrantySection vehicle={vehicle} maintenances={maintenances} />
      <TireRotationSection />
      <CarfaxExportSection vehicle={vehicle} fuelLogs={fuelLogs} maintenances={maintenances} upgrades={upgrades} />
    </div>
  );
}

/* ═══════════════════════════ 1. Línea de Tiempo (única) ═══════════════════════ */
function TimelineSection({ fuelLogs, maintenances, upgrades, vehicleId, currentKm }: {
  fuelLogs: FuelLog[]; maintenances: MaintenanceLog[]; upgrades: VehicleUpgrade[]; vehicleId: string; currentKm: number;
}) {
  const { money } = useMoney();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countryCode, setCountryCode] = useState<string | null>(null);
  const [addType, setAddType] = useState<"fuel" | "maint" | "part" | null>(null);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [fuelLogsState, setFuelLogsState] = useState(fuelLogs);
  const [maintsState, setMaintsState] = useState(maintenances);
  const [partsState, setPartsState] = useState(upgrades);
  const [visible, setVisible] = useState(3);

  useEffect(() => { getCurrentCountryCode().then((c) => setCountryCode(c)); }, []);

  // Desplegar automáticamente el formulario según ?add= (desde el Home)
  useEffect(() => {
    const add = searchParams.get("add");
    if (add === "fuel" || add === "maint" || add === "upgrade" || add === "part") setAddType(add === "fuel" ? "fuel" : add === "maint" ? "maint" : "part");
    if (add) router.replace(window.location.pathname, { scroll: false });
  }, [searchParams, router]);

  const esGalon = getCountryConfig(countryCode).fuelUnit === "galon";
  const volLabel = (litros: number) => esGalon ? `${(litros / GAL).toFixed(2)} gal` : `${litros} L`;
  const precioLabel = (p: number) => esGalon ? money(p) : money(p / GAL);

  const timeline: TimelineItem[] = [
    ...fuelLogsState.map((f) => ({ type: "fuel" as const, data: f })),
    ...maintsState.map((m) => ({ type: "maintenance" as const, data: m })),
    ...partsState.map((u) => ({ type: "part" as const, data: u })),
  ].sort((a, b) => new Date(b.data.fecha).getTime() - new Date(a.data.fecha).getTime());

  // Agrupar por mes (yyyy-MM) con el total de gasto del mes
  const monthMap = new Map<string, TimelineItem[]>();
  for (const it of timeline) {
    const key = itemFecha(it).slice(0, 7);
    if (!monthMap.has(key)) monthMap.set(key, []);
    monthMap.get(key)!.push(it);
  }
  const months = [...monthMap.entries()]
    .map(([key, items]) => {
      const [y, m] = key.split("-").map(Number);
      return {
        key, label: `${MESES_LARGO[(m || 1) - 1]} ${y}`,
        total: items.reduce((s, it) => s + eventCost(it), 0),
        items,
      };
    })
    .sort((a, b) => (a.key < b.key ? 1 : -1));

  const closeAll = () => { setAddType(null); setEditingKey(null); };

  const deleteItem = async (item: TimelineItem) => {
    const conf = confirm(item.type === "fuel" ? "¿Eliminar esta carga?" : item.type === "maintenance" ? "¿Eliminar este servicio?" : "¿Eliminar este repuesto?");
    if (!conf) return;
    const table = item.type === "fuel" ? "fuel_logs" : item.type === "maintenance" ? "maintenance_logs" : "vehicle_upgrades";
    const { error } = await createClient().from(table).delete().eq("id", item.data.id);
    if (error) { alert("No se pudo eliminar."); return; }
    if (item.type === "fuel") setFuelLogsState(fuelLogsState.filter((x) => x.id !== item.data.id));
    else if (item.type === "maintenance") setMaintsState(maintsState.filter((x) => x.id !== item.data.id));
    else setPartsState(partsState.filter((x) => x.id !== item.data.id));
    setEditingKey(null);
  };

  // Paginación: muestra `visible` eventos (3 iniciales) y luego de 10 en 10
  const shown: { month: typeof months[number]; items: TimelineItem[] }[] = [];
  let acc = 0;
  for (const month of months) {
    if (acc >= visible) break;
    const take = month.items.slice(0, Math.max(0, visible - acc));
    if (take.length > 0) shown.push({ month, items: take });
    acc += take.length;
  }
  const totalVisible = shown.reduce((s, m) => s + m.items.length, 0);
  const hasMore = totalVisible < timeline.length;

  const currentEditItem = editingKey ? timeline.find((x) => itemKey(x) === editingKey) ?? null : null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-zinc-300 flex items-center gap-2">
          <ScrollText className="w-4 h-4 text-auto-500" /> Historial
        </h2>
        <span className="text-[10px] font-bold text-zinc-500 bg-white/[0.06] px-2 py-0.5 rounded-full">{timeline.length} eventos</span>
      </div>

      {/* Botones grandes de registro */}
      <div className="grid grid-cols-3 gap-2">
        <button type="button"
          onClick={() => { setEditingKey(null); setAddType(addType === "fuel" ? null : "fuel"); }}
          className={`flex flex-col items-center gap-1.5 rounded-2xl px-2 py-3 border transition-all active:scale-[0.98] ${addType === "fuel" ? "bg-cyan-500/20 border-cyan-500/40" : "bg-cyan-500/10 border-cyan-500/25 hover:bg-cyan-500/20"}`}>
          <Fuel className="w-5 h-5 text-cyan-400" />
          <span className="text-[10px] font-extrabold text-zinc-100 text-center leading-tight">Cargar combustible</span>
        </button>
        <button type="button"
          onClick={() => { setEditingKey(null); setAddType(addType === "maint" ? null : "maint"); }}
          className={`flex flex-col items-center gap-1.5 rounded-2xl px-2 py-3 border transition-all active:scale-[0.98] ${addType === "maint" ? "bg-blue-500/20 border-blue-500/40" : "bg-blue-500/10 border-blue-500/25 hover:bg-blue-500/20"}`}>
          <Wrench className="w-5 h-5 text-blue-400" />
          <span className="text-[10px] font-extrabold text-zinc-100 text-center leading-tight">Registrar servicio</span>
        </button>
        <button type="button"
          onClick={() => { setEditingKey(null); setAddType(addType === "part" ? null : "part"); }}
          className={`flex flex-col items-center gap-1.5 rounded-2xl px-2 py-3 border transition-all active:scale-[0.98] ${addType === "part" ? "bg-violet-500/20 border-violet-500/40" : "bg-violet-500/10 border-violet-500/25 hover:bg-violet-500/20"}`}>
          <ShoppingBag className="w-5 h-5 text-violet-400" />
          <span className="text-[10px] font-extrabold text-zinc-100 text-center leading-tight">Registrar repuesto</span>
        </button>
      </div>

      {/* Formulario para NUEVO registro */}
      {addType && (
        <div className="bg-zinc-900 border border-auto-500/25 shadow-sm rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold text-auto-400">
              {addType === "fuel" ? "⛽ Nueva carga" : addType === "maint" ? "🔧 Nuevo servicio" : "🛒 Nuevo repuesto / accesorio"}
            </p>
            <button type="button" onClick={() => setAddType(null)} className="w-6 h-6 rounded-md hover:bg-white/10 flex items-center justify-center text-zinc-500"><X className="w-3.5 h-3.5" /></button>
          </div>
          {addType === "fuel" && <AddFuelForm vehicleId={vehicleId} onDone={(f) => { if (f) setFuelLogsState([f, ...fuelLogsState]); setAddType(null); }} />}
          {addType === "maint" && <AddMaintForm vehicleId={vehicleId} onDone={(m) => { if (m) setMaintsState([m, ...maintsState]); setAddType(null); }} />}
          {addType === "part" && <AddPartForm vehicleId={vehicleId} onDone={(p) => { if (p) setPartsState([p, ...partsState]); setAddType(null); }} />}
        </div>
      )}

      {timeline.length === 0 ? (
        <p className="text-xs text-zinc-500 text-center py-4">Sin eventos registrados. Agrega tu primera carga, servicio o repuesto.</p>
      ) : (
        <div className="space-y-4">
          {shown.map(({ month, items }) => (
            <div key={month.key}>
              {/* Separador de mes con total */}
              <div className="flex items-center gap-2 mb-1.5">
                <p className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-wide">{month.label}</p>
                {month.total > 0 && (
                  <span className="text-[10px] font-bold text-auto-400 bg-auto-500/10 border border-auto-500/20 px-2 py-0.5 rounded-full ml-auto tabular-nums">
                    {money(Math.round(month.total))}
                  </span>
                )}
              </div>
              <div className="space-y-2">
                {items.map((item) => {
                  const key = itemKey(item);
                  // Edición inline: reemplaza la tarjeta por el formulario en su posición
                  if (key === editingKey) {
                    return (
                      <div key={key} className="bg-zinc-900 border border-auto-500/30 shadow-sm rounded-2xl p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] font-bold text-auto-400">
                            ✏️ {item.type === "fuel" ? "Editar carga" : item.type === "maintenance" ? "Editar servicio" : "Editar repuesto"}
                          </p>
                          <button type="button" onClick={() => setEditingKey(null)} className="w-6 h-6 rounded-md hover:bg-white/10 flex items-center justify-center text-zinc-500"><X className="w-3.5 h-3.5" /></button>
                        </div>
                        {item.type === "fuel" && (
                          <AddFuelForm vehicleId={vehicleId} editItem={item.data as FuelLog} onDone={(f) => {
                            if (f) setFuelLogsState(fuelLogsState.map((x) => (x.id === f.id ? f : x)));
                            setEditingKey(null);
                          }} />
                        )}
                        {item.type === "maintenance" && (
                          <AddMaintForm vehicleId={vehicleId} editItem={item.data as MaintenanceLog} onDone={(m) => {
                            if (m) setMaintsState(maintsState.map((x) => (x.id === m.id ? m : x)));
                            setEditingKey(null);
                          }} />
                        )}
                        {item.type === "part" && (
                          <AddPartForm vehicleId={vehicleId} editItem={item.data as VehicleUpgrade} onDone={(p) => {
                            if (p) setPartsState(partsState.map((x) => (x.id === p.id ? p : x)));
                            setEditingKey(null);
                          }} />
                        )}
                      </div>
                    );
                  }
                  return (
                    <TimelineItemCard
                      key={key}
                      item={item}
                      esGalon={esGalon}
                      volLabel={volLabel}
                      precioLabel={precioLabel}
                      money={money}
                      currentKm={currentKm}
                      onEdit={() => { setAddType(null); setEditingKey(key); }}
                      onDelete={() => deleteItem(item)}
                    />
                  );
                })}
              </div>
            </div>
          ))}

          {hasMore && (
            <button type="button" onClick={() => setVisible((v) => v + 10)}
              className="w-full py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-[11px] font-bold text-auto-400 hover:bg-white/[0.08] transition-colors flex items-center justify-center gap-1.5">
              <ChevronDown className="w-3.5 h-3.5" /> Ver más ({timeline.length - totalVisible} restantes)
            </button>
          )}

          {visible > 3 && (
            <button type="button" onClick={() => setVisible(3)}
              className="w-full py-2 rounded-xl text-[11px] font-bold text-zinc-500 hover:text-zinc-300 transition-colors">
              ▲ Ver menos
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function TimelineItemCard({ item, esGalon, volLabel, precioLabel, money, currentKm, onEdit, onDelete }: {
  item: TimelineItem;
  esGalon: boolean;
  volLabel: (litros: number) => string;
  precioLabel: (p: number) => string;
  money: (n: number) => string;
  currentKm: number;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const st = itemIcon(item);

  let detail: string = "";
  if (item.type === "fuel") {
    const f = item.data as FuelLog;
    detail = `${f.odometro.toLocaleString("es-PE")} km`;
    if (f.grifo) detail += ` · ${f.grifo}`;
  } else if (item.type === "maintenance") {
    const m = item.data as MaintenanceLog;
    detail = m.odometro != null ? `${m.odometro.toLocaleString("es-PE")} km` : "";
    if (m.km_proximo != null) {
      detail += detail ? ` · próximo cambio ${m.km_proximo.toLocaleString("es-PE")} km` : `Próximo cambio ${m.km_proximo.toLocaleString("es-PE")} km`;
    }
  } else {
    const u = item.data as VehicleUpgrade;
    const prod = partProduct(u.tipo_componente || "");
    detail = prod ? prod.emoji + " " + (PART_CATEGORIA_LABEL[u.categoria] || "") : PART_CATEGORIA_LABEL[u.categoria] || "";
    if (u.odometro != null) detail += detail ? ` · compra a ${u.odometro.toLocaleString("es-PE")} km` : `compra a ${u.odometro.toLocaleString("es-PE")} km`;
  }

  const part = item.type === "part" ? partLife(item.data as VehicleUpgrade, currentKm) : null;
  const lifeColor = part?.nivel === "vencido" ? "text-red-400" : part?.nivel === "aviso" ? "text-amber-400" : "text-emerald-400";
  const lifeText = part ? [part.km, part.fecha].filter(Boolean).join(" · ") : null;

  return (
    <div className={`bg-zinc-900 border border-white/10 shadow-sm rounded-2xl p-3 flex items-center gap-3 border-l-2 ${st.border}`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${st.chip}`}>{st.icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-zinc-100">
          {itemLabel(item)}
          {item.type === "fuel" && <> · {volLabel((item.data as FuelLog).litros)} {esGalon ? `/gal @ ${precioLabel((item.data as FuelLog).precio_por_galon)}` : ` @ ${precioLabel((item.data as FuelLog).precio_por_galon)}/L`}</>}
        </p>
        <p className="text-[10px] text-zinc-500 flex items-center gap-1 truncate">
          <Calendar className="w-3 h-3 shrink-0" />
          {new Date(item.data.fecha + "T12:00:00").toLocaleDateString("es-PE")}
          {detail && <span className="truncate"> · {detail}</span>}
        </p>
        {part && lifeText && <p className={`text-[9px] font-bold mt-0.5 truncate ${lifeColor}`}>⏳ {lifeText}</p>}
      </div>
      <span className="text-xs font-bold text-zinc-300 shrink-0">{money(Math.round(eventCost(item)))}</span>
      <div className="relative shrink-0" ref={menuRef}>
        <button type="button" onClick={() => setMenuOpen(!menuOpen)}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.06] transition-colors" aria-label="Opciones">
          <MoreVertical className="w-4 h-4" />
        </button>
        {menuOpen && (
          <div className="absolute z-30 right-0 mt-1 w-32 bg-zinc-800 border border-white/10 rounded-xl shadow-xl overflow-hidden">
            <button type="button" onClick={() => { setMenuOpen(false); onEdit(); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-zinc-200 hover:bg-white/[0.06] transition-colors">
              <Pencil className="w-3.5 h-3.5" /> Editar
            </button>
            <button type="button" onClick={() => { setMenuOpen(false); onDelete(); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-300 hover:bg-red-500/10 transition-colors">
              <Trash2 className="w-3.5 h-3.5" /> Eliminar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════ Forms ═══════════════════════ */
function AddFuelForm({ vehicleId, editItem, onDone }: { vehicleId: string; editItem?: FuelLog | null; onDone: (f: FuelLog | null) => void }) {
  const [countryCode, setCountryCode] = useState<string | null>(null);
  const [form, setForm] = useState({ cantidad: "", precio_por_galon: "", odometro: "", fecha: new Date().toISOString().split("T")[0], tipo: "90", grifo: "", contacto_id: null as string | null });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getCurrentCountryCode().then((code) => {
      setCountryCode(code);
      const cfg = getCountryConfig(code);
      const esGalon = cfg.fuelUnit === "galon";
      if (editItem) {
        setForm({
          cantidad: String(esGalon ? editItem.litros / GAL : editItem.litros),
          precio_por_galon: String(esGalon ? editItem.precio_por_galon : editItem.precio_por_galon / GAL),
          odometro: String(editItem.odometro || ""),
          fecha: editItem.fecha,
          tipo: editItem.tipo_combustible || (cfg.fuelTypes[0]?.value || "90"),
          grifo: editItem.grifo || "",
          contacto_id: editItem.contacto_id || null,
        });
      } else {
        setForm((f) => ({ ...f, tipo: cfg.fuelTypes[0]?.value || "90" }));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editItem]);

  const cfg = getCountryConfig(countryCode);
  const esGalon = cfg.fuelUnit === "galon";
  const unidadLabel = esGalon ? "galones" : "litros";
  const unidadShort = esGalon ? "gal" : "L";
  const precioUnit = esGalon ? "galón" : "litro";

  const handleSubmit = async () => {
    const cant = parseFloat(form.cantidad);
    const precioLocal = parseFloat(form.precio_por_galon);
    const o = parseInt(form.odometro);
    if (!cant || !precioLocal || !o) return;
    const litros = esGalon ? cant * GAL : cant;
    const precioPorGalon = esGalon ? precioLocal : precioLocal * GAL;

    setSaving(true);
    const supabase = createClient();
    let data: FuelLog | null = null;
    if (editItem) {
      const { data: d } = await supabase.from("fuel_logs").update({
        litros, precio_por_galon: precioPorGalon, odometro: o, fecha: form.fecha, tipo_combustible: form.tipo, grifo: form.grifo || null, contacto_id: form.contacto_id || null,
      }).eq("id", editItem.id).select().single();
      data = d as FuelLog | null;
    } else {
      const { data: d } = await supabase.from("fuel_logs").insert({
        vehicle_id: vehicleId, litros, precio_por_galon: precioPorGalon, odometro: o, fecha: form.fecha, tipo_combustible: form.tipo, grifo: form.grifo || null, contacto_id: form.contacto_id || null,
      }).select().single();
      data = d as FuelLog | null;
    }
    if (data) await supabase.from("vehicles").update({ kilometraje: o }).eq("id", vehicleId);
    setSaving(false);
    if (data) onDone(data);
  };

  return (
    <div className="space-y-2">
      <p className="text-[10px] font-bold text-zinc-400">Unidad: {esGalon ? "galones" : "litros"} · el precio es por {precioUnit}</p>
      <div className="grid grid-cols-4 gap-1.5">
        <input type="number" step="0.1" value={form.cantidad} onChange={(e) => setForm({ ...form, cantidad: e.target.value })} placeholder={unidadShort} className="px-2 py-1.5 rounded-lg border border-white/10 text-xs bg-zinc-800 text-zinc-200 min-w-0" />
        <input type="number" step="0.01" value={form.precio_por_galon} onChange={(e) => setForm({ ...form, precio_por_galon: e.target.value })} placeholder={`${cfg.currency}/${unidadShort}`} className="px-2 py-1.5 rounded-lg border border-white/10 text-xs bg-zinc-800 text-zinc-200 min-w-0" />
        <input type="number" value={form.odometro} onChange={(e) => setForm({ ...form, odometro: e.target.value })} placeholder="Odom." className="px-2 py-1.5 rounded-lg border border-white/10 text-xs bg-zinc-800 text-zinc-200 min-w-0" />
        <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} className="px-1 py-1.5 rounded-lg border border-white/10 text-xs bg-zinc-800 text-zinc-200 min-w-0">
          {cfg.fuelTypes.map((ft) => <option key={ft.value} value={ft.value}>{ft.label}</option>)}
        </select>
      </div>
      <div>
        <span className="text-[10px] font-bold text-zinc-500">Grifo / estación donde cargaste</span>
        <div className="mt-0.5">
          <PlacePicker
            vehicleId={vehicleId}
            tipos={["grifo", "otro"]}
            value={form.contacto_id}
            onSelect={(c) => setForm((f) => ({ ...f, contacto_id: c ? c.id : null, grifo: c ? c.nombre : f.grifo }))}
            placeholder="Sin grifo definido"
          />
        </div>
      </div>
      <DatePicker colorTheme="auto" value={form.fecha} onChange={(d) => setForm({ ...form, fecha: d })} />
      <div className="flex gap-1.5">
        <button type="button" onClick={handleSubmit} disabled={saving} className="flex-1 px-3 py-2 rounded-lg bg-auto-600 text-white text-xs font-bold">{saving ? "..." : editItem ? "Guardar cambios" : "Guardar"}</button>
      </div>
    </div>
  );
}

function AddMaintForm({ vehicleId, editItem, onDone }: { vehicleId: string; editItem?: MaintenanceLog | null; onDone: (m: MaintenanceLog | null) => void }) {
  const { symbol } = useMoney();
  const [form, setForm] = useState({ tipo: "preventivo", titulo: "", costo: "", odometro: "", km_proximo: "", taller: "", contacto_id: null as string | null, fecha: new Date().toISOString().split("T")[0] });
  const [saving, setSaving] = useState(false);

  const esAceite = form.tipo === "cambio_aceite";

  useEffect(() => {
    if (editItem) {
      setForm({
        tipo: editItem.tipo || "preventivo",
        titulo: editItem.titulo || "",
        costo: editItem.costo != null ? String(editItem.costo) : "",
        odometro: editItem.odometro != null ? String(editItem.odometro) : "",
        km_proximo: editItem.km_proximo != null ? String(editItem.km_proximo) : "",
        taller: editItem.taller || "",
        contacto_id: editItem.contacto_id || null,
        fecha: editItem.fecha,
      });
    }
  }, [editItem]);

  const handleTipo = (tipo: string) => {
    setForm((f) => ({
      ...f, tipo,
      titulo: tipo === "cambio_aceite" && !editItem ? "Cambio de aceite" : f.titulo,
      ...(tipo === "cambio_aceite" && !f.km_proximo && f.odometro ? { km_proximo: String(parseInt(f.odometro || "0") + 5000) } : {}),
    }));
  };

  const handleSubmit = async () => {
    const tituloOk = form.titulo || (esAceite ? "Cambio de aceite" : "");
    if (!tituloOk) return;
    setSaving(true);
    const supabase = createClient();
    const payload = {
      tipo: form.tipo, titulo: tituloOk,
      costo: form.costo ? parseFloat(form.costo) : null,
      odometro: form.odometro ? parseInt(form.odometro) : null,
      km_proximo: form.km_proximo ? parseInt(form.km_proximo) : null,
      taller: form.taller || null, contacto_id: form.contacto_id || null, fecha: form.fecha,
    };
    let data: MaintenanceLog | null = null;
    if (editItem) {
      const { data: d } = await supabase.from("maintenance_logs").update(payload).eq("id", editItem.id).select().single();
      data = d as MaintenanceLog | null;
    } else {
      const { data: d } = await supabase.from("maintenance_logs").insert({ ...payload, vehicle_id: vehicleId }).select().single();
      data = d as MaintenanceLog | null;
    }
    if (data && form.odometro) await supabase.from("vehicles").update({ kilometraje: parseInt(form.odometro) }).eq("id", vehicleId);
    setSaving(false);
    if (data) onDone(data);
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-1.5">
        <select value={form.tipo} onChange={(e) => handleTipo(e.target.value)} className="px-2 py-2 rounded-lg border border-white/10 text-xs bg-zinc-800 text-zinc-200">
          {maintTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <input type="number" step="0.01" value={form.costo} onChange={(e) => setForm({ ...form, costo: e.target.value })} placeholder={`${symbol} costo`} className="px-2 py-2 rounded-lg border border-white/10 text-xs bg-zinc-800 text-zinc-200" />
      </div>

      {esAceite ? (
        <div className="rounded-xl bg-zinc-800/60 border border-violet-500/20 p-2.5 space-y-2">
          <p className="text-[10px] font-bold text-violet-300 flex items-center gap-1"><Droplets className="w-3 h-3" /> Cambio de aceite</p>
          <div className="grid grid-cols-2 gap-1.5">
            <label className="block"><span className="text-[9px] font-bold text-zinc-500">Fecha del cambio</span>
              <DatePicker colorTheme="auto" value={form.fecha} onChange={(d) => setForm({ ...form, fecha: d })} />
            </label>
            <label className="block"><span className="text-[9px] font-bold text-zinc-500">Km en el cambio</span>
              <input type="number" value={form.odometro} onChange={(e) => {
                const od = e.target.value;
                setForm((f) => ({ ...f, odometro: od, ...(!f.km_proximo && od ? { km_proximo: String(parseInt(od || "0") + 5000) } : {}) }));
              }} placeholder="Ej: 45000" className="w-full px-2 py-1.5 rounded-lg border border-white/10 text-xs bg-zinc-800 text-zinc-200" />
            </label>
          </div>
          <label className="block"><span className="text-[9px] font-bold text-zinc-500">Próximo cambio a los (km)</span>
            <input type="number" value={form.km_proximo} onChange={(e) => setForm({ ...form, km_proximo: e.target.value })} placeholder="Ej: 50000" className="w-full px-2 py-1.5 rounded-lg border border-white/10 text-xs bg-zinc-800 text-zinc-200" />
          </label>
        </div>
      ) : (
        <>
          <input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} placeholder="Título del mantenimiento" className="w-full px-2 py-1.5 rounded-lg border border-white/10 text-xs bg-zinc-800 text-zinc-200" />
          <input type="number" value={form.odometro} onChange={(e) => setForm({ ...form, odometro: e.target.value })} placeholder="Odómetro" className="w-full px-2 py-1.5 rounded-lg border border-white/10 text-xs bg-zinc-800 text-zinc-200" />
          <div>
            <span className="text-[10px] font-bold text-zinc-500">Taller / dónde lo hiciste</span>
            <div className="mt-0.5">
              <PlacePicker
                vehicleId={vehicleId}
                tipos={["mecanico", "electromecanico", "grua", "tienda_repuestos", "otro"]}
                value={form.contacto_id}
                onSelect={(c) => setForm((f) => ({ ...f, contacto_id: c ? c.id : null, taller: c ? c.nombre : f.taller }))}
              />
            </div>
          </div>
          <DatePicker colorTheme="auto" value={form.fecha} onChange={(d) => setForm({ ...form, fecha: d })} />
        </>
      )}

      <div className="flex gap-1.5">
        <button type="button" onClick={handleSubmit} disabled={saving} className="flex-1 px-3 py-2 rounded-lg bg-auto-600 text-white text-xs font-bold">{saving ? "..." : editItem ? "Guardar cambios" : esAceite ? "Registrar cambio de aceite" : "Guardar"}</button>
      </div>
    </div>
  );
}

/* Formulario de repuesto/accesorio: buscador + catálogo + sincronización con el ADN */
function AddPartForm({ vehicleId, editItem, onDone }: { vehicleId: string; editItem?: VehicleUpgrade | null; onDone: (p: VehicleUpgrade | null) => void }) {
  const { symbol } = useMoney();
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [specs, setSpecs] = useState<VehicleSpecs | null>(null);

  // Cargar el ADN actual para pre-llenar campos sincronizables
  useEffect(() => {
    createClient().from("vehicle_specs").select("*").eq("vehicle_id", vehicleId).maybeSingle()
      .then(({ data }) => setSpecs(data as VehicleSpecs | null));
  }, [vehicleId]);

  const [form, setForm] = useState({
    tipo_componente: editItem?.tipo_componente || "",
    nombre: editItem?.nombre || "",
    categoria: editItem?.categoria || "estetico",
    marca: editItem?.marca || "",
    proveedor: editItem?.proveedor || "",
    contacto_id: editItem?.contacto_id || null as string | null,
    costo: editItem?.costo != null ? String(editItem.costo) : "",
    fecha: editItem?.fecha || new Date().toISOString().split("T")[0],
    odometro: editItem?.odometro != null ? String(editItem.odometro) : "",
    conKm: editItem?.ciclo === "km",
    duracion_km: editItem?.duracion_km != null ? String(editItem.duracion_km) : "",
    conVencimiento: !!editItem?.fecha_vencimiento,
    fecha_vencimiento: editItem?.fecha_vencimiento || "",
    notas: editItem?.notas || "",
    adn: {} as Record<string, string>,
  });

  const picked = partProduct(form.tipo_componente);
  const results = searchProducts(query);

  const adnDefault = (key: string): string => {
    const v = (specs as unknown as Record<string, unknown>)?.[key];
    if (v == null) return "";
    if (key === "bateria_mantenimiento_fecha") return String(v);
    return String(v);
  };

  const applyProduct = (prod: PartProduct) => {
    const adn: Record<string, string> = {};
    for (const f of prod.adn || []) adn[f.key] = adnDefault(f.key);
    setForm((f) => {
      const next: typeof form = {
        ...f,
        tipo_componente: prod.value,
        categoria: prod.categoria,
        nombre: f.nombre || prod.label,
        adn,
      };
      if (prod.vida) {
        if (prod.vida.tipo === "km" && prod.vida.km) {
          next.conKm = true;
          next.duracion_km = String(prod.vida.km);
          next.conVencimiento = false;
          next.fecha_vencimiento = "";
        } else if (prod.vida.tipo === "tiempo" && prod.vida.meses) {
          next.conKm = false;
          next.duracion_km = "";
          next.conVencimiento = true;
          const d = new Date(next.fecha + "T12:00:00");
          d.setMonth(d.getMonth() + prod.vida.meses);
          next.fecha_vencimiento = d.toISOString().slice(0, 10);
        }
      }
      return next;
    });
    setQuery("");
    setShowPicker(false);
  };

  const handleSubmit = async () => {
    if (!form.nombre) return;
    setSaving(true);
    const supabase = createClient();
    const payload = {
      vehicle_id: vehicleId,
      tipo_componente: form.tipo_componente || null,
      nombre: form.nombre,
      categoria: form.categoria,
      marca: form.marca || null,
      proveedor: form.proveedor || null,
      contacto_id: form.contacto_id || null,
      costo: form.costo ? parseFloat(form.costo) : null,
      fecha: form.fecha,
      odometro: form.odometro ? parseInt(form.odometro) : null,
      fecha_mantenimiento: null,
      fecha_vencimiento: form.conVencimiento && form.fecha_vencimiento ? form.fecha_vencimiento : null,
      ciclo: form.conKm ? "km" : (form.conVencimiento ? "tiempo" : null),
      duracion_km: form.conKm && form.duracion_km ? parseInt(form.duracion_km) : null,
      notas: form.notas || null,
    };
    let data: VehicleUpgrade | null = null;
    if (editItem) {
      const { data: d } = await supabase.from("vehicle_upgrades").update(payload).eq("id", editItem.id).select().single();
      data = d as VehicleUpgrade | null;
    } else {
      const { data: d } = await supabase.from("vehicle_upgrades").insert(payload).select().single();
      data = d as VehicleUpgrade | null;
    }

    // Sincronizar campos del ADN si el producto los tiene y el usuario completó alguno
    const adnFields = picked?.adn || [];
    if (adnFields.length > 0) {
      const specPayload: Record<string, unknown> = { vehicle_id: vehicleId };
      for (const f of adnFields) {
        const raw = form.adn[f.key]?.trim() ?? "";
        if (!raw) continue;
        specPayload[f.key] = f.kind === "number" ? Number(raw) : raw;
      }
      if (Object.keys(specPayload).length > 1) {
        await supabase.from("vehicle_specs").upsert(specPayload, { onConflict: "vehicle_id" });
      }
    }

    setSaving(false);
    if (data) onDone(data);
  };

  const adnFields = picked?.adn || [];

  return (
    <div className="space-y-2">
      {/* Buscador de producto */}
      <div>
        <span className="text-[10px] font-bold text-zinc-500">Producto (busca el que compraste)</span>
        <div className="relative mt-0.5">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
          <input
            value={picked ? picked.label : query}
            readOnly={!!picked}
            onChange={(e) => { setQuery(e.target.value); setShowPicker(true); }}
            onFocus={() => setShowPicker(true)}
            onBlur={() => setTimeout(() => setShowPicker(false), 150)}
            placeholder="Llantas, batería, parlantes, gata…"
            className="w-full pl-8 pr-8 py-2 rounded-lg border border-white/10 text-xs bg-zinc-800 text-zinc-200"
          />
          {picked && (
            <button type="button" onClick={() => setForm((f) => ({ ...f, tipo_componente: "", categoria: "estetico", adn: {} }))}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-zinc-500 hover:text-zinc-200">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        {showPicker && !picked && (
          <div className="mt-1 max-h-52 overflow-y-auto rounded-xl border border-white/10 bg-zinc-900 p-1.5 space-y-0.5">
            {results.map((p) => (
              <button key={p.value} type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyProduct(p)}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/[0.06] text-left">
                <span className="text-base">{p.emoji}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-zinc-200 truncate">{p.label}</p>
                  <p className="text-[9px] text-zinc-500 truncate">
                    {PART_CATEGORIA_LABEL[p.categoria]} · {p.tipoMantenimiento}
                    {p.vida?.tipo === "km" && p.vida.km ? ` · ${p.vida.km.toLocaleString("es-PE")} km` : ""}
                    {p.vida?.tipo === "tiempo" && p.vida.meses ? ` · ${p.vida.meses} meses` : ""}
                  </p>
                </div>
              </button>
            ))}
            {results.length === 0 && <p className="text-[10px] text-zinc-500 px-2 py-2">Sin resultados. Puedes registrarlo como accesorio escribiendo el nombre.</p>}
          </div>
        )}
      </div>

      {picked?.descripcion && (
        <p className="text-[9px] text-zinc-500">{picked.descripcion} · {picked.tipoMantenimiento}</p>
      )}

      <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Nombre del repuesto / accesorio" className="w-full px-2 py-2 rounded-lg border border-white/10 text-xs bg-zinc-800 text-zinc-200" />

      <div>
        <input value={form.marca} onChange={(e) => setForm({ ...form, marca: e.target.value })} placeholder="Marca (ej: BOSCH)" className="w-full px-2 py-2 rounded-lg border border-white/10 text-xs bg-zinc-800 text-zinc-200" />
      </div>
      <div>
        <span className="text-[10px] font-bold text-zinc-500">Dónde lo compraste</span>
        <div className="mt-0.5">
          <PlacePicker
            vehicleId={vehicleId}
            tipos={["tienda_repuestos", "tienda_accesorios", "grifo", "otro"]}
            value={form.contacto_id}
            onSelect={(c) => setForm((f) => ({ ...f, contacto_id: c ? c.id : null, proveedor: c ? c.nombre : f.proveedor }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        <label className="block min-w-0"><span className="text-[9px] font-bold text-zinc-500">Costo ({symbol})</span>
          <input type="number" step="0.01" value={form.costo} onChange={(e) => setForm({ ...form, costo: e.target.value })} placeholder="Ej: 450" className="w-full px-2 py-1.5 rounded-lg border border-white/10 text-xs bg-zinc-800 text-zinc-200" />
        </label>
        <label className="block min-w-0"><span className="text-[9px] font-bold text-zinc-500">Odómetro al comprar</span>
          <input type="number" value={form.odometro} onChange={(e) => setForm({ ...form, odometro: e.target.value })} placeholder="Ej: 45000" className="w-full px-2 py-1.5 rounded-lg border border-white/10 text-xs bg-zinc-800 text-zinc-200" />
        </label>
      </div>

      <DatePicker colorTheme="auto" value={form.fecha} onChange={(d) => {
        setForm((f) => {
          const next = { ...f, fecha: d };
          if (form.conVencimiento && form.tipo_componente) {
            const prod = partProduct(form.tipo_componente);
            if (prod?.vida?.tipo === "tiempo" && prod.vida.meses) {
              const fecha = new Date(d + "T12:00:00");
              fecha.setMonth(fecha.getMonth() + prod.vida.meses);
              next.fecha_vencimiento = fecha.toISOString().slice(0, 10);
            }
          }
          return next;
        });
      }} />

      {/* Sincronización con el ADN del vehículo */}
      {adnFields.length > 0 && (
        <div className="rounded-xl bg-auto-500/[0.05] border border-auto-500/20 p-2.5 space-y-2">
          <p className="text-[10px] font-bold text-auto-400 flex items-center gap-1">
            <Gauge className="w-3 h-3" /> Se sincronizará con el ADN del vehículo
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {adnFields.map((f) => (
              <label key={f.key} className="block min-w-0 col-span-2 sm:col-span-1">
                <span className="text-[9px] font-bold text-zinc-500 block truncate">{f.label}</span>
                {f.kind === "date" ? (
                  <DatePicker colorTheme="auto" value={form.adn[f.key] || ""} onChange={(d) => setForm({ ...form, adn: { ...form.adn, [f.key]: d } })} />
                ) : (
                  <input
                    type={f.kind === "number" ? "number" : "text"}
                    value={form.adn[f.key] || ""}
                    onChange={(e) => setForm({ ...form, adn: { ...form.adn, [f.key]: e.target.value } })}
                    placeholder={f.help || ""}
                    className="w-full px-2 py-1.5 rounded-lg border border-white/10 text-xs bg-zinc-800 text-zinc-200 mt-0.5"
                  />
                )}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Vida útil: km y/o fecha */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-[10px] text-zinc-500">Marca el límite por kilómetros, por fecha, o ambos (se avisará lo que ocurra primero).</div>
        <div className="grid grid-cols-2 gap-1.5">
          <label className="flex items-center gap-2 cursor-pointer text-[11px] text-zinc-300">
            <input type="checkbox" checked={form.conKm} onChange={(e) => setForm((f) => ({ ...f, conKm: e.target.checked }))} className="accent-auto-500" /> Duración por km
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-[11px] text-zinc-300">
            <input type="checkbox" checked={form.conVencimiento} onChange={(e) => setForm((f) => ({ ...f, conVencimiento: e.target.checked }))} className="accent-auto-500" /> Vence (fecha)
          </label>
        </div>
        {form.conKm && (
          <div>
            <span className="text-[9px] font-bold text-zinc-500">Duración útil en km</span>
            <input type="number" min="0" value={form.duracion_km} onChange={(e) => setForm({ ...form, duracion_km: e.target.value })} placeholder="Ej: 40000" className="w-full px-2 py-1.5 rounded-lg border border-white/10 text-xs bg-zinc-800 text-zinc-200 mt-0.5" />
          </div>
        )}
        {form.conVencimiento && (
          <div>
            <span className="text-[9px] font-bold text-zinc-500">Fecha de vencimiento</span>
            <DatePicker colorTheme="auto" value={form.fecha_vencimiento} onChange={(d) => setForm({ ...form, fecha_vencimiento: d })} />
          </div>
        )}
      </div>

      <input value={form.notas} onChange={(e) => setForm({ ...form, notas: e.target.value })} placeholder="Notas (opcional)" className="w-full px-2 py-1.5 rounded-lg border border-white/10 text-xs bg-zinc-800 text-zinc-200" />

      <div className="flex gap-1.5">
        <button type="button" onClick={handleSubmit} disabled={saving} className="flex-1 px-3 py-2.5 rounded-lg bg-auto-600 text-white text-sm font-bold">{saving ? "..." : editItem ? "Guardar cambios" : "Registrar repuesto"}</button>
      </div>
    </div>
  );
}

/* ═══════════════════════════ 2. Control de Garantía ═══════════════════════ */
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

/* ═══════════════════════════ 3. Rotación de Neumáticos ═══════════════════════ */
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
          <button onClick={reset} className="px-4 py-2.5 rounded-xl bg-zinc-800 text-zinc-500 text-xs font-medium hover:bg-zinc-800 transition-colors">Reiniciar</button>
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

/* ═══════════════════════════ 4. Exportación Carfax ═══════════════════════ */
function CarfaxExportSection({ vehicle, fuelLogs, maintenances, upgrades }: {
  vehicle: Vehicle; fuelLogs: FuelLog[]; maintenances: MaintenanceLog[]; upgrades: VehicleUpgrade[];
}) {
  const totalEvents = fuelLogs.length + maintenances.length + upgrades.length;
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-bold text-zinc-300 flex items-center gap-2">
        <FileDown className="w-4 h-4 text-auto-500" /> Reporte Carfax
      </h2>
      <div className="bg-zinc-900 border border-white/10 shadow-sm rounded-2xl p-4 space-y-3">
        <p className="text-xs text-zinc-500">Genera un reporte PDF con todo el historial de mantenimientos, cargas, repuestos y mejoras.</p>
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-zinc-800 rounded-xl p-2 text-center">
            <p className="text-lg font-black text-cyan-400">{fuelLogs.length}</p>
            <p className="text-[9px] text-zinc-500">Cargas</p>
          </div>
          <div className="bg-zinc-800 rounded-xl p-2 text-center">
            <p className="text-lg font-black text-blue-400">{maintenances.length}</p>
            <p className="text-[9px] text-zinc-500">Mantenimientos</p>
          </div>
          <div className="bg-zinc-800 rounded-xl p-2 text-center">
            <p className="text-lg font-black text-violet-400">{upgrades.length}</p>
            <p className="text-[9px] text-zinc-500">Repuestos</p>
          </div>
        </div>
        <button onClick={() => window.open("/auto/app/bitacora/carfax", "_blank")}
          className="w-full py-3 rounded-xl bg-auto-600 text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-auto-500 transition-colors disabled:opacity-50"
          disabled={totalEvents === 0}>
          <FileDown className="w-4 h-4" /> Exportar reporte PDF
        </button>
      </div>
    </div>
  );
}
