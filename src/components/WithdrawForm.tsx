"use client";

import { useState } from "react";
import { AlertTriangle, ArrowRight, Wallet } from "lucide-react";
import { calculateWithdrawalBreakdown, MINIMUM_WITHDRAWAL_CENTS } from "@/lib/withdrawals";

interface Props {
  availableCents: number;
  billingProfile: any | null;
  onRequestWithdraw: (amountUsd: number, method: string) => Promise<{ success: boolean; error?: string }>;
  onOpenBillingProfile: () => void;
}

export default function WithdrawForm({ availableCents, billingProfile, onRequestWithdraw, onOpenBillingProfile }: Props) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const method = billingProfile?.withdrawal_method || "binance_pay";
  const amountCents = Math.round((parseFloat(amount) || 0) * 100);
  const { feeCents, netCents } = calculateWithdrawalBreakdown(amountCents, method);

  const isValid = amountCents >= MINIMUM_WITHDRAWAL_CENTS && amountCents <= availableCents;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;

    setLoading(true);
    setError("");
    setMessage("");

    const result = await onRequestWithdraw(parseFloat(amount), method);

    if (result.success) {
      setMessage("¡Solicitud enviada! Será procesada del 1 al 5 del mes.");
      setAmount("");
    } else {
      setError(result.error || "Error al solicitar retiro");
    }

    setLoading(false);
  }

  // Calculate next payment window
  const now = new Date();
  let nextWindow = new Date(now.getFullYear(), now.getMonth(), 1);
  if (now.getDate() > 5) {
    nextWindow.setMonth(nextWindow.getMonth() + 1);
  }
  const monthName = nextWindow.toLocaleDateString("es-ES", { month: "long" });

  if (!billingProfile) {
    return (
      <div className="card-soft rounded-[1.25rem] p-5 bg-warning-50/50 border border-warning-200">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-warning-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-warning-800">Completa tu perfil de facturación</p>
            <p className="text-xs text-warning-600 mt-1">
              Necesitamos tus datos legales y de retiro para procesar pagos de forma segura.
            </p>
            <button
              onClick={onOpenBillingProfile}
              className="mt-3 text-xs font-bold bg-warning-600 hover:bg-warning-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Completar perfil
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Payment window banner */}
      <div className="card-soft rounded-[1.25rem] p-4 bg-primary-50/50 border border-primary-200">
        <div className="flex items-center gap-2">
          <Wallet className="w-4 h-4 text-primary-500" />
          <p className="text-xs text-primary-700">
            <span className="font-bold">Próxima ventana de pago:</span> 1 al 5 de {monthName}
          </p>
        </div>
      </div>

      {/* Saved method info */}
      <div className="card-soft rounded-xl p-4 border border-zinc-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] text-zinc-400 uppercase font-bold">Método de retiro guardado</p>
            <p className="text-sm font-bold text-zinc-900 mt-0.5">
              {method === "binance_pay" ? "Binance Pay" : "PayPal"}
            </p>
            {method === "binance_pay" && (
              <p className="text-xs text-zinc-500">
                {billingProfile.binance_pay_id ? `ID: ${billingProfile.binance_pay_id}` : `Email: ${billingProfile.binance_email}`}
              </p>
            )}
            {method === "paypal" && (
              <p className="text-xs text-zinc-500">{billingProfile.paypal_email}</p>
            )}
          </div>
          <button
            onClick={onOpenBillingProfile}
            className="text-xs font-bold text-primary-600 hover:text-primary-700 transition-colors"
          >
            Editar
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card-soft rounded-[1.25rem] p-4 space-y-3">
        <h3 className="text-sm font-bold text-zinc-800">Solicitar retiro</h3>
        <p className="text-[11px] text-zinc-400">
          Mínimo: $10.00 · Disponible: ${(availableCents / 100).toFixed(2)}
        </p>

        <div>
          <label className="text-xs text-zinc-500 block mb-1">Monto (USD)</label>
          <input
            type="number"
            min="10"
            max={availableCents / 100}
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="10.00"
            required
            className="w-full rounded-xl bg-zinc-50 border border-zinc-200 px-3 py-2.5 text-sm"
          />
        </div>

        {/* Fee breakdown */}
        {amountCents > 0 && (
          <div className="rounded-xl bg-zinc-50 p-3 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-500">Monto solicitado</span>
              <span className="font-bold text-zinc-700">${(amountCents / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-zinc-500">Comisión ({method === "binance_pay" ? "0%" : "5%"})</span>
              <span className="font-bold text-zinc-700">-${(feeCents / 100).toFixed(2)}</span>
            </div>
            <div className="h-px bg-zinc-200" />
            <div className="flex justify-between text-sm">
              <span className="font-bold text-zinc-900">Tú recibes</span>
              <span className="font-extrabold text-secondary-600">${(netCents / 100).toFixed(2)}</span>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !isValid}
          className="w-full rounded-xl bg-secondary-600 hover:bg-secondary-700 text-white py-3 text-sm font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? "Enviando..." : <><ArrowRight className="w-4 h-4" /> Enviar solicitud</>}
        </button>

        {message && (
          <p className="text-xs text-center text-secondary-600 font-medium">{message}</p>
        )}
        {error && (
          <p className="text-xs text-center text-danger-600">{error}</p>
        )}
      </form>
    </div>
  );
}
