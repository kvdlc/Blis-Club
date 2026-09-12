"use client";

import { useState, useEffect } from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import { Save } from "lucide-react";
import { getActiveAppSlug } from "@/lib/active-app";

const FEATURES_BY_APP: Record<string, string[]> = {
  guau: ["academia", "nutricion", "tracker", "perdido", "referidos", "challenges"],
  auto: ["herramientas", "bitacora", "guantera", "marketplace"],
  Spartan: ["habitos", "gimnasio", "motivacion"],
};

const ADMIN_MODULES = [
  "dashboard", "usuarios", "productos", "compras", "email",
  "referidos", "marketplace", "proveedores", "configuracion",
];

export default function ConfiguracionPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const appSlug = getActiveAppSlug();
  const features = FEATURES_BY_APP[appSlug] || [];

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/app-settings?app=${encodeURIComponent(getActiveAppSlug())}`)
      .then((r) => r.json())
      .then((j) => {
        setSettings(j.data || {});
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleChange = (key: string, value: any) => {
    setSettings((s: any) => (s ? { ...s, [key]: value } : s));
  };

  const toggleFeature = (f: string) => {
    const current: string[] = settings?.enabled_features || [];
    handleChange("enabled_features", current.includes(f) ? current.filter((x) => x !== f) : [...current, f]);
  };

  const toggleModule = (m: string) => {
    const current = settings?.admin_modules || {};
    handleChange("admin_modules", { ...current, [m]: !current[m] });
  };

  const handleSave = async () => {
    if (!settings?.id) return;
    setSaving(true);
    await fetch("/api/admin/app-settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    setSaving(false);
  };

  return (
    <AdminGuard>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-zinc-900">Configuración</h1>
            <p className="text-sm text-zinc-500 mt-1">
              Ajustes de <span className="font-semibold text-primary-600">{appSlug}</span>: límites, referidos, features y módulos
            </p>
          </div>
          <button onClick={handleSave} disabled={saving || !settings?.id}
            className="flex items-center gap-2 bg-primary-600 text-white rounded-xl px-4 py-2.5 text-sm font-bold hover:bg-primary-700 active:scale-[0.97] transition-all disabled:opacity-50">
            <Save className="w-4 h-4" /> {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-zinc-500">Cargando...</div>
        ) : !settings?.id ? (
          <div className="card-soft rounded-[1.25rem] p-6 text-sm text-zinc-500">
            No hay configuración para <b>{appSlug}</b>. Créala desde la sección <b>Aplicaciones</b>.
          </div>
        ) : (
          <div className="space-y-6">
            {/* Límites de perros: solo Guau */}
            {appSlug === "guau" && (
              <div className="card-soft rounded-[1.25rem] p-6">
                <h2 className="text-base font-bold text-zinc-800 mb-4">Límites de perros por categoría</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { key: "max_dogs_usuario", label: "Usuario", icon: "👤" },
                    { key: "max_dogs_institucion", label: "Institución", icon: "🏢" },
                    { key: "max_dogs_admin", label: "Admin", icon: "🛡️" },
                    { key: "max_dogs_superadmin", label: "Super Admin", icon: "👑" },
                  ].map((f) => (
                    <div key={f.key}>
                      <label className="block text-sm font-semibold text-zinc-600 mb-1.5">
                        {f.icon} {f.label}
                      </label>
                      <input type="number" value={settings?.[f.key] || 0}
                        onChange={(e) => handleChange(f.key, parseInt(e.target.value) || 0)}
                        className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Referidos */}
            <div className="card-soft rounded-[1.25rem] p-6">
              <h2 className="text-base font-bold text-zinc-800 mb-4">Sistema de Referidos</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-zinc-600 mb-1.5">Comisión (%)</label>
                  <input type="number" value={settings?.referral_commission_pct ?? 20}
                    onChange={(e) => handleChange("referral_commission_pct", parseInt(e.target.value) || 0)}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-zinc-600 mb-1.5">Meses gratis por referido</label>
                  <input type="number" value={settings?.referral_free_months ?? 1}
                    onChange={(e) => handleChange("referral_free_months", parseInt(e.target.value) || 0)}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
                </div>
              </div>
            </div>

            {/* Features toggle */}
            <div className="card-soft rounded-[1.25rem] p-6">
              <h2 className="text-base font-bold text-zinc-800 mb-4">Features Activos</h2>
              {features.length === 0 ? (
                <p className="text-sm text-zinc-400">No hay features definidos para {appSlug}.</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {features.map((f) => {
                    const enabled = settings?.enabled_features?.includes(f);
                    return (
                      <button key={f} onClick={() => toggleFeature(f)}
                        className={`p-4 rounded-2xl border-2 text-sm font-bold text-left transition-all ${enabled ? "border-primary-400 bg-primary-50 text-primary-700" : "border-zinc-100 bg-white/60 text-zinc-500"}`}>
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Módulos de admin */}
            <div className="card-soft rounded-[1.25rem] p-6">
              <h2 className="text-base font-bold text-zinc-800 mb-1">Módulos del panel</h2>
              <p className="text-xs text-zinc-500 mb-4">Qué secciones ve un empleado de esta app.</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {ADMIN_MODULES.map((m) => {
                  const enabled = !!settings?.admin_modules?.[m];
                  return (
                    <button key={m} onClick={() => toggleModule(m)}
                      className={`p-3 rounded-2xl border-2 text-sm font-bold text-left capitalize transition-all ${enabled ? "border-primary-400 bg-primary-50 text-primary-700" : "border-zinc-100 bg-white/60 text-zinc-500"}`}>
                      {m}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminGuard>
  );
}
