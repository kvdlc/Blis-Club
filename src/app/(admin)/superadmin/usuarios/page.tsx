"use client";

import { useState, useEffect } from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import { Settings, Search, X, Clock, Smartphone, Users, UserCheck, UserPlus, TrendingUp, Filter, Ban, CreditCard, History, Save } from "lucide-react";

interface User {
  id: string;
  email: string;
  display_name: string;
  role: string;
  avatar_url: string;
  created_at: string;
  is_lead: boolean;
  source_app: string | null;
  last_sign_in_at: string | null;
  assigned_app: { name: string; slug: string } | null;
  plan_type: string;
  subscription_status: string;
  expires_at: string | null;
  current_period_end: string | null;
}

interface SubscriptionData {
  id: string;
  status: string;
  plan_type: string;
  current_period_start: string | null;
  current_period_end: string | null;
  expires_at: string | null;
  created_at: string;
}

type FilterType = "all" | "leads" | "clients";

function getDaysRemaining(endDate: string | null): { text: string; expired: boolean } {
  if (!endDate) return { text: "", expired: false };
  const end = new Date(endDate).getTime();
  const now = Date.now();
  const daysLeft = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  if (daysLeft <= 0) return { text: "Expirado", expired: true };
  if (daysLeft > 30) {
    const months = Math.floor(daysLeft / 30);
    const days = daysLeft % 30;
    return { text: `${months}m · ${days}d`, expired: false };
  }
  return { text: `${daysLeft}`, expired: false };
}

