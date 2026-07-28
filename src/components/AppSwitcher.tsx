"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { checkTrial } from "@/lib/trial";
import { Dog, Car, Shield, Loader2, ArrowRight, BadgeCheck, Clock, LogOut, User, ChevronRight } from "lucide-react";

interface AppInfo {
  app_slug: string;
  status: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  bgGradient: string;
  accentColor: string;
  tagline: string;
}

const APP_REGISTRY: Record<string, AppInfo> = {
  guau: {
    app_slug: "guau",
    status: "active",
    name: "Guau",
    description: "El mejor cuidado para tu perro",
    tagline: "Nutrición, salud y entrenamiento",
    icon: <Dog className="w-10 h-10" />,
    gradient: "from-blue-600 via-blue-500 to-violet-600",
    bgGradient: "from-blue-50 via-white to-violet-50",
    accentColor: "bg-blue-600",
  },
  auto: {
    app_slug: "auto",
    status: "active",
    name: "Auto",
    description: "Gestión inteligente de tu vehículo",
    tagline: "Bitácora, mantenimiento y más",
    icon: <Car className="w-10 h-10" />,
    gradient: "from-emerald-500 via-emerald-400 to-teal-500",
    bgGradient: "from-emerald-50 via-white to-teal-50",
    accentColor: "bg-emerald-600",
  },
  Spartan: {
    app_slug: "Spartan",
    status: "active",
    name: "Spartan",
    description: "Forja tu mejor versión",
    tagline: "Hábitos, gimnasio y disciplina",
    icon: <Shield className="w-10 h-10" />,
    gradient: "from-spartan-600 via-spartan-500 to-orange-600",
    bgGradient: "from-spartan-50 via-white to-orange-50",
    accentColor: "bg-spartan-600",
  },
};

export default function AppSwitcher() {
  const router = useRouter();
  const [apps, setApps] = useState<AppInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{ first_name?: string; avatar_url?: string } | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const [profileRes, userAppsRes] = await Promise.all([
        supabase.from("profiles").select("first_name, avatar_url").eq("id", user.id).single(),
        supabase.from("user_apps").select("*").eq("user_id", user.id),
      ]);

      setProfile(profileRes.data);

      const mapped = ((userAppsRes.data ?? []) as any[]).map((ua: any) => {
        const info = APP_REGISTRY[ua.app_slug];
        if (!info) return null;
        return { ...info, status: ua.status };
      }).filter(Boolean) as AppInfo[];

      setApps(mapped);
      setLoading(false);
    };
    load();
  }, []);

  const handleEnter = async (slug: string) => {
    const trial = await checkTrial((await createClient().auth.getUser()).data.user?.id || "", slug);
    if (trial.isExpired) {
      router.push(`/${slug}/app/suscripcion`);
    } else {
      router.push(`/${slug}/app`);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    await createClient().auth.signOut();
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950">
        <Loader2 className="w-8 h-8 text-zinc-500 animate-spin" />
        <p className="text-sm text-zinc-600 mt-3">Cargando tus aplicaciones...</p>
      </div>
    );
  }

  if (apps.length === 0) return null;

  const name = profile?.first_name || "Usuario";

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Header */}
      <header className="px-6 pt-12 pb-6">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-600 flex items-center justify-center ring-2 ring-white/10">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                <User className="w-5 h-5 text-zinc-300" />
              )}
            </div>
            <div>
              <p className="text-sm text-zinc-500">Bienvenido de vuelta</p>
              <h1 className="text-xl font-extrabold text-white">Hola, {name}</h1>
            </div>
          </div>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-zinc-400 text-xs font-medium hover:bg-white/10 hover:text-zinc-300 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            {loggingOut ? "..." : "Salir"}
          </button>
        </div>
      </header>

      {/* App Cards */}
      <div className="flex-1 px-6 pb-12">
        <div className="max-w-lg mx-auto space-y-6">
          <div>
            <p className="text-xs font-semibold text-zinc-600 uppercase tracking-widest mb-4">Tus aplicaciones</p>
          </div>

          <div className="space-y-4">
            {apps.map((app, i) => {
              const isActive = app.status === "active";
              const isTrialing = app.status === "trialing";

              return (
                <button
                  key={app.app_slug}
                  onClick={() => handleEnter(app.app_slug)}
                  className="w-full group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-sm hover:bg-white/[0.06] transition-all duration-300 active:scale-[0.98] text-left"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  {/* Subtle gradient bar at top */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${app.gradient}`} />

                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${app.gradient} flex items-center justify-center text-white shadow-lg shrink-0 ring-4 ring-white/5`}>
                        {app.icon}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 pt-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-extrabold text-white">{app.name}</h3>
                          {isActive && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <BadgeCheck className="w-3 h-3" />
                              Activo
                            </span>
                          )}
                          {isTrialing && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              <Clock className="w-3 h-3" />
                              Prueba
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-zinc-400 leading-relaxed">{app.description}</p>
                        <p className="text-xs text-zinc-600 mt-1">{app.tagline}</p>
                      </div>

                      {/* Arrow */}
                      <div className="shrink-0 pt-3">
                        <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 group-hover:border-white/20 transition-all">
                          <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-zinc-700 pt-4">
            Blis Club &middot; {apps.length} {apps.length === 1 ? "aplicación" : "aplicaciones"} disponibles
          </p>
        </div>
      </div>
    </div>
  );
}
