"use client";

import { useState, useEffect } from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import { Edit, Search, X, Save, Clock, Smartphone, Users, UserCheck, UserPlus, TrendingUp, Filter } from "lucide-react";

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
}

type FilterType = "all" | "leads" | "clients";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<FilterType>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ role: "", display_name: "" });

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/users");
    const json = await res.json();
    setUsers(json.data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (id: string) => {
    await fetch("/api/admin/users", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...editForm }),
    });
    setEditingId(null);
    load();
  };

  const roles = ["usuario", "institucion", "admin", "superadmin"];

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
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Gestiona roles, sesiones y aplicaciones</p>
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
                    <th className="text-left px-4 py-3 font-semibold text-zinc-600 dark:text-zinc-400">Rol</th>
                    <th className="text-left px-4 py-3 font-semibold text-zinc-600 dark:text-zinc-400">Tipo</th>
                    <th className="text-left px-4 py-3 font-semibold text-zinc-600 dark:text-zinc-400">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Última sesión
                      </div>
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-zinc-600 dark:text-zinc-400">
                      <div className="flex items-center gap-1">
                        <Smartphone className="w-3.5 h-3.5" /> App
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
                          <span className="font-semibold text-zinc-800 dark:text-zinc-200">{u.display_name || "—"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-zinc-500">{u.email}</td>
                      <td className="px-4 py-3">
                        {editingId === u.id ? (
                          <select
                            value={editForm.role}
                            onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                            className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1 text-xs"
                          >
                            {roles.map((r) => (
                              <option key={r} value={r}>{r}</option>
                            ))}
                          </select>
                        ) : (
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            u.role === "superadmin" ? "bg-accent-100 text-accent-700" :
                            u.role === "admin" ? "bg-primary-100 text-primary-700" :
                            u.role === "institucion" ? "bg-secondary-100 text-secondary-700" :
                            "bg-zinc-100 text-zinc-600"
                          }`}>
                            {u.role}
                          </span>
                        )}
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
                        {u.assigned_app ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-primary-50 text-primary-700">
                            <Smartphone className="w-3 h-3" /> {u.assigned_app.name}
                          </span>
                        ) : u.source_app ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
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
                        {editingId === u.id ? (
                          <div className="flex gap-1">
                            <button onClick={() => handleSave(u.id)}
                              className="p-1.5 rounded-lg bg-primary-100 text-primary-600 hover:bg-primary-200">
                              <Save className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => setEditingId(null)}
                              className="p-1.5 rounded-lg bg-zinc-100 text-zinc-500 hover:bg-zinc-200">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setEditingId(u.id); setEditForm({ role: u.role, display_name: u.display_name }); }}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-primary-600 hover:bg-primary-50"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminGuard>
  );
}
