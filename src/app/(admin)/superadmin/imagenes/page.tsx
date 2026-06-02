"use client";

import { useState, useEffect } from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import { Image, Plus, Upload } from "lucide-react";

const BREED_PLACEHOLDERS = [
  "Golden Retriever", "Bulldog Francés", "Pastor Alemán", "Labrador",
  "Poodle", "Chihuahua", "Beagle", "Dálmata",
  "Husky", "Corgi", "Border Collie", "Shih Tzu",
];

export default function ImagenesPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats?app=guau")
      .then((r) => r.json())
      .then((j) => { setStats(j.data || j); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <AdminGuard>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white">Imágenes</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Galería de imágenes por raza canina</p>
          </div>
          <button
            className="flex items-center gap-2 bg-primary-600 text-white rounded-xl px-4 py-2.5 text-sm font-bold hover:bg-primary-700 active:scale-[0.97] transition-all"
          >
            <Plus className="w-4 h-4" /> Subir Imagen
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-zinc-500">Cargando...</div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="card-soft rounded-[1.25rem] p-5">
                <div className="w-10 h-10 rounded-xl bg-accent-100 dark:bg-accent-950 flex items-center justify-center text-accent-600 mb-3">
                  <Image className="w-5 h-5" />
                </div>
                <p className="text-2xl font-extrabold text-zinc-900 dark:text-white">{stats?.total_images || "—"}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Imágenes totales</p>
              </div>
              <div className="card-soft rounded-[1.25rem] p-5">
                <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-950 flex items-center justify-center text-primary-600 mb-3">
                  <Upload className="w-5 h-5" />
                </div>
                <p className="text-2xl font-extrabold text-zinc-900 dark:text-white">{stats?.uploads_this_month || "—"}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Subidas este mes</p>
              </div>
              <div className="card-soft rounded-[1.25rem] p-5">
                <div className="w-10 h-10 rounded-xl bg-secondary-100 dark:bg-secondary-950 flex items-center justify-center text-secondary-600 mb-3">
                  <Image className="w-5 h-5" />
                </div>
                <p className="text-2xl font-extrabold text-zinc-900 dark:text-white">{BREED_PLACEHOLDERS.length}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Razas disponibles</p>
              </div>
              <div className="card-soft rounded-[1.25rem] p-5">
                <div className="w-10 h-10 rounded-xl bg-warning-100 dark:bg-warning-950 flex items-center justify-center text-warning-600 mb-3">
                  <Upload className="w-5 h-5" />
                </div>
                <p className="text-2xl font-extrabold text-zinc-900 dark:text-white">—</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Pendientes</p>
              </div>
            </div>

            <div className="card-soft rounded-[1.25rem] p-6">
              <h2 className="text-base font-bold text-zinc-800 dark:text-zinc-200 mb-4">Galería por Raza</h2>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                {BREED_PLACEHOLDERS.map((breed) => (
                  <div key={breed} className="aspect-square rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex flex-col items-center justify-center gap-2 p-3">
                    <Image className="w-8 h-8 text-zinc-300 dark:text-zinc-600" />
                    <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500 text-center leading-tight">{breed}</span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-4 text-center">
                Próximamente: subida masiva de imágenes por raza, organización por carpetas y optimización automática.
              </p>
            </div>
          </>
        )}
      </div>
    </AdminGuard>
  );
}
