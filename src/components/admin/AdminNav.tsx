"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, GraduationCap, UtensilsCrossed, BadgeCheck,
  DollarSign, Trophy, Image, Syringe, Users,
  Globe, Settings, Shield, ChevronDown, LogOut, Mail, ArrowUpCircle,
  Key, ShoppingCart, Package,
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
  { href: "/superadmin/productos", icon: Package, label: "Productos" },
  { href: "/superadmin/compras", icon: ShoppingCart, label: "Compras" },
  { href: "/superadmin/desafios", icon: Trophy, label: "Desafíos" },
  { href: "/superadmin/imagenes", icon: Image, label: "Imágenes" },
  { divider: true },
  { href: "/superadmin/email", icon: Mail, label: "Email" },
  { href: "/superadmin/referidos", icon: ArrowUpCircle, label: "Referidos" },
  { href: "/superadmin/configuracion", icon: Settings, label: "Configuración" },
  { href: "/superadmin/seguridad", icon: Shield, label: "Seguridad" },
  { href: "/superadmin/api-keys", icon: Key, label: "Claves API" },
  { divider: true },
  { href: "/superadmin/aplicaciones", icon: Globe, label: "Aplicaciones", global: true },
];

interface AppInfo {
  id: string;
  slug: string;
  name: string;
  is_active: boolean;
}

export default function AdminNav({ userRole, userName }: { userRole: string; userName: string }) {
  const pathname = usePathname();
  const [apps, setApps] = useState<AppInfo[]>([]);
  const [activeApp, setActiveApp] = useState<AppInfo | null>(null);
  const [showAppSwitcher, setShowAppSwitcher] = useState(false);
  const switcherRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data } = await supabase.from("applications").select("id, name, slug, is_active").order("name");
      if (data) {
        setApps(data);
        let stored = "";
        try { stored = localStorage.getItem("blis_active_app_slug") || ""; } catch {}
        const slug = stored || "guau";
        const found = data.find((a: AppInfo) => a.slug === slug);
        setActiveApp(found || data[0] || null);
      }
    };
    load();
  }, []);

  // Click outside to close
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (switcherRef.current && !switcherRef.current.contains(e.target as Node)) {
        setShowAppSwitcher(false);
      }
    };
    if (showAppSwitcher) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showAppSwitcher]);

  const switchApp = (app: AppInfo) => {
    try { localStorage.setItem("blis_active_app_slug", app.slug); } catch {}
    setActiveApp(app);
    setShowAppSwitcher(false);
    window.location.reload();
  };

  const isActive = (href: string, exact = false) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <>
      <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-60 bg-white/85 dark:bg-zinc-950/85 backdrop-blur-xl border-r border-zinc-100 dark:border-zinc-800/60 p-4 z-40">
        {/* App Switcher */}
        <div className="relative mb-6" ref={switcherRef}>
          <button
            onClick={() => setShowAppSwitcher(!showAppSwitcher)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-primary-50 dark:bg-primary-950/40 border border-primary-100 dark:border-primary-900/50 hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {activeApp?.name?.charAt(0) || "B"}
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-bold text-primary-700 dark:text-primary-300 truncate">
                {activeApp?.name || "Seleccionar app"}
              </p>
              <p className="text-[10px] text-primary-500 dark:text-primary-400">
                {activeApp?.slug ? `/${activeApp.slug}` : "Admin"}
              </p>
            </div>
            <ChevronDown className={`w-4 h-4 text-primary-500 shrink-0 transition-transform ${showAppSwitcher ? "rotate-180" : ""}`} />
          </button>

          {showAppSwitcher && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-xl py-1 z-50 overflow-hidden">
              {apps.map((app) => (
                <button
                  key={app.id}
                  onClick={() => switchApp(app)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors ${
                    activeApp?.id === app.id
                      ? "bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 font-bold"
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                  }`}
                >
                  <div className="w-6 h-6 rounded-md bg-primary-600 flex items-center justify-center text-white text-[10px] font-bold">
                    {app.name.charAt(0)}
                  </div>
                  <span className="font-medium truncate">{app.name}</span>
                  {activeApp?.id === app.id && (
                    <span className="ml-auto w-2 h-2 rounded-full bg-primary-500" />
                  )}
                </button>
              ))}
              <div className="border-t border-zinc-100 dark:border-zinc-800 mt-1 pt-1 px-3 pb-2">
                <Link href="/superadmin/aplicaciones" onClick={() => setShowAppSwitcher(false)}
                  className="flex items-center gap-2 text-xs text-primary-600 dark:text-primary-400 font-semibold hover:underline">
                  <Globe className="w-3 h-3" /> Gestionar aplicaciones
                </Link>
              </div>
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
    </>
  );
}
