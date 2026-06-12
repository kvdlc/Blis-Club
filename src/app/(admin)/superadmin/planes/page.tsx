"use client";

import { useState, useEffect } from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import { Plus, Edit, Trash2, DollarSign, Save, X, Eye, EyeOff, GripVertical, Globe, Tag, Mail } from "lucide-react";

interface Plan {
  id: string;
  name: string;
  price_cents: number;
  original_price_cents: number | null;
  izipay_price_id: string | null;
  max_dogs: number;
  features: string[];
  billing_interval: string;
  application_id: string | null;
  landing_visible: boolean;
  landing_order: number;
  landing_slug: string | null;
  description: string | null;
  badge: string | null;
  payment_provider: string;
  cta_text: string | null;
}

const BILLING_INTERVALS = [
  { value: "month", label: "Mensual" },
  { value: "quarter", label: "Trimestral" },
  { value: "year", label: "Anual" },
];

const LANDING_SLUGS = [
  { value: "", label: "No mostrar en landing" },
  { value: "guau-web", label: "Guau — Web (pago)" },
  { value: "guau-webg", label: "Guau — Web Gratis" },
  { value: "guau-app", label: "Guau — App (suscripción)" },
  { value: "cafecito", label: "Cafecito" },
];

const PAYMENT_PROVIDERS = [
  { value: "izipay", label: "Izipay" },
  { value: "stripe", label: "Stripe" },
  { value: "paypal", label: "PayPal" },
];

const defaultForm = {
  name: "",
  price_cents: 100,
  original_price_cents: null as number | null,
  max_dogs: 999,
  features: "",
  billing_interval: "quarter",
  landing_visible: false,
  landing_order: 0,
  landing_slug: "",
  description: "",
  badge: "",
  payment_provider: "izipay",
  cta_text: "",
  izipay_price_id: "",
};

