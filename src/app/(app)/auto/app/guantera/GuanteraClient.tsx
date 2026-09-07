"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getCatalogSpec, catalogSpecToVehicleSpecs, diffSpecsWithCatalog } from "@/lib/catalog";
import { CHART } from "@/lib/chart-theme";
import { ChartCard } from "@/components/charts/ChartCard";
import { DonutBreakdown } from "@/components/charts/DonutBreakdown";
import { KpiChip } from "@/components/charts/KpiChip";
import { getCountryConfig, getCurrentCountryCode } from "@/lib/countries";
import { uploadDocumentPhoto } from "@/lib/storage";
import { DatePicker } from "@/components/DatePicker";
import { ShieldCheck, BadgeAlert, MessageCircle } from "lucide-react";
import type { Vehicle, VehicleDocument, VehicleContact, VehicleSpecs } from "@/types/database";
import {
  FileText, Phone, Wrench, AlertTriangle, Plus, Trash2, X, Upload, Eye,
  BadgeCheck, Settings, Circle, Droplet, Droplets, Battery, BatteryCharging, Thermometer, OctagonAlert, Fuel, RotateCw, Lock, Cog, Sun,
  Shield, ClipboardList, Anchor, Store, Building2, Pin, Zap,
  Calendar, Gauge, FlaskConical, Ruler, Layers, CircleDot, RefreshCcw, CircleOff, Lightbulb, Waves,
} from "lucide-react";

/* ═══════════════════════════ Datos ═══════════════════════ */
const documentTypes = [
  { value: "seguro_obligatorio", label: "Seguro Obligatorio", icon: Shield },
  { value: "revision_tecnica", label: "Revisión Técnica", icon: Wrench },
  { value: "poliza_seguro", label: "Póliza de Seguro", icon: ClipboardList },
  { value: "matricula", label: "Matrícula", icon: FileText },
  { value: "licencia_conducir", label: "Licencia de Conducir", icon: BadgeCheck },
];

// Tipos con ciclo de 1 año (auto-vencimiento)
const TIPOS_UN_ANIO = ["seguro_obligatorio", "revision_tecnica", "poliza_seguro"];

const countryPrefixes = [
  { code: "PE", prefix: "+51", flag: "🇵🇪" },
  { code: "MX", prefix: "+52", flag: "🇲🇽" },
  { code: "CO", prefix: "+57", flag: "🇨🇴" },
  { code: "EC", prefix: "+593", flag: "🇪🇨" },
  { code: "CL", prefix: "+56", flag: "🇨🇱" },
  { code: "AR", prefix: "+54", flag: "🇦🇷" },
  { code: "BO", prefix: "+591", flag: "🇧🇴" },
  { code: "PY", prefix: "+595", flag: "🇵🇾" },
  { code: "UY", prefix: "+598", flag: "🇺🇾" },
  { code: "US", prefix: "+1", flag: "🇺🇸" },
  { code: "ES", prefix: "+34", flag: "🇪🇸" },
];

const contactTypes = [
  { value: "mecanico", label: "Mecánico", icon: Wrench },
  { value: "electromecanico", label: "Electromecánico", icon: Zap },
  { value: "grua", label: "Grúa", icon: Anchor },
  { value: "tienda_repuestos", label: "Tienda de Repuestos", icon: Store },
  { value: "aseguradora", label: "Aseguradora", icon: Building2 },
  { value: "otro", label: "Otro", icon: Pin },
];