function planBadge(planType: string, status: string, expiresAt: string | null, currentPeriodEnd: string | null) {
  const colors: Record<string, string> = {
    premium: "bg-emerald-100 text-emerald-700",
    temporal: "bg-amber-100 text-amber-700",
    permanente: "bg-blue-100 text-blue-700",
  };
  const labels: Record<string, string> = {
    premium: "Premium",
    temporal: "Temporal",
    permanente: "Permanente",
  };

  const endDate = planType === "temporal" ? expiresAt : currentPeriodEnd;
  const { text: remaining, expired } = getDaysRemaining(endDate);
  const isActive = status === "active" && !expired;

  const color = colors[planType] || "bg-zinc-100 text-zinc-600";
  const label = labels[planType] || planType;

  return (
    <div className="flex flex-col gap-0.5">
      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${color}`}>
        {label}
        {remaining && remaining !== "Ilimitado" ? ` · ${remaining}` : remaining === "Ilimitado" ? ` · ${remaining}` : ""}
      </span>
      <span className={`text-[10px] font-semibold ${isActive ? "text-emerald-600" : "text-red-500"}`}>
        {isActive ? "Activo" : "Inactivo"}
      </span>
    </div>
  );
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<FilterType>("all");
  const [manageUser, setManageUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [subLoading, setSubLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [editRole, setEditRole] = useState("");
  const [roleSaving, setRoleSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/users");
    const json = await res.json();
    setUsers(json.data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openManage = async (u: User) => {
    setManageUser(u);
    setEditRole(u.role);
    setSubLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${u.id}/subscription`);
      if (res.ok) {
        const json = await res.json();
        setSubscription(json.subscription || null);
      } else {
        setSubscription(null);
      }
    } catch {
      setSubscription(null);
    }
    setSubLoading(false);
  };

  const saveRole = async () => {
    if (!manageUser || editRole === manageUser.role) return;
    setRoleSaving(true);
    await fetch("/api/admin/users", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: manageUser.id, role: editRole }),
    });
    setRoleSaving(false);
    setManageUser({ ...manageUser, role: editRole });
    load();
  };

  const updatePlan = async (updates: Partial<SubscriptionData>) => {
    if (!manageUser) return;
    setActionLoading(true);
    const res = await fetch(`/api/admin/users/${manageUser.id}/subscription`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (res.ok) {
      const json = await res.json();
      setSubscription(json.subscription || null);
      load();
    }
    setActionLoading(false);
  };

  const toggleSuspend = async () => {
    if (!manageUser) return;
    setActionLoading(true);
    const isSuspended = manageUser.role === "suspended";
    await fetch(`/api/admin/users/${manageUser.id}/suspend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: isSuspended ? "reactivate" : "suspend" }),
    });
    setActionLoading(false);
    load();
    setManageUser({ ...manageUser, role: isSuspended ? "usuario" : "suspended" });
  };

  const roles = ["usuario", "institucion", "admin", "superadmin", "suspended"];

  const totalUsers = users.length;
  const totalLeads = users.filter((u) => u.is_lead).length;
  const totalClients = users.filter((u) => !u.is_lead).length;
  const conversionRate = totalUsers > 0 ? Math.round((totalClients / totalUsers) * 100) : 0;

  const filtered = users.filter((u) => {
    const matchesSearch = !search ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.display_name?.toLowerCase().includes(search.toLowerCase());

    const matchesType = typeFilter === "all" ? true :
      typeFilter === "leads" ? u.is_lead :
      !u.is_lead;

    return matchesSearch && matchesType;
  });

  const formatLastSignIn = (date: string | null) => {
    if (!date) return <span className="text-zinc-400 text-xs">—</span>;
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return <span className="text-emerald-600 text-xs font-semibold">Ahora</span>;
    if (diffMins < 60) return <span className="text-emerald-600 text-xs font-semibold">Hace {diffMins}m</span>;
    if (diffHours < 24) return <span className="text-emerald-600 text-xs">Hace {diffHours}h</span>;
    if (diffDays < 7) return <span className="text-zinc-500 text-xs">Hace {diffDays}d</span>;
    return <span className="text-zinc-400 text-xs">{d.toLocaleDateString()}</span>;
  };

  return (
    <AdminGuard>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white">Usuarios</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Gestiona roles, suscripciones y aplicaciones</p>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="card-soft rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-lg font-extrabold text-zinc-800">{totalUsers}</p>
              <p className="text-[10px] text-zinc-500 font-semibold uppercase">Total</p>
            </div>
          </div>
          <div className="card-soft rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <p className="text-lg font-extrabold text-zinc-800">{totalLeads}</p>
              <p className="text-[10px] text-zinc-500 font-semibold uppercase">Leads</p>
            </div>
          </div>
          <div className="card-soft rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-lg font-extrabold text-zinc-800">{totalClients}</p>
              <p className="text-[10px] text-zinc-500 font-semibold uppercase">Clientes</p>
            </div>
          </div>
          <div className="card-soft rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-100 text-accent-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-lg font-extrabold text-zinc-800">{conversionRate}%</p>
              <p className="text-[10px] text-zinc-500 font-semibold uppercase">Conversión</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre o email..."
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as FilterType)}
              className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 pl-10 pr-8 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 appearance-none cursor-pointer"
            >
              <option value="all">Todos</option>
              <option value="leads">Leads</option>
              <option value="clients">Clientes</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-zinc-500">Cargando...</div>
        ) : (
          <div className="card-soft rounded-[1.25rem] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-100 dark:border-zinc-800">
                    <th className="text-left px-4 py-3 font-semibold text-zinc-600 dark:text-zinc-400">Usuario</th>
                    <th className="text-left px-4 py-3 font-semibold text-zinc-600 dark:text-zinc-400">Email</th>
                    <th className="text-left px-4 py-3 font-semibold text-zinc-600 dark:text-zinc-400">Plan</th>
                    <th className="text-left px-4 py-3 font-semibold text-zinc-600 dark:text-zinc-400">Tipo</th>
                    <th className="text-left px-4 py-3 font-semibold text-zinc-600 dark:text-zinc-400">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Última sesión
                      </div>
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-zinc-600 dark:text-zinc-400">
                      <div className="flex items-center gap-1">
                        <Smartphone className="w-3.5 h-3.5" /> Origen
                      </div>
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-zinc-600 dark:text-zinc-400">Registro</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u) => (
                    <tr key={u.id} className="border-b border-zinc-50 dark:border-zinc-900 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-zinc-500 text-xs font-bold">
                            {(u.display_name || u.email || "?").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-semibold text-zinc-800 dark:text-zinc-200 block">{u.display_name || "—"}</span>
                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                              u.role === "superadmin" ? "bg-accent-100 text-accent-700" :
                              u.role === "admin" ? "bg-primary-100 text-primary-700" :
                              u.role === "institucion" ? "bg-secondary-100 text-secondary-700" :
                              u.role === "suspended" ? "bg-red-100 text-red-700" :
                              "bg-zinc-100 text-zinc-600"
                            }`}>
                              {u.role}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-zinc-500">{u.email}</td>
                      <td className="px-4 py-3">
                        {planBadge(u.plan_type, u.subscription_status, u.expires_at, u.current_period_end)}
                      </td>
                      <td className="px-4 py-3">
                        {u.is_lead ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
                            <UserPlus className="w-3 h-3" /> Lead
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                            <UserCheck className="w-3 h-3" /> Cliente
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {formatLastSignIn(u.last_sign_in_at)}
                      </td>
                      <td className="px-4 py-3">
                        {u.source_app ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                            <Smartphone className="w-3 h-3" /> {u.source_app}
                          </span>
                        ) : (
                          <span className="text-xs text-zinc-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-zinc-400">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => openManage(u)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-primary-600 hover:bg-primary-50"
                          title="Gestionar usuario"
                        >
                          <Settings className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal de gestión de usuario */}
        {manageUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Gestionar usuario</h2>
                  <button onClick={() => { setManageUser(null); setSubscription(null); }} className="p-2 hover:bg-zinc-100 rounded-lg">
                    <X className="w-5 h-5 text-zinc-500" />
                  </button>
                </div>

                {/* Info del usuario */}
                <div className="flex items-center gap-3 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-zinc-500 text-sm font-bold">
                    {(manageUser.display_name || manageUser.email || "?").charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">{manageUser.display_name || "—"}</p>
                    <p className="text-xs text-zinc-500 truncate">{manageUser.email}</p>
                  </div>
                  {manageUser.is_lead ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
                      <UserPlus className="w-3 h-3" /> Lead
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                      <UserCheck className="w-3 h-3" /> Cliente
                    </span>
                  )}
                </div>

                {/* Cambiar rol */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Rol</label>
                  <div className="flex gap-2">
                    <select
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value)}
                      className="flex-1 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    >
                      {roles.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                    <button
                      onClick={saveRole}
                      disabled={roleSaving || editRole === manageUser.role}
                      className="px-4 py-2.5 rounded-xl bg-primary-100 text-primary-700 hover:bg-primary-200 text-sm font-semibold disabled:opacity-40 transition-colors"
                    >
                      {roleSaving ? "..." : <Save className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Suscripción */}
                {subLoading ? (
                  <div className="text-center py-8 text-zinc-500">Cargando suscripción...</div>
                ) : subscription ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Plan</span>
                      {planBadge(subscription.plan_type, subscription.status, subscription.expires_at, subscription.current_period_end)}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Estado</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        subscription.status === "active" && !getDaysRemaining(
                          subscription.plan_type === "temporal" ? subscription.expires_at : subscription.current_period_end
                        ).expired ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                      }`}>
                        {subscription.status === "active" && !getDaysRemaining(
                          subscription.plan_type === "temporal" ? subscription.expires_at : subscription.current_period_end
                        ).expired ? "Activo" : "Inactivo"}
                      </span>
                    </div>

                    {subscription.expires_at && subscription.plan_type === "temporal" && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Expira</span>
                        <span className="text-sm text-zinc-800">{new Date(subscription.expires_at).toLocaleDateString()}</span>
                      </div>
                    )}
                    {subscription.current_period_end && subscription.plan_type !== "temporal" && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Próximo pago</span>
                        <span className="text-sm text-zinc-800">{new Date(subscription.current_period_end).toLocaleDateString()}</span>
                      </div>
                    )}

                    <hr className="border-zinc-100 dark:border-zinc-800" />

                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Cambiar plan</label>
                      <div className="grid grid-cols-3 gap-2">
                        {(["temporal", "premium", "permanente"] as const).map((plan) => (
                          <button
                            key={plan}
                            onClick={() => updatePlan({ plan_type: plan, status: "active" })}
                            disabled={actionLoading || subscription.plan_type === plan}
                            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                              subscription.plan_type === plan
                                ? "bg-zinc-100 text-zinc-400 border-zinc-200 cursor-not-allowed"
                                : plan === "premium"
                                ? "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                                : plan === "temporal"
                                ? "border-amber-200 text-amber-700 hover:bg-amber-50"
                                : "border-blue-200 text-blue-700 hover:bg-blue-50"
                            }`}
                          >
                            {plan === "premium" ? "Premium" : plan === "temporal" ? "Temporal" : "Permanente"}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => updatePlan({ status: "canceled" })}
                        disabled={actionLoading || subscription.status === "canceled"}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-red-200 text-red-700 hover:bg-red-50 disabled:opacity-40"
                      >
                        <Ban className="w-4 h-4" /> Cancelar
                      </button>
                      <button
                        onClick={toggleSuspend}
                        disabled={actionLoading}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-zinc-200 text-zinc-700 hover:bg-zinc-50 disabled:opacity-40"
                      >
                        <Ban className="w-4 h-4" /> {manageUser.role === "suspended" ? "Reactivar" : "Suspender"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-zinc-500">
                    <CreditCard className="w-10 h-10 mx-auto mb-3 text-zinc-300" />
                    <p className="text-sm">Sin suscripción activa</p>
                    <div className="grid grid-cols-3 gap-2 mt-4">
                      {(["temporal", "premium", "permanente"] as const).map((plan) => (
                        <button
                          key={plan}
                          onClick={() => updatePlan({ plan_type: plan, status: "active" })}
                          disabled={actionLoading}
                          className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                            plan === "premium"
                              ? "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                              : plan === "temporal"
                              ? "border-amber-200 text-amber-700 hover:bg-amber-50"
                              : "border-blue-200 text-blue-700 hover:bg-blue-50"
                          }`}
                        >
                          {plan === "premium" ? "Premium" : plan === "temporal" ? "Temporal" : "Permanente"}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  <a
                    href={`/superadmin/compras?userId=${manageUser.id}`}
                    className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-semibold bg-zinc-100 text-zinc-700 hover:bg-zinc-200 transition-colors"
                  >
                    <History className="w-4 h-4" /> Ver historial de pagos
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminGuard>
  );
}
