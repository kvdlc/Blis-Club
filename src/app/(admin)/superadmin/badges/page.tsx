"use client";

import { useState, useEffect } from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import { Plus, Edit, Trash2, BadgeCheck, Save, X } from "lucide-react";

interface Badge {
  id: string;
  name: string;
  description: string;
  badge_type: string;
  icon_url: string;
}

const BADGE_TYPES = ["academia", "tracker", "streak", "agility"];

export default function BadgesPage() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Badge | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", badge_type: "academia", icon_url: "" });

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/badges?app=guau");
    const json = await res.json();
    setBadges(json.data || []);
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
      await fetch("/api/admin/badges", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editing.id, ...form }),
      });
    } else {
      await fetch("/api/admin/badges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, application_id: appId }),
      });
    }
    setEditing(null);
    setShowNew(false);
    setForm({ name: "", description: "", badge_type: "academia", icon_url: "" });
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este badge?")) return;
    await fetch(`/api/admin/badges?id=${id}`, { method: "DELETE" });
    load();
  };

  return (
    <AdminGuard>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-zinc-900">Badges</h1>
            <p className="text-sm text-zinc-500 mt-1">Gestiona insignias y logros</p>
          </div>
          <button
            onClick={() => { setEditing(null); setShowNew(true); setForm({ name: "", description: "", badge_type: "academia", icon_url: "" }); }}
            className="flex items-center gap-2 bg-primary-600 text-white rounded-xl px-4 py-2.5 text-sm font-bold hover:bg-primary-700 active:scale-[0.97] transition-all"
          >
            <Plus className="w-4 h-4" /> Nuevo Badge
          </button>
        </div>

        {(showNew || editing) && (
          <div className="card-soft rounded-[1.25rem] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-zinc-800">
                {editing ? "Editar Badge" : "Nuevo Badge"}
              </h2>
              <button onClick={() => { setEditing(null); setShowNew(false); }} className="text-zinc-400 hover:text-zinc-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-zinc-600 mb-1.5">Nombre</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-600 mb-1.5">Tipo</label>
                <select value={form.badge_type} onChange={(e) => setForm({ ...form, badge_type: e.target.value })}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20">
                  {BADGE_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-600 mb-1.5">Descripción</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2}
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-600 mb-1.5">URL del Ícono</label>
              <input value={form.icon_url} onChange={(e) => setForm({ ...form, icon_url: e.target.value })} placeholder="https://..."
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
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
            {badges.map((b) => (
              <div key={b.id} className="card-soft rounded-[1.25rem] p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-accent-100 flex items-center justify-center text-accent-600">
                  {b.icon_url ? (
                    <img src={b.icon_url} alt="" className="w-6 h-6 rounded" />
                  ) : (
                    <BadgeCheck className="w-6 h-6" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-bold text-zinc-800">{b.name}</p>
                  <p className="text-sm text-zinc-500 truncate">{b.description || "Sin descripción"}</p>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-accent-100 text-accent-700">
                  {b.badge_type}
                </span>
                <div className="flex gap-1">
                  <button onClick={() => { setEditing(b); setForm({ name: b.name, description: b.description || "", badge_type: b.badge_type, icon_url: b.icon_url || "" }); }}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-zinc-400 hover:text-primary-600 hover:bg-primary-50 transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(b.id)}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-zinc-400 hover:text-danger-500 hover:bg-danger-50 transition-colors">
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
