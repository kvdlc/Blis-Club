"use client";

import { useState, useEffect } from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import { Plus, Edit, Trash2, Trophy, Save, X } from "lucide-react";

interface Challenge {
  id: string;
  title: string;
  description: string;
  fecha_inicio: string;
  fecha_fin: string;
  link_whatsapp: string;
}

export default function DesafiosPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Challenge | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", fecha_inicio: "", fecha_fin: "", link_whatsapp: "" });

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/challenges?app=guau");
    const json = await res.json();
    setChallenges(json.data || []);
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
      await fetch("/api/admin/challenges", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editing.id, ...form }),
      });
    } else {
      await fetch("/api/admin/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, application_id: appId }),
      });
    }
    setEditing(null);
    setShowNew(false);
    setForm({ title: "", description: "", fecha_inicio: "", fecha_fin: "", link_whatsapp: "" });
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este desafío?")) return;
    await fetch(`/api/admin/challenges?id=${id}`, { method: "DELETE" });
    load();
  };

  const formatDate = (d: string) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <AdminGuard>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-zinc-900">Desafíos</h1>
            <p className="text-sm text-zinc-500 mt-1">Gestiona desafíos y competencias</p>
          </div>
          <button
            onClick={() => { setEditing(null); setShowNew(true); setForm({ title: "", description: "", fecha_inicio: "", fecha_fin: "", link_whatsapp: "" }); }}
            className="flex items-center gap-2 bg-primary-600 text-white rounded-xl px-4 py-2.5 text-sm font-bold hover:bg-primary-700 active:scale-[0.97] transition-all"
          >
            <Plus className="w-4 h-4" /> Nuevo Desafío
          </button>
        </div>

        {(showNew || editing) && (
          <div className="card-soft rounded-[1.25rem] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-zinc-800">
                {editing ? "Editar Desafío" : "Nuevo Desafío"}
              </h2>
              <button onClick={() => { setEditing(null); setShowNew(false); }} className="text-zinc-400 hover:text-zinc-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-600 mb-1.5">Título</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-600 mb-1.5">Descripción</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2}
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-zinc-600 mb-1.5">Fecha Inicio</label>
                <input type="date" value={form.fecha_inicio} onChange={(e) => setForm({ ...form, fecha_inicio: e.target.value })}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-600 mb-1.5">Fecha Fin</label>
                <input type="date" value={form.fecha_fin} onChange={(e) => setForm({ ...form, fecha_fin: e.target.value })}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-600 mb-1.5">Link de WhatsApp</label>
              <input value={form.link_whatsapp} onChange={(e) => setForm({ ...form, link_whatsapp: e.target.value })} placeholder="https://chat.whatsapp.com/..."
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
            {challenges.map((c) => (
              <div key={c.id} className="card-soft rounded-[1.25rem] p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-warning-100 flex items-center justify-center text-warning-600">
                  <Trophy className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-bold text-zinc-800">{c.title}</p>
                  <p className="text-sm text-zinc-500 truncate">
                    {formatDate(c.fecha_inicio)} — {formatDate(c.fecha_fin)}
                    {c.link_whatsapp && ` · WhatsApp`}
                  </p>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-warning-100 text-warning-700">
                  Activo
                </span>
                <div className="flex gap-1">
                  <button onClick={() => { setEditing(c); setForm({ title: c.title, description: c.description || "", fecha_inicio: c.fecha_inicio || "", fecha_fin: c.fecha_fin || "", link_whatsapp: c.link_whatsapp || "" }); }}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-zinc-400 hover:text-primary-600 hover:bg-primary-50 transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(c.id)}
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
