"use client";

import { useState, useEffect } from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import { DollarSign, Check, X } from "lucide-react";

interface WithdrawalRequest {
  id: string;
  user_id: string;
  amount_usd: number;
  method: string;
  status: string;
  admin_notes: string;
  created_at: string;
  profiles?: { email: string; display_name: string } | null;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-warning-100 text-warning-700",
  completed: "bg-secondary-100 text-secondary-700",
  rejected: "bg-danger-100 text-danger-700",
};

export default function ReferidosPage() {
  const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState<Record<string, boolean>>({});

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/referral-payments");
    const json = await res.json();
    setRequests(json.data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleAction = async (id: string, status: "completed" | "rejected") => {
    if (!confirm(`¿Marcar esta solicitud como "${status}"?`)) return;
    setProcessing((p) => ({ ...p, [id]: true }));
    await fetch("/api/admin/referral-payments", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status, admin_notes: adminNotes[id] || "" }),
    });
    setProcessing((p) => ({ ...p, [id]: false }));
    load();
  };

  const formatDate = (d: string) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <AdminGuard>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white">Pagos por Referidos</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Gestiona solicitudes de retiro de comisiones</p>
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
                    <th className="text-left px-4 py-3 font-semibold text-zinc-600 dark:text-zinc-400">Monto</th>
                    <th className="text-left px-4 py-3 font-semibold text-zinc-600 dark:text-zinc-400">Método</th>
                    <th className="text-left px-4 py-3 font-semibold text-zinc-600 dark:text-zinc-400">Estado</th>
                    <th className="text-left px-4 py-3 font-semibold text-zinc-600 dark:text-zinc-400">Fecha</th>
                    <th className="text-left px-4 py-3 font-semibold text-zinc-600 dark:text-zinc-400">Notas</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {requests.map((r) => (
                    <tr key={r.id} className="border-b border-zinc-50 dark:border-zinc-900 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-accent-100 dark:bg-accent-950 flex items-center justify-center text-accent-600">
                            <DollarSign className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-semibold text-zinc-800 dark:text-zinc-200 text-sm">{r.profiles?.display_name || r.profiles?.email || r.user_id}</p>
                            <p className="text-xs text-zinc-400">{r.profiles?.email || "—"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-zinc-800 dark:text-zinc-200">
                        ${Number(r.amount_usd).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-zinc-500">{r.method || "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[r.status] || "bg-zinc-100 text-zinc-600"}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-zinc-400">{formatDate(r.created_at)}</td>
                      <td className="px-4 py-3">
                        <input
                          value={adminNotes[r.id] || ""}
                          onChange={(e) => setAdminNotes({ ...adminNotes, [r.id]: e.target.value })}
                          placeholder={r.admin_notes || "Notas admin..."}
                          className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1 text-xs min-w-[120px] focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                        />
                      </td>
                      <td className="px-4 py-3">
                        {r.status === "pending" ? (
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleAction(r.id, "completed")}
                              disabled={processing[r.id]}
                              className="p-1.5 rounded-lg bg-secondary-100 text-secondary-600 hover:bg-secondary-200 disabled:opacity-50"
                              title="Marcar Completado"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleAction(r.id, "rejected")}
                              disabled={processing[r.id]}
                              className="p-1.5 rounded-lg bg-danger-100 text-danger-600 hover:bg-danger-200 disabled:opacity-50"
                              title="Rechazar"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-zinc-400">{r.status}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {requests.length === 0 && (
              <div className="text-center py-12 text-zinc-500">No hay solicitudes de retiro</div>
            )}
          </div>
        )}
      </div>
    </AdminGuard>
  );
}
