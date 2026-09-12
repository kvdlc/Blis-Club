"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, GraduationCap, UtensilsCrossed, BadgeCheck,
  DollarSign, Trophy, Image, Syringe, Users,
  Globe, Settings, Shield, ChevronDown, LogOut, Mail, ArrowUpCircle,
  Key, ShoppingCart, Package, Car, ShoppingBag, Database, Coins, Menu, X,
} from "lucide-react";
import { getActiveAppSlug, setActiveAppSlug } from "@/lib/active-app";

/* ═══════════════════════════ App Info ═══════════════════════ */
interface AppInfo {
  id: string;
  slug: string;
  name: string;
  is_active: boolean;
}

interface NavItem {
  href?: string;
  icon?: any;
  label?: string;
  exact?: boolean;
  divider?: true;
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
  { href: "/superadmin/academia", icon: GraduationCap, label: "Academia" },
  { href: "/superadmin/nutricion", icon: UtensilsCrossed, label: "Nutrición" },
  { href: "/superadmin/vacunas", icon: Syringe, label: "Vacunas" },
  { href: "/superadmin/badges", icon: BadgeCheck, label: "Badges" },
  { href: "/superadmin/desafios", icon: Trophy, label: "Desafíos" },
];

const autoItems: NavItem[] = [
  { href: "/superadmin/vehiculos", icon: Car, label: "Vehículos" },
  { href: "/superadmin/marketplace", icon: ShoppingBag, label: "Marketplace" },
  { href: "/superadmin/proveedores", icon: Package, label: "Proveedores" },
  { href: "/superadmin/catalogo-vehiculos", icon: Database, label: "Catálogo" },
];

const advancedItems: NavItem[] = [
  { href: "/superadmin/planes", icon: DollarSign, label: "Planes" },
  { href: "/superadmin/monedas", icon: Coins, label: "Monedas" },
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

const APP_ITEMS: Record<string, NavItem[]> = {
  guau: guauItems,
  auto: autoItems,
  Spartan: [],
};

interface Props {
  userRole: string;
  userName: string;
  userApps: string[];
  adminModules: Record<string, boolean> | null;
}

export default function AdminNav({ userRole, userName, userApps }: Props) {
  const pathname = usePathname();
  const [apps, setApps] = useState<AppInfo[]>([]);
  const [activeApp, setActiveApp] = useState<AppInfo | null>(null);
  const [showAppSwitcher, setShowAppSwitcher] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const switcherRef = useRef<HTMLDivElement>(null);

  const isEmpleado = userRole === "empleado";
  const isSuperAdmin = userRole === "superadmin";
  const isAdmin = userRole === "admin" || isSuperAdmin;

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/admin/applications");
      const json = await res.json().catch(() => ({}));
      const data: AppInfo[] = json.data || [];
      const filtered = isEmpleado
        ? data.filter((a) => userApps.includes(a.slug))
        : data;
      setApps(filtered);
      const stored = getActiveAppSlug();
      const slug = isEmpleado ? userApps[0] : stored;
      const found = filtered.find((a) => a.slug === slug);
      setActiveApp(found || filtered[0] || null);
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Cerrar el drawer móvil al cambiar de ruta
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const switchApp = (app: AppInfo) => {
    setActiveAppSlug(app.slug);
    setActiveApp(app);
    setShowAppSwitcher(false);
    setMobileOpen(false);
    // Recarga completa para que todas las páginas tomen la nueva app
    window.location.assign(window.location.pathname + window.location.search);
  };

  const isActive = (href: string, exact = false) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  const buildSections = (): NavItem[] => {
    const sections: NavItem[] = [...globalItems];
    const slug = activeApp?.slug;

    if (isEmpleado) {
      if (userApps.includes("guau")) sections.push(...guauItems);
      if (userApps.includes("auto")) sections.push(...autoItems);
      sections.push({ divider: true });
    } else {
      // Admin/superadmin: solo las secciones de la app activa
      if (slug && APP_ITEMS[slug]) sections.push(...APP_ITEMS[slug]);
      sections.push({ divider: true });
    }

    if (isAdmin) sections.push(...advancedItems);
    return sections;
  };

  const sections = buildSections();

  const renderNav = () => (
    <nav className="flex flex-col gap-1 flex-1 overflow-auto scrollbar-hide">
      {sections.map((item, i) => {
        if (item.divider) return <div key={`d-${i}`} className="h-px bg-zinc-100 my-2" />;
        const active = isActive(item.href || "", item.exact);
        return (
          <Link
            key={item.href}
            href={item.href || ""}
            onClick={() => setMobileOpen(false)}
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
  );

  const appSwitcher = (
    <div className="relative" ref={switcherRef}>
      <button
        onClick={() => setShowAppSwitcher(!showAppSwitcher)}
        disabled={isEmpleado}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl border transition-colors ${
          isEmpleado ? "bg-zinc-50 border-zinc-100 cursor-default" : "bg-primary-50 border-primary-100 hover:bg-primary-100"
        }`}
      >
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0 ${
          activeApp?.slug === "auto" ? "bg-auto-600" : activeApp?.slug === "Spartan" ? "bg-spartan-600" : "bg-primary-600"
        }`}>
          {activeApp?.name?.charAt(0) || "B"}
        </div>
        <div className="flex-1 text-left min-w-0">
          <p className="text-sm font-bold text-zinc-700 truncate">{activeApp?.name || "Seleccionar app"}</p>
          <p className="text-[10px] text-zinc-400">{activeApp?.slug ? `/${activeApp.slug}` : "Admin"}</p>
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
                app.slug === "auto" ? "bg-auto-600" : app.slug === "Spartan" ? "bg-spartan-600" : "bg-primary-600"
              }`}>
                {app.name.charAt(0)}
              </div>
              <span className="font-medium truncate">{app.name}</span>
              {activeApp?.id === app.id && <span className="ml-auto w-2 h-2 rounded-full bg-primary-500" />}
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
  );

  return (
    <>
      {/* ═══ Desktop sidebar ═══ */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-60 bg-white/85 backdrop-blur-xl border-r border-zinc-100 p-4 z-40">
        {(!isEmpleado || apps.length > 1) ? (
          <div className="mb-4">{appSwitcher}</div>
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

        {renderNav()}

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

      {/* ═══ Mobile top bar ═══ */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-xl border-b border-zinc-100 px-4 h-14 flex items-center justify-between">
        <button onClick={() => setMobileOpen(true)} className="w-9 h-9 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-700">
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold ${
            activeApp?.slug === "auto" ? "bg-auto-600" : activeApp?.slug === "Spartan" ? "bg-spartan-600" : "bg-primary-600"
          }`}>
            {activeApp?.name?.charAt(0) || "B"}
          </div>
          <span className="text-sm font-bold text-zinc-800">{activeApp?.name || "Admin"}</span>
        </div>
        <Link href="/" className="w-9 h-9 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-500">
          <LogOut className="w-4 h-4" />
        </Link>
      </div>

      {/* ═══ Mobile drawer ═══ */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 max-w-[85vw] bg-white p-4 flex flex-col overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-extrabold text-zinc-800">Menú</span>
              <button onClick={() => setMobileOpen(false)} className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-500">
                <X className="w-4 h-4" />
              </button>
            </div>
            {(!isEmpleado || apps.length > 1) && <div className="mb-4">{appSwitcher}</div>}
            {renderNav()}
          </div>
        </div>
      )}
    </>
  );
}
