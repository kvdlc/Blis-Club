"use client";

import { useState, useEffect } from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import { Plus, Edit, Trash2, DollarSign, Save, X } from "lucide-react";

interface Plan {
  id: string;
  name: string;
  price_cents: number;
  max_dogs: number;
  features: string[];
  billing_interval: string;
}

const BILLING_INTERVALS = ["month", "year"];

export default function PlanesPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Plan | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ name: "", price_cents: 0, max_dogs: 1, features: "", billing_interval: "month" });

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/plans?app=guau");
    const json = await res.json();
    setPlans(json.data || []);
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

    const payload = {
      name: form.name,
      price_cents: form.price_cents,
      max_dogs: form.max_dogs,
      features: form.features ? form.features.split(",").map((f: string) => f.trim()).filter(Boolean) : [],
      billing_interval: form.billing_interval,
    };

    if (editing) {
      await fetch("/api/admin/plans", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editing.id, ...payload }),
      });
    } else {
      await fetch("/api/admin/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, application_id: appId }),
      });
    }
    setEditing(null);
    setShowNew(false);
    setForm({ name: "", price_cents: 0, max_dogs: 1, features: "", billing_interval: "month" });
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este plan?")) return;
    await fetch(`/api/admin/plans?id=${id}`, { method: "DELETE" });
    load();
  };

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  return (
    <AdminGuard>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-zinc-900">Planes</h1>
            <p className="text-sm text-zinc-500 mt-1">Gestiona planes de suscripción</p>
          </div>
          <button
            onClick={() => { setEditing(null); setShowNew(true); setForm({ name: "", price_cents: 0, max_dogs: 1, features: "", billing_interval: "month" }); }}
            className="flex items-center gap-2 bg-primary-600 text-white rounded-xl px-4 py-2.5 text-sm font-bold hover:bg-primary-700 active:scale-[0.97] transition-all"
          >
            <Plus className="w-4 h-4" /> Nuevo Plan
          </button>
        </div>

        {(showNew || editing) && (
          <div className="card-soft rounded-[1.25rem] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-zinc-800">
                {editing ? "Editar Plan" : "Nuevo Plan"}
              </h2>
              <button onClick={() => { setEditing(null); setShowNew(false); }} className="text-zinc-400 hover:text-zinc-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-semibold text-zinc-600 mb-1.5">Nombre</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-600 mb-1.5">Precio (centavos)</label>
                <input type="number" value={form.price_cents} onChange={(e) => setForm({ ...form, price_cents: parseInt(e.target.value) || 0 })}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-600 mb-1.5">Máx. perros</label>
                <input type="number" value={form.max_dogs} onChange={(e) => setForm({ ...form, max_dogs: parseInt(e.target.value) || 0 })}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-600 mb-1.5">Facturación</label>
                <select value={form.billing_interval} onChange={(e) => setForm({ ...form, billing_interval: e.target.value })}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20">
                  {BILLING_INTERVALS.map((bi) => (
                    <option key={bi} value={bi}>{bi === "month" ? "Mensual" : "Anual"}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-600 mb-1.5">Features (separadas por coma)</label>
              <textarea value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} rows={2}
                placeholder="Acceso a academia, Recetas premium, Soporte prioritario"
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
            {plans.map((p) => (
              <div key={p.id} className="card-soft rounded-[1.25rem] p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-secondary-100 flex items-center justify-center text-secondary-600">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-bold text-zinc-800">{p.name}</p>
                  <p className="text-sm text-zinc-500 truncate">
                    {formatPrice(p.price_cents)} · Hasta {p.max_dogs} perro{p.max_dogs !== 1 ? "s" : ""}
                    {(p.features || []).length > 0 && ` · ${(p.features || []).length} features`}
                  </p>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-secondary-100 text-secondary-700">
                  {formatPrice(p.price_cents)}/{p.billing_interval === "year" ? "año" : "mes"}
                </span>
                <div className="flex gap-1">
                  <button onClick={() => { setEditing(p); setForm({ name: p.name, price_cents: p.price_cents, max_dogs: p.max_dogs, features: (p.features || []).join(", "), billing_interval: p.billing_interval || "month" }); }}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-zinc-400 hover:text-primary-600 hover:bg-primary-50 transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(p.id)}
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
