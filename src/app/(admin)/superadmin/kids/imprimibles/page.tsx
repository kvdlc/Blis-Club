"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2, Pencil, Wand2, Eye, EyeOff, Save, X, Upload, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { uploadKidsAsset } from "@/lib/storage";
import { CATEGORY_META, DIFFICULTY_LABEL } from "@/lib/kids";

interface Printable {
  id: string;
  category_slug: string;
  title: string;
  description: string | null;
  cover_url: string | null;
  pdf_url: string | null;
  pages: number;
  age_min: number;
  age_max: number;
  difficulty: string;
  is_free: boolean;
  is_published: boolean;
  sort_order: number;
  tags: string[];
  data: any;
}

interface Category { id: string; slug: string; name: string }

const emptyForm = {
  id: "",
  category_slug: "colorear",
  title: "",
  description: "",
  cover_url: "",
  pdf_url: "",
  pages: 1,
  age_min: 3,
  age_max: 8,
  difficulty: "facil",
  is_free: true,
  is_published: true,
  sort_order: 0,
  tags: "",
  dataJson: "{}",
};

export default function AdminKidsImprimiblesPage() {
  const [items, setItems] = useState<Printable[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ ...emptyForm });
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    const [p, c] = await Promise.all([
      fetch("/api/admin/kids/printables").then((r) => r.json()),
      fetch("/api/admin/kids/categories").then((r) => r.json()),
    ]);
    setItems(p.printables ?? []);
    setCategories(c.categories ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const startNew = () => { setForm({ ...emptyForm }); setError(""); setShowForm(true); };

  const startEdit = (p: Printable) => {
    setForm({
      id: p.id,
      category_slug: p.category_slug,
      title: p.title,
      description: p.description ?? "",
      cover_url: p.cover_url ?? "",
      pdf_url: p.pdf_url ?? "",
      pages: p.pages,
      age_min: p.age_min,
      age_max: p.age_max,
      difficulty: p.difficulty,
      is_free: p.is_free,
      is_published: p.is_published,
      sort_order: p.sort_order,
      tags: (p.tags ?? []).join(", "),
      dataJson: JSON.stringify(p.data ?? {}, null, 2),
    });
    setError("");
    setShowForm(true);
  };

  const generateCover = async () => {
    if (form.title.trim().length < 3) { setError("Escribe un título para generar la portada."); return; }
    setGenerating(true);
    setError("");
    try {
      const res = await fetch("/api/kids/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: form.category_slug, subject: form.description.trim() || form.title.trim(), provider: "auto" }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "No se pudo generar"); return; }
      setForm((f) => ({ ...f, cover_url: data.imageUrl }));
    } finally { setGenerating(false); }
  };

  const uploadPdf = async (file: File) => {
    setUploading(true);
    setError("");
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setError("Sesión no válida"); return; }
      const url = await uploadKidsAsset(file, user.id);
      if (!url) { setError("No se pudo subir el PDF"); return; }
      setForm((f) => ({ ...f, pdf_url: url }));
    } finally { setUploading(false); }
  };

  const save = async () => {
    if (!form.title.trim()) { setError("El título es requerido"); return; }
    let data: any = {};
    try { data = form.dataJson.trim() ? JSON.parse(form.dataJson) : {}; }
    catch { setError("El JSON de datos no es válido"); return; }

    setSaving(true);
    setError("");
    const payload = {
      category_slug: form.category_slug,
      title: form.title.trim(),
      description: form.description.trim() || null,
      cover_url: form.cover_url || null,
      pdf_url: form.pdf_url || null,
      pages: Number(form.pages),
      age_min: Number(form.age_min),
      age_max: Number(form.age_max),
      difficulty: form.difficulty,
      is_free: form.is_free,
      is_published: form.is_published,
      sort_order: Number(form.sort_order),
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      data,
    };
    const res = await fetch("/api/admin/kids/printables", {
      method: form.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form.id ? { id: form.id, ...payload } : payload),
    });
    const out = await res.json();
    setSaving(false);
    if (!res.ok) { setError(out.error || "Error al guardar"); return; }
    setShowForm(false);
    load();
  };

  const togglePublished = async (p: Printable) => {
    setItems((prev) => prev.map((x) => (x.id === p.id ? { ...x, is_published: !x.is_published } : x)));
    await fetch("/api/admin/kids/printables", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: p.id, is_published: !p.is_published }),
    });
  };

  const remove = async (p: Printable) => {
    if (!confirm(`¿Eliminar "${p.title}"?`)) return;
    setItems((prev) => prev.filter((x) => x.id !== p.id));
    await fetch(`/api/admin/kids/printables?id=${p.id}`, { method: "DELETE" });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Kids · Imprimibles</h1>
          <p className="text-sm text-zinc-500">Sube recursos en PDF para que los niños impriman.</p>
        </div>
        <button onClick={startNew} className="inline-flex items-center gap-2 rounded-xl bg-kids-500 px-4 py-2.5 text-sm font-bold text-white shadow-kids-glow">
          <Plus className="h-4 w-4" /> Nuevo imprimible
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-zinc-800">{form.id ? "Editar imprimible" : "Nuevo imprimible"}</h2>
            <button onClick={() => setShowForm(false)} className="text-zinc-400 hover:text-zinc-700"><X className="h-5 w-5" /></button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-xs font-bold text-zinc-600">
              Título
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm font-normal" />
            </label>
            <label className="text-xs font-bold text-zinc-600">
              Categoría
              <select value={form.category_slug} onChange={(e) => setForm({ ...form, category_slug: e.target.value })} className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm font-normal">
                {categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
              </select>
            </label>
            <label className="text-xs font-bold text-zinc-600 sm:col-span-2">
              Descripción
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm font-normal" />
            </label>
            <label className="text-xs font-bold text-zinc-600">Páginas
              <input type="number" value={form.pages} onChange={(e) => setForm({ ...form, pages: Number(e.target.value) })} className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm font-normal" />
            </label>
            <label className="text-xs font-bold text-zinc-600">Orden
              <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm font-normal" />
            </label>
            <label className="text-xs font-bold text-zinc-600">Edad mín.
              <input type="number" value={form.age_min} onChange={(e) => setForm({ ...form, age_min: Number(e.target.value) })} className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm font-normal" />
            </label>
            <label className="text-xs font-bold text-zinc-600">Edad máx.
              <input type="number" value={form.age_max} onChange={(e) => setForm({ ...form, age_max: Number(e.target.value) })} className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm font-normal" />
            </label>
            <label className="text-xs font-bold text-zinc-600">Dificultad
              <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })} className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm font-normal">
                <option value="facil">Fácil</option>
                <option value="medio">Medio</option>
                <option value="dificil">Difícil</option>
              </select>
            </label>
            <label className="text-xs font-bold text-zinc-600">Etiquetas (coma)
              <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm font-normal" />
            </label>
            <label className="text-xs font-bold text-zinc-600 sm:col-span-2">
              Datos (JSON: words, size, shape, pages…)
              <textarea value={form.dataJson} onChange={(e) => setForm({ ...form, dataJson: e.target.value })} rows={5} className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 font-mono text-xs" />
            </label>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-xs font-bold text-zinc-600">
              <input type="checkbox" checked={form.is_free} onChange={(e) => setForm({ ...form, is_free: e.target.checked })} /> Gratis
            </label>
            <label className="flex items-center gap-2 text-xs font-bold text-zinc-600">
              <input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} /> Publicado
            </label>
          </div>

          {/* Portada + PDF */}
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-dashed border-zinc-200 p-4">
              <p className="mb-2 text-xs font-bold text-zinc-600">Portada</p>
              <div className="flex flex-wrap items-center gap-3">
                <button onClick={generateCover} disabled={generating} className="inline-flex items-center gap-2 rounded-xl bg-violet-500 px-4 py-2 text-xs font-bold text-white disabled:opacity-60">
                  {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />} Generar con IA
                </button>
                {form.cover_url && (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={form.cover_url} alt="" className="h-16 w-16 rounded-lg border border-zinc-200 object-cover" />
                    <button onClick={() => setForm({ ...form, cover_url: "" })} className="text-xs font-bold text-red-500">Quitar</button>
                  </>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-dashed border-zinc-200 p-4">
              <p className="mb-2 text-xs font-bold text-zinc-600">Archivo PDF</p>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadPdf(f); }}
                className="block w-full text-xs"
              />
              {uploading && <p className="mt-2 flex items-center gap-1.5 text-xs text-zinc-500"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Subiendo…</p>}
              {form.pdf_url && (
                <p className="mt-2 flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                  <FileText className="h-3.5 w-3.5" /> PDF cargado
                  <button onClick={() => setForm({ ...form, pdf_url: "" })} className="text-red-500">(quitar)</button>
                </p>
              )}
              {!form.pdf_url && !uploading && (
                <p className="mt-2 text-[11px] text-zinc-400 flex items-center gap-1"><Upload className="h-3 w-3" /> Si no subes PDF, se generará desde los datos/plantilla.</p>
              )}
            </div>
          </div>

          {error && <p className="mt-3 text-sm font-bold text-red-500">{error}</p>}

          <div className="mt-4 flex justify-end gap-3">
            <button onClick={() => setShowForm(false)} className="rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-bold text-zinc-600">Cancelar</button>
            <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-kids-500 px-5 py-2.5 text-sm font-bold text-white shadow-kids-glow disabled:opacity-60">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Guardar
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-7 w-7 animate-spin text-zinc-400" /></div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-10 text-center text-sm font-bold text-zinc-500">No hay imprimibles.</div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => {
            const meta = CATEGORY_META[p.category_slug];
            return (
              <div key={p.id} className="flex gap-3 rounded-2xl border border-zinc-200 bg-white p-3">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-zinc-100">
                  {p.cover_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.cover_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <FileText className="h-6 w-6 text-zinc-300" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase" style={{ color: meta?.color }}>{meta?.name ?? p.category_slug}</span>
                    {p.pdf_url && <span className="rounded-full bg-emerald-100 px-1.5 text-[9px] font-bold text-emerald-600">PDF</span>}
                  </div>
                  <p className="truncate text-sm font-bold text-zinc-800">{p.title}</p>
                  <p className="text-[11px] text-zinc-400">{p.pages} pág. · {p.age_min}–{p.age_max} años · {DIFFICULTY_LABEL[p.difficulty]}</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <button onClick={() => togglePublished(p)} className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold ${p.is_published ? "bg-emerald-50 text-emerald-600" : "bg-zinc-100 text-zinc-500"}`}>
                      {p.is_published ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                      {p.is_published ? "Publicado" : "Oculto"}
                    </button>
                    <button onClick={() => startEdit(p)} className="text-zinc-400 hover:text-kids-600"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => remove(p)} className="text-zinc-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
