"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Vehicle, VehicleDocument, VehicleContact, VehicleSpecs } from "@/types/database";
import {
  FileText, Phone, Wrench, AlertTriangle, Plus, Trash2, X,
  BadgeCheck, Settings, Circle, Droplets, Battery, Thermometer, OctagonAlert, Fuel, RotateCw, Lock, Cog, Sun,
  Shield, ClipboardList, Anchor, Store, Building2, Pin, Zap,
  Calendar, Gauge, FlaskConical, Ruler, Layers,
} from "lucide-react";

/* ═══════════════════════════ Datos ═══════════════════════ */
const documentTypes = [
  { value: "soat", label: "SOAT", icon: Shield },
  { value: "revision_tecnica", label: "Revisión Técnica", icon: Wrench },
  { value: "poliza_seguro", label: "Póliza de Seguro", icon: ClipboardList },
  { value: "matricula", label: "Matrícula", icon: FileText },
  { value: "licencia_conducir", label: "Licencia de Conducir", icon: BadgeCheck },
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
  { icon: Circle, name: "Check Engine", severity: "alto", color: "text-red-500", bg: "bg-red-500/10", desc: "Falla en el motor o sistema de emisiones. Requiere diagnóstico.", action: "Lleva al mecánico lo antes posible." },
  { icon: Droplets, name: "Presión de Aceite", severity: "alto", color: "text-red-400", bg: "bg-red-500/10", desc: "Presión de aceite baja o insuficiente. El motor puede dañarse.", action: "Detén el auto inmediatamente y revisa el nivel de aceite." },
  { icon: Battery, name: "Batería / Alternador", severity: "medio", color: "text-amber-400", bg: "bg-amber-500/10", desc: "Falla en el sistema de carga. La batería no se está cargando.", action: "Revisa el alternador y la batería." },
  { icon: Thermometer, name: "Temperatura del Motor", severity: "alto", color: "text-red-400", bg: "bg-red-500/10", desc: "Sobrecalentamiento del motor. Riesgo de daño grave.", action: "Apaga el motor y revisa el refrigerante." },
  { icon: OctagonAlert, name: "Freno de Mano / Frenos", severity: "alto", color: "text-red-500", bg: "bg-red-500/10", desc: "Freno de mano activado o nivel bajo de líquido de frenos.", action: "Verifica el freno de mano y el líquido de frenos." },
  { icon: Fuel, name: "Nivel de Combustible", severity: "bajo", color: "text-amber-400", bg: "bg-amber-500/10", desc: "Reserva de combustible activada. Quedan pocos litros.", action: "Carga combustible en la próxima estación." },
  { icon: Circle, name: "ABS (Antibloqueo)", severity: "medio", color: "text-amber-400", bg: "bg-amber-500/10", desc: "Falla en el sistema de frenos antibloqueo.", action: "Los frenos normales operan, pero el ABS no asistirá." },
  { icon: RotateCw, name: "Control de Tracción", severity: "bajo", color: "text-blue-400", bg: "bg-blue-500/10", desc: "Sistema de control de tracción activo o con falla.", action: "Si parpadea, está funcionando. Si queda fijo, requiere revisión." },
  { icon: Circle, name: "Airbag / SRS", severity: "alto", color: "text-red-400", bg: "bg-red-500/10", desc: "Falla en el sistema de bolsas de aire.", action: "Requiere revisión urgente. Los airbags podrían no activarse." },
  { icon: Lock, name: "Inmovilizador / Seguridad", severity: "bajo", color: "text-zinc-500", bg: "bg-zinc-100", desc: "Sistema antirrobo activo o llave no reconocida.", action: "Usa la llave original." },
  { icon: Cog, name: "Filtro de Partículas (DPF)", severity: "medio", color: "text-zinc-500", bg: "bg-zinc-100", desc: "Filtro de partículas diésel obstruido.", action: "Conduce a velocidad constante en carretera para regenerar." },
  { icon: Sun, name: "Luces de Cruce", severity: "bajo", color: "text-blue-300", bg: "bg-blue-500/10", desc: "Las luces bajas están encendidas.", action: "Informativo." },
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
          <h1 className="text-xl font-extrabold text-zinc-900">Guantera</h1>
          <p className="text-xs text-zinc-500">{vehicle.marca} {vehicle.modelo} · {vehicle.placa}</p>
        </div>
      </div>

      <DocumentsSection vehicleId={vehicle.id} initialDocs={initialDocs} />
      <ContactsSection vehicleId={vehicle.id} initialContacts={initialContacts} />
      <SpecsSection vehicleId={vehicle.id} initialSpecs={initialSpecs} />
      <WarningLightsSection />
    </div>
  );
}

