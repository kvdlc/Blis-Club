"use client";

import { useState, useEffect } from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import { Plus, Edit, Trash2, Globe, Save, X, ToggleLeft, ToggleRight } from "lucide-react";

export default function ApplicationsPage() {
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: "", slug: "", description: "", theme_color: "#5956E9", is_active: true });

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/applications");
    const json = await res.json();
    setApps(json.data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!form.name || !form.slug) return;
    if (editing) {
      await fetch("/api/admin/applications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editing.id, ...form }),
      });
    } else {
      await fetch("/api/admin/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }
    setShowForm(false);
    setEditing(null);
    setForm({ name: "", slug: "", description: "", theme_color: "#5956E9", is_active: true });
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta aplicación? Se perderán todos los datos asociados.")) return;
    await fetch(`/api/admin/applications?id=${id}`, { method: "DELETE" });
    load();
  };

  return (
    <AdminGuard>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white">Aplicaciones</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Administra las apps de tu fábrica SaaS</p>
          </div>
          <button onClick={() => { setEditing(null); setShowForm(true); }}
            className="flex items-center gap-2 bg-primary-600 text-white rounded-xl px-4 py-2.5 text-sm font-bold hover:bg-primary-700 active:scale-[0.97] transition-all">
            <Plus className="w-4 h-4" /> Nueva App
          </button>
        </div>

        {(showForm || editing) && (
          <div className="card-soft rounded-[1.25rem] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-zinc-800 dark:text-zinc-200">{editing ? "Editar" : "Nueva"} Aplicación</h2>
              <button onClick={() => { setShowForm(false); setEditing(null); }} className="text-zinc-400 hover:text-zinc-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">Nombre</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">Slug</label>
                <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">Descripción</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2}
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setForm({ ...form, is_active: !form.is_active })}
                className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                {form.is_active ? <ToggleRight className="w-5 h-5 text-secondary-500" /> : <ToggleLeft className="w-5 h-5 text-zinc-400" />}
                {form.is_active ? "Activo" : "Inactivo"}
              </button>
            </div>
            <button onClick={handleSave}
              className="flex items-center gap-2 bg-primary-600 text-white rounded-xl px-5 py-2.5 text-sm font-bold hover:bg-primary-700 active:scale-[0.97] transition-all">
              <Save className="w-4 h-4" /> {editing ? "Actualizar" : "Crear"}
            </button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-zinc-500">Cargando...</div>
        ) : (
          <div className="grid gap-4">
            {apps.map((app) => (
              <div key={app.id} className="card-soft rounded-[1.25rem] p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: app.theme_color || "#5956E9" }}>
                  <Globe className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-bold text-zinc-800 dark:text-zinc-200">{app.name}</p>
                  <p className="text-sm text-zinc-500 truncate">{app.description || "Sin descripción"} — /{app.slug}</p>
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${app.is_active ? "bg-secondary-100 text-secondary-700" : "bg-zinc-200 text-zinc-500"}`}>
                  {app.is_active ? "Activo" : "Inactivo"}
                </span>
                <div className="flex gap-1">
                  <button onClick={() => { setEditing(app); setForm({ name: app.name, slug: app.slug, description: app.description || "", theme_color: app.theme_color || "#5956E9", is_active: app.is_active }); }}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-zinc-400 hover:text-primary-600 hover:bg-primary-50">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(app.id)}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-zinc-400 hover:text-danger-500 hover:bg-danger-50">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminGuard>
  );
}
