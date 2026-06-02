"use client";

import { useState, useEffect } from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import { Plus, Edit, Trash2, Syringe, Save, X, ToggleLeft, ToggleRight } from "lucide-react";

interface Vaccine {
  id: string;
  name: string;
  group_name: string;
  vaccine_group: string;
  description: string;
  severity: string;
  contagion_type: string;
  mandatory: boolean;
  dose_count: number;
}

const VACCINE_GROUPS = ["core", "optional"];
const SEVERITY_OPTIONS = ["bajo", "medio", "alto", "mortal"];

const severityBadge = (s: string) => {
  switch (s) {
    case "bajo": return "bg-secondary-100 text-secondary-700 dark:bg-secondary-900 dark:text-secondary-300";
    case "medio": return "bg-accent-100 text-accent-700 dark:bg-accent-900 dark:text-accent-300";
    case "alto": return "bg-warning-100 text-warning-700 dark:bg-warning-900 dark:text-warning-300";
    case "mortal": return "bg-danger-100 text-danger-700 dark:bg-danger-900 dark:text-danger-300";
    default: return "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400";
  }
};

const defaultForm = {
  name: "",
  group_name: "",
  vaccine_group: "core",
  description: "",
  severity: "medio",
  contagion_type: "",
  mandatory: false,
  dose_count: 1,
};

export default function VacunasPage() {
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Vaccine | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState(defaultForm);

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
    const appsRes = await fetch("/api/admin/applications");
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
    setForm(defaultForm);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta vacuna?")) return;
    await fetch(`/api/admin/vaccines?id=${id}`, { method: "DELETE" });
    load();
  };

  const startEdit = (v: Vaccine) => {
    setShowNew(false);
    setEditing(v);
    setForm({
      name: v.name || "",
      group_name: v.group_name || "",
      vaccine_group: v.vaccine_group || "core",
      description: v.description || "",
      severity: v.severity || "medio",
      contagion_type: v.contagion_type || "",
      mandatory: v.mandatory ?? false,
      dose_count: v.dose_count ?? 1,
    });
  };

  const startNew = () => {
    setEditing(null);
    setShowNew(true);
    setForm(defaultForm);
  };

  const closeEditor = () => {
    setEditing(null);
    setShowNew(false);
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
            onClick={startNew}
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
              <button onClick={closeEditor} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">Nombre</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">Grupo</label>
                <input
                  value={form.group_name}
                  onChange={(e) => setForm({ ...form, group_name: e.target.value })}
                  placeholder="Ej: Cachorros, Anuales..."
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">Tipo de Vacuna</label>
                <select
                  value={form.vaccine_group}
                  onChange={(e) => setForm({ ...form, vaccine_group: e.target.value })}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                >
                  {VACCINE_GROUPS.map((g) => (
                    <option key={g} value={g}>{g === "core" ? "Core" : "Opcional"}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">Severidad</label>
                <select
                  value={form.severity}
                  onChange={(e) => setForm({ ...form, severity: e.target.value })}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                >
                  {SEVERITY_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">Tipo de Contagio</label>
                <input
                  value={form.contagion_type}
                  onChange={(e) => setForm({ ...form, contagion_type: e.target.value })}
                  placeholder="Ej: Aérea, Contacto directo..."
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">Número de Dosis</label>
                <input
                  type="number"
                  min={1}
                  value={form.dose_count}
                  onChange={(e) => setForm({ ...form, dose_count: parseInt(e.target.value) || 1 })}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">Descripción</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                placeholder="Información educativa sobre la vacuna, para qué sirve, efectos secundarios..."
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setForm({ ...form, mandatory: !form.mandatory })}
                className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400"
              >
                {form.mandatory ? (
                  <ToggleRight className="w-5 h-5 text-secondary-500" />
                ) : (
                  <ToggleLeft className="w-5 h-5 text-zinc-400" />
                )}
                {form.mandatory ? "Obligatoria" : "Opcional"}
              </button>
            </div>

            <button
              onClick={handleSave}
              className="flex items-center gap-2 bg-primary-600 text-white rounded-xl px-5 py-2.5 text-sm font-bold hover:bg-primary-700 active:scale-[0.97] transition-all"
            >
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
                <div className="w-12 h-12 rounded-2xl bg-danger-100 dark:bg-danger-950 flex items-center justify-center text-danger-600 shrink-0">
                  <Syringe className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-bold text-zinc-800 dark:text-zinc-200">{v.name}</p>
                  <p className="text-sm text-zinc-500 truncate">
                    {v.group_name || "Sin grupo"}
                    {v.vaccine_group && ` · ${v.vaccine_group === "core" ? "Core" : "Opcional"}`}
                    {v.dose_count != null && ` · ${v.dose_count} dosis`}
                  </p>
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${severityBadge(v.severity)}`}>
                  {v.severity || "—"}
                </span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${v.mandatory ? "bg-danger-100 text-danger-700 dark:bg-danger-900 dark:text-danger-300" : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"}`}>
                  {v.mandatory ? "Obligatoria" : "Opcional"}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => startEdit(v)}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-zinc-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(v.id)}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-zinc-400 hover:text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-950 transition-colors"
                  >
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