/* ═══════════════════════════ 1. Documentos ═══════════════════════ */
function DocumentsSection({ vehicleId, initialDocs }: { vehicleId: string; initialDocs: VehicleDocument[] }) {
  const [docs, setDocs] = useState(initialDocs);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ tipo: "soat", fecha_emision: "", fecha_vencimiento: "", notas: "" });

  const handleAdd = async () => {
    if (!form.fecha_vencimiento) return;
    setSaving(true);
    const supabase = createClient();
    const { data, error } = await supabase.from("vehicle_documents").insert({
      vehicle_id: vehicleId, tipo: form.tipo, fecha_emision: form.fecha_emision || null, fecha_vencimiento: form.fecha_vencimiento, notas: form.notas || null,
    }).select().single();
    setSaving(false);
    if (!error && data) {
      setDocs([...docs, data as VehicleDocument]);
      setAdding(false);
      setForm({ tipo: "soat", fecha_emision: "", fecha_vencimiento: "", notas: "" });
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
    if (dias <= 0) return { border: "border-red-500/20", badge: "bg-red-500/10 text-red-400", dot: "bg-red-500" };
    if (dias <= 15) return { border: "border-amber-500/20", badge: "bg-amber-500/10 text-amber-400", dot: "bg-amber-500" };
    return { border: "border-emerald-500/20", badge: "bg-emerald-500/10 text-emerald-400", dot: "bg-emerald-500" };
  };

  const DocIcon = ({ tipo }: { tipo: string }) => {
    const dt = documentTypes.find((t) => t.value === tipo);
    const Icon = dt?.icon || FileText;
    return <div className="w-10 h-10 rounded-xl bg-auto-600/10 border border-auto-600/20 flex items-center justify-center shrink-0"><Icon className="w-5 h-5 text-auto-500" /></div>;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-zinc-700 flex items-center gap-2">
          <BadgeCheck className="w-4 h-4 text-auto-500" /> Documentos Digitales
        </h2>
        <button onClick={() => setAdding(!adding)} className="w-8 h-8 rounded-full bg-auto-600/10 border border-auto-600/20 flex items-center justify-center text-auto-500 hover:bg-auto-600/20 transition-colors">
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {adding && (
        <div className="bg-white border border-zinc-200 shadow-sm rounded-2xl p-4 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}
              className="px-2.5 py-2 rounded-lg border border-zinc-200 text-xs font-medium bg-zinc-100 text-zinc-800">
              {documentTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <input type="date" value={form.fecha_emision} onChange={(e) => setForm({ ...form, fecha_emision: e.target.value })}
              className="px-2.5 py-2 rounded-lg border border-zinc-200 text-xs bg-zinc-100 text-zinc-800" placeholder="Emisión" />
          </div>
          <input type="date" value={form.fecha_vencimiento} onChange={(e) => setForm({ ...form, fecha_vencimiento: e.target.value })}
            required className="w-full px-2.5 py-2 rounded-lg border border-zinc-200 text-xs bg-zinc-100 text-zinc-800" />
          <div className="flex gap-1.5">
            <button onClick={handleAdd} disabled={saving} className="flex-1 px-3 py-1.5 rounded-lg bg-auto-600 text-white text-xs font-bold">
              {saving ? "Guardando..." : "Guardar"}
            </button>
            <button onClick={() => setAdding(false)} className="px-3 py-1.5 rounded-lg bg-zinc-100 text-zinc-500 text-xs">
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
            <div key={doc.id} className={`bg-white border border-zinc-200 shadow-sm rounded-2xl p-4 border ${style.border} flex items-center gap-3`}>
              <DocIcon tipo={doc.tipo} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-zinc-900">{dt?.label || doc.tipo}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Calendar className="w-3 h-3 text-zinc-500" />
                  <p className="text-[10px] text-zinc-500">Vence: {new Date(doc.fecha_vencimiento + "T12:00:00").toLocaleDateString("es-PE")}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
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
    </div>
  );
}

/* ═══════════════════════════ 2. Contactos ═══════════════════════ */
function ContactsSection({ vehicleId, initialContacts }: { vehicleId: string; initialContacts: VehicleContact[] }) {
  const [contacts, setContacts] = useState(initialContacts);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ nombre: "", tipo: "mecanico", telefono: "", whatsapp: "", direccion: "", notas: "" });

  const handleAdd = async () => {
    if (!form.nombre) return;
    setSaving(true);
    const supabase = createClient();
    const { data, error } = await supabase.from("vehicle_contacts").insert({
      vehicle_id: vehicleId, nombre: form.nombre, tipo: form.tipo, telefono: form.telefono || null, whatsapp: form.whatsapp || null, direccion: form.direccion || null, notas: form.notas || null,
    }).select().single();
    setSaving(false);
    if (!error && data) {
      setContacts([...contacts, data as VehicleContact]);
      setAdding(false);
      setForm({ nombre: "", tipo: "mecanico", telefono: "", whatsapp: "", direccion: "", notas: "" });
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await createClient().from("vehicle_contacts").delete().eq("id", id);
    if (!error) setContacts(contacts.filter((c) => c.id !== id));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-zinc-700 flex items-center gap-2">
          <Phone className="w-4 h-4 text-auto-500" /> Directorio de Talleres
        </h2>
        <button onClick={() => setAdding(!adding)} className="w-8 h-8 rounded-full bg-auto-600/10 border border-auto-600/20 flex items-center justify-center text-auto-500 hover:bg-auto-600/20 transition-colors">
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {adding && (
        <div className="bg-white border border-zinc-200 shadow-sm rounded-2xl p-4 space-y-2">
          <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            placeholder="Nombre del contacto *" className="w-full px-2.5 py-2 rounded-lg border border-zinc-200 text-xs bg-zinc-100 text-zinc-800" />
          <div className="grid grid-cols-2 gap-2">
            <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}
              className="px-2.5 py-2 rounded-lg border border-zinc-200 text-xs bg-zinc-100 text-zinc-800">
              {contactTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })}
              placeholder="Teléfono" className="px-2.5 py-2 rounded-lg border border-zinc-200 text-xs bg-zinc-100 text-zinc-800" />
          </div>
          <div className="flex gap-1.5">
            <button onClick={handleAdd} disabled={saving} className="flex-1 px-3 py-1.5 rounded-lg bg-auto-600 text-white text-xs font-bold">
              {saving ? "Guardando..." : "Guardar"}
            </button>
            <button onClick={() => setAdding(false)} className="px-3 py-1.5 rounded-lg bg-zinc-100 text-zinc-500 text-xs">
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
            <div key={c.id} className="bg-white border border-zinc-200 shadow-sm rounded-2xl p-3 flex flex-col gap-2">
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 rounded-lg bg-auto-600/10 border border-auto-600/20 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-auto-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-zinc-900 truncate">{c.nombre}</p>
                  <p className="text-[10px] text-zinc-500">{tipo?.label}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {c.telefono && (
                  <a href={`tel:${c.telefono}`} className="flex-1 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-[10px] font-bold hover:bg-emerald-500/20 transition-colors">
                    <Phone className="w-3 h-3 mr-1" /> Llamar
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
function SpecsSection({ vehicleId, initialSpecs }: { vehicleId: string; initialSpecs: VehicleSpecs | null }) {
  const [specs, setSpecs] = useState<VehicleSpecs | null>(initialSpecs);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    tipo_aceite: specs?.tipo_aceite || "",
    viscosidad_aceite: specs?.viscosidad_aceite || "",
    capacidad_aceite_litros: specs?.capacidad_aceite_litros?.toString() || "",
    tipo_refrigerante: specs?.tipo_refrigerante || "",
    capacidad_refrigerante_litros: specs?.capacidad_refrigerante_litros?.toString() || "",
    tipo_freno: specs?.tipo_freno || "",
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
      capacidad_aceite_litros: form.capacidad_aceite_litros ? parseFloat(form.capacidad_aceite_litros) : null,
      tipo_refrigerante: form.tipo_refrigerante || null,
      capacidad_refrigerante_litros: form.capacidad_refrigerante_litros ? parseFloat(form.capacidad_refrigerante_litros) : null,
      tipo_freno: form.tipo_freno || null,
      presion_neumaticos_delante: form.presion_neumaticos_delante ? parseInt(form.presion_neumaticos_delante) : null,
      presion_neumaticos_atras: form.presion_neumaticos_atras ? parseInt(form.presion_neumaticos_atras) : null,
      presion_neumaticos_repuesto: form.presion_neumaticos_repuesto ? parseInt(form.presion_neumaticos_repuesto) : null,
      capacidad_tanque_galones: form.capacidad_tanque_galones ? parseFloat(form.capacidad_tanque_galones) : null,
      octanaje_recomendado: form.octanaje_recomendado || null,
    };

    const { data, error } = specs
      ? await supabase.from("vehicle_specs").update(payload).eq("id", specs.id).select().single()
      : await supabase.from("vehicle_specs").insert(payload).select().single();

    setSaving(false);
    if (!error && data) {
      setSpecs(data as VehicleSpecs);
      setEditing(false);
    }
  };

  const specsCards = [
    { label: "Aceite", value: specs?.tipo_aceite || "—", detail: specs?.viscosidad_aceite, icon: Droplets },
    { label: "Cap. aceite", value: specs?.capacidad_aceite_litros ? `${specs.capacidad_aceite_litros} L` : "—", icon: FlaskConical },
    { label: "Refrigerante", value: specs?.tipo_refrigerante || "—", detail: specs?.capacidad_refrigerante_litros ? `${specs.capacidad_refrigerante_litros} L` : null, icon: Thermometer },
    { label: "Líq. frenos", value: specs?.tipo_freno || "—", icon: OctagonAlert },
    { label: "PSI delante", value: specs?.presion_neumaticos_delante ? `${specs.presion_neumaticos_delante} PSI` : "—", icon: Gauge },
    { label: "PSI atrás", value: specs?.presion_neumaticos_atras ? `${specs.presion_neumaticos_atras} PSI` : "—", icon: Gauge },
    { label: "PSI repuesto", value: specs?.presion_neumaticos_repuesto ? `${specs.presion_neumaticos_repuesto} PSI` : "—", icon: Ruler },
    { label: "Tanque", value: specs?.capacidad_tanque_galones ? `${specs.capacidad_tanque_galones} gal` : "—", icon: Fuel },
    { label: "Octanaje", value: specs?.octanaje_recomendado || "—", icon: Layers },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-zinc-700 flex items-center gap-2">
          <Settings className="w-4 h-4 text-auto-500" /> ADN del Vehículo
        </h2>
        <button onClick={() => setEditing(!editing)} className="text-xs font-bold text-auto-500 hover:text-auto-500 transition-colors">
          {editing ? "Cancelar" : "Editar"}
        </button>
      </div>

      {editing ? (
        <div className="bg-white border border-zinc-200 shadow-sm rounded-2xl p-4 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <label className="block"><span className="text-[10px] font-bold text-zinc-500">Tipo de aceite</span>
              <input value={form.tipo_aceite} onChange={(e) => setForm({ ...form, tipo_aceite: e.target.value })} placeholder="Ej: Sintético" className="w-full mt-0.5 px-2 py-1.5 rounded-lg border border-zinc-200 text-xs bg-zinc-100 text-zinc-800" />
            </label>
            <label className="block"><span className="text-[10px] font-bold text-zinc-500">Viscosidad</span>
              <input value={form.viscosidad_aceite} onChange={(e) => setForm({ ...form, viscosidad_aceite: e.target.value })} placeholder="Ej: 5W-30" className="w-full mt-0.5 px-2 py-1.5 rounded-lg border border-zinc-200 text-xs bg-zinc-100 text-zinc-800" />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <label className="block"><span className="text-[10px] font-bold text-zinc-500">Cap. aceite (L)</span>
              <input type="number" step="0.1" value={form.capacidad_aceite_litros} onChange={(e) => setForm({ ...form, capacidad_aceite_litros: e.target.value })} placeholder="4.5" className="w-full mt-0.5 px-2 py-1.5 rounded-lg border border-zinc-200 text-xs bg-zinc-100 text-zinc-800" />
            </label>
            <label className="block"><span className="text-[10px] font-bold text-zinc-500">Refrigerante</span>
              <input value={form.tipo_refrigerante} onChange={(e) => setForm({ ...form, tipo_refrigerante: e.target.value })} placeholder="Ej: Etilenglicol" className="w-full mt-0.5 px-2 py-1.5 rounded-lg border border-zinc-200 text-xs bg-zinc-100 text-zinc-800" />
            </label>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <label className="block"><span className="text-[10px] font-bold text-zinc-500">PSI delante</span>
              <input type="number" value={form.presion_neumaticos_delante} onChange={(e) => setForm({ ...form, presion_neumaticos_delante: e.target.value })} placeholder="32" className="w-full mt-0.5 px-2 py-1.5 rounded-lg border border-zinc-200 text-xs bg-zinc-100 text-zinc-800" />
            </label>
            <label className="block"><span className="text-[10px] font-bold text-zinc-500">PSI atrás</span>
              <input type="number" value={form.presion_neumaticos_atras} onChange={(e) => setForm({ ...form, presion_neumaticos_atras: e.target.value })} placeholder="32" className="w-full mt-0.5 px-2 py-1.5 rounded-lg border border-zinc-200 text-xs bg-zinc-100 text-zinc-800" />
            </label>
            <label className="block"><span className="text-[10px] font-bold text-zinc-500">PSI repuesto</span>
              <input type="number" value={form.presion_neumaticos_repuesto} onChange={(e) => setForm({ ...form, presion_neumaticos_repuesto: e.target.value })} placeholder="60" className="w-full mt-0.5 px-2 py-1.5 rounded-lg border border-zinc-200 text-xs bg-zinc-100 text-zinc-800" />
            </label>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <label className="block"><span className="text-[10px] font-bold text-zinc-500">Tanque (gal)</span>
              <input type="number" step="0.1" value={form.capacidad_tanque_galones} onChange={(e) => setForm({ ...form, capacidad_tanque_galones: e.target.value })} placeholder="14" className="w-full mt-0.5 px-2 py-1.5 rounded-lg border border-zinc-200 text-xs bg-zinc-100 text-zinc-800" />
            </label>
            <label className="block"><span className="text-[10px] font-bold text-zinc-500">Cap. refrig. (L)</span>
              <input type="number" step="0.1" value={form.capacidad_refrigerante_litros} onChange={(e) => setForm({ ...form, capacidad_refrigerante_litros: e.target.value })} placeholder="5.0" className="w-full mt-0.5 px-2 py-1.5 rounded-lg border border-zinc-200 text-xs bg-zinc-100 text-zinc-800" />
            </label>
            <label className="block"><span className="text-[10px] font-bold text-zinc-500">Líq. frenos</span>
              <input value={form.tipo_freno} onChange={(e) => setForm({ ...form, tipo_freno: e.target.value })} placeholder="DOT 4" className="w-full mt-0.5 px-2 py-1.5 rounded-lg border border-zinc-200 text-xs bg-zinc-100 text-zinc-800" />
            </label>
          </div>
          <label className="block"><span className="text-[10px] font-bold text-zinc-500">Octanaje</span>
            <input value={form.octanaje_recomendado} onChange={(e) => setForm({ ...form, octanaje_recomendado: e.target.value })} placeholder="Ej: 95 RON" className="w-full mt-0.5 px-2 py-1.5 rounded-lg border border-zinc-200 text-xs bg-zinc-100 text-zinc-800" />
          </label>
          <div className="flex gap-1.5">
            <button onClick={handleSave} disabled={saving} className="flex-1 px-3 py-1.5 rounded-lg bg-auto-600 text-white text-xs font-bold">{saving ? "Guardando..." : "Guardar"}</button>
            <button onClick={() => setEditing(false)} className="px-3 py-1.5 rounded-lg bg-zinc-100 text-zinc-500 text-xs"><X className="w-3.5 h-3.5" /></button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {specsCards.map((card) => (
            <div key={card.label} className="bg-white border border-zinc-200 shadow-sm rounded-2xl p-3 flex flex-col items-center text-center gap-1.5">
              <card.icon className="w-4 h-4 text-auto-500" />
              <p className="text-[10px] text-zinc-500">{card.label}</p>
              <p className="text-xs font-bold text-zinc-900">{card.value}</p>
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
      <h2 className="text-sm font-bold text-zinc-700 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-400" /> Luces del Tablero
      </h2>
      <div className="grid grid-cols-2 gap-2">
        {warningLights.map((light, i) => {
          const Icon = light.icon;
          return (
            <div key={i}>
              <button
                onClick={() => setSelected(selected === i ? null : i)}
                className={`w-full bg-white border border-zinc-200 shadow-sm rounded-2xl p-3 flex items-center gap-2 text-left transition-all ${selected === i ? "border border-auto-600/20" : ""}`}
              >
                <div className={`w-8 h-8 rounded-lg ${light.bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-4 h-4 ${light.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-zinc-900 truncate">{light.name}</p>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${light.bg} ${light.color}`}>
                    {light.severity}
                  </span>
                </div>
              </button>
              {selected === i && (
                <div className="bg-white border border-zinc-200 shadow-sm rounded-2xl p-3 mt-1 border border-auto-600/20">
                  <p className="text-xs text-zinc-700">{light.desc}</p>
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