export default function PlanesPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Plan | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/plans?app=guau");
    const json = await res.json();
    setPlans(json.data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const startEdit = (p: Plan) => {
    setEditing(p);
    setForm({
      name: p.name,
      price_cents: p.price_cents,
      original_price_cents: p.original_price_cents,
      max_dogs: p.max_dogs,
      features: (p.features || []).join(", "),
      billing_interval: p.billing_interval || "month",
      landing_visible: p.landing_visible ?? false,
      landing_order: p.landing_order ?? 0,
      landing_slug: p.landing_slug || "",
      description: p.description || "",
      badge: p.badge || "",
      payment_provider: p.payment_provider || "izipay",
      cta_text: p.cta_text || "",
      izipay_price_id: p.izipay_price_id || "",
    });
    setShowNew(false);
  };

  const startNew = () => {
    setEditing(null);
    setForm({ ...defaultForm });
    setShowNew(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const appSlug = localStorage.getItem("blis_active_app_slug") || "guau";
    const appsRes = await fetch("/api/admin/applications");
    const appsJson = await appsRes.json();
    const app = appsJson.data?.find((a: Record<string, unknown>) => a.slug === appSlug);
    const appId = app?.id;

    const payload = {
      name: form.name,
      price_cents: form.price_cents,
      original_price_cents: form.original_price_cents || null,
      izipay_price_id: form.izipay_price_id || null,
      max_dogs: form.max_dogs,
      features: form.features ? form.features.split(",").map((f: string) => f.trim()).filter(Boolean) : [],
      billing_interval: form.billing_interval,
      landing_visible: form.landing_visible,
      landing_order: form.landing_order,
      landing_slug: form.landing_slug || null,
      description: form.description || null,
      badge: form.badge || null,
      payment_provider: form.payment_provider,
      cta_text: form.cta_text || null,
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
    setSaving(false);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este plan?")) return;
    await fetch(`/api/admin/plans?id=${id}`, { method: "DELETE" });
    load();
  };

  const handleToggleVisible = async (p: Plan) => {
    await fetch("/api/admin/plans", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: p.id, landing_visible: !p.landing_visible }),
    });
    load();
  };

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;
  const intervalLabel = (bi: string) => bi === "month" ? "mes" : bi === "quarter" ? "trimestre" : "año";
  const slugLabel = (slug: string | null) => LANDING_SLUGS.find(s => s.value === slug)?.label || (slug || "—");

  return (
    <AdminGuard>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-zinc-900">Planes</h1>
            <p className="text-sm text-zinc-500 mt-1">Gestiona planes de suscripción y su visibilidad en landing pages</p>
          </div>
          <button
            onClick={startNew}
            className="flex items-center gap-2 bg-primary-600 text-white rounded-xl px-4 py-2.5 text-sm font-bold hover:bg-primary-700 active:scale-[0.97] transition-all"
          >
            <Plus className="w-4 h-4" /> Nuevo Plan
          </button>
        </div>

        {(showNew || editing) && (
          <div className="card-soft rounded-[1.25rem] p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-zinc-800">
                {editing ? "Editar Plan" : "Nuevo Plan"}
              </h2>
              <button onClick={() => { setEditing(null); setShowNew(false); }} className="text-zinc-400 hover:text-zinc-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Basic info */}
            <div>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">Información básica</p>
              <div className="grid md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-zinc-600 mb-1.5">Nombre</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Pro Trimestral"
                    className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-zinc-600 mb-1.5">Precio actual (centavos)</label>
                  <input type="number" value={form.price_cents} onChange={(e) => setForm({ ...form, price_cents: parseInt(e.target.value) || 0 })} placeholder="100"
                    className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-zinc-600 mb-1.5">Precio original (centavos)</label>
                  <input type="number" value={form.original_price_cents ?? ""} onChange={(e) => setForm({ ...form, original_price_cents: e.target.value ? parseInt(e.target.value) : null })} placeholder="4999 (tachado)"
                    className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-zinc-600 mb-1.5">Facturación</label>
                  <select value={form.billing_interval} onChange={(e) => setForm({ ...form, billing_interval: e.target.value })}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20">
                    {BILLING_INTERVALS.map((bi) => (
                      <option key={bi.value} value={bi.value}>{bi.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Description & features */}
            <div>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">Descripción & Features</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-zinc-600 mb-1.5">Descripción corta</label>
                  <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Acceso completo a nutrición, academia y tracker"
                    className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-zinc-600 mb-1.5">Features (separadas por coma)</label>
                  <textarea value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} rows={2}
                    placeholder="Perros ilimitados, Recetario completo, Academia canina"
                    className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-zinc-600 mb-1.5">Badge / etiqueta</label>
                    <input value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} placeholder="Ahorra 80%"
                      className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-zinc-600 mb-1.5">Texto del botón CTA</label>
                    <input value={form.cta_text} onChange={(e) => setForm({ ...form, cta_text: e.target.value })} placeholder="Suscribirme ahora"
                      className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
                  </div>
                </div>
              </div>
            </div>

            {/* Landing config */}
            <div>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">Configuración de Landing</p>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-zinc-600 mb-1.5">Landing page</label>
                  <select value={form.landing_slug} onChange={(e) => setForm({ ...form, landing_slug: e.target.value, landing_visible: !!e.target.value })}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20">
                    {LANDING_SLUGS.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-zinc-600 mb-1.5">Orden en la landing</label>
                  <input type="number" value={form.landing_order} onChange={(e) => setForm({ ...form, landing_order: parseInt(e.target.value) || 0 })} placeholder="1"
                    className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-3 cursor-pointer bg-white rounded-xl border border-zinc-200 px-4 py-2.5 w-full">
                    <input type="checkbox" checked={form.landing_visible} onChange={(e) => setForm({ ...form, landing_visible: e.target.checked })}
                      className="w-5 h-5 rounded border-zinc-300 text-primary-600 focus:ring-primary-500" />
                    <span className="text-sm font-semibold text-zinc-600">Visible en landing</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Payment & Advanced */}
            <div>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">Pago & Avanzado</p>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-zinc-600 mb-1.5">Pasarela de pago</label>
                  <select value={form.payment_provider} onChange={(e) => setForm({ ...form, payment_provider: e.target.value })}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20">
                    {PAYMENT_PROVIDERS.map((p) => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-zinc-600 mb-1.5">Izipay Price ID</label>
                  <input value={form.izipay_price_id} onChange={(e) => setForm({ ...form, izipay_price_id: e.target.value })} placeholder="izipay_pro_quarterly"
                    className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-zinc-600 mb-1.5">Máx. perros</label>
                  <input type="number" value={form.max_dogs} onChange={(e) => setForm({ ...form, max_dogs: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
                </div>
              </div>
            </div>

            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 bg-primary-600 text-white rounded-xl px-5 py-2.5 text-sm font-bold hover:bg-primary-700 active:scale-[0.97] transition-all disabled:opacity-50">
              <Save className="w-4 h-4" /> {saving ? "Guardando..." : editing ? "Actualizar" : "Crear"}
            </button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-zinc-500">Cargando...</div>
        ) : (
          <div className="grid gap-4">
            {plans.map((p) => (
              <div key={p.id} className="card-soft rounded-[1.25rem] p-5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-secondary-100 flex items-center justify-center text-secondary-600 shrink-0">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-base font-bold text-zinc-800">{p.name}</p>
                      {p.badge && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-warning-100 text-warning-700">{p.badge}</span>
                      )}
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-secondary-100 text-secondary-700">
                        {formatPrice(p.price_cents)}/{intervalLabel(p.billing_interval)}
                      </span>
                      {p.original_price_cents && p.original_price_cents > p.price_cents && (
                        <span className="text-xs text-zinc-400 line-through">{formatPrice(p.original_price_cents)}</span>
                      )}
                    </div>
                    {p.description && (
                      <p className="text-sm text-zinc-500 mt-0.5">{p.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      {p.landing_visible && p.landing_slug ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                          <Eye className="w-3 h-3" /> {slugLabel(p.landing_slug)} · #{p.landing_order}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-500">
                          <EyeOff className="w-3 h-3" /> Oculto
                        </span>
                      )}
                      <span className="text-xs text-zinc-400">
                        <Tag className="w-3 h-3 inline mr-1" />{p.payment_provider}
                      </span>
                      {p.max_dogs > 1 && (
                        <span className="text-xs text-zinc-400">Hasta {p.max_dogs} perros</span>
                      )}
                      {(p.features || []).length > 0 && (
                        <span className="text-xs text-zinc-400">{(p.features || []).length} features</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => handleToggleVisible(p)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${p.landing_visible ? "text-green-500 hover:bg-green-50" : "text-zinc-400 hover:bg-zinc-50"}`}
                      title={p.landing_visible ? "Ocultar de landing" : "Mostrar en landing"}>
                      {p.landing_visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button onClick={() => startEdit(p)}
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-zinc-400 hover:text-primary-600 hover:bg-primary-50 transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(p.id)}
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-zinc-400 hover:text-danger-500 hover:bg-danger-50 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminGuard>
  );
}