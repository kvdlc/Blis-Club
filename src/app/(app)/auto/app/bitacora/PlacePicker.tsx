"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { getCurrentCountryCode } from "@/lib/countries";
import { uploadContactPhoto } from "@/lib/storage";
import type { VehicleContact } from "@/types/database";
import { Store, Fuel, Wrench, Anchor, Building2, Pin, Plus, ChevronDown, Zap, ShoppingBag, MapPin, Phone, Upload, X, Search, Siren } from "lucide-react";

export const CONTACT_TYPES_META: { value: string; label: string; icon: any }[] = [
  { value: "mecanico", label: "Mecánico", icon: Wrench },
  { value: "electromecanico", label: "Electromecánico", icon: Zap },
  { value: "grua", label: "Grúa", icon: Anchor },
  { value: "tienda_repuestos", label: "Tienda de Repuestos", icon: Store },
  { value: "tienda_accesorios", label: "Tienda de Accesorios", icon: ShoppingBag },
  { value: "aseguradora", label: "Aseguradora", icon: Building2 },
  { value: "grifo", label: "Grifo / Estación", icon: Fuel },
  { value: "otro", label: "Otro", icon: Pin },
];

const countryPrefixes = [
  { code: "PE", prefix: "+51" }, { code: "MX", prefix: "+52" }, { code: "CO", prefix: "+57" },
  { code: "EC", prefix: "+593" }, { code: "CL", prefix: "+56" }, { code: "AR", prefix: "+54" },
  { code: "BO", prefix: "+591" }, { code: "PY", prefix: "+595" }, { code: "UY", prefix: "+598" },
  { code: "US", prefix: "+1" }, { code: "ES", prefix: "+34" },
];

interface Props {
  vehicleId: string;
  tipos: string[];
  value: string | null;
  onSelect: (contacto: { id: string; nombre: string } | null) => void;
  placeholder?: string;
}

