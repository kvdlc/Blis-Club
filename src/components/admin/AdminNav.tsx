"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, GraduationCap, UtensilsCrossed, BadgeCheck,
  DollarSign, Trophy, Image, Syringe, Layers, Users,
  Globe, Settings, Shield, ChevronDown, LogOut, Dog,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const sections = [
  { href: "/superadmin", icon: LayoutDashboard, label: "Dashboard", exact: true },
  { href: "/superadmin/usuarios", icon: Users, label: "Usuarios", global: true },
  { divider: true },
  { href: "/superadmin/academia", icon: GraduationCap, label: "Academia" },
  { href: "/superadmin/nutricion", icon: UtensilsCrossed, label: "Nutrición" },
  { href: "/superadmin/vacunas", icon: Syringe, label: "Vacunas" },
  { href: "/superadmin/badges", icon: BadgeCheck, label: "Badges" },
  { href: "/superadmin/planes", icon: DollarSign, label: "Planes" },
  { href: "/superadmin/desafios", icon: Trophy, label: "Desafíos" },
  { href: "/superadmin/imagenes", icon: Image, label: "Imágenes" },
  { divider: true },
  { href: "/superadmin/configuracion", icon: Settings, label: "Configuración" },
  { href: "/superadmin/aplicaciones", icon: Globe, label: "Aplicaciones", global: true },
  { href: "/superadmin/seguridad", icon: Shield, label: "Seguridad", global: true },
];

interface AppInfo {
  id: string;
  slug: string;
  name: string;
  is_active: boolean;
}

export default function AdminNav({ userRole, userName }: { userRole: string; userName: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [apps, setApps] = useState<AppInfo[]>([]);
  const [activeApp, setActiveApp] = useState<AppInfo | null>(null);
  const [showAppSwitcher, setShowAppSwitcher] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.from("applications").select("id, name, slug, is_active").order("name")
      .then(({ data }) => {
        if (data) {
          setApps(data);
          const stored = localStorage.getItem("blis_active_app_slug");
          const slug = stored || "guau";
          const found = data.find((a: AppInfo) => a.slug === slug);
          setActiveApp(found || data[0] || null);
        }
      });
  }, []);

  const switchApp = (app: AppInfo) => {
    localStorage.setItem("blis_active_app_slug", app.slug);
    setActiveApp(app);
    setShowAppSwitcher(false);
  };

  const isActive = (href: string, exact = false) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <>
      <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-60 bg-white/85 dark:bg-zinc-950/85 backdrop-blur-xl border-r border-zinc-100 dark:border-zinc-800/60 p-4 z-40">
        {/* App Switcher */}
        <div className="relative mb-6">
          <button
            onClick={() => setShowAppSwitcher(!showAppSwitcher)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-primary-50 dark:bg-primary-950/40 border border-primary-100 dark:border-primary-900/50 hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {activeApp?.name?.charAt(0) || "B"}
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-bold text-primary-700 dark:text-primary-300 truncate">
                {activeApp?.name || "Seleccionar app"}
              </p>
              <p className="text-[10px] text-primary-500 dark:text-primary-400">
                Administrador
              </p>
            </div>
            <ChevronDown className="w-4 h-4 text-primary-500 shrink-0" />
          </button>

          {showAppSwitcher && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-lg py-1 z-50">
              {apps.map((app) => (
                <button
                  key={app.id}
                  onClick={() => switchApp(app)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors ${
                    activeApp?.id === app.id
                      ? "bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300"
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                  }`}
                >
                  <div className="w-6 h-6 rounded-md bg-primary-600 flex items-center justify-center text-white text-[10px] font-bold">
                    {app.name.charAt(0)}
                  </div>
                  <span className="font-medium truncate">{app.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1 flex-1 overflow-auto scrollbar-hide">
          {sections.map((item, i) => {
            if ("divider" in item) {
              return <div key={`d-${i}`} className="h-px bg-zinc-100 dark:bg-zinc-800 my-2" />;
            }
            const active = isActive(item.href || "", item.exact);
            return (
              <Link
                key={item.href}
                href={item.href || ""}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? "bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 shadow-sm"
                    : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                }`}
              >
                {item.icon && <item.icon className="w-5 h-5" strokeWidth={active ? 2.5 : 1.8} />}
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-accent-500 flex items-center justify-center text-white text-xs font-bold">
              {userName?.charAt(0)?.toUpperCase() || "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 truncate">{userName}</p>
              <p className="text-[10px] text-accent-600 dark:text-accent-400 capitalize">{userRole}</p>
            </div>
            <Link href="/" className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-950 transition-colors">
              <LogOut className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </aside>

      {/* Mobile: simple overlay when sidebar items are needed */}
    </>
  );
}
