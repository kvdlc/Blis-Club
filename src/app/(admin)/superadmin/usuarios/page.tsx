"use client";

import { useState, useEffect } from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import { Plus, Edit, Trash2, Search, X, Save } from "lucide-react";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
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

  const filtered = users.filter((u) =>
    !search ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.display_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminGuard>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white">Usuarios</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Gestiona roles y permisos</p>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o email..."
            className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
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
