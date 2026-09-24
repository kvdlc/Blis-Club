"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2, Pencil, Wand2, Eye, EyeOff, Save, X } from "lucide-react";
import { CATEGORY_META, DIFFICULTY_LABEL } from "@/lib/kids";

interface Activity {
  id: string;
  category_slug: string;
  title: string;
  description: string | null;
  cover_url: string | null;
  age_min: number;
  age_max: number;
  difficulty: string;
  is_free: boolean;
  is_published: boolean;
  is_ai_generated: boolean;
  tags: string[];
  data: any;
  created_at: string;
}

interface Category {
  id: string;
  slug: string;
  name: string;
  emoji: string | null;
}

const emptyForm = {
  id: "",
  category_slug: "colorear",
  title: "",
  description: "",
  cover_url: "",
  age_min: 3,
  age_max: 8,
  difficulty: "facil",
  is_free: true,
  is_published: true,
  tags: "",
  image_as_page: true,
};

export default function AdminKidsActividadesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ ...emptyForm });
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    const [a, c] = await Promise.all([
      fetch(`/api/admin/kids/activities${filter ? `?category=${filter}` : ""}`).then((r) => r.json()),
      fetch("/api/admin/kids/categories").then((r) => r.json()),
    ]);
    setActivities(a.activities ?? []);
    setCategories(c.categories ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [filter]);

  const startNew = () => {
    setForm({ ...emptyForm });
    setError("");
    setShowForm(true);
  };

  const startEdit = (a: Activity) => {
    setForm({
      id: a.id,
      category_slug: a.category_slug,
      title: a.title,
      description: a.description ?? "",
      cover_url: a.cover_url ?? "",
      age_min: a.age_min,
      age_max: a.age_max,
      difficulty: a.difficulty,
      is_free: a.is_free,
      is_published: a.is_published,
      tags: (a.tags ?? []).join(", "),
      image_as_page: !!a.data?.image_url,
    });
    setError("");
    setShowForm(true);
  };

  const generateCover = async () => {
    if (form.title.trim().length < 3 && form.description.trim().length < 3) {
      setError("Escribe un título o descripción para generar la imagen.");
      return;
    }
    setGenerating(true);
    setError("");
    try {
      const res = await fetch("/api/kids/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: form.category_slug,
          subject: form.description.trim() || form.title.trim(),
          provider: "auto",
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "No se pudo generar"); return; }
      setForm((f) => ({ ...f, cover_url: data.imageUrl }));
    } finally {
      setGenerating(false);
    }
  };

  const save = async () => {
    if (!form.title.trim()) { setError("El título es requerido"); return; }
    setSaving(true);
    setError("");
    const payload: any = {
      category_slug: form.category_slug,
      title: form.title.trim(),
      description: form.description.trim() || null,
      cover_url: form.cover_url || null,
      age_min: Number(form.age_min),
      age_max: Number(form.age_max),
      difficulty: form.difficulty,
      is_free: form.is_free,
      is_published: form.is_published,
      is_ai_generated: !!form.cover_url && form.cover_url.includes("/generated/"),
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      data: form.image_as_page && form.cover_url ? { image_url: form.cover_url } : {},
    };
    const res = await fetch("/api/admin/kids/activities", {
      method: form.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form.id ? { id: form.id, ...payload } : payload),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error || "Error al guardar"); return; }
    setShowForm(false);
    load();
  };

  const togglePublished = async (a: Activity) => {
    setActivities((prev) => prev.map((x) => (x.id === a.id ? { ...x, is_published: !x.is_published } : x)));
    await fetch("/api/admin/kids/activities", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: a.id, is_published: !a.is_published }),
    });
  };

  const remove = async (a: Activity) => {
    if (!confirm(`¿Eliminar "${a.title}"?`)) return;
    setActivities((prev) => prev.filter((x) => x.id !== a.id));
    await fetch(`/api/admin/kids/activities?id=${a.id}`, { method: "DELETE" });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Kids · Actividades</h1>
          <p className="text-sm text-zinc-500">Administra las láminas, puzzles y cuentos de Kids Club.</p>
        </div>
        <button onClick={startNew} className="inline-flex items-center gap-2 rounded-xl bg-kids-500 px-4 py-2.5 text-sm font-bold text-white shadow-kids-glow">
          <Plus className="h-4 w-4" /> Nueva actividad
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setFilter("")} className={`rounded-full px-3.5 py-1.5 text-xs font-bold ${!filter ? "bg-zinc-900 text-white" : "bg-white text-zinc-600 border border-zinc-200"}`}>Todas</button>
        {categories.map((c) => (
          <button key={c.id} onClick={() => setFilter(c.slug)} className={`rounded-full px-3.5 py-1.5 text-xs font-bold ${filter === c.slug ? "bg-zinc-900 text-white" : "bg-white text-zinc-600 border border-zinc-200"}`}>
            {c.name}
          </button>
        ))}
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-zinc-800">{form.id ? "Editar actividad" : "Nueva actividad"}</h2>
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
            <label className="text-xs font-bold text-zinc-600">
              Edad mínima
              <input type="number" value={form.age_min} onChange={(e) => setForm({ ...form, age_min: Number(e.target.value) })} className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm font-normal" />
            </label>
            <label className="text-xs font-bold text-zinc-600">
              Edad máxima
              <input type="number" value={form.age_max} onChange={(e) => setForm({ ...form, age_max: Number(e.target.value) })} className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm font-normal" />
            </label>
            <label className="text-xs font-bold text-zinc-600">
              Dificultad
              <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })} className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm font-normal">
                <option value="facil">Fácil</option>
                <option value="medio">Medio</option>
                <option value="dificil">Difícil</option>
              </select>
            </label>
            <label className="text-xs font-bold text-zinc-600">
              Etiquetas (separadas por coma)
              <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm font-normal" />
            </label>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-xs font-bold text-zinc-600">
              <input type="checkbox" checked={form.is_free} onChange={(e) => setForm({ ...form, is_free: e.target.checked })} /> Gratis
            </label>
            <label className="flex items-center gap-2 text-xs font-bold text-zinc-600">
              <input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} /> Publicada
            </label>
            <label className="flex items-center gap-2 text-xs font-bold text-zinc-600">
              <input type="checkbox" checked={form.image_as_page} onChange={(e) => setForm({ ...form, image_as_page: e.target.checked })} /> Usar imagen como página para colorear
            </label>
          </div>

          {/* Imagen */}
          <div className="mt-4 rounded-xl border border-dashed border-zinc-200 p-4">
            <div className="flex flex-wrap items-center gap-3">
              <button onClick={generateCover} disabled={generating} className="inline-flex items-center gap-2 rounded-xl bg-violet-500 px-4 py-2 text-xs font-bold text-white disabled:opacity-60">
                {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />} Generar con IA
              </button>
              {form.cover_url && (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={form.cover_url} alt="" className="h-20 w-20 rounded-lg border border-zinc-200 object-cover" />
                  <button onClick={() => setForm({ ...form, cover_url: "" })} className="text-xs font-bold text-red-500">Quitar</button>
                </>
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

      {/* Lista */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-7 w-7 animate-spin text-zinc-400" /></div>
      ) : activities.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-10 text-center text-sm font-bold text-zinc-500">No hay actividades.</div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {activities.map((a) => {
            const meta = CATEGORY_META[a.category_slug];
            return (
              <div key={a.id} className="flex gap-3 rounded-2xl border border-zinc-200 bg-white p-3">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-zinc-100 text-2xl">
                  {a.cover_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={a.cover_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="font-black text-zinc-400">{a.title.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase" style={{ color: meta?.color }}>{meta?.name ?? a.category_slug}</span>
                    {a.is_ai_generated && <span className="rounded-full bg-violet-100 px-1.5 text-[9px] font-bold text-violet-600">IA</span>}
                  </div>
                  <p className="truncate text-sm font-bold text-zinc-800">{a.title}</p>
                  <p className="text-[11px] text-zinc-400">{a.age_min}–{a.age_max} años · {DIFFICULTY_LABEL[a.difficulty]}</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <button onClick={() => togglePublished(a)} className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold ${a.is_published ? "bg-emerald-50 text-emerald-600" : "bg-zinc-100 text-zinc-500"}`}>
                      {a.is_published ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                      {a.is_published ? "Publicada" : "Oculta"}
                    </button>
                    <button onClick={() => startEdit(a)} className="text-zinc-400 hover:text-kids-600"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => remove(a)} className="text-zinc-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
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
