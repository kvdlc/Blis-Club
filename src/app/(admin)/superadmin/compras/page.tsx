"use client";

import { useState, useEffect } from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import { Search, CreditCard, CheckCircle, XCircle, Clock, ChevronLeft, ChevronRight, Filter } from "lucide-react";

interface Purchase {
  id: string;
  user_id: string;
  subscription_id: string | null;
  plan_id: string | null;
  amount_cents: number;
  currency: string;
  status: string;
  payment_method: string;
  description: string;
  izipay_transaction_id: string | null;
  created_at: string;
  profiles: {
    id: string;
    email: string;
    display_name: string;
  } | null;
  plans: {
    id: string;
    name: string;
  } | null;
}

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [count, setCount] = useState(0);

  const load = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    params.set("page", page.toString());
    params.set("limit", limit.toString());
    
    const res = await fetch(`/api/admin/purchases?${params.toString()}`);
    const json = await res.json();
    setPurchases(json.data || []);
    setCount(json.count || 0);
    setLoading(false);
  };

  useEffect(() => { load(); }, [page, statusFilter]);

  const formatPrice = (cents: number, currency: string) => {
    const symbol = currency === "USD" ? "$" : "S/";
    return `${symbol}${(cents / 100).toFixed(2)}`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "succeeded":
      case "paid":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
            <CheckCircle className="w-3 h-3" /> Exitoso
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-700">
            <XCircle className="w-3 h-3" /> Fallido
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
            <Clock className="w-3 h-3" /> Pendiente
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-zinc-50 text-zinc-600">
            {status}
          </span>
        );
    }
  };

  const filtered = purchases.filter((p) =>
    !search ||
    p.profiles?.email?.toLowerCase().includes(search.toLowerCase()) ||
    p.profiles?.display_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.izipay_transaction_id?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(count / limit);

  return (
    <AdminGuard>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-zinc-900">Historial de Compras</h1>
            <p className="text-sm text-zinc-500 mt-1">Todas las transacciones de suscripción</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <CreditCard className="w-4 h-4" />
            {count} transacciones
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por email, nombre o ID de transacción..."
              className="w-full rounded-xl border border-zinc-200 bg-white pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="rounded-xl border border-zinc-200 bg-white pl-10 pr-8 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 appearance-none cursor-pointer"
            >
              <option value="">Todos los estados</option>
              <option value="succeeded">Exitoso</option>
              <option value="failed">Fallido</option>
              <option value="pending">Pendiente</option>
              <option value="refunded">Reembolsado</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-zinc-500">Cargando...</div>
        ) : (
          <>
            <div className="card-soft rounded-[1.25rem] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-100">
                      <th className="text-left px-4 py-3 font-semibold text-zinc-600">ID / Fecha</th>
                      <th className="text-left px-4 py-3 font-semibold text-zinc-600">Cliente</th>
                      <th className="text-left px-4 py-3 font-semibold text-zinc-600">Plan</th>
                      <th className="text-left px-4 py-3 font-semibold text-zinc-600">Monto</th>
                      <th className="text-left px-4 py-3 font-semibold text-zinc-600">Método</th>
                      <th className="text-left px-4 py-3 font-semibold text-zinc-600">Estado</th>
                      <th className="text-left px-4 py-3 font-semibold text-zinc-600">Transacción Izipay</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((p) => (
                      <tr key={p.id} className="border-b border-zinc-50 hover:bg-zinc-50/50">
                        <td className="px-4 py-3">
                          <div className="font-mono text-xs text-zinc-500">{p.id.slice(0, 8)}...</div>
                          <div className="text-xs text-zinc-400 mt-0.5">{formatDate(p.created_at)}</div>
                        </td>
                        <td className="px-4 py-3">
                          {p.profiles ? (
                            <div>
                              <div className="font-semibold text-zinc-800">{p.profiles.display_name || "—"}</div>
                              <div className="text-xs text-zinc-500">{p.profiles.email}</div>
                            </div>
                          ) : (
                            <span className="text-zinc-400 text-xs">Usuario eliminado</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-medium text-zinc-700">
                            {p.plans?.name || "Producto único"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-semibold text-zinc-800">
                            {formatPrice(p.amount_cents, p.currency)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-zinc-500 capitalize">{p.payment_method}</span>
                        </td>
                        <td className="px-4 py-3">
                          {getStatusBadge(p.status)}
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs text-zinc-500">
                            {p.izipay_transaction_id || "—"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-zinc-500">
                  Mostrando {filtered.length} de {count} transacciones
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="p-2 rounded-xl border border-zinc-200 text-zinc-500 hover:bg-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-medium text-zinc-600">
                    Página {page} de {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="p-2 rounded-xl border border-zinc-200 text-zinc-500 hover:bg-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AdminGuard>
  );
}
