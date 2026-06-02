"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Wallet, DollarSign, Users, AlertTriangle, Check, Share2, Clock, BadgeCheck, Receipt, FileText, Filter, TrendingUp, TrendingDown, Minus, Crown, Gift, Zap, Network } from "lucide-react";
import { useRouter } from "next/navigation";
import ReferralTree from "@/components/ReferralTree";
import type { ReferralNode, CommissionsSummary } from "@/types/database";

/* ─── Local types ─── */
interface ReferredUser {
  id: string;
  email: string;
  first_name: string | null;
  display_name: string | null;
}
interface ReferredSubscription {
  status: string;
  current_period_end: string | null;
  plan_id: string;
  created_at: string;
}
interface LegacyReferral {
  id: string;
  referral_code: string;
  status: string;
  reward_type: string;
  cash_reward_usd: number;
  months_rewarded: number;
  created_at: string;
  referred_user: ReferredUser | null;
  referred_subscription: ReferredSubscription | null;
}
interface Withdrawal {
  id: string;
  amount_usd: number;
  method: string;
  status: string;
  created_at: string;
}
interface Payment {
  id: string;
  amount_cents: number;
  currency: string;
  status: string;
  payment_method: string;
  description: string;
  receipt_url: string | null;
  izipay_transaction_id: string | null;
  created_at: string;
  plan: { name: string } | null;
}

interface Props {
  rewards: any | null;
  referrals: LegacyReferral[] | null;
  tree: ReferralNode[];
  summary: CommissionsSummary;
  withdrawals: Withdrawal[];
  payments: Payment[] | null;
  referralCode: string;
  userId: string;
  isSubscriptionActive: boolean;
}

/* ─── Constants ─── */
const PAYMENT_STATUS: Record<string, { label: string; color: string; icon: any; filter: string }> = {
  succeeded: { label: "Completado", color: "text-secondary-600 bg-secondary-50 dark:bg-secondary-950/30", icon: Check, filter: "completados" },
  failed: { label: "Fallido", color: "text-danger-600 bg-danger-50 dark:bg-danger-950/30", icon: AlertTriangle, filter: "fallidos" },
  refunded: { label: "Reembolsado", color: "text-warning-600 bg-warning-50 dark:bg-warning-950/30", icon: DollarSign, filter: "reembolsados" },
  pending: { label: "Pendiente", color: "text-primary-600 bg-primary-50 dark:bg-primary-950/30", icon: Clock, filter: "pendientes" },
  disputed: { label: "En disputa", color: "text-danger-600 bg-danger-50 dark:bg-danger-950/30", icon: AlertTriangle, filter: "disputas" },
};
const PAYMENT_METHOD_LABELS: Record<string, string> = {
  card: "Tarjeta", yape: "Yape", plin: "Plin", transfer: "Transferencia", paypal: "PayPal",
};
const WITHDRAWAL_STATUS: Record<string, { label: string; color: string }> = {
  pending: { label: "Pendiente", color: "text-warning-600" },
  approved: { label: "Aprobado", color: "text-primary-600" },
  paid: { label: "Pagado", color: "text-secondary-600" },
  rejected: { label: "Rechazado", color: "text-danger-600" },
};

function getSubStatusLabel(sub: ReferredSubscription | null) {
  if (!sub) return { label: "Sin suscripción", color: "bg-zinc-100 text-zinc-500", icon: Minus };
  const now = new Date().toISOString();
  const isExpired = sub.current_period_end && sub.current_period_end < now;
  if (sub.status === "trialing") return { label: "En prueba", color: "bg-warning-100 text-warning-700", icon: Clock };
  if (sub.status === "active" && !isExpired) return { label: "Pagando", color: "bg-secondary-100 text-secondary-700", icon: TrendingUp };
  if (sub.status === "canceled" || isExpired) return { label: "Cancelado", color: "bg-danger-100 text-danger-700", icon: TrendingDown };
  return { label: sub.status, color: "bg-zinc-100 text-zinc-500", icon: Minus };
}

