"use client";

import { useState, useEffect } from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import { Plus, Edit, Trash2, Syringe, Save, X, ToggleLeft, ToggleRight } from "lucide-react";

interface Vaccine {
  id: string;
  name: string;
  group_name: string;
  mandatory: boolean;
  severity: string;
}

const SEVERITY_OPTIONS = ["Alta", "Media", "Baja"];

export default function VacunasPage() {
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Vaccine | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ name: "", group_name: "", mandatory: false, severity: "Media" });

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/vaccines?app=guau");
    const json = await res.json();
    setVaccines(json.data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    const appSlug = localStorage.getItem("blis_active_app_slug") || "guau";
    const appsRes = await fetch(`/api/admin/applications`);
    const appsJson = await appsRes.json();
    const app = appsJson.data?.find((a: any) => a.slug === appSlug);
    const appId = app?.id;

    if (!appId) return;

    if (editing) {
      await fetch("/api/admin/vaccines", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editing.id, ...form }),
      });
    } else {
      await fetch("/api/admin/vaccines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, application_id: appId }),
      });
    }
    setEditing(null);
    setShowNew(false);
    setForm({ name: "", group_name: "", mandatory: false, severity: "Media" });
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta vacuna?")) return;
    await fetch(`/api/admin/vaccines?id=${id}`, { method: "DELETE" });
    load();
  };

  return (
    <AdminGuard>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white">Vacunas</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Gestiona el calendario de vacunación</p>
          </div>
          <button
            onClick={() => { setEditing(null); setShowNew(true); setForm({ name: "", group_name: "", mandatory: false, severity: "Media" }); }}
            className="flex items-center gap-2 bg-primary-600 text-white rounded-xl px-4 py-2.5 text-sm font-bold hover:bg-primary-700 active:scale-[0.97] transition-all"
          >
            <Plus className="w-4 h-4" /> Nueva Vacuna
          </button>
        </div>

        {(showNew || editing) && (
          <div className="card-soft rounded-[1.25rem] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-zinc-800 dark:text-zinc-200">
                {editing ? "Editar Vacuna" : "Nueva Vacuna"}
              </h2>
              <button onClick={() => { setEditing(null); setShowNew(false); }} className="text-zinc-400 hover:text-zinc-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">Nombre</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">Grupo</label>
                <input value={form.group_name} onChange={(e) => setForm({ ...form, group_name: e.target.value })}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">Severidad</label>
              <select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20">
                {SEVERITY_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setForm({ ...form, mandatory: !form.mandatory })}
                className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                {form.mandatory ? <ToggleRight className="w-5 h-5 text-secondary-500" /> : <ToggleLeft className="w-5 h-5 text-zinc-400" />}
                {form.mandatory ? "Obligatoria" : "Opcional"}
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
            {vaccines.map((v) => (
              <div key={v.id} className="card-soft rounded-[1.25rem] p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-danger-100 dark:bg-danger-950 flex items-center justify-center text-danger-600">
                  <Syringe className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-bold text-zinc-800 dark:text-zinc-200">{v.name}</p>
                  <p className="text-sm text-zinc-500 truncate">{v.group_name || "Sin grupo"} · {v.severity}</p>
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${v.mandatory ? "bg-danger-100 text-danger-700" : "bg-zinc-100 text-zinc-600"}`}>
                  {v.mandatory ? "Obligatoria" : "Opcional"}
                </span>
                <div className="flex gap-1">
                  <button onClick={() => { setEditing(v); setForm({ name: v.name, group_name: v.group_name, mandatory: v.mandatory, severity: v.severity }); }}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-zinc-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950 transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(v.id)}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-zinc-400 hover:text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-950 transition-colors">
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
