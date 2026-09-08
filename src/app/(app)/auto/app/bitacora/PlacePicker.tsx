"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { getCurrentCountryCode } from "@/lib/countries";
import type { VehicleContact } from "@/types/database";
import { Store, Fuel, Wrench, Anchor, Building2, Pin, Plus, ChevronDown, Zap, ShoppingBag, MapPin, Phone } from "lucide-react";

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
  tipos: string[];                 // tipos de establecimiento que aplican a este formulario
  value: string | null;            // contacto_id seleccionado
  onSelect: (contacto: { id: string; nombre: string } | null) => void;
  placeholder?: string;
}

/** Selector de centro/establecimiento desde el directorio (vehicle_contacts). Incluye '+' para crear al instante. */
export function PlacePicker({ vehicleId, tipos, value, onSelect, placeholder }: Props) {
  const [contacts, setContacts] = useState<VehicleContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [savingAdd, setSavingAdd] = useState(false);
  const [addForm, setAddForm] = useState({ nombre: "", tipo: tipos[0] || "otro", telefono: "", pais: "PE" });
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    getCurrentCountryCode().then((c) => {
      if (c) setAddForm((f) => ({ ...f, pais: c }));
    });
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicleId, tipos.join(",")]);

  const selected = contacts.find((c) => c.id === value) ?? null;

  const handleAdd = async () => {
    if (!addForm.nombre.trim()) return;
    setSavingAdd(true);
    setError(null);
    const prefijo = countryPrefixes.find((p) => p.code === addForm.pais)?.prefix || "+51";
    const telefono = addForm.telefono ? `${prefijo}${addForm.telefono.replace(/[^0-9]/g, "")}` : null;
    const supabase = createClient();
    const { data, error: err } = await supabase
      .from("vehicle_contacts")
      .insert({
        vehicle_id: vehicleId,
        nombre: addForm.nombre.trim(),
        tipo: addForm.tipo,
        telefono,
        whatsapp: telefono,
        pais_telefono: addForm.pais,
      })
      .select()
      .single();
    setSavingAdd(false);
    if (err || !data) { setError("No se pudo crear el centro. Intenta de nuevo."); return; }
    const nuevo = data as VehicleContact;
    setContacts((prev) => [...prev.filter((c) => c.id !== nuevo.id), nuevo].sort((a, b) => a.nombre.localeCompare(b.nombre)));
    onSelect({ id: nuevo.id, nombre: nuevo.nombre });
    setShowAdd(false);
    setAddForm((f) => ({ ...f, nombre: "", telefono: "" }));
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <div className="relative flex-1 min-w-0">
          <select
            value={selected?.id ?? ""}
            onChange={(e) => {
              const id = e.target.value;
              const c = contacts.find((x) => x.id === id);
              onSelect(c ? { id: c.id, nombre: c.nombre } : null);
            }}
            className="w-full px-2 py-2 rounded-lg border border-white/10 text-xs bg-zinc-800 text-zinc-200 appearance-none pr-8 min-w-0"
          >
            <option value="">— {placeholder || "Sin lugar / otro"} —</option>
            {contacts.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
        </div>
        <button
          type="button"
          onClick={() => setShowAdd((v) => !v)}
          className="shrink-0 w-9 h-9 rounded-lg bg-auto-600/10 border border-auto-600/25 flex items-center justify-center text-auto-400 hover:bg-auto-600/20 transition-colors"
          title="Agregar centro nuevo"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {showAdd && (
        <div className="rounded-xl bg-zinc-800/60 border border-white/10 p-2.5 space-y-1.5">
          <p className="text-[10px] font-bold text-auto-400">➕ Nuevo centro</p>
          <input
            value={addForm.nombre}
            onChange={(e) => setAddForm({ ...addForm, nombre: e.target.value })}
            placeholder="Nombre del lugar *"
            className="w-full px-2 py-1.5 rounded-lg border border-white/10 text-xs bg-zinc-900 text-zinc-200"
          />
          <div className="grid grid-cols-2 gap-1.5">
            {allowed.length > 1 ? (
              <select value={addForm.tipo} onChange={(e) => setAddForm({ ...addForm, tipo: e.target.value })}
                className="px-2 py-1.5 rounded-lg border border-white/10 text-xs bg-zinc-900 text-zinc-200 min-w-0">
                {allowed.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            ) : (
              (() => {
                const Icon0 = allowed[0]?.icon;
                return (
                  <div className="px-2 py-1.5 text-[10px] text-zinc-400 truncate flex items-center gap-1 min-w-0">
                    {Icon0 ? <Icon0 className="w-3 h-3" /> : null} {allowed[0]?.label}
                  </div>
                );
              })()
            )}
            <div className="flex items-center gap-1 min-w-0">
              <span className="text-xs text-zinc-500 px-0.5 shrink-0">
                {countryPrefixes.find((p) => p.code === addForm.pais)?.prefix || "+51"}
              </span>
              <input
                value={addForm.telefono}
                onChange={(e) => setAddForm({ ...addForm, telefono: e.target.value })}
                placeholder="Teléfono"
                className="flex-1 min-w-0 px-2 py-1.5 rounded-lg border border-white/10 text-xs bg-zinc-900 text-zinc-200"
              />
            </div>
          </div>
          {error && <p className="text-[10px] text-red-400">{error}</p>}
          <button
            type="button"
            onClick={handleAdd}
            disabled={savingAdd || !addForm.nombre.trim()}
            className="w-full py-1.5 rounded-lg bg-auto-600 text-white text-[11px] font-bold disabled:opacity-50"
          >
            {savingAdd ? "Guardando…" : "Crear y usar este lugar"}
          </button>
        </div>
      )}

      {selected && (
        <p className="text-[10px] text-zinc-500 flex items-center gap-1">
          <MapPin className="w-3 h-3 text-auto-400" /> {selected.nombre}
          {selected.telefono && (
            <span className="flex items-center gap-0.5 text-zinc-500">
              <Phone className="w-2.5 h-2.5" /> {selected.telefono}
            </span>
          )}
        </p>
      )}
    </div>
  );
}