/* ─── Main ─── */
export default function BilleteraClient({
  rewards, referrals, tree, summary, withdrawals, payments, referralCode, userId, isSubscriptionActive,
}: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<"billetera" | "red">("billetera");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawMethod, setWithdrawMethod] = useState("yape");
  const [withdrawAccount, setWithdrawAccount] = useState("");
  const [showWithdrawForm, setShowWithdrawForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const [paymentFilter, setPaymentFilter] = useState<string>("all");

  const availableCents = rewards?.available_cash_usd ?? 0;
  const totalCents = rewards?.total_cash_usd ?? summary.totalCents;
  const referralCount = tree.length;
  const activeReferralCount = tree.filter((n) => n.status === "paid" && !n.endedAt).length;

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/referrals/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amountUsd: parseFloat(withdrawAmount),
          method: withdrawMethod,
          accountInfo: { account: withdrawAccount },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage("Solicitud enviada. Te contactaremos pronto.");
        setShowWithdrawForm(false);
        setWithdrawAmount(""); setWithdrawAccount("");
      } else {
        setMessage(data.error || "Error al solicitar retiro");
      }
    } catch { setMessage("Error de conexión"); }
    finally { setLoading(false); }
  };

  const handleShareLink = () => {
    navigator.clipboard.writeText(`https://blis.club/guau/webg?ref=${referralCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredPayments = useMemo(() => {
    const all = payments ?? [];
    if (paymentFilter === "all") return all;
    const map: Record<string, string[]> = {
      completados: ["succeeded"], fallidos: ["failed"], reembolsados: ["refunded"],
      pendientes: ["pending"], disputas: ["disputed"],
    };
    return all.filter((p) => map[paymentFilter]?.includes(p.status));
  }, [payments, paymentFilter]);

  const paymentStats = useMemo(() => {
    const all = payments ?? [];
    return {
      all: all.length, completados: all.filter((p) => p.status === "succeeded").length,
      fallidos: all.filter((p) => p.status === "failed").length,
      reembolsados: all.filter((p) => p.status === "refunded").length,
      pendientes: all.filter((p) => p.status === "pending").length,
      disputas: all.filter((p) => p.status === "disputed").length,
    };
  }, [payments]);

  return (
    <div className="space-y-5 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="w-9 h-9 rounded-full bg-white/80 dark:bg-zinc-800/80 flex items-center justify-center">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Billetera</h1>
      </div>

      {/* Tabs */}
      <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-full p-1">
        {[
          { key: "billetera" as const, label: "Billetera", icon: Wallet },
          { key: "red" as const, label: "Red de Referidos", icon: Network },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full text-xs font-semibold transition-all ${
              tab === t.key ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm" : "text-zinc-500"
            }`}
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {/* ══════ TAB: BILLETERA ══════ */}
      {tab === "billetera" && (
        <div className="space-y-4 animate-fade-in">
          {/* Credit info banner */}
          <div className="card-soft rounded-[1.25rem] p-4 bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-950/40 dark:to-accent-950/40 border border-primary-100 dark:border-primary-800/30">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-primary-500" />
              <span className="text-[10px] font-bold uppercase text-primary-600 dark:text-primary-400">Crédito interno</span>
            </div>
            <p className="text-3xl font-extrabold text-zinc-900 dark:text-white">
              ${(availableCents / 100).toFixed(2)} <span className="text-sm font-normal text-zinc-400">USD</span>
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              Úsalo para pagar tu suscripción o retíralo cuando gustes.
            </p>
          </div>

          {/* Comisiones por nivel */}
          <div className="grid grid-cols-3 gap-2">
            <div className="card-soft rounded-xl p-3 text-center border border-primary-100 dark:border-primary-800/40">
              <p className="text-[10px] text-zinc-400 mb-0.5">Nivel 1 ($2.00)</p>
              <p className="text-sm font-extrabold text-primary-600">${(summary.level1Cents / 100).toFixed(2)}</p>
            </div>
            <div className="card-soft rounded-xl p-3 text-center border border-accent-100 dark:border-accent-800/40">
              <p className="text-[10px] text-zinc-400 mb-0.5">Nivel 2 ($1.00)</p>
              <p className="text-sm font-extrabold text-accent-600">${(summary.level2Cents / 100).toFixed(2)}</p>
            </div>
            <div className="card-soft rounded-xl p-3 text-center">
              <p className="text-[10px] text-zinc-400 mb-0.5">Nivel 3 ($0.50)</p>
              <p className="text-sm font-extrabold text-zinc-500">${(summary.level3Cents / 100).toFixed(2)}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="card-soft rounded-xl p-3 text-center">
              <p className="text-lg font-extrabold text-zinc-900 dark:text-white">{referralCount}</p>
              <p className="text-[10px] text-zinc-500">Referidos</p>
            </div>
            <div className="card-soft rounded-xl p-3 text-center">
              <p className="text-lg font-extrabold text-secondary-600">{activeReferralCount}</p>
              <p className="text-[10px] text-zinc-500">Activos</p>
            </div>
            <div className="card-soft rounded-xl p-3 text-center">
              <p className="text-lg font-extrabold text-danger-600">{referralCount - activeReferralCount}</p>
              <p className="text-[10px] text-zinc-500">Inactivos</p>
            </div>
          </div>

          {/* Withdrawal section */}
          {!isSubscriptionActive && availableCents >= 1000 && (
            <div className="card-soft rounded-[1.25rem] p-4 flex items-center gap-3 bg-warning-50/50 dark:bg-warning-950/20 border border-warning-200 dark:border-warning-800">
              <AlertTriangle className="w-5 h-5 text-warning-500 shrink-0" />
              <p className="text-xs text-warning-700 dark:text-warning-300">
                Necesitas una suscripción activa para poder retirar tu crédito.
              </p>
            </div>
          )}

          {isSubscriptionActive && availableCents >= 1000 && (
            <button
              onClick={() => setShowWithdrawForm(!showWithdrawForm)}
              className="w-full rounded-xl bg-secondary-600 hover:bg-secondary-700 text-white py-3 font-bold text-sm transition-colors active:scale-[0.98]"
            >
              {showWithdrawForm ? "Cancelar retiro" : "Solicitar retiro de efectivo"}
            </button>
          )}

          {isSubscriptionActive && availableCents < 1000 && availableCents > 0 && (
            <div className="card-soft rounded-[1.25rem] p-4 flex items-center gap-3 bg-zinc-50 dark:bg-zinc-900/40">
              <BadgeCheck className="w-5 h-5 text-zinc-400 shrink-0" />
              <p className="text-xs text-zinc-500">
                Necesitas ${((1000 - availableCents) / 100).toFixed(2)} más para solicitar un retiro (mínimo $10.00 USD).
              </p>
            </div>
          )}

          {/* Withdraw form */}
          {showWithdrawForm && (
            <form onSubmit={handleWithdraw} className="card-soft rounded-[1.25rem] p-4 space-y-3">
              <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Solicitar retiro</h3>
              <p className="text-[11px] text-zinc-400">Mínimo: $10.00 USD · Disponible: ${(availableCents / 100).toFixed(2)}</p>
              <div>
                <label className="text-xs text-zinc-500 block mb-1">Monto (USD)</label>
                <input type="number" min="10" max={availableCents / 100} step="0.01" value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-2 text-sm" placeholder="10.00" required />
              </div>
              <div>
                <label className="text-xs text-zinc-500 block mb-1">Método</label>
                <select value={withdrawMethod} onChange={(e) => setWithdrawMethod(e.target.value)}
                  className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-2 text-sm">
                  <option value="yape">Yape</option>
                  <option value="plin">Plin</option>
                  <option value="transfer">Transferencia bancaria</option>
                  <option value="paypal">PayPal</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-zinc-500 block mb-1">Cuenta / Número</label>
                <input type="text" value={withdrawAccount} onChange={(e) => setWithdrawAccount(e.target.value)}
                  className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-2 text-sm" placeholder="999 888 777" required />
              </div>
              <button type="submit" disabled={loading}
                className="w-full rounded-xl bg-primary-600 hover:bg-primary-700 text-white py-2.5 text-sm font-bold transition-colors disabled:opacity-50">
                {loading ? "Enviando..." : "Enviar solicitud"}
              </button>
              {message && (
                <p className={`text-xs text-center ${message.toLowerCase().includes("error") ? "text-danger-600" : "text-secondary-600"}`}>{message}</p>
              )}
            </form>
          )}

          {/* Payment History */}
          {payments && payments.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-primary-500" />Historial de cobros ({filteredPayments.length})
                </h3>
                <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)}
                  className="text-[10px] font-bold bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1">
                  <option value="all">Todos ({paymentStats.all})</option>
                  <option value="completados">Completados ({paymentStats.completados})</option>
                  <option value="fallidos">Fallidos ({paymentStats.fallidos})</option>
                  <option value="reembolsados">Reembolsados ({paymentStats.reembolsados})</option>
                  <option value="pendientes">Pendientes ({paymentStats.pendientes})</option>
                  <option value="disputas">Disputas ({paymentStats.disputas})</option>
                </select>
              </div>
              <div className="space-y-2">
                {filteredPayments.map((p) => {
                  const status = PAYMENT_STATUS[p.status] || PAYMENT_STATUS.pending;
                  const Icon = status.icon;
                  return (
                    <div key={p.id} className="card-soft rounded-xl p-3.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${status.color}`}><Icon className="w-4 h-4" /></div>
                          <div>
                            <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{p.plan?.name || p.description || "Suscripción"}</p>
                            <p className="text-[10px] text-zinc-400">
                              {new Date(p.created_at).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}
                              {" · "}{PAYMENT_METHOD_LABELS[p.payment_method] || p.payment_method}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-extrabold ${p.status === "refunded" || p.status === "failed" ? "text-zinc-400 line-through" : "text-zinc-900 dark:text-white"}`}>
                            ${(p.amount_cents / 100).toFixed(2)} {p.currency}
                          </p>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${status.color}`}>{status.label}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Magic Link */}
          <div className="card-soft rounded-[1.25rem] p-4 bg-gradient-to-br from-accent-50 to-primary-50 dark:from-accent-900/20 dark:to-primary-900/20 border border-accent-100 dark:border-accent-800/30">
            <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mb-2">Tu enlace mágico</h4>
            <p className="text-[11px] text-zinc-500 mb-3">
              Comparte este enlace. Cuando alguien entre y se registre, se vincula automáticamente a ti. Sin necesidad de que ingresen ningún código.
            </p>
            <button onClick={handleShareLink}
              className="w-full flex items-center justify-between rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 px-3 py-2.5 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800 mb-2">
              <span className="text-[11px] font-mono text-zinc-600 dark:text-zinc-400 truncate pr-2">blis.club/guau/app?ref={referralCode}</span>
              <span className="text-xs font-semibold text-primary-600 flex items-center gap-1 shrink-0">
                {copied ? <><Check className="w-3 h-3" /> Copiado</> : <><Share2 className="w-3 h-3" /> Copiar</>}
              </span>
            </button>
            <p className="text-[10px] text-zinc-400 text-center">
              Válido por 60 días desde que la persona hace clic. Si se registra dentro de ese tiempo, ganas tu recompensa.
            </p>
          </div>

          {/* Withdrawals History */}
          {withdrawals.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2"><Clock className="w-4 h-4 text-zinc-500" />Historial de retiros</h3>
              <div className="space-y-2">
                {withdrawals.map((w) => {
                  const s = WITHDRAWAL_STATUS[w.status] || WITHDRAWAL_STATUS.pending;
                  return (
                    <div key={w.id} className="card-soft rounded-xl p-3 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">${(w.amount_usd / 100).toFixed(2)} USD</p>
                        <p className="text-[10px] text-zinc-400 capitalize">{w.method}</p>
                      </div>
                      <span className={`text-[10px] font-bold ${s.color}`}>{s.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════ TAB: RED DE REFERIDOS ══════ */}
      {tab === "red" && (
        <div className="space-y-4">
          <ReferralTree userId={userId} />
        </div>
      )}
    </div>
  );
}
