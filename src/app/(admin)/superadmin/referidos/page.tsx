"use client";

import { useState, useEffect } from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import {
  DollarSign, Check, X, Users, TrendingUp, Wallet, Clock, AlertCircle,
  Lock, Unlock, RotateCcw, Send, Ban, ArrowRight, Eye, Package, TreePine, CircleDollarSign,
  ChevronDown, ChevronRight, RefreshCw, Loader2, UserPlus
} from "lucide-react";

interface Commission {
  id: string;
  user_id: string;
  referral_id: string;
  level: number;
  commission_cents: number;
  status: string;
  available_after?: string;
  created_at: string;
  referrer?: { email: string; display_name: string; first_name: string; last_name: string } | null;
  referral?: { referred_user_id: string; referred?: { email: string; display_name: string } | null } | null;
}

interface WalletData {
  user_id: string;
  total_cash_usd: number;
  available_cash_usd: number;
  profile?: { email: string; display_name: string; first_name: string; last_name: string } | null;
}

interface WithdrawalRequest {
  id: string;
  user_id: string;
  amount_usd: number;
  method: string;
  withdrawal_method: string;
  status: string;
  payment_reference?: string | null;
  fee_cents?: number;
  net_amount_cents?: number;
  failure_reason?: string | null;
  rejection_reason?: string | null;
  billing?: any;
  created_at: string;
  profiles?: { email: string; display_name: string } | null;
}

interface Summary {
  totalPending: number;
  totalAvailable: number;
  totalPaidOut: number;
  totalWithdrawn: number;
  totalPendingWithdrawals: number;
  totalCommissions: number;
  totalUsersWithEarnings: number;
}

interface TreeNode {
  id: string;
  profile: { id: string; display_name: string; email: string; avatar_url: string } | null;
  subscription: { status: string; current_period_end: string } | null;
  commissions: { total: number; pending: number; available: number; paid_out: number; count: number };
  referral_count: number;
  children: TreeNode[];
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-warning-100 text-warning-700",
  processing: "bg-primary-100 text-primary-700",
  completed: "bg-secondary-100 text-secondary-700",
  failed: "bg-danger-100 text-danger-700",
  rejected: "bg-danger-100 text-danger-700",
  available: "bg-secondary-100 text-secondary-700",
  paid_out: "bg-accent-100 text-accent-700",
};

