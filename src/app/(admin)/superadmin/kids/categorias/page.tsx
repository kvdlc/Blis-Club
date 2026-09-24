"use client";

import { useEffect, useState } from "react";
import { Loader2, Save, Eye, EyeOff } from "lucide-react";

interface Category {
  id: string;
  slug: string;
  name: string;
  emoji: string | null;
  description: string | null;
  color: string | null;
  sort_order: number;
  is_active: boolean;
}

export default function AdminKidsCategoriasPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/kids/categories").then((r) => r.json());
    setCategories(res.categories ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const patch = (id: string, changes: Partial<Category>) =>
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...changes } : c)));

  const save = async (c: Category) => {
    setSavingId(c.id);
    await fetch("/api/admin/kids/categories", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: c.id,
        name: c.name,
        emoji: c.emoji,
        description: c.description,
        color: c.color,
        sort_order: c.sort_order,
        is_active: c.is_active,
      }),
    });
    setSavingId(null);
  };

  if (loading) {
    return <div className="flex justify-center py-16"><Loader2 className="h-7 w-7 animate-spin text-zinc-400" /></div>;
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Kids · Categorías</h1>
        <p className="text-sm text-zinc-500">Personaliza los tipos de contenido que ven los niños.</p>
      </div>

      <div className="space-y-3">
        {categories.map((c) => (
          <div key={c.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-4">
            <input
              value={c.emoji ?? ""}
              onChange={(e) => patch(c.id, { emoji: e.target.value })}
              className="h-12 w-12 rounded-xl border border-zinc-200 text-center text-2xl"
            />
            <div className="min-w-[140px] flex-1">
              <input
                value={c.name}
                onChange={(e) => patch(c.id, { name: e.target.value })}
                className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm font-bold"
              />
              <p className="mt-1 px-1 text-[11px] text-zinc-400">slug: {c.slug}</p>
            </div>
            <input
              value={c.description ?? ""}
              onChange={(e) => patch(c.id, { description: e.target.value })}
              placeholder="Descripción"
              className="min-w-[200px] flex-[2] rounded-xl border border-zinc-200 px-3 py-2 text-sm"
            />
            <input
              type="color"
              value={c.color ?? "#F59E0B"}
              onChange={(e) => patch(c.id, { color: e.target.value })}
              className="h-10 w-12 rounded-lg border border-zinc-200"
              title="Color"
            />
            <input
              type="number"
              value={c.sort_order}
              onChange={(e) => patch(c.id, { sort_order: Number(e.target.value) })}
              className="w-16 rounded-xl border border-zinc-200 px-2 py-2 text-center text-sm"
              title="Orden"
            />
            <button
              onClick={() => patch(c.id, { is_active: !c.is_active })}
              className={`inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-bold ${c.is_active ? "bg-emerald-50 text-emerald-600" : "bg-zinc-100 text-zinc-500"}`}
            >
              {c.is_active ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
              {c.is_active ? "Activa" : "Oculta"}
            </button>
            <button
              onClick={() => save(c)}
              disabled={savingId === c.id}
              className="inline-flex items-center gap-1.5 rounded-xl bg-kids-500 px-4 py-2 text-xs font-bold text-white disabled:opacity-60"
            >
              {savingId === c.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Guardar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
