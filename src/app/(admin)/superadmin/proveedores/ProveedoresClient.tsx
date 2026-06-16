"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Trash2, X } from "lucide-react";

interface Provider {
  id?: string;
  nombre: string;
  contacto: string | null;
  telefono: string | null;
  email: string | null;
  direccion: string | null;
  notas: string | null;
  activo: boolean;
}

export default function ProveedoresClient({ initial }: { initial: any[] }) {
  const [providers, setProviders] = useState<Provider[]>(initial);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<Provider>({ nombre: "", contacto: "", telefono: "", email: "", direccion: "", notas: "", activo: true });
  const [saving, setSaving] = useState(false);

  const resetForm = () => setForm({ nombre: "", contacto: "", telefono: "", email: "", direccion: "", notas: "", activo: true });

  const handleSave = async () => {
    if (!form.nombre) { alert("El nombre es obligatorio."); return; }
    setSaving(true);
    const supabase = createClient();

    if (editing) {
      const { data, error } = await supabase.from("providers").update({
        nombre: form.nombre, contacto: form.contacto || null, telefono: form.telefono || null,
        email: form.email || null, direccion: form.direccion || null, notas: form.notas || null,
        activo: form.activo,
      }).eq("id", editing).select().single();
      if (error) { alert("Error al guardar: " + error.message); setSaving(false); return; }
      if (data) setProviders(providers.map((p) => p.id === editing ? data as Provider : p));
      setEditing(null);
    } else {
      const { data, error } = await supabase.from("providers").insert({
        nombre: form.nombre, contacto: form.contacto || null, telefono: form.telefono || null,
        email: form.email || null, direccion: form.direccion || null, notas: form.notas || null,
        activo: true,
      }).select().single();
      if (error) { alert("Error al guardar: " + error.message); setSaving(false); return; }
      if (data) setProviders([data as Provider, ...providers]);
      setAdding(false);
    }
    setSaving(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar proveedor?")) return;
    const { error } = await createClient().from("providers").delete().eq("id", id);
    if (error) { alert("Error al eliminar: " + error.message); return; }
    setProviders(providers.filter((p) => p.id !== id));
  };

  const startEdit = (p: Provider) => {
    setEditing(p.id!);
    setForm({ nombre: p.nombre, contacto: p.contacto, telefono: p.telefono, email: p.email, direccion: p.direccion, notas: p.notas, activo: p.activo });
    setAdding(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-800">Proveedores</h1>
          <p className="text-sm text-zinc-500">{providers.length} registrados</p>
        </div>
        <button onClick={() => { setAdding(!adding); setEditing(null); resetForm(); }}
          className="px-4 py-2 rounded-xl bg-primary-600 text-white text-sm font-bold flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> Agregar
        </button>
      </div>

      {(adding || editing) && (
        <div className="bg-white rounded-2xl border border-zinc-200 p-4 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              placeholder="Nombre *" className="px-3 py-2 rounded-xl border border-zinc-200 text-sm" />
            <input value={form.contacto || ""} onChange={(e) => setForm({ ...form, contacto: e.target.value })}
              placeholder="Persona de contacto" className="px-3 py-2 rounded-xl border border-zinc-200 text-sm" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <input value={form.telefono || ""} onChange={(e) => setForm({ ...form, telefono: e.target.value })}
              placeholder="Teléfono" className="px-3 py-2 rounded-xl border border-zinc-200 text-sm" />
            <input value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Email" className="px-3 py-2 rounded-xl border border-zinc-200 text-sm" />
            <input value={form.direccion || ""} onChange={(e) => setForm({ ...form, direccion: e.target.value })}
              placeholder="Dirección" className="px-3 py-2 rounded-xl border border-zinc-200 text-sm" />
          </div>
          <textarea value={form.notas || ""} onChange={(e) => setForm({ ...form, notas: e.target.value })}
            placeholder="Notas" rows={2} className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-sm resize-none" />
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving}
              className="px-4 py-2 rounded-xl bg-primary-600 text-white text-sm font-bold">{saving ? "..." : "Guardar"}</button>
            <button onClick={() => { setAdding(false); setEditing(null); }}
              className="px-4 py-2 rounded-xl bg-zinc-100 text-zinc-600 text-sm"><X className="w-4 h-4" /></button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50">
              <th className="text-left px-4 py-3 text-xs font-bold text-zinc-500">Nombre</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-zinc-500">Contacto</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-zinc-500">Teléfono</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-zinc-500">Email</th>
              <th className="text-right px-4 py-3 text-xs font-bold text-zinc-500">Acción</th>
            </tr>
          </thead>
          <tbody>
            {providers.map((p) => (
              <tr key={p.id} className={`border-b border-zinc-50 hover:bg-zinc-50/50 ${!p.activo ? "opacity-50" : ""}`}>
                <td className="px-4 py-3 font-bold text-zinc-800">{p.nombre}</td>
                <td className="px-4 py-3 text-zinc-600">{p.contacto || "—"}</td>
                <td className="px-4 py-3 text-zinc-600">{p.telefono || "—"}</td>
                <td className="px-4 py-3 text-zinc-600 text-xs">{p.email || "—"}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => startEdit(p)}
                      className="w-8 h-8 rounded-lg hover:bg-zinc-100 flex items-center justify-center text-zinc-400 hover:text-primary-600 text-xs font-bold">Editar</button>
                    <button onClick={() => handleDelete(p.id!)}
                      className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-zinc-400 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {providers.length === 0 && (
              <tr><td colSpan={5} className="text-center py-8 text-zinc-400">Sin proveedores</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
