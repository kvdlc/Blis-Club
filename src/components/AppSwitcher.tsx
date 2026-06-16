"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Dog, Car, Loader2, ArrowRight, BadgeCheck, Clock, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { checkTrial } from "@/lib/trial";

interface AppInfo {
  app_slug: string;
  status: string;
  name: string;
  icon: React.ReactNode;
  color: string;
}

const APP_REGISTRY: Record<string, AppInfo> = {
  guau: {
    app_slug: "guau",
    status: "active",
    name: "Guau",
    icon: <Dog className="w-8 h-8" />,
    color: "from-primary-500 to-primary-700",
  },
  auto: {
    app_slug: "auto",
    status: "active",
    name: "Auto",
    icon: <Car className="w-8 h-8" />,
    color: "from-auto-500 to-auto-700",
  },
};

export default function AppSwitcher() {
  const router = useRouter();
  const [apps, setApps] = useState<AppInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data: userApps } = await supabase
        .from("user_apps")
        .select("*")
        .eq("user_id", user.id);

      const mapped = (userApps ?? []).map((ua: any) => {
        const info = APP_REGISTRY[ua.app_slug] || {
          app_slug: ua.app_slug,
          status: ua.status,
          name: ua.app_slug.charAt(0).toUpperCase() + ua.app_slug.slice(1),
          icon: <Dog className="w-8 h-8" />,
          color: "from-zinc-500 to-zinc-700",
        };
        return { ...info, status: ua.status };
      });

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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
        <p className="text-sm text-zinc-500">Cargando tus aplicaciones...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-extrabold text-zinc-900">Tus aplicaciones</h2>
        <p className="text-sm text-zinc-500">Elige a cuál quieres entrar</p>
      </div>

      <div className="grid gap-3 max-w-sm mx-auto">
        {apps.map((app) => {
          const StatusIcon = app.status === "active" ? BadgeCheck : app.status === "trialing" ? Clock : AlertTriangle;
          const statusLabel = app.status === "active" ? "Activo" : app.status === "trialing" ? "Prueba" : "Expirado";
          const statusColor = app.status === "active" ? "text-emerald-600 bg-emerald-50" : app.status === "trialing" ? "text-primary-600 bg-primary-50" : "text-danger-600 bg-danger-50";

          return (
            <button
              key={app.app_slug}
              onClick={() => handleEnter(app.app_slug)}
              className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-zinc-100 shadow-sm hover:shadow-md transition-all active:scale-[0.98] text-left"
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${app.color} flex items-center justify-center text-white shadow-lg shrink-0`}>
                {app.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-extrabold text-zinc-800">{app.name}</p>
                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 ${statusColor}`}>
                  <StatusIcon className="w-3 h-3" />
                  {statusLabel}
                </span>
              </div>
              <ArrowRight className="w-5 h-5 text-zinc-400" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
