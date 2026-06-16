"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, GraduationCap, UtensilsCrossed, BadgeCheck,
  DollarSign, Trophy, Image, Syringe, Users,
  Globe, Settings, Shield, ChevronDown, LogOut, Mail, ArrowUpCircle,
  Key, ShoppingCart, Package, Car, ShoppingBag,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

/* ═══════════════════════════ App Info ═══════════════════════ */
interface AppInfo {
  id: string;
  slug: string;
  name: string;
  is_active: boolean;
}

/* ═══════════════════════════ Section Builder ═══════════════════════ */
interface NavItem {
  href?: string;
  icon?: any;
  label?: string;
  exact?: boolean;
  divider?: true;
  appSlug?: string; // only show if user has this app
}

const globalItems: NavItem[] = [
  { href: "/superadmin", icon: LayoutDashboard, label: "Dashboard", exact: true },
  { href: "/superadmin/usuarios", icon: Users, label: "Usuarios" },
  { divider: true },
  { href: "/superadmin/productos", icon: Package, label: "Productos" },
  { href: "/superadmin/compras", icon: ShoppingCart, label: "Compras" },
  { divider: true },
];

const guauItems: NavItem[] = [
  { href: "/superadmin/academia", icon: GraduationCap, label: "Academia", appSlug: "guau" },
  { href: "/superadmin/nutricion", icon: UtensilsCrossed, label: "Nutrición", appSlug: "guau" },
  { href: "/superadmin/vacunas", icon: Syringe, label: "Vacunas", appSlug: "guau" },
  { href: "/superadmin/badges", icon: BadgeCheck, label: "Badges", appSlug: "guau" },
  { href: "/superadmin/desafios", icon: Trophy, label: "Desafíos", appSlug: "guau" },
];

const autoItems: NavItem[] = [
  { href: "/superadmin/vehiculos", icon: Car, label: "Vehículos", appSlug: "auto" },
  { href: "/superadmin/marketplace", icon: ShoppingBag, label: "Marketplace", appSlug: "auto" },
  { href: "/superadmin/proveedores", icon: Package, label: "Proveedores", appSlug: "auto" },
];

const advancedItems: NavItem[] = [
  { href: "/superadmin/planes", icon: DollarSign, label: "Planes" },
  { href: "/superadmin/imagenes", icon: Image, label: "Imágenes" },
  { divider: true },
  { href: "/superadmin/email", icon: Mail, label: "Email" },
  { href: "/superadmin/referidos", icon: ArrowUpCircle, label: "Referidos" },
  { href: "/superadmin/configuracion", icon: Settings, label: "Configuración" },
  { divider: true },
  { href: "/superadmin/seguridad", icon: Shield, label: "Seguridad" },
  { href: "/superadmin/api-keys", icon: Key, label: "Claves API" },
  { divider: true },
  { href: "/superadmin/aplicaciones", icon: Globe, label: "Aplicaciones" },
];

/* ═══════════════════════════ Component ═══════════════════════ */
interface Props {
  userRole: string;
  userName: string;
  userApps: string[];
  adminModules: Record<string, boolean> | null;
}