const warningLights = [
  { icon: Gauge, name: "Check Engine", severity: "alto", color: "text-red-500", bg: "bg-red-500/10", desc: "Falla en el motor o sistema de emisiones. Requiere diagnóstico.", action: "Lleva al mecánico lo antes posible." },
  { icon: Droplet, name: "Presión de Aceite", severity: "alto", color: "text-red-400", bg: "bg-red-500/10", desc: "Presión de aceite baja o insuficiente. El motor puede dañarse.", action: "Detén el auto inmediatamente y revisa el nivel de aceite." },
  { icon: BatteryCharging, name: "Batería / Alternador", severity: "medio", color: "text-amber-400", bg: "bg-amber-500/10", desc: "Falla en el sistema de carga. La batería no se está cargando.", action: "Revisa el alternador y la batería." },
  { icon: Thermometer, name: "Temperatura del Motor", severity: "alto", color: "text-red-400", bg: "bg-red-500/10", desc: "Sobrecalentamiento del motor. Riesgo de daño grave.", action: "Apaga el motor y revisa el refrigerante." },
  { icon: CircleDot, name: "Frenos", severity: "alto", color: "text-red-500", bg: "bg-red-500/10", desc: "Freno de mano activado o nivel bajo de líquido de frenos.", action: "Verifica el freno de mano y el líquido de frenos." },
  { icon: Fuel, name: "Nivel de Combustible", severity: "bajo", color: "text-amber-400", bg: "bg-amber-500/10", desc: "Reserva de combustible activada. Quedan pocos litros.", action: "Carga combustible en la próxima estación." },
  { icon: RefreshCcw, name: "ABS (Antibloqueo)", severity: "medio", color: "text-amber-400", bg: "bg-amber-500/10", desc: "Falla en el sistema de frenos antibloqueo.", action: "Los frenos normales operan, pero el ABS no asistirá." },
  { icon: RotateCw, name: "Control de Tracción / ESP", severity: "medio", color: "text-blue-400", bg: "bg-blue-500/10", desc: "Sistema de estabilidad o control de tracción activo o con falla.", action: "Si parpadea, está funcionando. Si queda fijo, requiere revisión." },
  { icon: OctagonAlert, name: "Airbag / SRS", severity: "alto", color: "text-red-400", bg: "bg-red-500/10", desc: "Falla en el sistema de bolsas de aire.", action: "Requiere revisión urgente. Los airbags podrían no activarse." },
  { icon: CircleOff, name: "Presión de llantas (TPMS)", severity: "medio", color: "text-amber-400", bg: "bg-amber-500/10", desc: "Presión baja en uno o más neumáticos.", action: "Verifica la presión de las llantas y llénalas según el manual." },
  { icon: Lightbulb, name: "Dirección asistida", severity: "medio", color: "text-zinc-400", bg: "bg-zinc-800", desc: "Falla en el sistema de dirección asistida.", action: "La dirección puede sentirse dura. Revisa el nivel de líquido." },
  { icon: Lock, name: "Inmovilizador / Seguridad", severity: "bajo", color: "text-zinc-500", bg: "bg-zinc-800", desc: "Sistema antirrobo activo o llave no reconocida.", action: "Usa la llave original." },
  { icon: Waves, name: "AdBlue (urea)", severity: "medio", color: "text-blue-300", bg: "bg-blue-500/10", desc: "Nivel bajo de AdBlue en vehículos diésel.", action: "Rellena el depósito de AdBlue para evitar limitación de potencia." },
  { icon: Sun, name: "Luces de carretera", severity: "bajo", color: "text-blue-300", bg: "bg-blue-500/10", desc: "Las luces de carretera están encendidas.", action: "Informativo. Apágalas al cruzar con otro vehículo." },
];

/* ═══════════════════════════ Componente principal ═══════════════════════ */
interface Props {
  userId: string;
  vehicle: Vehicle | null;
  documents: VehicleDocument[];
  contacts: VehicleContact[];
  specs: VehicleSpecs | null;
}

export default function GuanteraClient({ userId, vehicle, documents: initialDocs, contacts: initialContacts, specs: initialSpecs }: Props) {
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
          <FileText className="w-5 h-5 text-auto-500" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-zinc-100">Guantera</h1>
          <p className="text-xs text-zinc-500">{vehicle.marca} {vehicle.modelo} · {vehicle.placa}</p>
        </div>
      </div>

      <GuanteraInsights docs={initialDocs} contacts={initialContacts} />
      <DocumentsSection vehicleId={vehicle.id} initialDocs={initialDocs} />
      <ContactsSection vehicleId={vehicle.id} initialContacts={initialContacts} />
      <SpecsSection vehicleId={vehicle.id} catalogSpecId={vehicle.catalog_spec_id} initialSpecs={initialSpecs} />
      <WarningLightsSection />
    </div>
  );
}

/* ═══════════════════════════ Vigencia (insights) ═══════════════════════ */
function GuanteraInsights({ docs, contacts }: { docs: VehicleDocument[]; contacts: VehicleContact[] }) {
  const hoy = new Date();
  const diasHasta = (d: string) => Math.ceil((new Date(d + "T12:00:00").getTime() - hoy.getTime()) / (1000 * 3600 * 24));

  let vigentes = 0, proximos = 0, vencidos = 0;
  for (const d of docs) {
    const dias = diasHasta(d.fecha_vencimiento);
    if (dias < 0) vencidos++;
    else if (dias <= 30) proximos++;
    else vigentes++;
  }

  const donut = [
    { name: "Vigentes", value: vigentes, color: CHART.emerald },
    { name: "Próximos", value: proximos, color: CHART.orange },
    { name: "Vencidos", value: vencidos, color: "#ef4444" },
  ];
  const total = docs.length;

  return (
    <ChartCard title="Estado de tus documentos" icon={<ShieldCheck className="w-3.5 h-3.5" />} accent={CHART.emerald}>
      {total === 0 ? (
        <div className="flex flex-col items-center py-3 gap-2">
          <BadgeAlert className="w-6 h-6 text-zinc-500" />
          <p className="text-xs text-zinc-500 text-center">Agrega SOAT, revisión técnica y póliza para vigilar su vencimiento aquí.</p>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <DonutBreakdown data={donut} centerValue={`${total}`} centerLabel="docs" height={140} />
          <div className="flex-1 grid grid-cols-2 gap-2">
            <KpiChip icon={<ShieldCheck className="w-3.5 h-3.5" />} label="Vigentes" value={`${vigentes}`} color={CHART.emerald} soft={CHART.emeraldSoft} href="/auto/app/guantera" />
            <KpiChip icon={<BadgeAlert className="w-3.5 h-3.5" />} label="Vencidos" value={`${vencidos}`} color="#ef4444" soft="rgba(239,68,68,0.15)" href="/auto/app/guantera" />
            <KpiChip icon={<Phone className="w-3.5 h-3.5" />} label="Contactos" value={`${contacts.length}`} color={CHART.teal} soft={CHART.tealSoft} href="/auto/app/guantera" />
            <KpiChip icon={<Wrench className="w-3.5 h-3.5" />} label="Aviso" value={proximos > 0 ? `${proximos}` : "—"} color={CHART.orange} soft={CHART.orangeSoft} href="/auto/app/guantera" />
          </div>
        </div>
      )}
    </ChartCard>
  );
}

