"use client";

import { useState, useEffect } from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import { Plus, Edit, Trash2, Save, X, Package, DollarSign, ImageIcon, ToggleLeft, ToggleRight } from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string;
  price_cents: number;
  currency: string;
  image_url: string;
  is_active: boolean;
  stock_quantity: number | null;
  application_id: string | null;
  applications: {
    name: string;
    slug: string;
  } | null;
  created_at: string;
}

interface Application {
  id: string;
  name: string;
  slug: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Product | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price_cents: 0,
    currency: "USD",
    image_url: "",
    stock_quantity: "" as string | number,
    application_id: "",
  });

  const load = async () => {
    setLoading(true);
    const [productsRes, appsRes] = await Promise.all([
      fetch("/api/admin/products"),
      fetch("/api/admin/applications"),
    ]);
    const productsJson = await productsRes.json();
    const appsJson = await appsRes.json();
    setProducts(productsJson.data || []);
    setApplications(appsJson.data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    const payload = {
      name: form.name,
      description: form.description,
      price_cents: form.price_cents,
      currency: form.currency,
      image_url: form.image_url || null,
      stock_quantity: form.stock_quantity === "" ? null : parseInt(form.stock_quantity as string) || null,
      application_id: form.application_id || null,
    };

    if (editing) {
      await fetch("/api/admin/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editing.id, ...payload }),
      });
    } else {
      await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }
    setEditing(null);
    setShowNew(false);
    resetForm();
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este producto?")) return;
    await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" });
    load();
  };

  const handleToggleActive = async (product: Product) => {
    await fetch("/api/admin/products", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: product.id, is_active: !product.is_active }),
    });
    load();
  };

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      price_cents: 0,
      currency: "USD",
      image_url: "",
      stock_quantity: "",
      application_id: "",
    });
  };

  const formatPrice = (cents: number, currency: string) => {
    const symbol = currency === "USD" ? "$" : "S/";
    return `${symbol}${(cents / 100).toFixed(2)}`;
  };

  return (
    <AdminGuard>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white">Productos</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Gestiona productos de compra única</p>
          </div>
          <button
            onClick={() => { setEditing(null); setShowNew(true); resetForm(); }}
            className="flex items-center gap-2 bg-primary-600 text-white rounded-xl px-4 py-2.5 text-sm font-bold hover:bg-primary-700 active:scale-[0.97] transition-all"
          >
            <Plus className="w-4 h-4" /> Nuevo Producto
          </button>
        </div>

        {(showNew || editing) && (
          <div className="card-soft rounded-[1.25rem] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-zinc-800 dark:text-zinc-200">
                {editing ? "Editar Producto" : "Nuevo Producto"}
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
                <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">Precio (centavos)</label>
                <input type="number" value={form.price_cents} onChange={(e) => setForm({ ...form, price_cents: parseInt(e.target.value) || 0 })}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">Moneda</label>
                <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20">
                  <option value="USD">USD ($)</option>
                  <option value="PEN">PEN (S/)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">Stock (vacío = ilimitado)</label>
                <input type="number" value={form.stock_quantity} onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })}
                  placeholder="Ilimitado"
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">Aplicación</label>
                <select value={form.application_id} onChange={(e) => setForm({ ...form, application_id: e.target.value })}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20">
                  <option value="">Ninguna</option>
                  {applications.map((app) => (
                    <option key={app.id} value={app.id}>{app.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">URL de imagen</label>
                <input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">Descripción</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2}
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
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
            {products.map((p) => (
              <div key={p.id} className={`card-soft rounded-[1.25rem] p-5 flex items-center gap-4 ${!p.is_active ? "opacity-60" : ""}`}>
                <div className="w-12 h-12 rounded-2xl bg-secondary-100 dark:bg-secondary-950 flex items-center justify-center text-secondary-600 overflow-hidden">
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <Package className="w-6 h-6" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-base font-bold text-zinc-800 dark:text-zinc-200">{p.name}</p>
                    {p.stock_quantity !== null && p.stock_quantity <= 5 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-700">
                        Stock bajo: {p.stock_quantity}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-zinc-500 truncate">{p.description || "Sin descripción"}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-semibold text-zinc-600">
                      {formatPrice(p.price_cents, p.currency)}
                    </span>
                    {p.applications && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary-50 text-primary-700">
                        {p.applications.name}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleActive(p)}
                    className={`p-2 rounded-xl transition-colors ${p.is_active ? "text-emerald-600 hover:bg-emerald-50" : "text-zinc-400 hover:bg-zinc-100"}`}
                    title={p.is_active ? "Desactivar" : "Activar"}
                  >
                    {p.is_active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                  </button>
                  <button onClick={() => { setEditing(p); setForm({
                    name: p.name,
                    description: p.description || "",
                    price_cents: p.price_cents,
                    currency: p.currency,
                    image_url: p.image_url || "",
                    stock_quantity: p.stock_quantity === null ? "" : p.stock_quantity,
                    application_id: p.application_id || "",
                  }); }}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-zinc-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950 transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(p.id)}
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