export default function ReferidosPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "pending" | "available" | "users" | "withdrawals" | "tree">("overview");
  const [selectedCommissions, setSelectedCommissions] = useState<Set<string>>(new Set());
  const [trees, setTrees] = useState<TreeNode[]>([]);
  const [treeApps, setTreeApps] = useState<{id: string; slug: string; name: string}[]>([]);
  const [selectedTreeApp, setSelectedTreeApp] = useState("guau");
  const [treeLoading, setTreeLoading] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [selectedTreeUser, setSelectedTreeUser] = useState<TreeNode | null>(null);
  const [processing, setProcessing] = useState(false);
  const [withdrawalFilter, setWithdrawalFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const [paymentReference, setPaymentReference] = useState<Record<string, string>>({});
  const [failureReason, setFailureReason] = useState<Record<string, string>>({});
  const [rejectionReason, setRejectionReason] = useState<Record<string, string>>({});
  const [expandedWithdrawal, setExpandedWithdrawal] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      // Fetch referrals endpoint (commissions, wallets, summary)
      let referralsData: any = {};
      try {
        const referralsRes = await fetch("/api/admin/referrals");
        if (referralsRes.ok) {
          referralsData = await referralsRes.json();
        } else {
          console.error("Referrals endpoint error:", referralsRes.status);
        }
      } catch (e) {
        console.error("Referrals fetch error:", e);
      }

      // Fetch withdrawals endpoint separately so one failure doesn't break the other
      let withdrawalsData: any = { withdrawals: [] };
      try {
        const withdrawalsRes = await fetch("/api/admin/withdrawals");
        if (withdrawalsRes.ok) {
          withdrawalsData = await withdrawalsRes.json();
        } else {
          console.error("Withdrawals endpoint error:", withdrawalsRes.status);
        }
      } catch (e) {
        console.error("Withdrawals fetch error:", e);
      }

      setSummary(referralsData.summary || null);
      setCommissions(referralsData.commissions || []);
      setWallets(referralsData.wallets || []);
      setWithdrawals(withdrawalsData.withdrawals || []);
    } catch (e) {
      console.error("Error loading admin data:", e);
    }
    setLoading(false);
  };

  const loadTree = async (appSlug?: string) => {
    setTreeLoading(true);
    try {
      const slug = appSlug || selectedTreeApp;
      const res = await fetch(`/api/admin/referrals/tree?app=${slug}`);
      if (res.ok) {
        const data = await res.json();
        setTrees(data.trees || []);
        setTreeApps(data.apps || []);
        // Auto-expand first level
        const rootIds = (data.trees || []).map((t: TreeNode) => t.id);
        setExpandedNodes(new Set(rootIds));
      } else {
        console.error("Tree endpoint error:", res.status);
      }
    } catch (e) {
      console.error("Tree fetch error:", e);
    }
    setTreeLoading(false);
  };

  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
  };

  useEffect(() => { load(); }, []);

  const handleMarkPaid = async () => {
    if (selectedCommissions.size === 0) return;
    if (!confirm(`¿Marcar ${selectedCommissions.size} comision(es) como pagadas?`)) return;
    setProcessing(true);
    await fetch("/api/admin/referrals", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commissionIds: Array.from(selectedCommissions), status: "paid_out" }),
    });
    setSelectedCommissions(new Set());
    setProcessing(false);
    load();
  };

  const handleProcess = async (id: string) => {
    setActionLoading((p) => ({ ...p, [id]: true }));
    try {
      const res = await fetch(`/api/admin/withdrawals/${id}/process`, { method: "POST" });
      if (res.ok) load();
    } finally {
      setActionLoading((p) => ({ ...p, [id]: false }));
    }
  };

  const handleComplete = async (id: string) => {
    const ref = paymentReference[id];
    if (!ref) return alert("Ingresa el TX ID / referencia de pago");
    setActionLoading((p) => ({ ...p, [id]: true }));
    try {
      const res = await fetch(`/api/admin/withdrawals/${id}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payment_reference: ref }),
      });
      if (res.ok) {
        setPaymentReference((p) => ({ ...p, [id]: "" }));
        load();
      }
    } finally {
      setActionLoading((p) => ({ ...p, [id]: false }));
    }
  };

  const handleFail = async (id: string) => {
    const reason = failureReason[id];
    if (!reason) return alert("Ingresa el motivo del fallo");
    if (!confirm("¿Marcar como fallado? El saldo será devuelto al usuario.")) return;
    setActionLoading((p) => ({ ...p, [id]: true }));
    try {
      const res = await fetch(`/api/admin/withdrawals/${id}/fail`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ failure_reason: reason }),
      });
      if (res.ok) {
        setFailureReason((p) => ({ ...p, [id]: "" }));
        load();
      }
    } finally {
      setActionLoading((p) => ({ ...p, [id]: false }));
    }
  };

  const handleReject = async (id: string) => {
    const reason = rejectionReason[id];
    if (!reason) return alert("Ingresa el motivo del rechazo");
    if (!confirm("¿Rechazar este retiro? El saldo será devuelto al usuario.")) return;
    setActionLoading((p) => ({ ...p, [id]: true }));
    try {
      const res = await fetch(`/api/admin/withdrawals/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rejection_reason: reason }),
      });
      if (res.ok) {
        setRejectionReason((p) => ({ ...p, [id]: "" }));
        load();
      }
    } finally {
      setActionLoading((p) => ({ ...p, [id]: false }));
    }
  };

  const toggleCommission = (id: string) => {
    const next = new Set(selectedCommissions);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedCommissions(next);
  };

  const formatDate = (d: string) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
  };

  const formatMoney = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  const countNodes = (node: TreeNode): number => {
    if (!node) return 0;
    return 1 + node.children.reduce((sum, child) => sum + countNodes(child), 0);
  };

  const renderTreeNode = (node: TreeNode, depth: number) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const levelColors = ["border-primary-400", "border-accent-400", "border-warning-400", "border-zinc-400"];
    const levelBg = ["bg-primary-50", "bg-accent-50", "bg-warning-50", "bg-zinc-50"];

    return (
      <div key={node.id} className="flex flex-col items-center">
        {/* Node Card */}
        <div
          onClick={() => { setSelectedTreeUser(node); }}
          className={`relative cursor-pointer group transition-all hover:scale-105 ${
            selectedTreeUser?.id === node.id ? "ring-2 ring-primary-500 ring-offset-2" : ""
          }`}
        >
          <div className={`w-40 bg-white dark:bg-zinc-800 rounded-2xl border-2 ${levelColors[Math.min(depth, 3)]} shadow-sm hover:shadow-md transition-all p-3 text-center`}>
            {/* Avatar */}
            <div className={`w-14 h-14 rounded-full mx-auto mb-2 overflow-hidden border-2 ${levelColors[Math.min(depth, 3)]} ${levelBg[Math.min(depth, 3)]} flex items-center justify-center`}>
              {node.profile?.avatar_url ? (
                <img src={node.profile.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-lg font-bold text-zinc-500">
                  {(node.profile?.display_name || "?").charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            {/* Info */}
            <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate px-1">
              {node.profile?.display_name || "Usuario"}
            </p>
            <p className="text-[10px] text-zinc-400 truncate px-1">{node.profile?.email}</p>
            {/* Level Badge */}
            <div className="mt-2 flex items-center justify-center gap-1">
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                depth === 0 ? "bg-primary-100 text-primary-700" :
                depth === 1 ? "bg-accent-100 text-accent-700" :
                depth === 2 ? "bg-warning-100 text-warning-700" :
                "bg-zinc-100 text-zinc-600"
              }`}>
                Nivel {depth}
              </span>
              {node.subscription?.status === "active" && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-secondary-100 text-secondary-700">
                  Activo
                </span>
              )}
            </div>
            {/* Earnings mini */}
            {node.commissions.total > 0 && (
              <p className="text-[10px] font-semibold text-primary-600 mt-1.5">
                +{formatMoney(node.commissions.total)}
              </p>
            )}
          </div>
        </div>

        {/* Expand/Collapse Button */}
        {hasChildren && (
          <button
            onClick={(e) => { e.stopPropagation(); toggleNode(node.id); }}
            className="mt-1 mb-1 w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center hover:bg-zinc-200 transition-colors"
          >
            {isExpanded ? <ChevronDown className="w-3 h-3 text-zinc-500" /> : <ChevronRight className="w-3 h-3 text-zinc-500" />}
          </button>
        )}

        {/* Children */}
        {isExpanded && hasChildren && (
          <div className="relative pt-4">
            {/* Vertical connector from parent to horizontal line */}
            <div className="absolute top-0 left-1/2 w-0.5 h-4 bg-zinc-200 dark:bg-zinc-700 -translate-x-1/2" />
            {/* Horizontal line */}
            <div className="relative flex items-start gap-6">
              {/* Horizontal connector line */}
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-zinc-200 dark:bg-zinc-700" style={{
                width: `${(node.children.length - 1) * 176 + 160}px`,
                marginLeft: `${80 - ((node.children.length - 1) * 176 + 160) / 2}px`
              }} />
              {node.children.map((child) => (
                <div key={child.id} className="relative">
                  {/* Vertical connector to child */}
                  <div className="absolute -top-4 left-1/2 w-0.5 h-4 bg-zinc-200 dark:bg-zinc-700 -translate-x-1/2" />
                  {renderTreeNode(child, depth + 1)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const filteredWithdrawals = withdrawals.filter((w) => {
    if (withdrawalFilter === "all") return true;
    return w.status === withdrawalFilter;
  });

  if (loading) {
    return (
      <AdminGuard>
        <div className="text-center py-12 text-zinc-500">Cargando datos de referidos...</div>
      </AdminGuard>
    );
  }

  const pendingCommissions = commissions.filter((c) => c.status === "pending");
  const availableCommissions = commissions.filter((c) => c.status === "available");

  return (
    <AdminGuard>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white">Sistema de Referidos</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Gestiona comisiones, billeteras y solicitudes de retiro</p>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="card-soft rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="w-4 h-4 text-warning-500" />
                <span className="text-xs font-semibold text-zinc-500">En Espera</span>
              </div>
              <p className="text-xl font-extrabold text-zinc-900">{formatMoney(summary.totalPending)}</p>
            </div>
            <div className="card-soft rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Unlock className="w-4 h-4 text-secondary-500" />
                <span className="text-xs font-semibold text-zinc-500">Disponible</span>
              </div>
              <p className="text-xl font-extrabold text-zinc-900">{formatMoney(summary.totalAvailable)}</p>
            </div>
            <div className="card-soft rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Check className="w-4 h-4 text-accent-500" />
                <span className="text-xs font-semibold text-zinc-500">Pagado</span>
              </div>
              <p className="text-xl font-extrabold text-zinc-900">{formatMoney(summary.totalPaidOut)}</p>
            </div>
            <div className="card-soft rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-primary-500" />
                <span className="text-xs font-semibold text-zinc-500">Retirado</span>
              </div>
              <p className="text-xl font-extrabold text-zinc-900">{formatMoney(summary.totalWithdrawn)}</p>
            </div>
            <div className="card-soft rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-danger-500" />
                <span className="text-xs font-semibold text-zinc-500">Retiros Pend.</span>
              </div>
              <p className="text-xl font-extrabold text-zinc-900">{formatMoney(summary.totalPendingWithdrawals)}</p>
            </div>
            <div className="card-soft rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-zinc-500" />
                <span className="text-xs font-semibold text-zinc-500">Afiliados</span>
              </div>
              <p className="text-xl font-extrabold text-zinc-900">{summary.totalUsersWithEarnings}</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-1 overflow-x-auto">
          {([
            { key: "overview" as const, label: "Resumen" },
            { key: "pending" as const, label: `En Espera (${pendingCommissions.length})` },
            { key: "available" as const, label: `Disponibles (${availableCommissions.length})` },
            { key: "users" as const, label: "Usuarios" },
            { key: "withdrawals" as const, label: `Retiros (${withdrawals.filter(w => w.status === "pending").length})` },
            { key: "tree" as const, label: "Árbol", onClick: () => { if (trees.length === 0) loadTree(); } },
          ]).map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                if ((tab as any).onClick) (tab as any).onClick();
              }}
              className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors whitespace-nowrap ${
                activeTab === tab.key
                  ? "bg-white dark:bg-zinc-800 text-primary-600 border-b-2 border-primary-600"
                  : "text-zinc-500 hover:text-zinc-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="card-soft rounded-[1.25rem] overflow-hidden">
              <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-200 px-4 pt-4">Top Afiliados</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-100 dark:border-zinc-800">
                      <th className="text-left px-4 py-3 font-semibold text-zinc-600 dark:text-zinc-400">Usuario</th>
                      <th className="text-left px-4 py-3 font-semibold text-zinc-600 dark:text-zinc-400">Ganado Total</th>
                      <th className="text-left px-4 py-3 font-semibold text-zinc-600 dark:text-zinc-400">Disponible</th>
                      <th className="text-left px-4 py-3 font-semibold text-zinc-600 dark:text-zinc-400">Comisiones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wallets
                      .filter((w) => (w.total_cash_usd || 0) > 0)
                      .sort((a, b) => (b.available_cash_usd || 0) - (a.available_cash_usd || 0))
                      .map((w) => (
                        <tr key={w.user_id} className="border-b border-zinc-50 dark:border-zinc-900 hover:bg-zinc-50/50">
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-semibold text-zinc-800 dark:text-zinc-200">{w.profile?.display_name || w.profile?.email}</p>
                              <p className="text-xs text-zinc-400">{w.profile?.email}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3 font-semibold text-zinc-800">{formatMoney(w.total_cash_usd)}</td>
                          <td className="px-4 py-3">
                            <span className="font-bold text-secondary-600">{formatMoney(w.available_cash_usd)}</span>
                          </td>
                          <td className="px-4 py-3 text-zinc-500">
                            {commissions.filter((c) => c.user_id === w.user_id).length} comisiones
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              {wallets.filter((w) => (w.total_cash_usd || 0) > 0).length === 0 && (
                <div className="text-center py-8 text-zinc-500">No hay usuarios con ganancias aún</div>
              )}
            </div>
          </div>
        )}

        {/* PENDING COMMISSIONS TAB */}
        {activeTab === "pending" && (
          <div className="space-y-4">
            {selectedCommissions.size > 0 && (
              <div className="flex items-center justify-between bg-primary-50 dark:bg-primary-950/30 rounded-xl px-4 py-3">
                <span className="text-sm font-semibold text-primary-700 dark:text-primary-300">
                  {selectedCommissions.size} comision(es) seleccionada(s)
                </span>
                <button
                  onClick={handleMarkPaid}
                  disabled={processing}
                  className="bg-primary-600 hover:bg-primary-700 text-white rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50 transition-colors"
                >
                  {processing ? "Procesando..." : "Marcar como Pagadas"}
                </button>
              </div>
            )}
            <div className="card-soft rounded-[1.25rem] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-100 dark:border-zinc-800">
                      <th className="px-4 py-3 w-10"><input type="checkbox" className="rounded border-zinc-300" /></th>
                      <th className="text-left px-4 py-3 font-semibold text-zinc-600 dark:text-zinc-400">Quién recibe</th>
                      <th className="text-left px-4 py-3 font-semibold text-zinc-600 dark:text-zinc-400">Referido</th>
                      <th className="text-left px-4 py-3 font-semibold text-zinc-600 dark:text-zinc-400">Nivel</th>
                      <th className="text-left px-4 py-3 font-semibold text-zinc-600 dark:text-zinc-400">Monto</th>
                      <th className="text-left px-4 py-3 font-semibold text-zinc-600 dark:text-zinc-400">Disponible en</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingCommissions.map((c) => {
                      const daysRemaining = c.available_after
                        ? Math.max(0, Math.ceil((new Date(c.available_after).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
                        : 0;
                      return (
                        <tr key={c.id} className="border-b border-zinc-50 dark:border-zinc-900 hover:bg-zinc-50/50">
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selectedCommissions.has(c.id)}
                              onChange={() => toggleCommission(c.id)}
                              className="rounded border-zinc-300"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-semibold text-zinc-800 dark:text-zinc-200">{c.referrer?.display_name || c.referrer?.email}</p>
                            <p className="text-xs text-zinc-400">{c.referrer?.email}</p>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-zinc-600 dark:text-zinc-400">{c.referral?.referred?.display_name || c.referral?.referred?.email}</p>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                              c.level === 1 ? "bg-primary-100 text-primary-700" :
                              c.level === 2 ? "bg-accent-100 text-accent-700" :
                              "bg-warning-100 text-warning-700"
                            }`}>
                              Nivel {c.level}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-bold text-zinc-800">{formatMoney(c.commission_cents)}</td>
                          <td className="px-4 py-3 text-xs text-zinc-400">
                            {daysRemaining > 0 ? `${daysRemaining} día(s)` : "Pronto"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {pendingCommissions.length === 0 && (
                <div className="text-center py-8 text-zinc-500">No hay comisiones en espera</div>
              )}
            </div>
          </div>
        )}

        {/* AVAILABLE COMMISSIONS TAB */}
        {activeTab === "available" && (
          <div className="card-soft rounded-[1.25rem] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-100 dark:border-zinc-800">
                    <th className="text-left px-4 py-3 font-semibold text-zinc-600 dark:text-zinc-400">Quién recibe</th>
                    <th className="text-left px-4 py-3 font-semibold text-zinc-600 dark:text-zinc-400">Referido</th>
                    <th className="text-left px-4 py-3 font-semibold text-zinc-600 dark:text-zinc-400">Nivel</th>
                    <th className="text-left px-4 py-3 font-semibold text-zinc-600 dark:text-zinc-400">Monto</th>
                    <th className="text-left px-4 py-3 font-semibold text-zinc-600 dark:text-zinc-400">Disponible desde</th>
                  </tr>
                </thead>
                <tbody>
                  {availableCommissions.map((c) => (
                    <tr key={c.id} className="border-b border-zinc-50 dark:border-zinc-900 hover:bg-zinc-50/50">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-zinc-800 dark:text-zinc-200">{c.referrer?.display_name || c.referrer?.email}</p>
                        <p className="text-xs text-zinc-400">{c.referrer?.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-zinc-600 dark:text-zinc-400">{c.referral?.referred?.display_name || c.referral?.referred?.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          c.level === 1 ? "bg-primary-100 text-primary-700" :
                          c.level === 2 ? "bg-accent-100 text-accent-700" :
                          "bg-warning-100 text-warning-700"
                        }`}>
                          Nivel {c.level}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-bold text-secondary-600">{formatMoney(c.commission_cents)}</td>
                      <td className="px-4 py-3 text-xs text-zinc-400">{formatDate(c.available_after || c.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {availableCommissions.length === 0 && (
              <div className="text-center py-8 text-zinc-500">No hay comisiones disponibles</div>
            )}
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === "users" && (
          <div className="card-soft rounded-[1.25rem] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-100 dark:border-zinc-800">
                    <th className="text-left px-4 py-3 font-semibold text-zinc-600 dark:text-zinc-400">Usuario</th>
                    <th className="text-left px-4 py-3 font-semibold text-zinc-600 dark:text-zinc-400">Ganado Total</th>
                    <th className="text-left px-4 py-3 font-semibold text-zinc-600 dark:text-zinc-400">Disponible</th>
                    <th className="text-left px-4 py-3 font-semibold text-zinc-600 dark:text-zinc-400">Referidos Directos</th>
                    <th className="text-left px-4 py-3 font-semibold text-zinc-600 dark:text-zinc-400">Comisiones</th>
                  </tr>
                </thead>
                <tbody>
                  {wallets
                    .sort((a, b) => (b.available_cash_usd || 0) - (a.available_cash_usd || 0))
                    .map((w) => {
                      const userCommissions = commissions.filter((c) => c.user_id === w.user_id);
                      const directReferrals = commissions.filter((c) => c.user_id === w.user_id && c.level === 1).length;
                      return (
                        <tr key={w.user_id} className="border-b border-zinc-50 dark:border-zinc-900 hover:bg-zinc-50/50">
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-semibold text-zinc-800 dark:text-zinc-200">{w.profile?.display_name || w.profile?.email}</p>
                              <p className="text-xs text-zinc-400">{w.profile?.email}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3 font-semibold text-zinc-800">{formatMoney(w.total_cash_usd)}</td>
                          <td className="px-4 py-3 font-bold text-secondary-600">{formatMoney(w.available_cash_usd)}</td>
                          <td className="px-4 py-3 text-zinc-500">{directReferrals}</td>
                          <td className="px-4 py-3 text-zinc-500">{userCommissions.length} total</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* WITHDRAWALS TAB */}
        {activeTab === "withdrawals" && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-zinc-600">Filtrar:</span>
              {["all", "pending", "processing", "completed", "failed", "rejected"].map((f) => (
                <button
                  key={f}
                  onClick={() => setWithdrawalFilter(f)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
                    withdrawalFilter === f
                      ? "bg-primary-600 text-white"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 hover:bg-zinc-200"
                  }`}
                >
                  {f === "all" ? "Todos" : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {filteredWithdrawals.length === 0 && (
                <div className="text-center py-8 text-zinc-500 card-soft rounded-[1.25rem]">No hay retiros</div>
              )}
              {filteredWithdrawals.map((w) => (
                <div key={w.id} className="card-soft rounded-[1.25rem] overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-accent-100 dark:bg-accent-950 flex items-center justify-center text-accent-600">
                          <DollarSign className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-zinc-800 dark:text-zinc-200 text-sm">{w.profiles?.display_name || w.profiles?.email || w.user_id}</p>
                          <p className="text-xs text-zinc-400">{w.profiles?.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${STATUS_COLORS[w.status] || "bg-zinc-100 text-zinc-600"}`}>
                              {w.status}
                            </span>
                            <span className="text-[10px] text-zinc-400">{formatDate(w.created_at)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-extrabold text-zinc-900 dark:text-white">{formatMoney(w.amount_usd)}</p>
                        <p className="text-[10px] text-zinc-400">{w.withdrawal_method || w.method}</p>
                        {w.fee_cents !== undefined && w.fee_cents > 0 && (
                          <p className="text-[10px] text-zinc-400">Fee: ${(w.fee_cents / 100).toFixed(2)}</p>
                        )}
                      </div>
                    </div>

                    {/* Expand details */}
                    <button
                      onClick={() => setExpandedWithdrawal(expandedWithdrawal === w.id ? null : w.id)}
                      className="mt-3 text-xs font-semibold text-primary-600 flex items-center gap-1 hover:text-primary-700 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      {expandedWithdrawal === w.id ? "Ocultar detalles" : "Ver detalles de pago"}
                    </button>

                    {expandedWithdrawal === w.id && w.billing && (
                      <div className="mt-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 space-y-1 text-xs">
                        <p><span className="text-zinc-400">Nombre:</span> <span className="font-semibold">{w.billing.full_name}</span></p>
                        <p><span className="text-zinc-400">País:</span> {w.billing.country_code}</p>
                        <p><span className="text-zinc-400">Documento:</span> {w.billing.document_type?.toUpperCase()} {w.billing.document_number}</p>
                        {w.withdrawal_method === "binance_pay" && (
                          <>
                            {w.billing.binance_pay_id && <p><span className="text-zinc-400">Binance Pay ID:</span> <span className="font-mono">{w.billing.binance_pay_id}</span></p>}
                            {w.billing.binance_email && <p><span className="text-zinc-400">Binance Email:</span> {w.billing.binance_email}</p>}
                          </>
                        )}
                        {w.withdrawal_method === "paypal" && (
                          <p><span className="text-zinc-400">PayPal Email:</span> {w.billing.paypal_email}</p>
                        )}
                      </div>
                    )}

                    {/* TX ID for completed */}
                    {w.status === "completed" && w.payment_reference && (
                      <div className="mt-3 p-3 rounded-xl bg-secondary-50 dark:bg-secondary-950/30">
                        <p className="text-xs font-semibold text-secondary-700 dark:text-secondary-300">
                          Referencia / TX ID: <span className="font-mono">{w.payment_reference}</span>
                        </p>
                      </div>
                    )}

                    {/* Failure/Rejection reason */}
                    {(w.status === "failed" && w.failure_reason) && (
                      <div className="mt-3 p-3 rounded-xl bg-danger-50 dark:bg-danger-950/30">
                        <p className="text-xs text-danger-700 dark:text-danger-300">
                          <span className="font-semibold">Fallo:</span> {w.failure_reason}
                        </p>
                      </div>
                    )}
                    {(w.status === "rejected" && w.rejection_reason) && (
                      <div className="mt-3 p-3 rounded-xl bg-danger-50 dark:bg-danger-950/30">
                        <p className="text-xs text-danger-700 dark:text-danger-300">
                          <span className="font-semibold">Rechazo:</span> {w.rejection_reason}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    {w.status === "pending" && (
                      <div className="mt-3 flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => handleProcess(w.id)}
                          disabled={actionLoading[w.id]}
                          className="flex items-center gap-1.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white px-3 py-2 text-xs font-bold transition-colors disabled:opacity-50"
                        >
                          <Send className="w-3.5 h-3.5" /> Procesar
                        </button>
                        <div className="flex items-center gap-1 flex-1 min-w-[200px]">
                          <input
                            type="text"
                            placeholder="Motivo de rechazo..."
                            value={rejectionReason[w.id] || ""}
                            onChange={(e) => setRejectionReason((p) => ({ ...p, [w.id]: e.target.value }))}
                            className="flex-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-danger-500/20"
                          />
                          <button
                            onClick={() => handleReject(w.id)}
                            disabled={actionLoading[w.id]}
                            className="flex items-center gap-1 rounded-lg bg-danger-100 text-danger-600 hover:bg-danger-200 px-2 py-1.5 text-xs font-bold transition-colors disabled:opacity-50"
                          >
                            <Ban className="w-3.5 h-3.5" /> Rechazar
                          </button>
                        </div>
                      </div>
                    )}

                    {w.status === "processing" && (
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="TX ID / Referencia de pago..."
                            value={paymentReference[w.id] || ""}
                            onChange={(e) => setPaymentReference((p) => ({ ...p, [w.id]: e.target.value }))}
                            className="flex-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-secondary-500/20"
                          />
                          <button
                            onClick={() => handleComplete(w.id)}
                            disabled={actionLoading[w.id]}
                            className="flex items-center gap-1.5 rounded-lg bg-secondary-600 hover:bg-secondary-700 text-white px-3 py-2 text-xs font-bold transition-colors disabled:opacity-50"
                          >
                            <Check className="w-3.5 h-3.5" /> Completar
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Motivo del fallo..."
                            value={failureReason[w.id] || ""}
                            onChange={(e) => setFailureReason((p) => ({ ...p, [w.id]: e.target.value }))}
                            className="flex-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-danger-500/20"
                          />
                          <button
                            onClick={() => handleFail(w.id)}
                            disabled={actionLoading[w.id]}
                            className="flex items-center gap-1.5 rounded-lg bg-danger-100 text-danger-600 hover:bg-danger-200 px-3 py-2 text-xs font-bold transition-colors disabled:opacity-50"
                          >
                            <AlertCircle className="w-3.5 h-3.5" /> Falló
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TREE TAB */}
        {activeTab === "tree" && (
          <div className="flex gap-6 h-[calc(100vh-200px)] min-h-[600px]">
            {/* Left: Tree Visualization */}
            <div className="flex-1 flex flex-col min-w-0">
              {/* App Selector + Controls */}
              <div className="flex items-center justify-between mb-4 shrink-0">
                <div className="flex items-center gap-3">
                  <select
                    value={selectedTreeApp}
                    onChange={(e) => { setSelectedTreeApp(e.target.value); loadTree(e.target.value); }}
                    className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  >
                    <option value="">Todas las apps</option>
                    {treeApps.map((app) => (
                      <option key={app.id} value={app.slug}>{app.name}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => loadTree()}
                    className="flex items-center gap-1.5 bg-primary-600 text-white rounded-lg px-3 py-2 text-xs font-bold hover:bg-primary-700 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Actualizar
                  </button>
                </div>
                <div className="text-xs text-zinc-500">
                  {trees.length} raíz(es) · {trees.reduce((acc, t) => acc + countNodes(t), 0)} miembros
                </div>
              </div>

              {/* Tree Canvas */}
              <div className="flex-1 overflow-auto card-soft rounded-[1.25rem] p-6">
                {treeLoading ? (
                  <div className="flex items-center justify-center h-full text-zinc-500">
                    <Loader2 className="w-8 h-8 animate-spin mr-2" /> Cargando árbol...
                  </div>
                ) : trees.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-zinc-500 space-y-3">
                    <TreePine className="w-16 h-16 text-zinc-300" />
                    <p>No hay datos de referidos para esta app</p>
                    <p className="text-xs">Los usuarios deben referir a otros usando su código de invitación</p>
                  </div>
                ) : (
                  <div className="space-y-8 min-w-max">
                    {trees.map((root) => (
                      <div key={root.id} className="inline-block">
                        {renderTreeNode(root, 0)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right: User Details Panel */}
            <div className="w-80 shrink-0">
              {selectedTreeUser ? (
                <div className="card-soft rounded-[1.25rem] p-5 space-y-4 sticky top-4">
                  {/* User Header */}
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full bg-zinc-100 dark:bg-zinc-800 border-4 border-white dark:border-zinc-700 mx-auto overflow-hidden shadow-lg">
                      {selectedTreeUser.profile?.avatar_url ? (
                        <img src={selectedTreeUser.profile.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary-100 text-primary-600 text-xl font-bold">
                          {(selectedTreeUser.profile?.display_name || "?").charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <h3 className="font-bold text-zinc-900 dark:text-white mt-3 text-sm">
                      {selectedTreeUser.profile?.display_name || "Usuario"}
                    </h3>
                    <p className="text-xs text-zinc-500">{selectedTreeUser.profile?.email}</p>
                    {selectedTreeUser.subscription ? (
                      <span className={`inline-flex items-center gap-1 mt-2 text-[10px] font-bold px-2.5 py-1 rounded-full ${
                        selectedTreeUser.subscription.status === "active"
                          ? "bg-secondary-100 text-secondary-700"
                          : "bg-zinc-100 text-zinc-500"
                      }`}>
                        <CircleDollarSign className="w-3 h-3" />
                        {selectedTreeUser.subscription.status === "active" ? "Suscripción Activa" : "Inactiva"}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-bold px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-500">
                        Sin suscripción
                      </span>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="space-y-2">
                    <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-3">
                      <p className="text-[10px] text-zinc-400 uppercase tracking-wide">Red</p>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <p className="text-xl font-extrabold text-zinc-900 dark:text-white">{selectedTreeUser.referral_count}</p>
                        <p className="text-xs text-zinc-500">referidos directos</p>
                      </div>
                      <p className="text-xs text-zinc-500 mt-1">{countNodes(selectedTreeUser) - 1} total en la red</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-warning-50 dark:bg-warning-950/20 rounded-xl p-3">
                        <p className="text-[10px] text-warning-600 uppercase tracking-wide">En Espera</p>
                        <p className="text-lg font-extrabold text-warning-700">{formatMoney(selectedTreeUser.commissions.pending)}</p>
                      </div>
                      <div className="bg-secondary-50 dark:bg-secondary-950/20 rounded-xl p-3">
                        <p className="text-[10px] text-secondary-600 uppercase tracking-wide">Disponible</p>
                        <p className="text-lg font-extrabold text-secondary-700">{formatMoney(selectedTreeUser.commissions.available)}</p>
                      </div>
                      <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-3">
                        <p className="text-[10px] text-zinc-400 uppercase tracking-wide">Total Ganado</p>
                        <p className="text-lg font-extrabold text-zinc-700 dark:text-zinc-300">{formatMoney(selectedTreeUser.commissions.total)}</p>
                      </div>
                      <div className="bg-accent-50 dark:bg-accent-950/20 rounded-xl p-3">
                        <p className="text-[10px] text-accent-600 uppercase tracking-wide">Pagado</p>
                        <p className="text-lg font-extrabold text-accent-700">{formatMoney(selectedTreeUser.commissions.paid_out)}</p>
                      </div>
                    </div>

                    <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-3">
                      <p className="text-[10px] text-zinc-400 uppercase tracking-wide">Comisiones</p>
                      <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mt-1">{selectedTreeUser.commissions.count} generadas</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedTreeUser(null)}
                    className="w-full py-2 text-xs font-semibold text-zinc-500 hover:text-zinc-700 transition-colors"
                  >
                    Cerrar panel
                  </button>
                </div>
              ) : (
                <div className="card-soft rounded-[1.25rem] p-8 text-center text-zinc-500 sticky top-4">
                  <Users className="w-12 h-12 mx-auto mb-3 text-zinc-300" />
                  <p className="text-sm font-semibold">Selecciona un usuario</p>
                  <p className="text-xs mt-1">Haz click en cualquier nodo del árbol para ver sus detalles</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminGuard>
  );
}