/* ═══════════════════════════ 1. Documentos ═══════════════════════ */
function DocumentsSection({ vehicleId, initialDocs }: { vehicleId: string; initialDocs: VehicleDocument[] }) {
  const [docs, setDocs] = useState(initialDocs);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ tipo: "seguro_obligatorio", fecha_emision: "", fecha_vencimiento: "", notas: "", imagen_url: "" });
  const [verDoc, setVerDoc] = useState<VehicleDocument | null>(null);

  // Auto-vencimiento +1 año para tipos de ciclo anual
  const handleEmision = (tipo: string, fecha: string) => {
    const auto = TIPOS_UN_ANIO.includes(tipo) && fecha && !form.fecha_vencimiento;
    let ven = form.fecha_vencimiento;
    if (auto) {
      const d = new Date(fecha + "T12:00:00");
      d.setFullYear(d.getFullYear() + 1);
      ven = d.toISOString().slice(0, 10);
    }
    setForm({ ...form, tipo, fecha_emision: fecha, fecha_vencimiento: ven });
  };

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const url = await uploadDocumentPhoto(file, vehicleId);
    if (url) setForm({ ...form, imagen_url: url });
    setUploading(false);
    e.target.value = "";
  };

  const handleAdd = async () => {
    if (!form.fecha_vencimiento) return;
    setSaving(true);
    const supabase = createClient();
    const { data, error } = await supabase.from("vehicle_documents").insert({
      vehicle_id: vehicleId, tipo: form.tipo, fecha_emision: form.fecha_emision || null, fecha_vencimiento: form.fecha_vencimiento, notas: form.notas || null, imagen_url: form.imagen_url || null,
    }).select().single();
    setSaving(false);
    if (!error && data) {
      setDocs([...docs, data as VehicleDocument]);
      setAdding(false);
      setForm({ tipo: "seguro_obligatorio", fecha_emision: "", fecha_vencimiento: "", notas: "", imagen_url: "" });
    }
  };

  const handleDelete = async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase.from("vehicle_documents").delete().eq("id", id);
    if (!error) setDocs(docs.filter((d) => d.id !== id));
  };

  const daysUntil = (dateStr: string) => {
    const dias = Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return isNaN(dias) ? -999 : dias;
  };
  const getUrgencyStyle = (dias: number) => {
    if (dias <= 0) return { border: "border-red-500/20", badge: "bg-red-500/10 text-red-400" };
    if (dias <= 15) return { border: "border-amber-500/20", badge: "bg-amber-500/10 text-amber-400" };
    return { border: "border-emerald-500/20", badge: "bg-emerald-500/10 text-emerald-400" };
  };

  const fmt = (f: string | null | undefined) => f ? new Date(f + "T12:00:00").toLocaleDateString("es-PE") : "—";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-zinc-300 flex items-center gap-2">
          <BadgeCheck className="w-4 h-4 text-auto-500" /> Documentos Digitales
        </h2>
        <button onClick={() => setAdding(!adding)} className="w-8 h-8 rounded-full bg-auto-600/10 border border-auto-600/20 flex items-center justify-center text-auto-500 hover:bg-auto-600/20 transition-colors">
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {adding && (
        <div className="bg-zinc-900 border border-white/10 shadow-sm rounded-2xl p-4 space-y-2">
          <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}
            className="w-full px-2.5 py-2 rounded-lg border border-white/10 text-xs font-medium bg-zinc-800 text-zinc-200">
            {documentTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>

          <div className="grid grid-cols-2 gap-2">
            <label className="block"><span className="text-[10px] font-bold text-zinc-500">Fecha de inicio</span>
              <DatePicker colorTheme="auto" value={form.fecha_emision} onChange={(d) => handleEmision(form.tipo, d)} />
            </label>
            <label className="block"><span className="text-[10px] font-bold text-zinc-500">Fecha de vencimiento</span>
              <DatePicker colorTheme="auto" value={form.fecha_vencimiento} onChange={(d) => setForm({ ...form, fecha_vencimiento: d })} />
            </label>
          </div>
          {TIPOS_UN_ANIO.includes(form.tipo) && <p className="text-[9px] text-zinc-500">Al poner la fecha de inicio se sugiere el vencimiento automático (+1 año).</p>}

          {/* Imagen / documento */}
          <label className="block">
            <span className="text-[10px] font-bold text-zinc-500">Imagen del documento</span>
            <label className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-dashed border-white/15 bg-zinc-900 cursor-pointer hover:bg-zinc-800/60 transition-colors mt-1 ${uploading ? "opacity-60" : ""}`}>
              <Upload className="w-4 h-4 text-zinc-400" />
              <span className="text-zinc-400 text-[10px]">{uploading ? "Subiendo..." : form.imagen_url ? "Imagen cargada ✓" : "Subir imagen (opcional)"}</span>
              <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" disabled={uploading} />
            </label>
            {form.imagen_url && <img src={form.imagen_url} alt="" className="mt-1 h-24 w-full object-cover rounded-lg" />}
          </label>

          <div className="flex gap-1.5">
            <button onClick={handleAdd} disabled={saving || !form.fecha_vencimiento} className="flex-1 px-3 py-1.5 rounded-lg bg-auto-600 text-white text-xs font-bold">
              {saving ? "Guardando..." : "Guardar"}
            </button>
            <button onClick={() => setAdding(false)} className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-500 text-xs">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-2">
        {docs.length === 0 && !adding && (
          <p className="text-xs text-zinc-500 text-center py-4">No hay documentos registrados</p>
        )}
        {docs.map((doc) => {
          const dias = daysUntil(doc.fecha_vencimiento);
          const style = getUrgencyStyle(dias);
          const dt = documentTypes.find((t) => t.value === doc.tipo);
          return (
            <div key={doc.id} className={`bg-zinc-900 border border-white/10 shadow-sm rounded-2xl p-4 border ${style.border} flex items-center gap-3`}>
              {/* Miniatura */}
              <button onClick={() => doc.imagen_url && setVerDoc(doc)} className={`w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-white/10 ${doc.imagen_url ? "" : "bg-auto-600/10 flex items-center justify-center"}`}>
                {doc.imagen_url ? <img src={doc.imagen_url} alt="" className="w-full h-full object-cover" /> : <FileText className="w-5 h-5 text-auto-500" />}
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-zinc-100">{dt?.label || doc.tipo}</p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 text-[10px] text-zinc-500">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Inicio: {fmt(doc.fecha_emision)}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Vence: {fmt(doc.fecha_vencimiento)}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {doc.imagen_url && (
                  <button onClick={() => setVerDoc(doc)} className="w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-zinc-100" title="Ver documento">
                    <Eye className="w-4 h-4" />
                  </button>
                )}
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${style.badge}`}>
                  {dias <= 0 ? "Vencido" : `${dias}d`}
                </span>
                <button onClick={() => handleDelete(doc.id)} className="w-7 h-7 rounded-lg hover:bg-red-600/10 flex items-center justify-center text-zinc-500 hover:text-red-500 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal ver documento */}
      {verDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => setVerDoc(null)}>
          <div className="bg-zinc-900 border border-white/10 rounded-2xl p-3 max-w-lg w-full max-h-[85vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <img src={verDoc.imagen_url || ""} alt="" className="w-full max-h-[70vh] object-contain rounded-xl bg-black/40" />
            <div className="flex items-center justify-between mt-3">
              <p className="text-xs font-bold text-zinc-300">{documentTypes.find((t) => t.value === verDoc.tipo)?.label || verDoc.tipo}</p>
              <div className="flex gap-2">
                <a href={verDoc.imagen_url || "#"} download target="_blank" rel="noopener" className="text-[10px] font-bold text-auto-400 hover:text-auto-300">Descargar</a>
                <button onClick={() => setVerDoc(null)} className="text-[10px] font-bold text-zinc-400 hover:text-zinc-100">Cerrar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════ 2. Contactos ═══════════════════════ */
function ContactsSection({ vehicleId, initialContacts }: { vehicleId: string; initialContacts: VehicleContact[] }) {
  const [contacts, setContacts] = useState(initialContacts);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ nombre: "", tipo: "mecanico", telefono: "", whatsapp: "", pais: "PE", direccion: "", notas: "" });

  // Prefijo por defecto = país del usuario
  useEffect(() => {
    getCurrentCountryCode().then((code) => {
      if (code) setForm((f) => ({ ...f, pais: code }));
    });
  }, []);

  const prefijoDe = (pais: string) => countryPrefixes.find((p) => p.code === pais)?.prefix || countryPrefixes[0].prefix;

  const handleAdd = async () => {
    if (!form.nombre) return;
    setSaving(true);
    const supabase = createClient();
    const { data, error } = await supabase.from("vehicle_contacts").insert({
      vehicle_id: vehicleId, nombre: form.nombre, tipo: form.tipo,
      telefono: form.telefono ? `${prefijoDe(form.pais)}${form.telefono.replace(/[^0-9]/g, "")}` : null,
      whatsapp: form.whatsapp ? `${prefijoDe(form.pais)}${form.whatsapp.replace(/[^0-9]/g, "")}` : null,
      pais_telefono: form.pais, direccion: form.direccion || null, notas: form.notas || null,
    }).select().single();
    setSaving(false);
    if (!error && data) {
      setContacts([...contacts, data as VehicleContact]);
      setAdding(false);
      setForm({ nombre: "", tipo: "mecanico", telefono: "", whatsapp: "", pais: form.pais, direccion: "", notas: "" });
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await createClient().from("vehicle_contacts").delete().eq("id", id);
    if (!error) setContacts(contacts.filter((c) => c.id !== id));
  };

  const waLink = (c: VehicleContact) => {
    const full = c.whatsapp ? c.whatsapp.replace(/[^0-9]/g, "") : "";
    return `https://wa.me/${full}`;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-zinc-300 flex items-center gap-2">
          <Phone className="w-4 h-4 text-auto-500" /> Directorio de Talleres
        </h2>
        <button onClick={() => setAdding(!adding)} className="w-8 h-8 rounded-full bg-auto-600/10 border border-auto-600/20 flex items-center justify-center text-auto-500 hover:bg-auto-600/20 transition-colors">
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {adding && (
        <div className="bg-zinc-900 border border-white/10 shadow-sm rounded-2xl p-4 space-y-2">
          <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            placeholder="Nombre del contacto *" className="w-full px-2.5 py-2 rounded-lg border border-white/10 text-xs bg-zinc-800 text-zinc-200" />
          <div className="grid grid-cols-2 gap-2">
            <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}
              className="px-2.5 py-2 rounded-lg border border-white/10 text-xs bg-zinc-800 text-zinc-200">
              {contactTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <select value={form.pais} onChange={(e) => setForm({ ...form, pais: e.target.value })}
              className="px-2.5 py-2 rounded-lg border border-white/10 text-xs bg-zinc-800 text-zinc-200">
              {countryPrefixes.map((p) => <option key={p.code} value={p.code}>{p.flag} {p.code} ({p.prefix})</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-1">
              <span className="text-xs text-zinc-500 px-1">{prefijoDe(form.pais)}</span>
              <input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                placeholder="Teléfono" className="flex-1 px-2.5 py-2 rounded-lg border border-white/10 text-xs bg-zinc-800 text-zinc-200" />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs text-zinc-500 px-1">{prefijoDe(form.pais)}</span>
              <input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                placeholder="WhatsApp" className="flex-1 px-2.5 py-2 rounded-lg border border-white/10 text-xs bg-zinc-800 text-zinc-200" />
            </div>
          </div>
          <div className="flex gap-1.5">
            <button onClick={handleAdd} disabled={saving} className="flex-1 px-3 py-1.5 rounded-lg bg-auto-600 text-white text-xs font-bold">
              {saving ? "Guardando..." : "Guardar"}
            </button>
            <button onClick={() => setAdding(false)} className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-500 text-xs">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        {contacts.length === 0 && !adding && (
          <p className="text-xs text-zinc-500 text-center py-4 col-span-2">No hay contactos registrados</p>
        )}
        {contacts.map((c) => {
          const tipo = contactTypes.find((t) => t.value === c.tipo);
          const Icon = tipo?.icon || Phone;
          return (
            <div key={c.id} className="bg-zinc-900 border border-white/10 shadow-sm rounded-2xl p-3 flex flex-col gap-2">
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 rounded-lg bg-auto-600/10 border border-auto-600/20 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-auto-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-zinc-100 truncate">{c.nombre}</p>
                  <p className="text-[10px] text-zinc-500">{tipo?.label}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {c.telefono && (
                  <a href={`tel:${c.telefono}`} className="flex-1 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-[10px] font-bold hover:bg-emerald-500/20 transition-colors">
                    <Phone className="w-3 h-3 mr-1" /> Llamar
                  </a>
                )}
                {c.whatsapp && (
                  <a href={waLink(c)} target="_blank" rel="noopener noreferrer" className="flex-1 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 text-[10px] font-bold hover:bg-green-500/20 transition-colors">
                    <MessageCircle className="w-3 h-3 mr-1" /> WhatsApp
                  </a>
                )}
                <button onClick={() => handleDelete(c.id)} className="w-7 h-7 rounded-lg hover:bg-red-600/10 flex items-center justify-center text-zinc-500 hover:text-red-500 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════ 3. ADN del Vehículo ═══════════════════════ */
export function SpecsSection({ vehicleId, catalogSpecId, initialSpecs, defaultEditing = false }: { vehicleId: string; catalogSpecId: string | null; initialSpecs: VehicleSpecs | null; defaultEditing?: boolean }) {
  const [specs, setSpecs] = useState<VehicleSpecs | null>(initialSpecs);
  const [editing, setEditing] = useState(defaultEditing);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [countryCode, setCountryCode] = useState<string | null>(null);

  useEffect(() => { getCurrentCountryCode().then((c) => setCountryCode(c)); }, []);
  const cfg = getCountryConfig(countryCode);
  const octanajes = cfg.fuelTypes.filter((t) => t.value !== "diesel" && t.value !== "glp" && t.value !== "gnv" && t.value !== "gnc");

  const [form, setForm] = useState({
    tipo_aceite: specs?.tipo_aceite || "",
    viscosidad_aceite: specs?.viscosidad_aceite || "",
    aceite_marca: specs?.aceite_marca || "",
    capacidad_aceite_litros: specs?.capacidad_aceite_litros?.toString() || "",
    tipo_refrigerante: specs?.tipo_refrigerante || "",
    refrigerante_marca: specs?.refrigerante_marca || "",
    capacidad_refrigerante_litros: specs?.capacidad_refrigerante_litros?.toString() || "",
    tipo_freno: specs?.tipo_freno || "",
    freno_marca: specs?.freno_marca || "",
    bateria_marca: specs?.bateria_marca || "",
    bateria_mantenimiento_fecha: specs?.bateria_mantenimiento_fecha || "",
    presion_neumaticos_delante: specs?.presion_neumaticos_delante?.toString() || "",
    presion_neumaticos_atras: specs?.presion_neumaticos_atras?.toString() || "",
    presion_neumaticos_repuesto: specs?.presion_neumaticos_repuesto?.toString() || "",
    capacidad_tanque_galones: specs?.capacidad_tanque_galones?.toString() || "",
    octanaje_recomendado: specs?.octanaje_recomendado || "",
  });

  const handleSave = async () => {
    setSaving(true);
    const supabase = createClient();
    const payload = {
      vehicle_id: vehicleId,
      tipo_aceite: form.tipo_aceite || null,
      viscosidad_aceite: form.viscosidad_aceite || null,
      aceite_marca: form.aceite_marca || null,
      capacidad_aceite_litros: form.capacidad_aceite_litros ? parseFloat(form.capacidad_aceite_litros) : null,
      tipo_refrigerante: form.tipo_refrigerante || null,
      refrigerante_marca: form.refrigerante_marca || null,
      capacidad_refrigerante_litros: form.capacidad_refrigerante_litros ? parseFloat(form.capacidad_refrigerante_litros) : null,
      tipo_freno: form.tipo_freno || null,
      freno_marca: form.freno_marca || null,
      bateria_marca: form.bateria_marca || null,
      bateria_mantenimiento_fecha: form.bateria_mantenimiento_fecha || null,
      presion_neumaticos_delante: form.presion_neumaticos_delante ? parseInt(form.presion_neumaticos_delante) : null,
      presion_neumaticos_atras: form.presion_neumaticos_atras ? parseInt(form.presion_neumaticos_atras) : null,
      presion_neumaticos_repuesto: form.presion_neumaticos_repuesto ? parseInt(form.presion_neumaticos_repuesto) : null,
      capacidad_tanque_galones: form.capacidad_tanque_galones ? parseFloat(form.capacidad_tanque_galones) : null,
      octanaje_recomendado: form.octanaje_recomendado || null,
      tanque_unidad: cfg.fuelUnit,
    };

    const { data, error } = specs
      ? await supabase.from("vehicle_specs").update(payload).eq("id", specs.id).select().single()
      : await supabase.from("vehicle_specs").insert(payload).select().single();

    setSaving(false);
    if (!error && data) {
      setSpecs(data as VehicleSpecs);
      setEditing(false);
      if (catalogSpecId) {
        const catSpec = await getCatalogSpec(catalogSpecId);
        if (catSpec) {
          const correcciones = diffSpecsWithCatalog(data as VehicleSpecs, catSpec);
          if (correcciones.length > 0) {
            await supabase.from("spec_corrections").insert(
              correcciones.map((c) => ({
                vehicle_id: vehicleId,
                catalog_spec_id: catalogSpecId,
                campo: c.campo,
                valor_catalogo: c.valor_catalogo,
                valor_usuario: c.valor_usuario,
              }))
            );
          }
        }
      }
    }
  };

  const handleSyncCatalog = async () => {
    if (!catalogSpecId) return;
    setSyncing(true);
    const catSpec = await getCatalogSpec(catalogSpecId);
    if (catSpec) {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("vehicle_specs")
        .upsert({ vehicle_id: vehicleId, ...catalogSpecToVehicleSpecs(catSpec) })
        .select()
        .single();
      if (!error && data) setSpecs(data as VehicleSpecs);
    }
    setSyncing(false);
  };

  const specsCards = [
    { label: "Aceite", value: specs?.tipo_aceite || "—", detail: [specs?.viscosidad_aceite, specs?.aceite_marca].filter(Boolean).join(" · "), icon: Droplets },
    { label: "Refrigerante", value: specs?.tipo_refrigerante || "—", detail: [specs?.refrigerante_marca, specs?.capacidad_refrigerante_litros ? `${specs.capacidad_refrigerante_litros} L` : null].filter(Boolean).join(" · "), icon: Thermometer },
    { label: "Líq. frenos", value: specs?.tipo_freno || "—", detail: specs?.freno_marca || null, icon: OctagonAlert },
    { label: "Batería", value: specs?.bateria_marca || "—", detail: specs?.bateria_mantenimiento_fecha ? `Mant: ${new Date(specs.bateria_mantenimiento_fecha + "T12:00:00").toLocaleDateString("es-PE")}` : null, icon: Battery },
    { label: "PSI del.", value: specs?.presion_neumaticos_delante ? `${specs.presion_neumaticos_delante} PSI` : "—", icon: Gauge },
    { label: "PSI atrás", value: specs?.presion_neumaticos_atras ? `${specs.presion_neumaticos_atras} PSI` : "—", icon: Gauge },
    { label: "PSI repuesto", value: specs?.presion_neumaticos_repuesto ? `${specs.presion_neumaticos_repuesto} PSI` : "—", icon: Ruler },
    { label: "Tanque", value: specs?.capacidad_tanque_galones ? `${specs.capacidad_tanque_galones} ${specs.tanque_unidad || "gal"}` : "—", icon: Fuel },
    { label: "Octanaje", value: specs?.octanaje_recomendado || "—", icon: Layers },
  ];

  const renderFields = (
    <div className="bg-zinc-900 border border-white/10 shadow-sm rounded-2xl p-4 space-y-2">
      <div className="grid grid-cols-3 gap-2">
        <label className="block"><span className="text-[10px] font-bold text-zinc-500">Tipo de aceite</span>
          <input value={form.tipo_aceite} onChange={(e) => setForm({ ...form, tipo_aceite: e.target.value })} placeholder="Ej: Sintético" className="w-full mt-0.5 px-2 py-1.5 rounded-lg border border-white/10 text-xs bg-zinc-800 text-zinc-200" /></label>
        <label className="block"><span className="text-[10px] font-bold text-zinc-500">Viscosidad</span>
          <input value={form.viscosidad_aceite} onChange={(e) => setForm({ ...form, viscosidad_aceite: e.target.value })} placeholder="5W-30" className="w-full mt-0.5 px-2 py-1.5 rounded-lg border border-white/10 text-xs bg-zinc-800 text-zinc-200" /></label>
        <label className="block"><span className="text-[10px] font-bold text-zinc-500">Marca aceite</span>
          <input value={form.aceite_marca} onChange={(e) => setForm({ ...form, aceite_marca: e.target.value })} placeholder="Ej: Castrol" className="w-full mt-0.5 px-2 py-1.5 rounded-lg border border-white/10 text-xs bg-zinc-800 text-zinc-200" /></label>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <label className="block"><span className="text-[10px] font-bold text-zinc-500">Cap. aceite (L)</span>
          <input type="number" step="0.1" value={form.capacidad_aceite_litros} onChange={(e) => setForm({ ...form, capacidad_aceite_litros: e.target.value })} placeholder="4.5" className="w-full mt-0.5 px-2 py-1.5 rounded-lg border border-white/10 text-xs bg-zinc-800 text-zinc-200" /></label>
        <label className="block"><span className="text-[10px] font-bold text-zinc-500">Refrigerante</span>
          <input value={form.tipo_refrigerante} onChange={(e) => setForm({ ...form, tipo_refrigerante: e.target.value })} placeholder="Etilenglicol" className="w-full mt-0.5 px-2 py-1.5 rounded-lg border border-white/10 text-xs bg-zinc-800 text-zinc-200" /></label>
        <label className="block"><span className="text-[10px] font-bold text-zinc-500">Marca refrig.</span>
          <input value={form.refrigerante_marca} onChange={(e) => setForm({ ...form, refrigerante_marca: e.target.value })} placeholder="Ej: Prestone" className="w-full mt-0.5 px-2 py-1.5 rounded-lg border border-white/10 text-xs bg-zinc-800 text-zinc-200" /></label>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <label className="block"><span className="text-[10px] font-bold text-zinc-500">Cap. refrig. (L)</span>
          <input type="number" step="0.1" value={form.capacidad_refrigerante_litros} onChange={(e) => setForm({ ...form, capacidad_refrigerante_litros: e.target.value })} placeholder="5.0" className="w-full mt-0.5 px-2 py-1.5 rounded-lg border border-white/10 text-xs bg-zinc-800 text-zinc-200" /></label>
        <label className="block"><span className="text-[10px] font-bold text-zinc-500">Líq. frenos</span>
          <input value={form.tipo_freno} onChange={(e) => setForm({ ...form, tipo_freno: e.target.value })} placeholder="DOT 4" className="w-full mt-0.5 px-2 py-1.5 rounded-lg border border-white/10 text-xs bg-zinc-800 text-zinc-200" /></label>
        <label className="block"><span className="text-[10px] font-bold text-zinc-500">Marca frenos</span>
          <input value={form.freno_marca} onChange={(e) => setForm({ ...form, freno_marca: e.target.value })} placeholder="Ej: Bosch" className="w-full mt-0.5 px-2 py-1.5 rounded-lg border border-white/10 text-xs bg-zinc-800 text-zinc-200" /></label>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <label className="block"><span className="text-[10px] font-bold text-zinc-500">Marca batería</span>
          <input value={form.bateria_marca} onChange={(e) => setForm({ ...form, bateria_marca: e.target.value })} placeholder="Ej: BOSCH" className="w-full mt-0.5 px-2 py-1.5 rounded-lg border border-white/10 text-xs bg-zinc-800 text-zinc-200" /></label>
        <label className="block"><span className="text-[10px] font-bold text-zinc-500">Próx. mantenimiento batería</span>
          <DatePicker colorTheme="auto" value={form.bateria_mantenimiento_fecha} onChange={(d) => setForm({ ...form, bateria_mantenimiento_fecha: d })} />
        </label>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <label className="block"><span className="text-[10px] font-bold text-zinc-500">PSI delante</span>
          <input type="number" value={form.presion_neumaticos_delante} onChange={(e) => setForm({ ...form, presion_neumaticos_delante: e.target.value })} placeholder="32" className="w-full mt-0.5 px-2 py-1.5 rounded-lg border border-white/10 text-xs bg-zinc-800 text-zinc-200" /></label>
        <label className="block"><span className="text-[10px] font-bold text-zinc-500">PSI atrás</span>
          <input type="number" value={form.presion_neumaticos_atras} onChange={(e) => setForm({ ...form, presion_neumaticos_atras: e.target.value })} placeholder="32" className="w-full mt-0.5 px-2 py-1.5 rounded-lg border border-white/10 text-xs bg-zinc-800 text-zinc-200" /></label>
        <label className="block"><span className="text-[10px] font-bold text-zinc-500">PSI repuesto</span>
          <input type="number" value={form.presion_neumaticos_repuesto} onChange={(e) => setForm({ ...form, presion_neumaticos_repuesto: e.target.value })} placeholder="60" className="w-full mt-0.5 px-2 py-1.5 rounded-lg border border-white/10 text-xs bg-zinc-800 text-zinc-200" /></label>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <label className="block"><span className="text-[10px] font-bold text-zinc-500">Capacidad tanque ({cfg.fuelUnitShort})</span>
          <input type="number" step="0.1" value={form.capacidad_tanque_galones} onChange={(e) => setForm({ ...form, capacidad_tanque_galones: e.target.value })} placeholder="14" className="w-full mt-0.5 px-2 py-1.5 rounded-lg border border-white/10 text-xs bg-zinc-800 text-zinc-200" /></label>
        <label className="block"><span className="text-[10px] font-bold text-zinc-500">Octanaje recomendado (toca para elegir)</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {octanajes.map((o) => {
              const sel = (form.octanaje_recomendado || "").split(",").map((s) => s.trim()).includes(o.value);
              return (
                <button type="button" key={o.value}
                  onClick={() => {
                    const cur = (form.octanaje_recomendado || "").split(",").map((s) => s.trim()).filter(Boolean);
                    const next = sel ? cur.filter((v) => v !== o.value) : [...cur, o.value];
                    setForm({ ...form, octanaje_recomendado: next.join(",") });
                  }}
                  className={`px-2 py-1 rounded-full text-[10px] font-bold border transition-colors ${sel ? "bg-auto-500 text-white border-auto-500" : "bg-zinc-800 text-zinc-400 border-white/10 hover:bg-zinc-700"}`}>
                  {o.label.replace(/\(.*\)/, "").trim()}
                </button>
              );
            })}
          </div>
        </label>
      </div>
      <div className="flex gap-1.5">
        <button onClick={handleSave} disabled={saving} className="flex-1 px-3 py-1.5 rounded-lg bg-auto-600 text-white text-xs font-bold">{saving ? "Guardando..." : "Guardar"}</button>
        <button onClick={() => setEditing(false)} className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-500 text-xs"><X className="w-3.5 h-3.5" /></button>
      </div>
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-zinc-300 flex items-center gap-2">
          <Settings className="w-4 h-4 text-auto-500" /> ADN del Vehículo
        </h2>
        <div className="flex items-center gap-2">
          {catalogSpecId && (
            <button onClick={handleSyncCatalog} disabled={syncing} className="text-[10px] font-bold text-auto-500 bg-auto-600/10 border border-auto-600/20 px-2 py-1 rounded-lg hover:bg-auto-600/20 transition-colors disabled:opacity-50">
              {syncing ? "Sincronizando..." : "Sincronizar con catálogo"}
            </button>
          )}
          <button onClick={() => setEditing(!editing)} className="text-xs font-bold text-auto-500 hover:text-auto-500 transition-colors">
            {editing ? "Cancelar" : "Editar"}
          </button>
        </div>
      </div>

      {editing ? renderFields : (
        <div className="grid grid-cols-3 gap-2">
          {specsCards.map((card) => (
            <div key={card.label} className="bg-zinc-900 border border-white/10 shadow-sm rounded-2xl p-3 flex flex-col items-center text-center gap-1.5">
              <card.icon className="w-4 h-4 text-auto-500" />
              <p className="text-[10px] text-zinc-500">{card.label}</p>
              <p className="text-xs font-bold text-zinc-100">{card.value}</p>
              {card.detail && <p className="text-[9px] text-zinc-500">{card.detail}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════ 4. Testigos ═══════════════════════ */
function WarningLightsSection() {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-bold text-zinc-300 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-400" /> Luces del Tablero
      </h2>
      <div className="grid grid-cols-2 gap-2">
        {warningLights.map((light, i) => {
          const Icon = light.icon;
          return (
            <div key={i}>
              <button
                onClick={() => setSelected(selected === i ? null : i)}
                className={`w-full bg-zinc-900 border border-white/10 shadow-sm rounded-2xl p-3 flex items-center gap-2 text-left transition-all ${selected === i ? "border border-auto-600/20" : ""}`}
              >
                <div className={`w-8 h-8 rounded-lg ${light.bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-4 h-4 ${light.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-zinc-100 truncate">{light.name}</p>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${light.bg} ${light.color}`}>
                    {light.severity}
                  </span>
                </div>
              </button>
              {selected === i && (
                <div className="bg-zinc-900 border border-white/10 shadow-sm rounded-2xl p-3 mt-1 border border-auto-600/20">
                  <p className="text-xs text-zinc-300">{light.desc}</p>
                  <p className="text-[10px] text-auto-500 font-bold mt-1.5">Qué hacer: {light.action}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
