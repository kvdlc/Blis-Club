import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import type { Dog, Walk, DailyLog } from "@/types/database";
import { Activity, UtensilsCrossed, GraduationCap, TrendingUp, PawPrint, Plus } from "lucide-react";
import { AddDogForm } from "./AddDogForm";

async function getDashboardData(userId: string) {
  const supabase = await createClient();

  const [dogRes, logsRes, walksRes] = await Promise.all([
    supabase.from("dogs").select("*").eq("owner_id", userId).limit(1).single(),
    supabase.from("daily_logs").select("*").order("fecha", { ascending: false }).limit(3),
    supabase.from("walks").select("*").order("start_time", { ascending: false }).limit(30),
  ]);

  return {
    dog: (dogRes.data as Dog | null) ?? null,
    logs: (logsRes.data as DailyLog[] | null) ?? [],
    walks: (walksRes.data as Walk[] | null) ?? [],
  };
}

function getTrafficColor(light: string | null) {
  switch (light) {
    case "green": return "bg-secondary-500";
    case "yellow": return "bg-warning-500";
    case "red": return "bg-danger-500";
    default: return "bg-zinc-200 dark:bg-zinc-700";
  }
}

function getStressColor(level: number | null) {
  if (!level) return "text-zinc-400";
  if (level <= 2) return "text-secondary-600 dark:text-secondary-400";
  if (level <= 3) return "text-warning-600 dark:text-warning-400";
  return "text-danger-600 dark:text-danger-400";
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { dog, logs, walks } = await getDashboardData(user.id);

  const last7Walks = walks.slice(0, 7).reverse();
  const greenCount = walks.filter((w) => w.traffic_light === "green").length;
  const walkTotal = walks.length || 1;
  const greenPct = Math.round((greenCount / walkTotal) * 100);
  const todayWalks = walks.filter((w) => {
    const d = new Date(w.start_time);
    const t = new Date();
    return d.toDateString() === t.toDateString();
  });

  if (!dog) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <PawPrint className="w-16 h-16 text-primary-300 dark:text-primary-700" />
        <div>
          <h2 className="text-xl font-semibold text-zinc-700 dark:text-zinc-300">
            ¡Bienvenido a Blis Club!
          </h2>
          <p className="text-zinc-500 mt-2 max-w-sm">
            Registra tu primer perro para empezar a usar la calculadora de nutrición, el tracker de paseos y la academia de entrenamiento.
          </p>
        </div>
        <AddDogForm userId={user.id} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dog Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary-100 dark:bg-primary-950 flex items-center justify-center">
            <PawPrint className="w-7 h-7 text-primary-600 dark:text-primary-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{dog.nombre}</h2>
            <p className="text-sm text-zinc-500">
              {dog.raza} · {dog.edad_meses} meses · {dog.peso_kg} kg
            </p>
          </div>
          <span className="text-xs font-medium bg-accent-100 dark:bg-accent-950 text-accent-700 dark:text-accent-400 px-3 py-1.5 rounded-full">
            {dog.objetivo_principal?.slice(0, 20) ?? "Sin objetivo"}
          </span>
        </div>
      </div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { href: "/guau/app/tracker", icon: Activity, label: "Iniciar Paseo", color: "bg-primary-50 dark:bg-primary-950 border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-400" },
          { href: "/guau/app/nutricion", icon: UtensilsCrossed, label: "Nutrición", color: "bg-secondary-50 dark:bg-secondary-950 border-secondary-200 dark:border-secondary-800 text-secondary-700 dark:text-secondary-400" },
          { href: "/guau/app/academia", icon: GraduationCap, label: "Academia", color: "bg-warning-50 dark:bg-warning-950 border-warning-200 dark:border-warning-800 text-warning-700 dark:text-warning-400" },
          { href: "/guau/app/perfil", icon: TrendingUp, label: "Mi Progreso", color: "bg-accent-50 dark:bg-accent-950 border-accent-200 dark:border-accent-800 text-accent-700 dark:text-accent-400" },
        ].map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className={`rounded-2xl border p-4 flex flex-col items-center justify-center gap-2 text-center transition-colors hover:opacity-80 ${card.color}`}
          >
            <card.icon className="w-7 h-7" />
            <span className="text-xs font-semibold">{card.label}</span>
          </Link>
        ))}
      </div>

      {/* Mini Heatmap */}
      {last7Walks.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5">
          <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">
            Últimos 7 paseos
          </h3>
          <div className="flex gap-1.5">
            {last7Walks.map((w, i) => (
              <div
                key={i}
                className={`flex-1 h-8 rounded-lg ${getTrafficColor(w.traffic_light)}`}
                title={`${w.traffic_light ?? "sin datos"} - ${new Date(w.start_time).toLocaleDateString("es", { weekday: "short" })}`}
              />
            ))}
            {Array.from({ length: 7 - last7Walks.length }).map((_, i) => (
              <div key={`e-${i}`} className="flex-1 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800" />
            ))}
          </div>
          <p className="text-xs text-zinc-500 mt-2">
            {greenPct}% de paseos en verde · {todayWalks.length} paseo{todayWalks.length === 1 ? "" : "s"} hoy
          </p>
        </div>
      )}

      {/* Latest Logs */}
      {logs.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5">
          <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">
            Últimos registros
          </h3>
          <div className="space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="flex items-center gap-3 text-sm">
                <span className="text-zinc-400 w-20 shrink-0">
                  {new Date(log.fecha + "T00:00:00").toLocaleDateString("es", { weekday: "short", day: "numeric", month: "short" })}
                </span>
                <span className={`font-medium ${getStressColor(log.nivel_estres)}`}>
                  Estrés: {log.nivel_estres ?? "-"}/5
                </span>
                {log.comida_gramos && (
                  <span className="text-secondary-600 dark:text-secondary-400 font-medium">
                    {log.comida_gramos}g
                  </span>
                )}
                {log.notas_conducta && (
                  <span className="text-zinc-500 truncate">{log.notas_conducta.slice(0, 40)}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
