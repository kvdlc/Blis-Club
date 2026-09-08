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
import { uploadDocumentPhoto, uploadContactPhoto } from "@/lib/storage";
import { DatePicker } from "@/components/DatePicker";
import { MapLocationPicker } from "@/components/MapLocationPicker";
import { formatoRestante, diasHasta } from "@/lib/dates";
import { ShieldCheck, BadgeAlert, MessageCircle } from "lucide-react";
import type { Vehicle, VehicleDocument, VehicleContact, VehicleSpecs } from "@/types/database";
import {
  FileText, Phone, Wrench, AlertTriangle, Plus, Trash2, X, Upload, Eye, Pencil, MapPin, HelpCircle,
  BadgeCheck, Settings, Circle, Droplet, Droplets, Battery, BatteryCharging, Thermometer, OctagonAlert, Fuel, RotateCw, Lock, Cog, Sun,
  Shield, ClipboardList, Anchor, Store, Building2, Pin, Zap, ShoppingBag, Siren,
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
  { value: "tienda_accesorios", label: "Tienda de Accesorios", icon: ShoppingBag },
  { value: "aseguradora", label: "Aseguradora", icon: Building2 },
  { value: "grifo", label: "Grifo / Estación de servicio", icon: Fuel },
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
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <DonutBreakdown data={donut} centerValue={`${total}`} centerLabel="docs" height={140} />
          <div className="grid grid-cols-2 gap-2 sm:flex-1">
            <KpiChip icon={<ShieldCheck className="w-3.5 h-3.5" />} label="Vigentes" value={`${vigentes}`} color={CHART.emerald} soft={CHART.emeraldSoft} href="/auto/app/guantera" />
            <KpiChip icon={<BadgeAlert className="w-3.5 h-3.5" />} label="Vencidos" value={`${vencidos}`} color="#ef4444" soft="rgba(239,68,68,0.15)" href="/auto/app/guantera" />
            <KpiChip icon={<Phone className="w-3.5 h-3.5" />} label="Contactos" value={`${contacts.length}`} color={CHART.teal} soft={CHART.tealSoft} href="/auto/app/guantera" />
            <KpiChip icon={<Wrench className="w-3.5 h-3.5" />} label="Por vencer" value={proximos > 0 ? `${proximos}` : "—"} color={CHART.orange} soft={CHART.orangeSoft} href="/auto/app/guantera" />
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
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [form, setForm] = useState({ tipo: "seguro_obligatorio", fecha_emision: "", fecha_vencimiento: "", notas: "", imagen_url: "" });
  const [verDoc, setVerDoc] = useState<VehicleDocument | null>(null);

  const resetForm = () => {
    setForm({ tipo: "seguro_obligatorio", fecha_emision: "", fecha_vencimiento: "", notas: "", imagen_url: "" });
    setUploadError(null);
  };

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
    setUploadError(null);
    try {
      const url = await uploadDocumentPhoto(file, vehicleId);
      if (url) setForm({ ...form, imagen_url: url });
      else setUploadError("No se pudo subir la imagen. Intenta con otra foto (JPG/PNG).");
    } catch {
      setUploadError("Error al procesar la imagen. Intenta con una foto más liviana.");
    } finally {
      setUploading(false);
    }
    e.target.value = "";
  };

  const startAdd = () => {
    setEditId(null);
    resetForm();
    setAdding(true);
  };

  const startEdit = (doc: VehicleDocument) => {
    setEditId(doc.id);
    setForm({
      tipo: doc.tipo,
      fecha_emision: doc.fecha_emision || "",
      fecha_vencimiento: doc.fecha_vencimiento,
      notas: doc.notas || "",
      imagen_url: doc.imagen_url || "",
    });
    setUploadError(null);
    setAdding(true);
  };

  const cancelForm = () => {
    setAdding(false);
    setEditId(null);
    resetForm();
  };

  const handleSave = async () => {
    if (!form.fecha_vencimiento) return;
    setSaving(true);
    const supabase = createClient();
    const payload = {
      tipo: form.tipo, fecha_emision: form.fecha_emision || null, fecha_vencimiento: form.fecha_vencimiento, notas: form.notas || null, imagen_url: form.imagen_url || null,
    };
    const { data, error } = editId
      ? await supabase.from("vehicle_documents").update(payload).eq("id", editId).select().single()
      : await supabase.from("vehicle_documents").insert({ ...payload, vehicle_id: vehicleId }).select().single();
    setSaving(false);
    if (!error && data) {
      const saved = data as VehicleDocument;
      setDocs(editId ? docs.map((d) => (d.id === saved.id ? saved : d)) : [...docs, saved]);
      cancelForm();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este documento?")) return;
    const supabase = createClient();
    const { error } = await supabase.from("vehicle_documents").delete().eq("id", id);
    if (!error) setDocs(docs.filter((d) => d.id !== id));
  };

  const daysUntil = (dateStr: string) => diasHasta(dateStr);
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
        <button onClick={() => adding ? cancelForm() : startAdd()} className="w-8 h-8 rounded-full bg-auto-600/10 border border-auto-600/20 flex items-center justify-center text-auto-500 hover:bg-auto-600/20 transition-colors">
          {adding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </button>
      </div>

      {adding && (
        <div className="bg-zinc-900 border border-white/10 shadow-sm rounded-2xl p-4 space-y-2">
          <p className="text-[10px] font-bold text-auto-400">{editId ? "✏️ Editando documento" : "Nuevo documento"}</p>
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
            {uploadError && <p className="text-[10px] text-red-400 mt-1">{uploadError}</p>}
          </label>

          <div className="flex gap-1.5">
            <button onClick={handleSave} disabled={saving || !form.fecha_vencimiento} className="flex-1 px-3 py-1.5 rounded-lg bg-auto-600 text-white text-xs font-bold">
              {saving ? "Guardando..." : editId ? "Guardar cambios" : "Guardar"}
            </button>
            <button onClick={cancelForm} className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-500 text-xs">
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
                <button onClick={() => startEdit(doc)} className="w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-auto-300" title="Editar documento">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${style.badge}`}>
                  {dias <= 0 ? "Vencido" : formatoRestante(doc.fecha_vencimiento)}
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
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [form, setForm] = useState({
    nombre: "", encargado: "", tipo: "mecanico", telefono: "", telefono_alt: "",
    pais: "PE", pais_alt: "PE", foto_url: "", lat: null as number | null,
    lng: null as number | null, referencia: "", notas: "", es_emergencia: false,
  });

  // Prefijo por defecto = país del usuario
  useEffect(() => {
    getCurrentCountryCode().then((code) => {
      if (code) setForm((f) => ({ ...f, pais: code, pais_alt: code }));
    });
  }, []);

  const resetContactForm = (pais: string) => {
    setForm({ nombre: "", encargado: "", tipo: "mecanico", telefono: "", telefono_alt: "", pais, pais_alt: pais, foto_url: "", lat: null, lng: null, referencia: "", notas: "", es_emergencia: false });
    setPhotoError(null);
  };

  const startAddContact = () => {
    setEditId(null);
    resetContactForm(form.pais || "PE");
    setAdding(true);
  };

  const startEditContact = (c: VehicleContact) => {
    setEditId(c.id);
    // Quitar el prefijo guardado para mostrarlo por separado
    const strip = (num: string | null) => num ? num.replace(/^\+\d+/, "") : "";
    setForm({
      nombre: c.nombre,
      encargado: c.encargado || "",
      tipo: c.tipo,
      telefono: strip(c.telefono),
      telefono_alt: strip(c.telefono_alt) || strip(c.whatsapp),
      pais: c.pais_telefono || "PE",
      pais_alt: c.pais_telefono || "PE",
      foto_url: c.foto_url || "",
      lat: c.lat ?? null,
      lng: c.lng ?? null,
      referencia: c.ubicacion || "",
      notas: c.notas || "",
      es_emergencia: c.es_emergencia === true,
    });
    setPhotoError(null);
    setAdding(true);
  };

  const cancelContactForm = () => {
    setAdding(false);
    setEditId(null);
    resetContactForm(form.pais || "PE");
  };

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    setPhotoError(null);
    try {
      const url = await uploadContactPhoto(file, vehicleId);
      if (url) setForm((f) => ({ ...f, foto_url: url }));
      else setPhotoError("No se pudo subir la foto. Intenta con otra imagen (JPG/PNG).");
    } catch {
      setPhotoError("Error al procesar la imagen. Intenta con una foto más liviana.");
    } finally {
      setUploadingPhoto(false);
    }
    e.target.value = "";
  };

  const handleSaveContact = async () => {
    if (!form.nombre) return;
    setSaving(true);
    const supabase = createClient();
    const telefonoCompleto = form.telefono ? `+${CountryPrefixOnly(form.pais)}${form.telefono.replace(/[^0-9]/g, "")}` : null;
    const payload = {
      nombre: form.nombre, encargado: form.encargado || null, tipo: form.tipo,
      telefono: telefonoCompleto,
      telefono_alt: form.telefono_alt ? `+${CountryPrefixOnly(form.pais_alt)}${form.telefono_alt.replace(/[^0-9]/g, "")}` : null,
      whatsapp: telefonoCompleto,
      pais_telefono: form.pais,
      foto_url: form.foto_url || null,
      lat: (form.lat != null && !isNaN(form.lat)) ? form.lat : null,
      lng: (form.lng != null && !isNaN(form.lng)) ? form.lng : null,
      ubicacion: form.referencia || null,
      es_emergencia: form.es_emergencia === true,
      notas: form.notas || null,
    };
    const { data, error } = editId
      ? await supabase.from("vehicle_contacts").update(payload).eq("id", editId).select().single()
      : await supabase.from("vehicle_contacts").insert({ ...payload, vehicle_id: vehicleId }).select().single();
    setSaving(false);
    if (!error && data) {
      const saved = data as VehicleContact;
      setContacts(editId ? contacts.map((c) => (c.id === saved.id ? saved : c)) : [...contacts, saved]);
      cancelContactForm();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este contacto?")) return;
    const { error } = await createClient().from("vehicle_contacts").delete().eq("id", id);
    if (!error) setContacts(contacts.filter((c) => c.id !== id));
  };

  const waLink = (full: string | null) => {
    const d = (full || "").replace(/[^0-9]/g, "");
    return d ? `https://wa.me/${d}` : "#";
  };
  const mapHref = (c: VehicleContact) => {
    if (c.lat != null && c.lng != null && !isNaN(c.lat)) return `https://www.google.com/maps?q=${c.lat},${c.lng}`;
    if (c.ubicacion) return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.ubicacion)}`;
    return "#";
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-zinc-300 flex items-center gap-2">
          <Phone className="w-4 h-4 text-auto-500" /> Directorio de Talleres
        </h2>
        <button type="button" onClick={() => adding ? cancelContactForm() : startAddContact()} className="w-8 h-8 rounded-full bg-auto-600/10 border border-auto-600/20 flex items-center justify-center text-auto-500 hover:bg-auto-600/20 transition-colors">
          {adding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </button>
      </div>

      {adding && (
        <div className="bg-zinc-900 border border-white/10 shadow-sm rounded-2xl p-4 space-y-3">
          <p className="text-[10px] font-bold text-auto-400">{editId ? "✏️ Editando contacto" : "Nuevo contacto"}</p>

          {/* Foto del taller (subida por archivo) */}
          <div>
            <span className="text-[10px] font-bold text-zinc-500">Foto del taller</span>
            <div className="flex items-center gap-3 mt-1">
              {form.foto_url ? (
                <img src={form.foto_url} alt="" className="w-20 h-20 rounded-xl object-cover border border-white/10" />
              ) : (
                <div className="w-20 h-20 rounded-xl bg-zinc-800 border border-white/10 flex items-center justify-center">
                  <Store className="w-6 h-6 text-zinc-600" />
                </div>
              )}
              <label className="flex-1 flex flex-col items-center justify-center gap-1 px-3 py-3 rounded-xl border border-dashed border-white/15 bg-zinc-900 cursor-pointer hover:bg-zinc-800/60 transition-colors">
                <Upload className="w-4 h-4 text-zinc-400" />
                <span className="text-[10px] text-zinc-400">{uploadingPhoto ? "Subiendo..." : form.foto_url ? "Cambiar foto" : "Subir foto"}</span>
                <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" disabled={uploadingPhoto} />
              </label>
            </div>
            {photoError && <p className="text-[10px] text-red-400 mt-1">{photoError}</p>}
          </div>

          <div className="grid grid-cols-1 gap-2">
            <label className="block">
              <span className="text-[10px] font-bold text-zinc-500">Nombre del taller / mecánica *</span>
              <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                placeholder="Ej: Taller García" className="w-full mt-0.5 px-2.5 py-2 rounded-lg border border-white/10 text-xs bg-zinc-800 text-zinc-200" />
            </label>
            <label className="block">
              <span className="text-[10px] font-bold text-zinc-500">Mecánico dueño / encargado (opcional)</span>
              <input value={form.encargado} onChange={(e) => setForm({ ...form, encargado: e.target.value })}
                placeholder="Ej: Juan García" className="w-full mt-0.5 px-2.5 py-2 rounded-lg border border-white/10 text-xs bg-zinc-800 text-zinc-200" />
            </label>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}
              className="px-2.5 py-2 rounded-lg border border-white/10 text-xs bg-zinc-800 text-zinc-200">
              {contactTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          {/* Número principal (llamada y WhatsApp, el mismo) */}
          <div>
            <span className="text-[10px] font-bold text-zinc-500">Número principal (llamada / WhatsApp)</span>
            <div className="flex items-center gap-1.5 mt-1">
              <select value={form.pais} onChange={(e) => setForm({ ...form, pais: e.target.value })}
                className="shrink-0 px-2 py-2 rounded-lg border border-white/10 text-xs bg-zinc-800 text-zinc-200">
                {countryPrefixes.map((p) => <option key={p.code} value={p.code}>{p.flag} {p.prefix}</option>)}
              </select>
              <input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                placeholder="Ej: 987654321" className="flex-1 px-2.5 py-2 rounded-lg border border-white/10 text-xs bg-zinc-800 text-zinc-200" />
            </div>
          </div>

          {/* Número alternativo (opcional) */}
          <div>
            <span className="text-[10px] font-bold text-zinc-500">Número alternativo (opcional)</span>
            <div className="flex items-center gap-1.5 mt-1">
              <select value={form.pais_alt} onChange={(e) => setForm({ ...form, pais_alt: e.target.value })}
                className="shrink-0 px-2 py-2 rounded-lg border border-white/10 text-xs bg-zinc-800 text-zinc-200">
                {countryPrefixes.map((p) => <option key={p.code} value={p.code}>{p.flag} {p.prefix}</option>)}
              </select>
              <input value={form.telefono_alt} onChange={(e) => setForm({ ...form, telefono_alt: e.target.value })}
                placeholder="Número alternativo" className="flex-1 px-2.5 py-2 rounded-lg border border-white/10 text-xs bg-zinc-800 text-zinc-200" />
            </div>
          </div>

          {/* Ubicación en el mapa */}
          <div>
            <span className="text-[10px] font-bold text-zinc-500">Ubicación en el mapa</span>
            <div className="mt-1">
              <MapLocationPicker
                lat={form.lat}
                lng={form.lng}
                onChange={(la, ln) => setForm((f) => ({ ...f, lat: isNaN(la) ? null : la, lng: isNaN(ln) ? null : ln }))}
              />
            </div>
          </div>

          {/* Referencia de la ubicación */}
          <div>
            <span className="text-[10px] font-bold text-zinc-500">Referencia (opcional)</span>
            <div className="flex items-center gap-1.5 mt-1">
              <MapPin className="w-4 h-4 text-zinc-500 shrink-0" />
              <input value={form.referencia} onChange={(e) => setForm({ ...form, referencia: e.target.value })}
                placeholder="Ej: frente al grifo, segunda cuadra" className="flex-1 px-2.5 py-2 rounded-lg border border-white/10 text-xs bg-zinc-800 text-zinc-200" />
            </div>
          </div>

          <input value={form.notas} onChange={(e) => setForm({ ...form, notas: e.target.value })}
            placeholder="Notas" className="w-full px-2.5 py-2 rounded-lg border border-white/10 text-xs bg-zinc-800 text-zinc-200" />

          {/* Marcar como SOS / emergencia */}
          <label className="flex items-center gap-2.5 cursor-pointer select-none rounded-xl border border-red-500/20 bg-red-500/[0.05] px-3 py-2.5">
            <button
              type="button"
              role="switch"
              aria-checked={form.es_emergencia}
              onClick={() => setForm((f) => ({ ...f, es_emergencia: !f.es_emergencia }))}
              className={`relative w-10 h-5.5 shrink-0 rounded-full transition-colors ${form.es_emergencia ? "bg-red-500" : "bg-zinc-600"}`}
            >
              <span className={`absolute top-0.5 w-4.5 h-4.5 rounded-full bg-white transition-all ${form.es_emergencia ? "left-5" : "left-0.5"}`} />
            </button>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-red-300 flex items-center gap-1"><Siren className="w-3.5 h-3.5" /> Marcar como SOS / emergencia</p>
              <p className="text-[9px] text-zinc-500">Aparecerá primero en el asistente en carretera (SOS) del Home.</p>
            </div>
          </label>

          <button type="button" onClick={handleSaveContact} disabled={saving}
            className="w-full py-3 rounded-xl bg-auto-600 text-white text-sm font-bold hover:bg-auto-500 transition-colors active:scale-[0.98] disabled:opacity-50">
            {saving ? "Guardando..." : editId ? "Guardar cambios" : "Guardar taller"}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {contacts.length === 0 && !adding && (
          <p className="text-xs text-zinc-500 text-center py-4 sm:col-span-2">No hay talleres registrados</p>
        )}
        {contacts.map((c) => {
          const tipo = contactTypes.find((t) => t.value === c.tipo);
          const Icon = tipo?.icon || Store;
          const principal = c.telefono || c.whatsapp;
          return (
            <div key={c.id} className="bg-zinc-900 border border-white/10 shadow-sm rounded-2xl p-3 flex items-center gap-3">
              {/* Foto a la izquierda */}
              <div className="relative w-16 h-16 shrink-0">
                {c.foto_url ? (
                  <img src={c.foto_url} alt="" className="w-full h-full rounded-xl object-cover border border-white/10" />
                ) : (
                  <div className="w-full h-full rounded-xl bg-zinc-800 border border-white/10 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-auto-500/70" />
                  </div>
                )}
                <span className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-auto-600/90 border-2 border-zinc-900 flex items-center justify-center">
                  <Icon className="w-3 h-3 text-white" />
                </span>
              </div>

              {/* Info central */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-bold text-zinc-100 truncate leading-tight">{c.nombre}</p>
                  {c.es_emergencia === true && (
                    <span className="shrink-0 text-[8px] font-bold text-red-400 bg-red-500/10 border border-red-500/25 px-1.5 py-0.5 rounded-full">SOS</span>
                  )}
                </div>
                {c.encargado && <p className="text-[10px] text-zinc-300 truncate leading-tight">{c.encargado}</p>}
                <p className="text-[10px] text-zinc-500 truncate">{tipo?.label}</p>
                {principal && <p className="text-[11px] font-bold text-zinc-300 mt-0.5 tabular-nums truncate">{principal}</p>}
                {c.ubicacion && <p className="text-[9px] text-zinc-500 truncate">{c.ubicacion}</p>}
              </div>

              {/* Botones icono a la derecha */}
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <div className="flex items-center gap-1.5">
                  <a href={`tel:${principal}`} title="Llamar"
                    className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/20 transition-colors">
                    <Phone className="w-4 h-4" />
                  </a>
                  <a href={principal ? waLink(principal) : "#"} title="WhatsApp" target="_blank" rel="noopener noreferrer"
                    className="w-9 h-9 rounded-xl bg-green-500/10 border border-green-500/25 flex items-center justify-center text-green-400 hover:bg-green-500/20 transition-colors">
                    <MessageCircle className="w-4 h-4" />
                  </a>
                  <a href={mapHref(c)} title="Ver en mapa" target="_blank" rel="noopener noreferrer"
                    className="w-9 h-9 rounded-xl bg-auto-500/10 border border-auto-500/25 flex items-center justify-center text-auto-400 hover:bg-auto-500/20 transition-colors">
                    <MapPin className="w-4 h-4" />
                  </a>
                </div>
                <div className="flex items-center gap-0.5">
                  <button type="button" onClick={() => startEditContact(c)} className="w-6 h-6 rounded-md hover:bg-white/10 flex items-center justify-center text-zinc-500 hover:text-auto-300" title="Editar">
                    <Pencil className="w-3 h-3" />
                  </button>
                  <button type="button" onClick={() => handleDelete(c.id)} className="w-6 h-6 rounded-md hover:bg-red-600/10 flex items-center justify-center text-zinc-500 hover:text-red-500" title="Eliminar">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Devuelve solo los dígitos del prefijo (sin +) */
function CountryPrefixOnly(pais: string) {
  const p = countryPrefixes.find((x) => x.code === pais)?.prefix || countryPrefixes[0].prefix;
  return p.replace("+", "");
}

/* ═══════════════════════════ 3. ADN del Vehículo ═══════════════════════ */
const specsInputCls = "w-full mt-0.5 px-2 py-1.5 rounded-lg border border-white/10 text-xs bg-zinc-800 text-zinc-200";

/** Título de grupo con ícono (a nivel módulo para no remontar inputs). */
function GroupTitle({ icon: GI, children }: { icon: any; children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-extrabold text-auto-400 flex items-center gap-1.5 uppercase tracking-wide mt-1 first:mt-0">
      <GI className="w-3.5 h-3.5" /> {children}
    </p>
  );
}

/** Campo con etiqueta + tooltip de ayuda (ⓘ) explicando qué es y cómo encontrar el dato. */
function Field({ label, help, children }: { label: string; help?: string; children: React.ReactNode }) {
  const [showHelp, setShowHelp] = useState(false);
  return (
    <div className="block">
      <div className="flex items-start gap-1">
        <span className="text-[10px] font-bold text-zinc-400 leading-tight pt-0.5">{label}</span>
        {help && (
          <button
            type="button"
            onClick={() => setShowHelp((v) => !v)}
            aria-label={`Ayuda: ${label}`}
            className={`shrink-0 rounded-full p-0.5 transition-colors ${showHelp ? "text-auto-400" : "text-zinc-500 hover:text-auto-400"}`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      {children}
      {showHelp && help && (
        <span className="block text-[9px] leading-snug text-zinc-400 bg-auto-500/[0.06] border border-auto-500/15 rounded-lg px-2 py-1.5 mt-1">
          {help}
        </span>
      )}
    </div>
  );
}

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
    llanta_ancho: specs?.llanta_ancho?.toString() || "",
    llanta_perfil: specs?.llanta_perfil?.toString() || "",
    llanta_rin: specs?.llanta_rin?.toString() || "",
    capacidad_tanque_galones: specs?.capacidad_tanque_galones?.toString() || "",
    octanaje_recomendado: specs?.octanaje_recomendado || "",
    km_anuales: specs?.km_anuales?.toString() || "",
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
      llanta_ancho: form.llanta_ancho ? parseInt(form.llanta_ancho) : null,
      llanta_perfil: form.llanta_perfil ? parseInt(form.llanta_perfil) : null,
      llanta_rin: form.llanta_rin ? parseInt(form.llanta_rin) : null,
      capacidad_tanque_galones: form.capacidad_tanque_galones ? parseFloat(form.capacidad_tanque_galones) : null,
      octanaje_recomendado: form.octanaje_recomendado || null,
      km_anuales: form.km_anuales ? parseInt(form.km_anuales) : null,
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
    { label: "Llanta", value: [specs?.llanta_ancho, specs?.llanta_perfil, specs?.llanta_rin].filter((v) => v != null).length === 3 ? `${specs?.llanta_ancho}/${specs?.llanta_perfil} R${specs?.llanta_rin}` : "—", icon: Layers },
    { label: "Tanque", value: specs?.capacidad_tanque_galones ? `${specs.capacidad_tanque_galones} ${specs.tanque_unidad || "gal"}` : "—", icon: Fuel },
    { label: "Octanaje", value: specs?.octanaje_recomendado || "—", icon: Layers },
    { label: "Km anuales", value: specs?.km_anuales ? `${specs.km_anuales.toLocaleString("es-PE")} km` : "—", icon: Gauge },
  ];

  // Campo con etiqueta + ayuda (texto debajo explicando cómo encontrar el dato)
  const renderFields = (
    <div className="bg-zinc-900 border border-white/10 shadow-sm rounded-2xl p-4 space-y-3">
      {/* 🛢️ Motor y lubricación */}
      <div className="space-y-2">
        <GroupTitle icon={Droplets}>Motor y lubricación</GroupTitle>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <Field label="Tipo de aceite" help="Qué aceite lleva el motor (Sintético / Semisintético / Mineral). Está en el manual o en la tapa del motor. Si no sabes, busca en internet: tipo de aceite [marca y modelo]">
            <input value={form.tipo_aceite} onChange={(e) => setForm({ ...form, tipo_aceite: e.target.value })} placeholder="Sintético" className={specsInputCls} />
          </Field>
          <Field label="Viscosidad" help="Número como 5W-30 que sale en el manual o en la lata del aceite. Importante para no dañar el motor. Busca: aceite recomendado [marca y modelo]">
            <input value={form.viscosidad_aceite} onChange={(e) => setForm({ ...form, viscosidad_aceite: e.target.value })} placeholder="5W-30" className={specsInputCls} />
          </Field>
          <Field label="Marca de aceite" help="Marca que usas o recomienda el fabricante. Mírala en la lata del aceite o pregunta al taller donde cambias el aceite.">
            <input value={form.aceite_marca} onChange={(e) => setForm({ ...form, aceite_marca: e.target.value })} placeholder="Castrol" className={specsInputCls} />
          </Field>
          <Field label="Capacidad de aceite (L)" help="Capacidad total de aceite del motor. Está en el manual (sección especificaciones). Busca: capacidad de aceite [marca y modelo]">
            <input type="number" step="0.1" value={form.capacidad_aceite_litros} onChange={(e) => setForm({ ...form, capacidad_aceite_litros: e.target.value })} placeholder="4.5" className={specsInputCls} />
          </Field>
        </div>
      </div>

      {/* 🌡️ Refrigeración */}
      <div className="space-y-2 pt-2 border-t border-white/5">
        <GroupTitle icon={Thermometer}>Refrigeración</GroupTitle>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <Field label="Tipo de refrigerante" help="Líquido para el radiador. El tipo y mezcla están en el manual o en el envase. Busca: refrigerante para [marca y modelo]">
            <input value={form.tipo_refrigerante} onChange={(e) => setForm({ ...form, tipo_refrigerante: e.target.value })} placeholder="Etilenglicol" className={specsInputCls} />
          </Field>
          <Field label="Marca de refrigerante" help="Marca del refrigerante que usas. Mírala en el envase del producto.">
            <input value={form.refrigerante_marca} onChange={(e) => setForm({ ...form, refrigerante_marca: e.target.value })} placeholder="Prestone" className={specsInputCls} />
          </Field>
          <Field label="Capacidad (L)" help="Litros totales que necesita el sistema de enfriamiento (no solo el vaso de reserva). Está en el manual.">
            <input type="number" step="0.1" value={form.capacidad_refrigerante_litros} onChange={(e) => setForm({ ...form, capacidad_refrigerante_litros: e.target.value })} placeholder="5.0" className={specsInputCls} />
          </Field>
        </div>
      </div>

      {/* 🛑 Frenos */}
      <div className="space-y-2 pt-2 border-t border-white/5">
        <GroupTitle icon={OctagonAlert}>Frenos</GroupTitle>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <Field label="Tipo de líquido" help="Tipo de líquido de frenos: DOT 3 o DOT 4. Está escrito en la tapa del depósito (junto al motor). Usa el que indique el manual.">
            <input value={form.tipo_freno} onChange={(e) => setForm({ ...form, tipo_freno: e.target.value })} placeholder="DOT 4" className={specsInputCls} />
          </Field>
          <Field label="Marca de frenos" help="Marca de pastillas/discos de freno. Si no la ves, pregunta en la casa de repuestos o revisa la factura del último cambio.">
            <input value={form.freno_marca} onChange={(e) => setForm({ ...form, freno_marca: e.target.value })} placeholder="Bosch" className={specsInputCls} />
          </Field>
        </div>
      </div>

      {/* 🔋 Batería */}
      <div className="space-y-2 pt-2 border-t border-white/5">
        <GroupTitle icon={Battery}>Batería</GroupTitle>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Marca / referencia" help="Marca y referencia exacta que trae la batería (ej: BOSCH S4, VARTA E11). Está en la etiqueta superior de la batería.">
            <input value={form.bateria_marca} onChange={(e) => setForm({ ...form, bateria_marca: e.target.value })} placeholder="BOSCH S4" className={specsInputCls} />
          </Field>
          <Field label="Fecha del próximo mantenimiento" help="Fecha para agendar la próxima revisión o cambio de batería (suele ser cada 2-3 años). La pones tú como recordatorio.">
            <DatePicker colorTheme="auto" value={form.bateria_mantenimiento_fecha} onChange={(d) => setForm({ ...form, bateria_mantenimiento_fecha: d })} />
          </Field>
        </div>
      </div>

      {/* 🛞 Neumáticos */}
      <div className="space-y-2 pt-2 border-t border-white/5">
        <GroupTitle icon={Ruler}>Neumáticos</GroupTitle>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <Field label="Presión delantera (PSI)" help="PSI recomendado para las ruedas delanteras. Está en una etiqueta pegada en el marco de la puerta del conductor o en el manual.">
            <input type="number" value={form.presion_neumaticos_delante} onChange={(e) => setForm({ ...form, presion_neumaticos_delante: e.target.value })} placeholder="32" className={specsInputCls} />
          </Field>
          <Field label="Presión trasera (PSI)" help="PSI de las ruedas traseras. Suele ser igual o un poco mayor que el delantero; míralo en la misma etiqueta de la puerta.">
            <input type="number" value={form.presion_neumaticos_atras} onChange={(e) => setForm({ ...form, presion_neumaticos_atras: e.target.value })} placeholder="32" className={specsInputCls} />
          </Field>
          <Field label="Presión de repuesto (PSI)" help="Presión de la llanta de repuesto. Está indicado en el sticker de la puerta o en la llanta misma. Suele ser más alta.">
            <input type="number" value={form.presion_neumaticos_repuesto} onChange={(e) => setForm({ ...form, presion_neumaticos_repuesto: e.target.value })} placeholder="60" className={specsInputCls} />
          </Field>
          <Field label="Medida (ancho)" help="Ancho de la llanta en mm: el primer número (205 en 205/55 R16). Está grabado en el costado de la llanta.">
            <input type="number" value={form.llanta_ancho} onChange={(e) => setForm({ ...form, llanta_ancho: e.target.value })} placeholder="205" className={specsInputCls} />
          </Field>
          <Field label="Medida (perfil)" help="Perfil o altura: el segundo número (55 en 205/55 R16). Va junto al ancho en el costado de la llanta.">
            <input type="number" value={form.llanta_perfil} onChange={(e) => setForm({ ...form, llanta_perfil: e.target.value })} placeholder="55" className={specsInputCls} />
          </Field>
          <Field label="Medida (rin)" help="Rin o diámetro de la llanta en pulgadas: el número tras la R (16 en 205/55 R16). También grabado en el costado.">
            <input type="number" value={form.llanta_rin} onChange={(e) => setForm({ ...form, llanta_rin: e.target.value })} placeholder="16" className={specsInputCls} />
          </Field>
        </div>
      </div>

      {/* ⛽ Combustible */}
      <div className="space-y-2 pt-2 border-t border-white/5">
        <GroupTitle icon={Fuel}>Combustible</GroupTitle>
        <div className="grid grid-cols-2 gap-2">
          <Field label={`Capacidad de tanque (${cfg.fuelUnitShort})`} help="Capacidad del tanque de combustible. Está en el manual. También puedes buscarla en internet: capacidad de tanque [marca y modelo]">
            <input type="number" step="0.1" value={form.capacidad_tanque_galones} onChange={(e) => setForm({ ...form, capacidad_tanque_galones: e.target.value })} placeholder="14" className={specsInputCls} />
          </Field>
          <Field label="Octanaje recomendado" help="Toca los botones para marcar el o los tipos de combustible que recomienda el fabricante (95, 97, etc.). Está en el manual o en la tapa del tanque.">
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
          </Field>
        </div>
        <Field label="Kilómetros anuales estimados" help="Estimación de cuántos km haces al año. Súmale los km del odómetro de hace 1 año o divide tu recorrido mensual por 12. Lo usan las herramientas de costo.">
          <input type="number" value={form.km_anuales} onChange={(e) => setForm({ ...form, km_anuales: e.target.value })} placeholder="15000" className={specsInputCls} />
        </Field>
      </div>

      <div className="flex gap-1.5 pt-2 border-t border-white/5">
        <button type="button" onClick={handleSave} disabled={saving} className="flex-1 px-3 py-2.5 rounded-lg bg-auto-600 text-white text-xs font-bold">{saving ? "Guardando..." : "Guardar ADN del vehículo"}</button>
        <button type="button" onClick={() => setEditing(false)} className="px-3 py-2.5 rounded-lg bg-zinc-800 text-zinc-500 text-xs"><X className="w-3.5 h-3.5" /></button>
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
            <button type="button" onClick={handleSyncCatalog} disabled={syncing} className="text-[10px] font-bold text-auto-500 bg-auto-600/10 border border-auto-600/20 px-2 py-1 rounded-lg hover:bg-auto-600/20 transition-colors disabled:opacity-50">
              {syncing ? "Sincronizando..." : "Sincronizar con catálogo"}
            </button>
          )}
          <button type="button" onClick={() => setEditing(!editing)} className="text-xs font-bold text-auto-500 hover:text-auto-500 transition-colors">
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
