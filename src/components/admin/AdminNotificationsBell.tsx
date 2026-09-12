"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Bell, Check, ExternalLink, Loader2, RefreshCw, UserPlus, X } from "lucide-react";
import { APP_LABELS, type AdminFeed } from "@/lib/admin-notifications-shared";

function relTime(iso: string, now: number): string {
  const diff = now - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "ahora";
  if (m < 60) return `hace ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `hace ${d} d`;
  return new Date(iso).toLocaleDateString("es-PE", { day: "numeric", month: "short" });
}

export function AdminNotificationsBell({ feed, dark = true }: { feed: AdminFeed | null; dark?: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [now, setNow] = useState<number | null>(null);
  const [marking, setMarking] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => setNow(Date.now()), []);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  if (!feed) return null;

  const { notifications, unreadCount, totals } = feed;

  const markRead = async () => {
    if (marking) return;
    setMarking(true);
    try {
      await createClient().rpc("admin_mark_notifications_read");
      router.refresh();
    } catch {
      /* noop */
    }
    setMarking(false);
  };

  const refresh = () => {
    setRefreshing(true);
    router.refresh();
    setTimeout(() => setRefreshing(false), 800);
  };

  const btnCls = dark
    ? "bg-white/5 border border-white/10 text-zinc-300 hover:bg-white/10 hover:text-white"
    : "bg-white/80 border border-zinc-200 text-zinc-600 hover:bg-white";

  const panelCls = dark
    ? "bg-[#0e1428]/95 border border-white/10 text-zinc-200"
    : "bg-white border border-zinc-200 text-zinc-800";

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notificaciones de registros"
        className={`relative w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 ${btnCls}`}
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center tabular-nums">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className={`absolute right-0 top-full mt-2 w-[340px] max-w-[88vw] rounded-2xl shadow-2xl z-50 overflow-hidden backdrop-blur-md ${panelCls}`}>
          {/* Header */}
          <div className={`px-4 py-3 border-b ${dark ? "border-white/10" : "border-zinc-100"}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className={`w-4 h-4 ${dark ? "text-emerald-400" : "text-emerald-600"}`} />
                <span className="text-sm font-extrabold">Nuevos registros</span>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={refresh} title="Actualizar" className={`w-7 h-7 rounded-lg flex items-center justify-center ${dark ? "hover:bg-white/10" : "hover:bg-zinc-100"}`}>
                  <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
                </button>
                <button onClick={() => setOpen(false)} title="Cerrar" className={`w-7 h-7 rounded-lg flex items-center justify-center ${dark ? "hover:bg-white/10" : "hover:bg-zinc-100"}`}>
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-2">
              <div>
                <p className={`text-2xl font-black tabular-nums ${dark ? "text-zinc-50" : "text-zinc-900"}`}>{totals.total}</p>
                <p className={`text-[10px] font-semibold uppercase tracking-wide ${dark ? "text-zinc-500" : "text-zinc-400"}`}>Usuarios</p>
              </div>
              <div className="flex flex-wrap gap-1.5 flex-1">
                {totals.byApp.map((a) => {
                  const info = APP_LABELS[a.app_slug];
                  return (
                    <span
                      key={a.app_slug}
                      className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ color: info?.color || "#a1a1aa", background: `${info?.color || "#a1a1aa"}1f` }}
                    >
                      {info?.name || a.app_slug}: {a.count}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Lista */}
          <div className="max-h-[52vh] overflow-y-auto">
            {notifications.length === 0 && (
              <p className={`text-center text-xs py-8 ${dark ? "text-zinc-500" : "text-zinc-400"}`}>Sin registros todavía</p>
            )}
            {notifications.map((n) => {
              const info = n.app_slug ? APP_LABELS[n.app_slug] : null;
              const name = [n.first_name, n.last_name].filter(Boolean).join(" ").trim() || n.email || "Usuario";
              return (
                <Link
                  key={n.id}
                  href={n.user_id ? `/superadmin/usuarios?user=${n.user_id}` : "/superadmin/usuarios"}
                  onClick={() => setOpen(false)}
                  className={`flex items-start gap-3 px-4 py-3 transition-colors ${dark ? "hover:bg-white/[0.06]" : "hover:bg-zinc-50"} ${n.read ? "" : dark ? "bg-emerald-500/[0.06]" : "bg-emerald-50/60"}`}
                >
                  <span
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-black shrink-0 text-white"
                    style={{ background: info?.color || "#71717a" }}
                  >
                    {name.charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />}
                      <p className="text-xs font-bold truncate">{name}</p>
                    </div>
                    <p className={`text-[10px] truncate ${dark ? "text-zinc-400" : "text-zinc-500"}`}>{n.email}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {info && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ color: info.color, background: `${info.color}1f` }}>
                          {info.name}
                        </span>
                      )}
                      <span className={`text-[9px] ${dark ? "text-zinc-500" : "text-zinc-400"}`}>{now ? relTime(n.created_at, now) : ""}</span>
                    </div>
                  </div>
                  <ExternalLink className={`w-3.5 h-3.5 shrink-0 mt-1 ${dark ? "text-zinc-600" : "text-zinc-300"}`} />
                </Link>
              );
            })}
          </div>

          {/* Footer */}
          <div className={`px-4 py-3 border-t flex items-center justify-between gap-2 ${dark ? "border-white/10" : "border-zinc-100"}`}>
            <button
              onClick={markRead}
              disabled={marking || unreadCount === 0}
              className={`flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-40 ${
                dark ? "bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              }`}
            >
              {marking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Marcar leídas
            </button>
            <Link
              href="/superadmin/usuarios"
              onClick={() => setOpen(false)}
              className={`text-[11px] font-bold px-2.5 py-1.5 rounded-lg transition-colors ${dark ? "text-zinc-300 hover:bg-white/10" : "text-zinc-600 hover:bg-zinc-100"}`}
            >
              Ver usuarios →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
