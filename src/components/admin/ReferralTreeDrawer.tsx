"use client";

import { useState } from "react";
import {
  X, Mail, Eye, Ban, Check, AlertTriangle, DollarSign, Users,
  ChevronRight, CircleDollarSign, CreditCard, FileText, Edit3
} from "lucide-react";

interface TreeNode {
  id: string;
  profile: { display_name: string; email: string; avatar_url: string | null } | null;
  subscription: { status: string; current_period_end: string } | null;
  commissions: { total: number; pending: number; available: number; paid_out: number; count: number };
  referral_count: number;
  children: TreeNode[];
}

interface Props {
  node: TreeNode | null;
  onClose: () => void;
  onViewNetwork: (nodeId: string) => void;
  onSuspend: (userId: string, action: "suspend" | "reactivate") => void;
  onChangeSubscription: (userId: string, status: string) => void;
  totalNetwork: number;
}

function countChildren(n: TreeNode): number {
  return 1 + n.children.reduce((sum, c) => sum + countChildren(c), 0);
}

export function ReferralTreeDrawer({ node, onClose, onViewNetwork, onSuspend, onChangeSubscription, totalNetwork }: Props) {
  const [activeTab, setActiveTab] = useState<"overview" | "actions">("overview");
  const [showSuspendConfirm, setShowSuspendConfirm] = useState(false);
  const [suspendAction, setSuspendAction] = useState<"suspend" | "reactivate">("suspend");

  if (!node) return null;

  const formatMoney = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 overflow-y-auto border-l border-zinc-200">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-zinc-200 p-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-100 to-accent-100 border-2 border-primary-200 flex items-center justify-center overflow-hidden">
              {node.profile?.avatar_url ? (
                <img src={node.profile.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-lg font-bold text-primary-600">
                  {(node.profile?.display_name || "?").charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <h3 className="font-bold text-zinc-900">{node.profile?.display_name || "Usuario"}</h3>
              <p className="text-xs text-zinc-500">{node.profile?.email}</p>
              <div className="flex items-center gap-2 mt-1">
                {node.subscription?.status === "active" ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary-100 text-secondary-700">Suscripcion Act.</span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-500">{node.subscription?.status || "Sin suscripcion"}</span>
                )}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center hover:bg-zinc-200 transition-colors">
            <X className="w-4 h-4 text-zinc-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-200">
          {[
            { key: "overview" as const, label: "Resumen", icon: Users },
            { key: "actions" as const, label: "Acciones", icon: Edit3 },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors ${ activeTab === tab.key ? "text-primary-600 border-b-2 border-primary-600" : "text-zinc-500 hover:text-zinc-700" }`}
            >
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-5 space-y-5">
          {activeTab === "overview" && (
            <>
              {/* Network Stats */}
              <div className="bg-zinc-50 rounded-xl p-4">
                <p className="text-[10px] text-zinc-400 uppercase tracking-wide font-semibold">Red de Afiliados</p>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div>
                    <p className="text-2xl font-extrabold text-zinc-900">{node.referral_count}</p>
                    <p className="text-xs text-zinc-500">referidos directos</p>
                  </div>
                  <div>
                    <p className="text-2xl font-extrabold text-zinc-900">{totalNetwork}</p>
                    <p className="text-xs text-zinc-500">total en la red</p>
                  </div>
                </div>
                <button
                  onClick={() => onViewNetwork(node.id)}
                  className="mt-3 w-full flex items-center justify-center gap-2 bg-primary-600 text-white rounded-lg py-2 text-xs font-bold hover:bg-primary-700 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" /> Ver red completa
                </button>
              </div>

              {/* Financial Stats */}
              <div>
                <p className="text-[10px] text-zinc-400 uppercase tracking-wide font-semibold mb-3">Finanzas</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-warning-50 rounded-xl p-3">
                    <p className="text-[10px] text-warning-600 uppercase tracking-wide">En Espera</p>
                    <p className="text-xl font-extrabold text-warning-700">{formatMoney(node.commissions.pending)}</p>
                  </div>
                  <div className="bg-secondary-50 rounded-xl p-3">
                    <p className="text-[10px] text-secondary-600 uppercase tracking-wide">Disponible</p>
                    <p className="text-xl font-extrabold text-secondary-700">{formatMoney(node.commissions.available)}</p>
                  </div>
                  <div className="bg-zinc-50 rounded-xl p-3">
                    <p className="text-[10px] text-zinc-400 uppercase tracking-wide">Total Ganado</p>
                    <p className="text-xl font-extrabold text-zinc-700">{formatMoney(node.commissions.total)}</p>
                  </div>
                  <div className="bg-accent-50 rounded-xl p-3">
                    <p className="text-[10px] text-accent-600 uppercase tracking-wide">Pagado</p>
                    <p className="text-xl font-extrabold text-accent-700">{formatMoney(node.commissions.paid_out)}</p>
                  </div>
                </div>
                <div className="mt-3 bg-zinc-50 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-zinc-400 uppercase tracking-wide">Comisiones Generadas</p>
                    <p className="text-lg font-extrabold text-zinc-800">{node.commissions.count}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-zinc-300" />
                </div>
              </div>
            </>
          )}

          {activeTab === "actions" && (
            <div className="space-y-3">
              <p className="text-[10px] text-zinc-400 uppercase tracking-wide font-semibold">Gestionar Suscripcion</p>
              <div className="space-y-2">
                {["active", "canceled", "paused"].map((status) => (
                  <button
                    key={status}
                    onClick={() => onChangeSubscription(node.id, status)}
                    disabled={node.subscription?.status === status}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${ node.subscription?.status === status ? "border-secondary-400 bg-secondary-50 text-secondary-700" : "border-zinc-200 hover:border-primary-300 hover:bg-primary-50/50" }`}
                  >
                    <CreditCard className="w-5 h-5" />
                    <div className="text-left flex-1">
                      <p className="text-sm font-semibold capitalize">{status === "active" ? "Activo" : status === "canceled" ? "Cancelado" : "Pausado"}</p>
                      <p className="text-xs text-zinc-400">Cambiar estado</p>
                    </div>
                    {node.subscription?.status === status && <Check className="w-4 h-4 text-secondary-600" />}
                  </button>
                ))}
              </div>

              <p className="text-[10px] text-zinc-400 uppercase tracking-wide font-semibold pt-2">Acciones de Cuenta</p>
              <button
                onClick={() => { setSuspendAction("suspend"); setShowSuspendConfirm(true); }}
                className="w-full flex items-center gap-3 p-3 rounded-xl border-2 border-danger-200 hover:bg-danger-50 transition-all text-left"
              >
                <Ban className="w-5 h-5 text-danger-500" />
                <div>
                  <p className="text-sm font-semibold text-danger-700">Suspender Cuenta</p>
                  <p className="text-xs text-zinc-500">Bloquear saldo y retiros</p>
                </div>
              </button>
              <button
                onClick={() => { setSuspendAction("reactivate"); setShowSuspendConfirm(true); }}
                className="w-full flex items-center gap-3 p-3 rounded-xl border-2 border-secondary-200 hover:bg-secondary-50 transition-all text-left"
              >
                <Check className="w-5 h-5 text-secondary-600" />
                <div>
                  <p className="text-sm font-semibold text-secondary-700">Reactivar Cuenta</p>
                  <p className="text-xs text-zinc-500">Restaurar saldo disponible</p>
                </div>
              </button>

              <p className="text-[10px] text-zinc-400 uppercase tracking-wide font-semibold pt-2">Comunicacion</p>
              <a
                href={`mailto:${node.profile?.email}`}
                className="w-full flex items-center gap-3 p-3 rounded-xl border-2 border-zinc-200 hover:border-primary-300 hover:bg-primary-50/50 transition-all"
              >
                <Mail className="w-5 h-5 text-primary-500" />
                <div className="text-left">
                  <p className="text-sm font-semibold">Enviar Email</p>
                  <p className="text-xs text-zinc-500">{node.profile?.email}</p>
                </div>
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Suspend Confirmation Modal */}
      {showSuspendConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowSuspendConfirm(false)} />
          <div className="relative bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-danger-100 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6 text-danger-600" />
            </div>
            <h3 className="text-lg font-bold text-center text-zinc-900">
              {suspendAction === "suspend" ? "Suspender cuenta" : "Reactivar cuenta"}
            </h3>
            <p className="text-sm text-zinc-500 text-center mt-2">
              {suspendAction === "suspend"
                ? `El usuario ${node.profile?.display_name || ""} no podra realizar retiros. Su saldo sera bloqueado.`
                : `El usuario ${node.profile?.display_name || ""} recuperara su saldo disponible.`}
            </p>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setShowSuspendConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-zinc-200 text-sm font-semibold text-zinc-600 hover:bg-zinc-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  onSuspend(node.id, suspendAction);
                  setShowSuspendConfirm(false);
                }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-colors ${ suspendAction === "suspend" ? "bg-danger-600 hover:bg-danger-700" : "bg-secondary-600 hover:bg-secondary-700" }`}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
