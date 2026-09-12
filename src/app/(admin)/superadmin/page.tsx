import { cookies } from "next/headers";
import { createServiceClient } from "@/lib/supabase/service";
import { Users, UtensilsCrossed, DollarSign, Dog, Car, Package, ShoppingCart } from "lucide-react";

export default async function SuperAdminPage() {
  const supabase = createServiceClient();
  const cookieStore = await cookies();
  const appSlug = cookieStore.get("blis_active_app_slug")?.value || "guau";

  const [
    { count: totalUsers },
    { count: totalActiveSubs },
    { data: apps },
    { data: recentUsers },
    { count: totalDogs },
    { count: totalRecipes },
    { count: totalVehicles },
    { count: totalProducts },
    { count: totalPurchases },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("subscriptions").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("applications").select("id, name, slug, is_active").order("created_at"),
    supabase.from("profiles").select("id, display_name, email, role, created_at").order("created_at", { ascending: false }).limit(5),
    supabase.from("dogs").select("*", { count: "exact", head: true }),
    supabase.from("nutrition_recipes").select("*", { count: "exact", head: true }),
    supabase.from("vehicles").select("*", { count: "exact", head: true }),
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("product_orders").select("*", { count: "exact", head: true }),
  ]);

  const appId = (apps || []).find((a: any) => a.slug === appSlug)?.id;

  const stats: { label: string; value: number; icon: any; color: string }[] = [
    { label: "Usuarios", value: totalUsers || 0, icon: Users, color: "primary" },
  ];

  if (appSlug === "guau") {
    stats.push(
      { label: "Perros", value: totalDogs || 0, icon: Dog, color: "secondary" },
      { label: "Recetas", value: totalRecipes || 0, icon: UtensilsCrossed, color: "warning" },
    );
  } else if (appSlug === "auto") {
    stats.push(
      { label: "Vehículos", value: totalVehicles || 0, icon: Car, color: "secondary" },
      { label: "Productos", value: totalProducts || 0, icon: Package, color: "warning" },
      { label: "Compras", value: totalPurchases || 0, icon: ShoppingCart, color: "accent" },
    );
  }

  stats.push({ label: "Suscripciones Activas", value: totalActiveSubs || 0, icon: DollarSign, color: "accent" });

  const colorMap: Record<string, string> = {
    primary: "bg-primary-50 text-primary-600",
    secondary: "bg-secondary-50 text-secondary-600",
    warning: "bg-warning-50 text-warning-600",
    accent: "bg-accent-50 text-accent-600",
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-zinc-900">Dashboard</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Métricas de <span className="font-semibold text-primary-600">{appSlug}</span>
          {appId ? "" : " · app no encontrada"}
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
            <p className="text-2xl font-extrabold text-zinc-900">{s.value}</p>
            <p className="text-xs text-zinc-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card-soft rounded-[1.25rem] p-6">
          <h2 className="text-base font-bold text-zinc-800 mb-4">Aplicaciones</h2>
          <div className="space-y-2">
            {(apps || []).map((app: any) => (
              <div key={app.id} className={`flex items-center gap-3 p-3 rounded-xl ${app.slug === appSlug ? "bg-primary-50" : "bg-white/50"}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold ${
                  app.slug === "auto" ? "bg-auto-600" : app.slug === "Spartan" ? "bg-spartan-600" : "bg-primary-600"
                }`}>
                  {app.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-zinc-800">{app.name}</p>
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
          <h2 className="text-base font-bold text-zinc-800 mb-4">Usuarios Recientes</h2>
          <div className="space-y-2">
            {(recentUsers || []).map((u: any) => (
              <div key={u.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/50">
                <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-500 text-xs font-bold">
                  {(u.display_name || u.email || "?").charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-zinc-800 truncate">{u.display_name || u.email}</p>
                  <p className="text-xs text-zinc-500">{u.email}</p>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary-50 text-primary-600">
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
