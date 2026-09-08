"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { MarketplaceListing, MarketplaceProduct } from "@/types/database";
import { Trash2, Eye, EyeOff, Plus, X, Pencil, Upload, Save } from "lucide-react";

const catLabels: Record<string, string> = {
  repuestos: "Repuestos", accesorios: "Accesorios", servicios: "Servicios",
  cupones: "Cupones", autos_usados: "Autos Usados",
};

const productCats = ["accesorios", "repuestos", "electronica", "seguridad", "confort", "otro"];

interface Props {
  listings: (MarketplaceListing & { profiles?: { display_name?: string; email?: string; whatsapp?: string } | null })[];
  products: MarketplaceProduct[];
}

export default function MarketplaceAdminClient({ listings: initialListings, products: initialProducts }: Props) {
  const [tab, setTab] = useState<"vehiculos" | "productos">("vehiculos");
  const [listings, setListings] = useState(initialListings);
  const [products, setProducts] = useState(initialProducts);
  const [editing, setEditing] = useState<MarketplaceProduct | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ titulo: "", categoria: "accesorios", descripcion: "", imagen_url: "", precio: "", precio_original: "", url_temu: "", destacado: false, activo: true });

  const resetForm = () => setForm({ titulo: "", categoria: "accesorios", descripcion: "", imagen_url: "", precio: "", precio_original: "", url_temu: "", destacado: false, activo: true });

  const openCreate = () => { resetForm(); setEditing(null); setCreating(true); };
  const openEdit = (p: MarketplaceProduct) => {
    setForm({ titulo: p.titulo, categoria: p.categoria || "accesorios", descripcion: p.descripcion || "", imagen_url: p.imagen_url || "", precio: p.precio != null ? String(p.precio) : "", precio_original: p.precio_original != null ? String(p.precio_original) : "", url_temu: p.url_temu || "", destacado: p.destacado, activo: p.activo });
    setEditing(p); setCreating(true);
  };

  const saveProduct = async () => {
    if (!form.titulo.trim()) { alert("El título es obligatorio."); return; }
    const { error } = await createClient().from("marketplace_products").upsert({
      ...(editing ? { id: editing.id } : {}),
      titulo: form.titulo.trim(),
      categoria: form.categoria,
      descripcion: form.descripcion.trim() || null,
      imagen_url: form.imagen_url.trim() || null,
      precio: form.precio ? parseFloat(form.precio) : null,
      precio_original: form.precio_original ? parseFloat(form.precio_original) : null,
      url_temu: form.url_temu.trim() || null,
      destacado: form.destacado,
      activo: form.activo,
      updated_at: new Date().toISOString(),
    });
    if (error) { alert("Error al guardar: " + error.message); return; }
    setCreating(false); setEditing(null); resetForm();
    // refresh local
    const supabase = createClient();
    const { data } = await supabase.from("marketplace_products").select("*").order("created_at", { ascending: false }).limit(200);
    setProducts((data as MarketplaceProduct[] | null) ?? initialProducts);
  };

  const toggleProduct = async (p: MarketplaceProduct) => {
    await createClient().from("marketplace_products").update({ activo: !p.activo, updated_at: new Date().toISOString() }).eq("id", p.id);
    setProducts(products.map((x) => (x.id === p.id ? { ...x, activo: !x.activo } : x)));
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("¿Eliminar este producto?")) return;
    await createClient().from("marketplace_products").delete().eq("id", id);
    setProducts(products.filter((p) => p.id !== id));
  };

  const activos = listings.filter((l) => l.activo).length;
  const inactivos = listings.length - activos;
  const prodActivos = products.filter((p) => p.activo).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-800">Marketplace</h1>
          <p className="text-sm text-zinc-500">Administra ventas de vehículos y el catálogo de productos.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setTab("vehiculos")} className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${tab === "vehiculos" ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"}`}>
            Vehículos ({listings.length})
          </button>
          <button onClick={() => setTab("productos")} className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${tab === "productos" ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"}`}>
            Productos ({products.length})
          </button>
        </div>
      </div>

      {tab === "vehiculos" && (
        <div>
          <p className="text-xs text-zinc-500 mb-2">{activos} activos · {inactivos} inactivos</p>
          <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-100 bg-zinc-50">
                    <th className="text-left px-4 py-3 text-xs font-bold text-zinc-500">Artículo</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-zinc-500">Categoría</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-zinc-500">Precio</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-zinc-500">Vendedor</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-zinc-500">Estado</th>
                    <th className="text-right px-4 py-3 text-xs font-bold text-zinc-500">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {listings.map((l) => (
                    <tr key={l.id} className={`border-b border-zinc-50 ${!l.activo ? "opacity-50" : ""}`}>
                      <td className="px-4 py-3 font-bold text-zinc-800 max-w-[200px] truncate">{l.titulo}</td>
                      <td className="px-4 py-3 text-xs text-zinc-600">{catLabels[l.categoria] || l.categoria}</td>
                      <td className="px-4 py-3 font-bold text-zinc-800">S/ {l.precio?.toLocaleString("es-PE") ?? l.precio}</td>
                      <td className="px-4 py-3 text-xs text-zinc-600">{l.profiles?.display_name || l.whatsapp}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${l.activo ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-500"}`}>{l.activo ? "Activo" : "Oculto"}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => createClient().from("marketplace_listings").update({ activo: !l.activo }).eq("id", l.id).then(() => setListings(listings.map((x) => (x.id === l.id ? { ...x, activo: !x.activo } : x))))}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${l.activo ? "hover:bg-amber-50 text-zinc-400 hover:text-amber-600" : "hover:bg-emerald-50 text-zinc-400 hover:text-emerald-600"}`}>
                            {l.activo ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          <button onClick={async () => { if (confirm("¿Eliminar esta publicación?")) { await createClient().from("marketplace_listings").delete().eq("id", l.id); setListings(listings.filter((x) => x.id !== l.id)); } }}
                            className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-zinc-400 hover:text-red-500">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {listings.length === 0 && (
                    <tr><td colSpan={6} className="text-center py-8 text-zinc-400">Sin publicaciones</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === "productos" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-zinc-500">{prodActivos} activos · {products.length - prodActivos} inactivos</p>
            <button onClick={openCreate} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 text-white text-sm font-bold hover:bg-zinc-800">
              <Plus className="w-4 h-4" /> Nuevo producto
            </button>
          </div>

          {(creating || editing) && (
            <div className="bg-white rounded-2xl border border-zinc-100 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-zinc-800">{editing ? "Editar producto" : "Nuevo producto"}</h3>
                <button onClick={() => { setCreating(false); setEditing(null); resetForm(); }} className="text-zinc-400 hover:text-zinc-600"><X className="w-4 h-4" /></button>
              </div>
              <input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} placeholder="Título *"
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-300" />
              <div className="grid grid-cols-3 gap-2">
                <select value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} className="px-3 py-2 rounded-xl border border-zinc-200 text-sm">
                  {productCats.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <input type="number" step="0.01" value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} placeholder="Precio" className="px-3 py-2 rounded-xl border border-zinc-200 text-sm" />
                <input type="number" step="0.01" value={form.precio_original} onChange={(e) => setForm({ ...form, precio_original: e.target.value })} placeholder="Precio original" className="px-3 py-2 rounded-xl border border-zinc-200 text-sm" />
              </div>
              <input value={form.url_temu} onChange={(e) => setForm({ ...form, url_temu: e.target.value })} placeholder="URL de Temu"
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-sm" />
              <input value={form.imagen_url} onChange={(e) => setForm({ ...form, imagen_url: e.target.value })} placeholder="URL de imagen"
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-sm" />
              <textarea rows={2} value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} placeholder="Descripción" className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-sm resize-none" />
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1.5 text-sm"><input type="checkbox" checked={form.destacado} onChange={(e) => setForm({ ...form, destacado: e.target.checked })} /> Destacado</label>
                <label className="flex items-center gap-1.5 text-sm"><input type="checkbox" checked={form.activo} onChange={(e) => setForm({ ...form, activo: e.target.checked })} /> Activo</label>
              </div>
              <button onClick={saveProduct} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 text-white text-sm font-bold hover:bg-zinc-800">
                <Save className="w-4 h-4" /> {editing ? "Guardar cambios" : "Crear producto"}
              </button>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-100 bg-zinc-50">
                    <th className="text-left px-4 py-3 text-xs font-bold text-zinc-500">Producto</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-zinc-500">Categoría</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-zinc-500">Precio</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-zinc-500">Destacado</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-zinc-500">Estado</th>
                    <th className="text-right px-4 py-3 text-xs font-bold text-zinc-500">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id} className={`border-b border-zinc-50 ${!p.activo ? "opacity-50" : ""}`}>
                      <td className="px-4 py-3 font-bold text-zinc-800 max-w-[200px] truncate">
                        {p.destacado && <span className="mr-1 text-amber-500">★</span>}{p.titulo}
                      </td>
                      <td className="px-4 py-3 text-xs text-zinc-600">{p.categoria}</td>
                      <td className="px-4 py-3 font-bold text-zinc-800">{p.precio != null ? `S/ ${p.precio.toLocaleString("es-PE")}` : "—"}</td>
                      <td className="px-4 py-3 text-xs text-zinc-600">{p.destacado ? "Sí" : "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${p.activo ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-500"}`}>{p.activo ? "Activo" : "Oculto"}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEdit(p)} className="w-8 h-8 rounded-lg hover:bg-zinc-100 flex items-center justify-center text-zinc-400 hover:text-zinc-700"><Pencil className="w-4 h-4" /></button>
                          <button onClick={() => toggleProduct(p)} className="w-8 h-8 rounded-lg hover:bg-amber-50 flex items-center justify-center text-zinc-400 hover:text-amber-600">{p.activo ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                          <button onClick={() => deleteProduct(p.id)} className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-zinc-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {products.length === 0 && (
                    <tr><td colSpan={6} className="text-center py-8 text-zinc-400">Sin productos. Agrega el catálogo desde aquí.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
