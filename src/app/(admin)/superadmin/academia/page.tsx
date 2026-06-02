"use client";

import { useState, useEffect } from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import { Plus, Edit, Trash2, GraduationCap, Save, X } from "lucide-react";

interface Stage {
  id: string;
  title: string;
  description: string;
  color_hex: string;
  order: number;
}

const STAGE_COLORS = ["#5956E9", "#209F89", "#F97316", "#EF4444", "#A855F7", "#3B82F6", "#EC4899", "#14B8A6"];

export default function AcademiaPage() {
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Stage | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", color_hex: "#5956E9", order: 0 });

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/stages?app=guau");
    const json = await res.json();
    setStages(json.data || []);
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
      await fetch("/api/admin/stages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editing.id, ...form }),
      });
    } else {
      await fetch("/api/admin/stages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, application_id: appId }),
      });
    }
    setEditing(null);
    setShowNew(false);
    setForm({ title: "", description: "", color_hex: "#5956E9", order: stages.length });
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta etapa?")) return;
    await fetch(`/api/admin/stages?id=${id}`, { method: "DELETE" });
    load();
  };

  return (
    <AdminGuard>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white">Academia</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Gestiona etapas, módulos y lecciones</p>
          </div>
          <button
            onClick={() => { setEditing(null); setShowNew(true); setForm({ title: "", description: "", color_hex: "#5956E9", order: stages.length }); }}
            className="flex items-center gap-2 bg-primary-600 text-white rounded-xl px-4 py-2.5 text-sm font-bold hover:bg-primary-700 active:scale-[0.97] transition-all"
          >
            <Plus className="w-4 h-4" /> Nueva Etapa
          </button>
        </div>

        {(showNew || editing) && (
          <div className="card-soft rounded-[1.25rem] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-zinc-800 dark:text-zinc-200">
                {editing ? "Editar Etapa" : "Nueva Etapa"}
              </h2>
              <button onClick={() => { setEditing(null); setShowNew(false); }} className="text-zinc-400 hover:text-zinc-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">Título</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">Orden</label>
                <input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">Descripción</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2}
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">Color</label>
              <div className="flex gap-2">
                {STAGE_COLORS.map((c) => (
                  <button key={c} onClick={() => setForm({ ...form, color_hex: c })}
                    className={`w-9 h-9 rounded-xl transition-all ${form.color_hex === c ? "ring-2 ring-offset-2 ring-primary-500 scale-110" : ""}`}
                    style={{ backgroundColor: c }} />
                ))}
              </div>
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
            {stages.map((stage) => (
              <div key={stage.id} className="card-soft rounded-[1.25rem] p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: stage.color_hex }}>
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-bold text-zinc-800 dark:text-zinc-200">{stage.title}</p>
                  <p className="text-sm text-zinc-500 truncate">{stage.description || "Sin descripción"}</p>
                </div>
                <span className="text-xs text-zinc-400 font-mono">#{stage.order}</span>
                <div className="flex gap-1">
                  <button onClick={() => { setEditing(stage); setForm({ title: stage.title, description: stage.description || "", color_hex: stage.color_hex, order: stage.order }); }}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-zinc-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950 transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(stage.id)}
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
