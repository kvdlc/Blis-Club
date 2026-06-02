"use client";

import { useState, useEffect } from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import { Plus, Edit, Trash2, UtensilsCrossed, Save, X } from "lucide-react";

export default function NutricionPage() {
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/recipes?app=guau").then(r => r.json()).then(j => { setRecipes(j.data || []); setLoading(false); });
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta receta?")) return;
    await fetch(`/api/admin/recipes?id=${id}`, { method: "DELETE" });
    setRecipes(recipes.filter(r => r.id !== id));
  };

  return (
    <AdminGuard>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white">Nutrición</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Gestiona recetas y alimentos tóxicos</p>
          </div>
          <button className="flex items-center gap-2 bg-primary-600 text-white rounded-xl px-4 py-2.5 text-sm font-bold hover:bg-primary-700 active:scale-[0.97] transition-all">
            <Plus className="w-4 h-4" /> Nueva Receta
          </button>
        </div>
        {loading ? (
          <div className="text-center py-12 text-zinc-500">Cargando...</div>
        ) : (
          <div className="grid gap-4">
            {recipes.slice(0, 20).map((r: any) => (
              <div key={r.id} className="card-soft rounded-[1.25rem] p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-warning-100 dark:bg-warning-950 flex items-center justify-center text-warning-600">
                  <UtensilsCrossed className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-bold text-zinc-800 dark:text-zinc-200">{r.title}</p>
                  <p className="text-sm text-zinc-500 truncate">{r.category} · {r.difficulty} · {r.prep_time_min}min</p>
                </div>
                <div className="flex gap-1">
                  <button className="w-9 h-9 rounded-xl flex items-center justify-center text-zinc-400 hover:text-danger-500 hover:bg-danger-50"
                    onClick={() => handleDelete(r.id)}>
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