/** Selector de centro/establecimiento desde el directorio (vehicle_contacts) con buscador y alta completa. */
export function PlacePicker({ vehicleId, tipos, value, onSelect, placeholder }: Props) {
  const [contacts, setContacts] = useState<VehicleContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [showList, setShowList] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const allowed = CONTACT_TYPES_META.filter((c) => tipos.includes(c.value));

  const load = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("vehicle_contacts")
      .select("*")
      .eq("vehicle_id", vehicleId)
      .in("tipo", tipos)
      .order("nombre");
    setContacts((data as VehicleContact[] | null) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [vehicleId, tipos.join(",")]);

  // Cerrar la lista al hacer clic afuera
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setShowList(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const selected = contacts.find((c) => c.id === value) ?? null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter((c) => c.nombre.toLowerCase().includes(q));
  }, [contacts, query]);

  const pick = (c: VehicleContact) => {
    onSelect({ id: c.id, nombre: c.nombre });
    setQuery("");
    setShowList(false);
  };

  return (
    <div className="space-y-1.5" ref={rootRef}>
      <div className="flex items-center gap-1.5">
        {/* Buscador + lista */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
          <input
            value={selected ? selected.nombre : query}
            readOnly={!!selected}
            placeholder={placeholder || "Busca el lugar (taller, grifo, tienda…)"}
            onChange={(e) => { setQuery(e.target.value); setShowList(true); }}
            onFocus={() => { if (!selected) setShowList(true); }}
            className="w-full pl-8 pr-8 py-2 rounded-lg border border-white/10 text-xs glass-input text-zinc-200"
          />
          {selected ? (
            <button type="button" onClick={() => onSelect(null)} className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-zinc-500 hover:text-zinc-200">
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
          )}

          {showList && !selected && (
            <div ref={listRef} className="absolute z-30 mt-1 left-0 right-0 max-h-56 overflow-y-auto rounded-xl border border-white/10 glass-card p-1.5 space-y-0.5 shadow-xl">
              {loading && <p className="text-[10px] text-zinc-500 px-2 py-2">Cargando centros…</p>}
              {!loading && filtered.length === 0 && (
                <p className="text-[10px] text-zinc-500 px-2 py-2">No hay lugares registrados de este tipo.</p>
              )}
              {filtered.map((c) => {
                const meta = CONTACT_TYPES_META.find((t) => t.value === c.tipo);
                const Icon = meta?.icon || Pin;
                return (
                  <button key={c.id} type="button"
                    onClick={() => pick(c)}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/[0.06] text-left">
                    <div className="relative shrink-0">
                      <Icon className="w-4 h-4 text-zinc-400" />
                      {c.es_emergencia && <Siren className="w-2.5 h-2.5 text-red-500 absolute -top-1.5 -right-1.5" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-zinc-200 truncate">{c.nombre}</p>
                      {c.encargado && <p className="text-[9px] text-zinc-500 truncate">{c.encargado}</p>}
                    </div>
                    {c.es_emergencia && <span className="text-[8px] font-bold text-red-400 shrink-0">SOS</span>}
                    {c.telefono && <span className="text-[9px] text-zinc-500 shrink-0">{c.telefono}</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Botón + (alta completa) */}
        <button
          type="button"
          onClick={() => setShowAdd((v) => !v)}
          className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center border transition-colors ${showAdd ? "bg-auto-600/20 border-auto-500/40 text-auto-300" : "bg-auto-600/10 border-auto-600/25 text-auto-400 hover:bg-auto-600/20"}`}
          title="Agregar lugar nuevo"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {showAdd && (
        <QuickContactForm
          vehicleId={vehicleId}
          defaultTipos={allowed}
          onDone={(c) => { pick(c); setShowAdd(false); }}
          onCancel={() => setShowAdd(false)}
        />
      )}

      {selected && (
        <p className="text-[10px] text-zinc-500 flex items-center gap-1">
          <MapPin className="w-3 h-3 text-auto-400" /> {selected.nombre}
          {selected.encargado && <span className="text-zinc-500">· {selected.encargado}</span>}
          {selected.telefono && <span className="flex items-center gap-0.5 text-zinc-500"><Phone className="w-2.5 h-2.5" />{selected.telefono}</span>}
        </p>
      )}
    </div>
  );
}

/** Alta completa de un centro (similar al formulario del directorio de talleres), con foto. */
function QuickContactForm({ vehicleId, defaultTipos, onDone, onCancel }: {
  vehicleId: string;
  defaultTipos: { value: string; label: string; icon: any }[];
  onDone: (c: VehicleContact) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    nombre: "", encargado: "", tipo: defaultTipos[0]?.value || "otro",
    telefono: "", whatsapp: "", pais: "PE", notas: "", foto_url: "", es_emergencia: false,
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCurrentCountryCode().then((c) => { if (c) setForm((f) => ({ ...f, pais: c })); });
  }, []);

  const prefijo = countryPrefixes.find((p) => p.code === form.pais)?.prefix || "+51";

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setError(null);
    const url = await uploadContactPhoto(file, vehicleId);
    if (url) setForm((f) => ({ ...f, foto_url: url }));
    else setError("No se pudo subir la foto. Intenta con otra imagen.");
    setUploading(false);
    e.target.value = "";
  };

  const save = async () => {
    if (!form.nombre.trim()) { setError("El nombre del lugar es obligatorio."); return; }
    setSaving(true); setError(null);
    const supabase = createClient();
    const normalize = (num: string): string | null => {
      const raw = (num || "").trim();
      if (!raw) return null;
      const prefixDigits = (countryPrefixes.find((p) => p.code === form.pais)?.prefix || "+51").replace("+", "");
      let d = raw.replace(/[^0-9]/g, "");
      if (d.startsWith("00")) d = d.slice(2);
      if (d.startsWith(prefixDigits)) return `+${d}`;
      return `+${prefixDigits}${d}`;
    };
    const tel = normalize(form.telefono);
    const wa = normalize(form.whatsapp) || tel;
    const { data, error: err } = await supabase
      .from("vehicle_contacts")
      .insert({
        vehicle_id: vehicleId,
        nombre: form.nombre.trim(),
        encargado: form.encargado.trim() || null,
        tipo: form.tipo,
        telefono: tel,
        whatsapp: wa,
        pais_telefono: form.pais,
        notas: form.notas.trim() || null,
        foto_url: form.foto_url || null,
        es_emergencia: form.es_emergencia === true,
      })
      .select()
      .single();
    setSaving(false);
    if (err || !data) { setError("No se pudo guardar el lugar."); return; }
    onDone(data as VehicleContact);
  };

  const tipoOptions = defaultTipos.length > 1 ? defaultTipos : CONTACT_TYPES_META;

  return (
    <div className="rounded-2xl glass-input border border-auto-500/30 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold text-auto-400">➕ Registrar lugar nuevo</p>
        <button type="button" onClick={onCancel} className="w-6 h-6 rounded-md hover:bg-white/10 flex items-center justify-center text-zinc-500"><X className="w-3.5 h-3.5" /></button>
      </div>

      {/* Foto del lugar */}
      <div className="flex items-center gap-2.5">
        {form.foto_url ? (
          <img src={form.foto_url} alt="" className="w-16 h-16 rounded-xl object-cover border border-white/10" />
        ) : (
          <div className="w-16 h-16 rounded-xl glass-card border border-white/10 flex items-center justify-center">
            <Store className="w-6 h-6 text-zinc-600" />
          </div>
        )}
        <label className="flex-1 flex flex-col items-center justify-center gap-1 px-3 py-3 rounded-xl border border-dashed border-white/15 glass-card cursor-pointer hover:bg-white/10/60 transition-colors">
          <Upload className="w-4 h-4 text-zinc-400" />
          <span className="text-[10px] text-zinc-400">{uploading ? "Subiendo…" : form.foto_url ? "Cambiar foto" : "Subir foto"}</span>
          <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" disabled={uploading} />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        <label className="block min-w-0">
          <span className="text-[9px] font-bold text-zinc-500">Nombre del lugar *</span>
          <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            placeholder="Ej: Grifo Primax" className="w-full px-2 py-1.5 rounded-lg border border-white/10 text-xs glass-card text-zinc-200 mt-0.5" />
        </label>
        <label className="block min-w-0">
          <span className="text-[9px] font-bold text-zinc-500">Encargado (opcional)</span>
          <input value={form.encargado} onChange={(e) => setForm({ ...form, encargado: e.target.value })}
            placeholder="Ej: Juan Pérez" className="w-full px-2 py-1.5 rounded-lg border border-white/10 text-xs glass-card text-zinc-200 mt-0.5" />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        <label className="block min-w-0">
          <span className="text-[9px] font-bold text-zinc-500">Tipo</span>
          <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}
            className="w-full px-2 py-1.5 rounded-lg border border-white/10 text-xs glass-card text-zinc-200 mt-0.5 min-w-0">
            {tipoOptions.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </label>
        <label className="block min-w-0">
          <span className="text-[9px] font-bold text-zinc-500">País</span>
          <select value={form.pais} onChange={(e) => setForm({ ...form, pais: e.target.value })}
            className="w-full px-2 py-1.5 rounded-lg border border-white/10 text-xs glass-card text-zinc-200 mt-0.5 min-w-0">
            {countryPrefixes.map((p) => <option key={p.code} value={p.code}>{p.code} {p.prefix}</option>)}
          </select>
        </label>
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        <label className="block min-w-0">
          <span className="text-[9px] font-bold text-zinc-500">Teléfono</span>
          <div className="flex items-center gap-1 mt-0.5 min-w-0">
            <span className="text-xs text-zinc-500 px-0.5 shrink-0">{prefijo}</span>
            <input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })}
              placeholder="999 888 777" className="flex-1 min-w-0 px-2 py-1.5 rounded-lg border border-white/10 text-xs glass-card text-zinc-200" />
          </div>
        </label>
        <label className="block min-w-0">
          <span className="text-[9px] font-bold text-zinc-500">WhatsApp</span>
          <div className="flex items-center gap-1 mt-0.5 min-w-0">
            <span className="text-xs text-zinc-500 px-0.5 shrink-0">{prefijo}</span>
            <input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
              placeholder="999 888 777" className="flex-1 min-w-0 px-2 py-1.5 rounded-lg border border-white/10 text-xs glass-card text-zinc-200" />
          </div>
        </label>
      </div>

      <input value={form.notas} onChange={(e) => setForm({ ...form, notas: e.target.value })} placeholder="Notas (opcional)" className="w-full px-2 py-1.5 rounded-lg border border-white/10 text-xs glass-card text-zinc-200" />

      <label className="flex items-center gap-2.5 cursor-pointer select-none rounded-xl border border-red-500/20 bg-red-500/[0.05] px-3 py-2">
        <button
          type="button"
          role="switch"
          aria-checked={form.es_emergencia}
          onClick={() => setForm((f) => ({ ...f, es_emergencia: !f.es_emergencia }))}
          className={`relative w-9 h-5 shrink-0 rounded-full transition-colors ${form.es_emergencia ? "bg-red-500" : "bg-zinc-600"}`}
        >
          <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${form.es_emergencia ? "left-4.5" : "left-0.5"}`} />
        </button>
        <span className="text-[11px] font-bold text-red-300">Marcar como SOS / emergencia</span>
      </label>

      {error && <p className="text-[10px] text-red-400">{error}</p>}

      <div className="flex gap-1.5">
        <button type="button" onClick={save} disabled={saving || uploading}
          className="flex-1 py-2 rounded-lg bg-auto-600 text-white text-[11px] font-bold disabled:opacity-50">
          {saving ? "Guardando…" : "Guardar y usar este lugar"}
        </button>
      </div>
    </div>
  );
}
