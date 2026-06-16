"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Vehicle, VehicleDocument, VehicleContact, VehicleSpecs } from "@/types/database";
import {
  ChevronDown, FileText, Phone, Wrench, AlertTriangle, Plus, Trash2, Save, X,
} from "lucide-react";

/* ═══════════════════════════ Datos ═══════════════════════ */
const documentTypes = [
  { value: "soat", label: "SOAT", icon: "🛡️" },
  { value: "revision_tecnica", label: "Revisión Técnica", icon: "🔧" },
  { value: "poliza_seguro", label: "Póliza de Seguro", icon: "📋" },
  { value: "matricula", label: "Matrícula", icon: "🚗" },
  { value: "licencia_conducir", label: "Licencia de Conducir", icon: "🪪" },
];

const contactTypes = [
  { value: "mecanico", label: "Mecánico", icon: "🔧" },
  { value: "electromecanico", label: "Electromecánico", icon: "⚡" },
  { value: "grua", label: "Grúa", icon: "🪝" },
  { value: "tienda_repuestos", label: "Tienda de Repuestos", icon: "🏪" },
  { value: "aseguradora", label: "Aseguradora", icon: "🏢" },
  { value: "otro", label: "Otro", icon: "📌" },
];

const warningLights = [
  { icon: "🔴", name: "Check Engine", severity: "alto", desc: "Falla en el motor o sistema de emisiones. Requiere diagnóstico.", action: "Lleva al mecánico lo antes posible." },
  { icon: "🛢️", name: "Presión de Aceite", severity: "alto", desc: "Presión de aceite baja o insuficiente. El motor puede dañarse.", action: "Detén el auto inmediatamente y revisa el nivel de aceite." },
  { icon: "🔋", name: "Batería / Alternador", severity: "medio", desc: "Falla en el sistema de carga. La batería no se está cargando.", action: "Revisa el alternador y la batería. Puedes quedarte sin energía." },
  { icon: "🌡️", name: "Temperatura del Motor", severity: "alto", desc: "Sobrecalentamiento del motor. Riesgo de daño grave.", action: "Apaga el motor, deja enfriar y revisa el nivel de refrigerante." },
  { icon: "🛑", name: "Freno de Mano / Frenos", severity: "alto", desc: "Freno de mano activado o nivel bajo de líquido de frenos.", action: "Verifica que el freno de mano esté abajo. Revisa el líquido de frenos." },
  { icon: "🫗", name: "Nivel de Combustible", severity: "bajo", desc: "Reserva de combustible activada. Quedan pocos litros.", action: "Carga combustible en la próxima estación." },
  { icon: "⭕", name: "ABS (Antibloqueo)", severity: "medio", desc: "Falla en el sistema de frenos antibloqueo. Los frenos aún funcionan.", action: "Los frenos normales operan, pero el ABS no asistirá en emergencia." },
  { icon: "🔄", name: "Control de Tracción", severity: "bajo", desc: "Sistema de control de tracción activo o con falla.", action: "Si parpadea, está funcionando. Si queda fijo, requiere revisión." },
  { icon: "🎈", name: "Airbag / SRS", severity: "alto", desc: "Falla en el sistema de bolsas de aire. Pueden no desplegarse.", action: "Requiere revisión urgente. Los airbags podrían no activarse en un choque." },
  { icon: "🔐", name: "Inmovilizador / Seguridad", severity: "bajo", desc: "Sistema antirrobo activo o llave no reconocida.", action: "Usa la llave original. Si persiste, revisa la batería del control." },
  { icon: "⚙️", name: "Filtro de Partículas (DPF)", severity: "medio", desc: "Filtro de partículas diésel obstruido. Afecta rendimiento.", action: "Conduce a velocidad constante en carretera para regenerar el filtro." },
  { icon: "🔆", name: "Luces de Cruce", severity: "bajo", desc: "Indica que las luces bajas están encendidas.", action: "Informativo. Tus luces de cruce están activadas." },
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
        <div className="w-10 h-10 rounded-xl bg-auto-600/10 flex items-center justify-center text-lg">📄</div>
        <div>
          <h1 className="text-xl font-extrabold text-zinc-200">Guantera</h1>
          <p className="text-xs text-zinc-400">{vehicle.marca} {vehicle.modelo} · {vehicle.placa}</p>
        </div>
      </div>

      <div className="space-y-2">
        <DocumentsSection vehicleId={vehicle.id} initialDocs={initialDocs} />
        <ContactsSection vehicleId={vehicle.id} initialContacts={initialContacts} />
        <SpecsSection vehicleId={vehicle.id} initialSpecs={initialSpecs} />
        <WarningLightsSection />
      </div>
    </div>
  );
}

