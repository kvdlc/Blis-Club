import { createServiceClient } from "@/lib/supabase/service";
import { Users, GraduationCap, UtensilsCrossed, Shield, BadgeCheck, DollarSign, Trophy, Image, Syringe, Layers, Settings, Dog } from "lucide-react";

export default async function SuperAdminPage() {
  const supabase = createServiceClient();

  const [
    { count: totalUsers },
    { count: totalDogs },
    { count: totalRecipes },
    { count: totalActiveSubs },
    { data: apps },
    { data: recentUsers },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("dogs").select("*", { count: "exact", head: true }),
    supabase.from("nutrition_recipes").select("*", { count: "exact", head: true }),
    supabase.from("subscriptions").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("applications").select("id, name, slug, is_active").order("created_at"),
    supabase.from("profiles").select("id, display_name, email, role, created_at").order("created_at", { ascending: false }).limit(5),
  ]);

  const stats = [
    { label: "Usuarios", value: totalUsers || 0, icon: Users, color: "primary" },
    { label: "Perros", value: totalDogs || 0, icon: Dog, color: "secondary" },
    { label: "Recetas", value: totalRecipes || 0, icon: UtensilsCrossed, color: "warning" },
    { label: "Suscripciones Activas", value: totalActiveSubs || 0, icon: DollarSign, color: "accent" },
  ];

  const colorMap: Record<string, string> = {
    primary: "bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400",
    secondary: "bg-secondary-50 dark:bg-secondary-950/40 text-secondary-600 dark:text-secondary-400",
    warning: "bg-warning-50 dark:bg-warning-950/40 text-warning-600 dark:text-warning-400",
    accent: "bg-accent-50 dark:bg-accent-950/40 text-accent-600 dark:text-accent-400",
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white">Dashboard</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Administra todas tus aplicaciones desde un solo lugar
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="card-soft rounded-[1.25rem] p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[s.color]}`}>
                <s.icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-zinc-900 dark:text-white">{s.value}</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card-soft rounded-[1.25rem] p-6">
          <h2 className="text-base font-bold text-zinc-800 dark:text-zinc-200 mb-4">Aplicaciones</h2>
          <div className="space-y-2">
            {(apps || []).map((app: any) => (
              <div key={app.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/50 dark:bg-zinc-800/30">
                <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white text-xs font-bold">
                  {app.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{app.name}</p>
                  <p className="text-xs text-zinc-500">/{app.slug}</p>
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${app.is_active ? "bg-secondary-100 text-secondary-700" : "bg-zinc-200 text-zinc-500"}`}>
                  {app.is_active ? "Activo" : "Inactivo"}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card-soft rounded-[1.25rem] p-6">
          <h2 className="text-base font-bold text-zinc-800 dark:text-zinc-200 mb-4">Usuarios Recientes</h2>
          <div className="space-y-2">
            {(recentUsers || []).map((u: any) => (
              <div key={u.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/50 dark:bg-zinc-800/30">
                <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-zinc-500 text-xs font-bold">
                  {(u.display_name || u.email || "?").charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                    {u.display_name || u.email}
                  </p>
                  <p className="text-xs text-zinc-500">{u.email}</p>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400">
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