export default function AdminNav({ userRole, userName, userApps, adminModules }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [apps, setApps] = useState<AppInfo[]>([]);
  const [activeApp, setActiveApp] = useState<AppInfo | null>(null);
  const [showAppSwitcher, setShowAppSwitcher] = useState(false);
  const switcherRef = useRef<HTMLDivElement>(null);

  const isEmpleado = userRole === "empleado";
  const isSuperAdmin = userRole === "superadmin";
  const isAdmin = userRole === "admin" || isSuperAdmin;

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data } = await supabase.from("applications").select("id, name, slug, is_active").order("name");
      if (data) {
        // Si empleado, filtrar solo sus apps
        const filtered = isEmpleado
          ? data.filter((a: AppInfo) => userApps.includes(a.slug))
          : data;
        setApps(filtered);
        let stored = "";
        try { stored = localStorage.getItem("blis_active_app_slug") || ""; } catch {}
        const slug = isEmpleado ? userApps[0] : (stored || "guau");
        const found = filtered.find((a: AppInfo) => a.slug === slug);
        setActiveApp(found || filtered[0] || null);
      }
    };
    load();
  }, []);

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
    router.refresh();
  };

  const isActive = (href: string, exact = false) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  // Construir secciones dinámicamente
  const buildSections = (): NavItem[] => {
    const sections: NavItem[] = [...globalItems];

    // Secciones por app
    if (isEmpleado) {
      const hasGuau = userApps.includes("guau");
      const hasAuto = userApps.includes("auto");
      if (hasGuau) sections.push(...guauItems.filter((i) => !i.appSlug || i.appSlug === "guau"));
      if (hasAuto) sections.push(...autoItems.filter((i) => !i.appSlug || i.appSlug === "auto"));
      sections.push({ divider: true });
    } else {
      // Admin/Superadmin: mostrar todas las secciones de apps
      sections.push(...guauItems);
      sections.push(...autoItems);
      sections.push({ divider: true });
    }

    // Módulos condicionales basados en admin_modules
    const modules = adminModules;
    if (!isEmpleado || modules?.proveedores) {
      // proveedores ya incluido en autoItems
    }

    // Avanzadas: solo admin/superadmin
    if (isAdmin) {
      sections.push(...advancedItems);
    }

    return sections;
  };

  const sections = buildSections();

  return (
    <>
      <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-60 bg-white/85 backdrop-blur-xl border-r border-zinc-100 p-4 z-40">
        {/* App Switcher (oculto para empleado con 1 sola app) */}
        {!isEmpleado || apps.length > 1 ? (
          <div className="relative mb-4" ref={switcherRef}>
            <button
              onClick={() => setShowAppSwitcher(!showAppSwitcher)}
              disabled={isEmpleado}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl border transition-colors cursor-pointer ${
                isEmpleado
                  ? "bg-zinc-50 border-zinc-100 cursor-default"
                  : "bg-primary-50 border-primary-100 hover:bg-primary-100"
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0 ${
                activeApp?.slug === "auto" ? "bg-auto-600" : "bg-primary-600"
              }`}>
                {activeApp?.name?.charAt(0) || "B"}
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-bold text-zinc-700 truncate">
                  {activeApp?.name || "Seleccionar app"}
                </p>
                <p className="text-[10px] text-zinc-400">
                  {activeApp?.slug ? `/${activeApp.slug}` : "Admin"}
                </p>
              </div>
              {!isEmpleado && (
                <ChevronDown className={`w-4 h-4 text-zinc-400 shrink-0 transition-transform ${showAppSwitcher ? "rotate-180" : ""}`} />
              )}
            </button>

            {showAppSwitcher && !isEmpleado && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-2xl border border-zinc-100 shadow-xl py-1 z-50 overflow-hidden">
                {apps.map((app) => (
                  <button
                    key={app.id}
                    onClick={() => switchApp(app)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors ${
                      activeApp?.id === app.id ? "bg-primary-50 text-primary-700 font-bold" : "text-zinc-600 hover:bg-zinc-50"
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center text-white text-[10px] font-bold ${
                      app.slug === "auto" ? "bg-auto-600" : "bg-primary-600"
                    }`}>
                      {app.name.charAt(0)}
                    </div>
                    <span className="font-medium truncate">{app.name}</span>
                    {activeApp?.id === app.id && (
                      <span className="ml-auto w-2 h-2 rounded-full bg-primary-500" />
                    )}
                  </button>
                ))}
                <div className="border-t border-zinc-100 mt-1 pt-1 px-3 pb-2">
                  <Link href="/superadmin/aplicaciones" onClick={() => setShowAppSwitcher(false)}
                    className="flex items-center gap-2 text-xs text-primary-600 font-semibold hover:underline">
                    <Globe className="w-3 h-3" /> Gestionar aplicaciones
                  </Link>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="mb-4 px-3 py-2">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold mb-1 ${
              activeApp?.slug === "auto" ? "bg-auto-600" : "bg-primary-600"
            }`}>
              {activeApp?.name?.charAt(0) || "B"}
            </div>
            <p className="text-xs font-bold text-zinc-700">{activeApp?.name}</p>
            <p className="text-[10px] text-zinc-400">Panel de administración</p>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex flex-col gap-1 flex-1 overflow-auto scrollbar-hide">
          {sections.map((item, i) => {
            if (item.divider) return <div key={`d-${i}`} className="h-px bg-zinc-100 my-2" />;
            const active = isActive(item.href || "", item.exact);
            return (
              <Link
                key={item.href}
                href={item.href || ""}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active ? "bg-primary-50 text-primary-700 shadow-sm" : "text-zinc-500 hover:bg-zinc-50"
                }`}
              >
                {item.icon && <item.icon className="w-5 h-5" strokeWidth={active ? 2.5 : 1.8} />}
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="mt-3 pt-3 border-t border-zinc-100">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
              isEmpleado ? "bg-auto-600" : "bg-accent-500"
            }`}>
              {userName?.charAt(0)?.toUpperCase() || "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-zinc-700 truncate">{userName}</p>
              <p className="text-[10px] text-accent-600 capitalize">{userRole}</p>
            </div>
            <Link href="/" className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-danger-500 hover:bg-danger-50 transition-colors">
              <LogOut className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