/* ═══════════════════════════ 1. Documentos ═══════════════════════ */
function DocumentsSection({ vehicleId, initialDocs }: { vehicleId: string; initialDocs: VehicleDocument[] }) {
  const [docs, setDocs] = useState(initialDocs);
  const [open, setOpen] = useState(false);
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
  const getUrgencyColor = (dias: number) => dias <= -900 ? "bg-red-500/10 text-red-400" : dias <= 0 ? "bg-red-500/10 text-red-400" : dias <= 15 ? "bg-amber-500/10 text-amber-400" : "bg-emerald-500/10 text-emerald-400";

  return (
    <div className="card-auto-dark rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full p-4 flex items-center justify-between text-left">
        <div className="flex items-center gap-3">
          <span className="text-xl">🪪</span>
          <div>
            <p className="text-sm font-bold text-zinc-200">Documentos Digitales</p>
            <p className="text-[10px] text-zinc-500">{docs.length} documento(s) registrado(s)</p>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-zinc-500 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-2">
          {docs.map((doc) => {
            const dias = daysUntil(doc.fecha_vencimiento);
            const tipoLabel = documentTypes.find((t) => t.value === doc.tipo)?.label || doc.tipo;
            return (
              <div key={doc.id} className="flex items-center justify-between bg-white/5 rounded-xl p-3">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-zinc-200">{tipoLabel}</p>
                  <p className="text-[10px] text-zinc-500">Vence: {new Date(doc.fecha_vencimiento + "T12:00:00").toLocaleDateString("es-PE")}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getUrgencyColor(dias)}`}>
                    {dias <= 0 ? "Vencido" : `${dias}d`}
                  </span>
                  <button onClick={() => handleDelete(doc.id)} className="w-7 h-7 rounded-lg hover:bg-red-600/10 flex items-center justify-center text-zinc-500 hover:text-red-500 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}

          {adding ? (
            <div className="bg-auto-600/10 rounded-xl p-3 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                  className="px-2.5 py-2 rounded-lg border border-white/10 text-xs font-medium bg-white/5">
                  {documentTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
                <input type="date" value={form.fecha_emision} onChange={(e) => setForm({ ...form, fecha_emision: e.target.value })}
                  className="px-2.5 py-2 rounded-lg border border-white/10 text-xs bg-white/5" placeholder="Emisión" />
              </div>
              <input type="date" value={form.fecha_vencimiento} onChange={(e) => setForm({ ...form, fecha_vencimiento: e.target.value })}
                required className="w-full px-2.5 py-2 rounded-lg border border-white/10 text-xs bg-white/5" />
              <div className="flex gap-1.5">
                <button onClick={handleAdd} disabled={saving} className="flex-1 px-3 py-1.5 rounded-lg bg-auto-600 text-white text-xs font-bold">
                  {saving ? "Guardando..." : "Guardar"}
                </button>
                <button onClick={() => setAdding(false)} className="px-3 py-1.5 rounded-lg bg-white/10 text-zinc-400 text-xs">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setAdding(true)} className="w-full py-2.5 rounded-xl border-2 border-dashed border-white/10 text-xs font-bold text-zinc-500 hover:border-auto-300 hover:text-auto-500 transition-colors flex items-center justify-center gap-1.5">
              <Plus className="w-3.5 h-3.5" /> Agregar documento
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════ 2. Contactos ═══════════════════════ */
function ContactsSection({ vehicleId, initialContacts }: { vehicleId: string; initialContacts: VehicleContact[] }) {
  const [contacts, setContacts] = useState(initialContacts);
  const [open, setOpen] = useState(false);
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
    <div className="card-auto-dark rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full p-4 flex items-center justify-between text-left">
        <div className="flex items-center gap-3">
          <span className="text-xl">📞</span>
          <div>
            <p className="text-sm font-bold text-zinc-200">Directorio de Talleres</p>
            <p className="text-[10px] text-zinc-500">{contacts.length} contacto(s)</p>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-zinc-500 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-2">
          {contacts.map((c) => {
            const tipoLabel = contactTypes.find((t) => t.value === c.tipo)?.label || c.tipo;
            return (
              <div key={c.id} className="flex items-center justify-between bg-white/5 rounded-xl p-3">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-zinc-200">{c.nombre}</p>
                  <p className="text-[10px] text-zinc-500">{tipoLabel}{c.telefono ? ` · ${c.telefono}` : ""}</p>
                </div>
                <div className="flex items-center gap-1">
                  {c.telefono && (
                    <a href={`tel:${c.telefono}`} className="w-7 h-7 rounded-lg bg-emerald-600/10 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/10 transition-colors">
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <button onClick={() => handleDelete(c.id)} className="w-7 h-7 rounded-lg hover:bg-red-600/10 flex items-center justify-center text-zinc-500 hover:text-red-500 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}

          {adding ? (
            <div className="bg-auto-600/10 rounded-xl p-3 space-y-2">
              <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                placeholder="Nombre del contacto *" className="w-full px-2.5 py-2 rounded-lg border border-white/10 text-xs bg-white/5" />
              <div className="grid grid-cols-2 gap-2">
                <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                  className="px-2.5 py-2 rounded-lg border border-white/10 text-xs bg-white/5">
                  {contactTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
                <input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                  placeholder="Teléfono" className="px-2.5 py-2 rounded-lg border border-white/10 text-xs bg-white/5" />
              </div>
              <div className="flex gap-1.5">
                <button onClick={handleAdd} disabled={saving} className="flex-1 px-3 py-1.5 rounded-lg bg-auto-600 text-white text-xs font-bold">
                  {saving ? "Guardando..." : "Guardar"}
                </button>
                <button onClick={() => setAdding(false)} className="px-3 py-1.5 rounded-lg bg-white/10 text-zinc-400 text-xs">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setAdding(true)} className="w-full py-2.5 rounded-xl border-2 border-dashed border-white/10 text-xs font-bold text-zinc-500 hover:border-auto-300 hover:text-auto-500 transition-colors flex items-center justify-center gap-1.5">
              <Plus className="w-3.5 h-3.5" /> Agregar contacto
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════ 3. ADN del Vehículo ═══════════════════════ */
function SpecsSection({ vehicleId, initialSpecs }: { vehicleId: string; initialSpecs: VehicleSpecs | null }) {
  const [specs, setSpecs] = useState<VehicleSpecs | null>(initialSpecs);
  const [open, setOpen] = useState(false);
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

  const specsRows = [
    { label: "Tipo de aceite", value: specs?.tipo_aceite, detail: specs?.viscosidad_aceite },
    { label: "Capacidad de aceite", value: specs?.capacidad_aceite_litros ? `${specs.capacidad_aceite_litros} L` : null },
    { label: "Refrigerante", value: specs?.tipo_refrigerante, detail: specs?.capacidad_refrigerante_litros ? `${specs.capacidad_refrigerante_litros} L` : null },
    { label: "Capacidad refrigerante", value: specs?.capacidad_refrigerante_litros ? `${specs.capacidad_refrigerante_litros} L` : null },
    { label: "Líquido de frenos", value: specs?.tipo_freno },
    { label: "Presión neumáticos", value: specs?.presion_neumaticos_delante ? `${specs.presion_neumaticos_delante} del / ${specs.presion_neumaticos_atras} atrás` : null },
    { label: "Presión repuesto", value: specs?.presion_neumaticos_repuesto ? `${specs.presion_neumaticos_repuesto} PSI` : null },
    { label: "Capacidad tanque", value: specs?.capacidad_tanque_galones ? `${specs.capacidad_tanque_galones} gal` : null },
    { label: "Octanaje recomendado", value: specs?.octanaje_recomendado },
  ];

  return (
    <div className="card-auto-dark rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full p-4 flex items-center justify-between text-left">
        <div className="flex items-center gap-3">
          <span className="text-xl">🧬</span>
          <div>
            <p className="text-sm font-bold text-zinc-200">ADN del Vehículo</p>
            <p className="text-[10px] text-zinc-500">Especificaciones del fabricante</p>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-zinc-500 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="px-4 pb-4">
          {editing ? (
            <div className="bg-auto-600/10 rounded-xl p-3 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <label className="block"><span className="text-[10px] font-bold text-zinc-400">Tipo de aceite</span>
                  <input value={form.tipo_aceite} onChange={(e) => setForm({ ...form, tipo_aceite: e.target.value })} placeholder="Ej: Sintético" className="w-full mt-0.5 px-2 py-1.5 rounded-lg border border-white/10 text-xs bg-white/5" />
                </label>
                <label className="block"><span className="text-[10px] font-bold text-zinc-400">Viscosidad</span>
                  <input value={form.viscosidad_aceite} onChange={(e) => setForm({ ...form, viscosidad_aceite: e.target.value })} placeholder="Ej: 5W-30" className="w-full mt-0.5 px-2 py-1.5 rounded-lg border border-white/10 text-xs bg-white/5" />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <label className="block"><span className="text-[10px] font-bold text-zinc-400">Cap. aceite (L)</span>
                  <input type="number" step="0.1" value={form.capacidad_aceite_litros} onChange={(e) => setForm({ ...form, capacidad_aceite_litros: e.target.value })} placeholder="4.5" className="w-full mt-0.5 px-2 py-1.5 rounded-lg border border-white/10 text-xs bg-white/5" />
                </label>
                <label className="block"><span className="text-[10px] font-bold text-zinc-400">Refrigerante</span>
                  <input value={form.tipo_refrigerante} onChange={(e) => setForm({ ...form, tipo_refrigerante: e.target.value })} placeholder="Ej: Etilenglicol" className="w-full mt-0.5 px-2 py-1.5 rounded-lg border border-white/10 text-xs bg-white/5" />
                </label>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <label className="block"><span className="text-[10px] font-bold text-zinc-400">PSI delante</span>
                  <input type="number" value={form.presion_neumaticos_delante} onChange={(e) => setForm({ ...form, presion_neumaticos_delante: e.target.value })} placeholder="32" className="w-full mt-0.5 px-2 py-1.5 rounded-lg border border-white/10 text-xs bg-white/5" />
                </label>
                <label className="block"><span className="text-[10px] font-bold text-zinc-400">PSI atrás</span>
                  <input type="number" value={form.presion_neumaticos_atras} onChange={(e) => setForm({ ...form, presion_neumaticos_atras: e.target.value })} placeholder="32" className="w-full mt-0.5 px-2 py-1.5 rounded-lg border border-white/10 text-xs bg-white/5" />
                </label>
                <label className="block"><span className="text-[10px] font-bold text-zinc-400">PSI repuesto</span>
                  <input type="number" value={form.presion_neumaticos_repuesto} onChange={(e) => setForm({ ...form, presion_neumaticos_repuesto: e.target.value })} placeholder="60" className="w-full mt-0.5 px-2 py-1.5 rounded-lg border border-white/10 text-xs bg-white/5" />
                </label>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <label className="block"><span className="text-[10px] font-bold text-zinc-400">Tanque (gal)</span>
                  <input type="number" step="0.1" value={form.capacidad_tanque_galones} onChange={(e) => setForm({ ...form, capacidad_tanque_galones: e.target.value })} placeholder="14" className="w-full mt-0.5 px-2 py-1.5 rounded-lg border border-white/10 text-xs bg-white/5" />
                </label>
                <label className="block"><span className="text-[10px] font-bold text-zinc-400">Cap. refrig. (L)</span>
                  <input type="number" step="0.1" value={form.capacidad_refrigerante_litros} onChange={(e) => setForm({ ...form, capacidad_refrigerante_litros: e.target.value })} placeholder="5.0" className="w-full mt-0.5 px-2 py-1.5 rounded-lg border border-white/10 text-xs bg-white/5" />
                </label>
                <label className="block"><span className="text-[10px] font-bold text-zinc-400">Líq. frenos</span>
                  <input value={form.tipo_freno} onChange={(e) => setForm({ ...form, tipo_freno: e.target.value })} placeholder="DOT 4" className="w-full mt-0.5 px-2 py-1.5 rounded-lg border border-white/10 text-xs bg-white/5" />
                </label>
              </div>
              <label className="block"><span className="text-[10px] font-bold text-zinc-400">Octanaje</span>
                <input value={form.octanaje_recomendado} onChange={(e) => setForm({ ...form, octanaje_recomendado: e.target.value })} placeholder="Ej: 95 RON" className="w-full mt-0.5 px-2 py-1.5 rounded-lg border border-white/10 text-xs bg-white/5" />
              </label>
              <div className="flex gap-1.5">
                <button onClick={handleSave} disabled={saving} className="flex-1 px-3 py-1.5 rounded-lg bg-auto-600 text-white text-xs font-bold">{saving ? "Guardando..." : "Guardar"}</button>
                <button onClick={() => setEditing(false)} className="px-3 py-1.5 rounded-lg bg-white/10 text-zinc-400 text-xs"><X className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ) : specs ? (
            <div className="space-y-1 mb-3">
              {specsRows.map((row) => (
                <div key={row.label} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
                  <span className="text-[10px] text-zinc-500">{row.label}</span>
                  <span className="text-xs font-bold text-zinc-200">{row.value || "—"}</span>
                </div>
              ))}
              <button onClick={() => setEditing(true)} className="w-full mt-2 py-2 rounded-xl border border-white/10 text-xs font-medium text-zinc-400 hover:text-auto-500 hover:border-auto-300 transition-colors">
                Editar especificaciones
              </button>
            </div>
          ) : (
            <div className="text-center py-3 mb-3">
              <p className="text-xs text-zinc-500 mb-2">No hay especificaciones registradas</p>
              <button onClick={() => setEditing(true)} className="px-4 py-2 rounded-xl bg-auto-600 text-white text-xs font-bold">
                Agregar especificaciones
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════ 4. Testigos ═══════════════════════ */
function WarningLightsSection() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="card-auto-dark rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full p-4 flex items-center justify-between text-left">
        <div className="flex items-center gap-3">
          <span className="text-xl">⚠️</span>
          <div>
            <p className="text-sm font-bold text-zinc-200">Luces del Tablero</p>
            <p className="text-[10px] text-zinc-500">Significado de las luces del tablero</p>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-zinc-500 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-1">
          {warningLights.map((light, i) => (
            <div key={i}>
              <button
                onClick={() => setSelected(selected === i ? null : i)}
                className="w-full flex items-center gap-3 py-2.5 text-left"
              >
                <span className="text-lg shrink-0">{light.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-zinc-200">{light.name}</p>
                  <p className="text-[10px] text-zinc-500 truncate">{light.desc}</p>
                </div>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                  light.severity === "alto" ? "bg-red-500/10 text-red-400" :
                  light.severity === "medio" ? "bg-amber-500/10 text-amber-400" :
                  "bg-white/5 text-zinc-400"
                }`}>
                  {light.severity}
                </span>
              </button>
              {selected === i && (
                <div className="bg-auto-600/10 rounded-xl p-3 ml-8 mb-1">
                  <p className="text-xs text-zinc-300">{light.desc}</p>
                  <p className="text-[10px] text-auto-500 font-bold mt-1.5">Qué hacer: {light.action}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
