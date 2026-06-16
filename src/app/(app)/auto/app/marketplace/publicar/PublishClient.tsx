"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { ArrowLeft, Plus, X } from "lucide-react";

const categories = [
  { value: "repuestos", label: "Repuestos" },
  { value: "accesorios", label: "Accesorios" },
  { value: "servicios", label: "Servicios" },
  { value: "cupones", label: "Cupones de descuento" },
  { value: "autos_usados", label: "Autos Usados" },
];

function generateSlug(titulo: string): string {
  return titulo
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 80) + "-" + Math.random().toString(36).substring(2, 8);
}

export default function PublishClient({ userId }: { userId: string }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    titulo: "",
    categoria: "repuestos",
    marca: "",
    modelo: "",
    estado_item: "usado",
    precio: "",
    descripcion: "",
    whatsapp: "",
    ciudad: "",
    fotos: [] as string[],
  });
  const [fotoUrl, setFotoUrl] = useState("");

  const addFoto = () => {
    if (fotoUrl.trim() && form.fotos.length < 5) {
      setForm({ ...form, fotos: [...form.fotos, fotoUrl.trim()] });
      setFotoUrl("");
    }
  };

  const removeFoto = (i: number) => {
    setForm({ ...form, fotos: form.fotos.filter((_, idx) => idx !== i) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titulo || !form.precio || !form.whatsapp) return;

    const precio = parseFloat(form.precio);
    if (isNaN(precio) || precio < 0) { alert("El precio debe ser un número positivo."); return; }

    const cleanPhone = form.whatsapp.replace(/[^0-9]/g, "");
    if (cleanPhone.length < 8) { alert("Ingresa un número de WhatsApp válido (mínimo 8 dígitos)."); return; }

    setSaving(true);
    const slug = generateSlug(form.titulo);
    const supabase = createClient();

    const { error } = await supabase.from("marketplace_listings").insert({
      user_id: userId,
      slug,
      titulo: form.titulo,
      categoria: form.categoria,
      marca: form.marca || null,
      modelo: form.modelo || null,
      estado_item: form.estado_item,
      precio: parseFloat(form.precio),
      descripcion: form.descripcion || null,
      whatsapp: form.whatsapp,
      ciudad: form.ciudad || null,
      fotos: form.fotos,
      activo: true,
    });

    setSaving(false);

    if (error) {
      alert("Error al publicar: " + error.message);
    } else {
      router.push(`/auto/app/marketplace/${slug}`);
    }
  };

  return (
    <div className="space-y-4">
      <Link href="/auto/app/marketplace" className="inline-flex items-center gap-1.5 text-sm font-medium text-auto-500 hover:text-auto-700 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Marketplace
      </Link>

      <div>
        <h1 className="text-xl font-extrabold text-zinc-200">Publicar artículo</h1>
        <p className="text-xs text-zinc-400 mt-1">Llena los datos de tu producto o servicio.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <label className="block">
          <span className="text-xs font-bold text-zinc-400">Título *</span>
          <input required value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })}
            placeholder="Ej: Faros LED para Toyota Corolla 2020"
            className="w-full mt-1 px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-auto-600/20" />
        </label>

        <div className="grid grid-cols-2 gap-2">
          <label className="block">
            <span className="text-xs font-bold text-zinc-400">Categoría *</span>
            <select required value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })}
              className="w-full mt-1 px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-auto-600/20">
              {categories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-bold text-zinc-400">Estado *</span>
            <select required value={form.estado_item} onChange={(e) => setForm({ ...form, estado_item: e.target.value })}
              className="w-full mt-1 px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-auto-600/20">
              <option value="usado">Usado</option>
              <option value="nuevo">Nuevo</option>
            </select>
          </label>
        </div>

        <label className="block">
          <span className="text-xs font-bold text-zinc-400">Precio (S/) *</span>
          <input required type="number" min="0" step="0.01" value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })}
            placeholder="0 = Gratis"
            className="w-full mt-1 px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-auto-600/20" />
        </label>

        <div className="grid grid-cols-2 gap-2">
          <label className="block">
            <span className="text-xs font-bold text-zinc-400">Marca</span>
            <input value={form.marca} onChange={(e) => setForm({ ...form, marca: e.target.value })}
              placeholder="Ej: Toyota"
              className="w-full mt-1 px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-auto-600/20" />
          </label>
          <label className="block">
            <span className="text-xs font-bold text-zinc-400">Modelo</span>
            <input value={form.modelo} onChange={(e) => setForm({ ...form, modelo: e.target.value })}
              placeholder="Ej: Corolla"
              className="w-full mt-1 px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-auto-600/20" />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <label className="block">
            <span className="text-xs font-bold text-zinc-400">WhatsApp *</span>
            <input required value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
              placeholder="+51 999 888 777"
              className="w-full mt-1 px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-auto-600/20" />
          </label>
          <label className="block">
            <span className="text-xs font-bold text-zinc-400">Ciudad</span>
            <input value={form.ciudad} onChange={(e) => setForm({ ...form, ciudad: e.target.value })}
              placeholder="Ej: Lima"
              className="w-full mt-1 px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-auto-600/20" />
          </label>
        </div>

        <label className="block">
          <span className="text-xs font-bold text-zinc-400">Descripción</span>
          <textarea rows={3} value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            placeholder="Describe tu producto, compatibilidad, condición..."
            className="w-full mt-1 px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-auto-600/20 resize-none" />
        </label>

        {/* Fotos */}
        <div>
          <span className="text-xs font-bold text-zinc-400">Fotos (URL, máx 5)</span>
          <div className="flex gap-1.5 mt-1">
            <input value={fotoUrl} onChange={(e) => setFotoUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addFoto())}
              placeholder="https://..."
              className="flex-1 px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-xs focus:outline-none focus:ring-2 focus:ring-auto-600/20" />
            <button type="button" onClick={addFoto} disabled={!fotoUrl.trim() || form.fotos.length >= 5}
              className="px-3 py-2.5 rounded-xl bg-white/5 text-zinc-400 hover:bg-auto-100 hover:text-auto-500 disabled:opacity-40 transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          {form.fotos.length > 0 && (
            <div className="flex gap-1.5 mt-1.5 flex-wrap">
              {form.fotos.map((url, i) => (
                <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden bg-white/5">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeFoto(i)}
                    className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/50 flex items-center justify-center">
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button type="submit" disabled={saving}
          className="w-full py-3 rounded-2xl bg-auto-600 text-white font-bold text-sm hover:bg-auto-500 transition-colors active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-auto-600/20">
          {saving ? "Publicando..." : "Publicar artículo"}
        </button>
      </form>
    </div>
  );
}
