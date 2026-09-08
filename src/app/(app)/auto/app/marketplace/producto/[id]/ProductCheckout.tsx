"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Minus, Plus, ShoppingCart, Loader2, Lock, Check, BadgePercent, X, CreditCard,
} from "lucide-react";
import type { MarketplaceProduct } from "@/types/database";
import { useMoney } from "@/lib/money";
import IzipayCheckout from "@/components/IzipayCheckout";
import { VOLUME_TIERS, tierFor } from "@/lib/volumeTiers";

export function ProductCheckout({ product }: { product: MarketplaceProduct }) {
  const { money } = useMoney();
  const [qty, setQty] = useState(1);
  const [modal, setModal] = useState(false);
  const [email, setEmail] = useState("");
  const [checkout, setCheckout] = useState<{
    formToken: string; publicKey: string; orderId: string; displayMode: string; totalLabel: string; tierLabel: string; discountPct: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const tier = tierFor(qty);
  const base = product.precio ?? 0;
  const unit = Math.round(base * (1 - tier.pct / 100) * 100) / 100;
  const total = Math.round(unit * qty * 100) / 100;

  const startCheckout = async () => {
    setError("");
    if (!email.trim()) { setError("Escribe tu correo para continuar con el pago."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/izipay/create-product-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, quantity: qty, email: email.trim() }),
      });
      const data = await res.json();
      if (!data.formToken) { setError(data.error || "No se pudo iniciar el pago."); setLoading(false); return; }
      setCheckout({
        formToken: data.formToken, publicKey: data.publicKey || "", orderId: data.orderId,
        displayMode: data.displayMode || "embedded", totalLabel: data.totalLabel || "",
        tierLabel: data.tierLabel || tier.label, discountPct: data.discountPct ?? tier.pct,
      });
    } catch {
      setError("Fallo de conexión. Intenta de nuevo.");
    }
    setLoading(false);
  };

  return (
    <div className="bg-zinc-900 border border-white/10 rounded-2xl p-4 space-y-4">
      {/* Selector de cantidad */}
      <div>
        <p className="text-xs font-bold text-zinc-300 mb-2">Cantidad</p>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="w-10 h-10 rounded-xl bg-zinc-800 border border-white/10 flex items-center justify-center text-zinc-300 hover:bg-zinc-700 transition-colors">
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-12 text-center text-lg font-black text-zinc-50 tabular-nums">{qty}</span>
          <button type="button" onClick={() => setQty((q) => Math.min(50, q + 1))}
            className="w-10 h-10 rounded-xl bg-zinc-800 border border-white/10 flex items-center justify-center text-zinc-300 hover:bg-zinc-700 transition-colors">
            <Plus className="w-4 h-4" />
          </button>
          <span className="ml-auto text-[10px] font-bold text-zinc-500">{tier.label}</span>
        </div>
      </div>

      {/* Descuentos por volumen */}
      <div className="space-y-1.5">
        {VOLUME_TIERS.map((t) => {
          const active = tier.min === t.min;
          return (
            <button key={t.min} type="button" onClick={() => setQty(t.min)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border text-left transition-colors ${active ? "border-auto-500 bg-auto-600/10" : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05]"}`}>
              <span className="text-xs font-bold text-zinc-200">{t.label}</span>
              <span className="text-[11px] font-bold text-auto-400">{t.min}{t.min > 1 ? `+ uds` : " ud"} · {t.pct > 0 ? `-${t.pct}%` : "precio base"}</span>
            </button>
          );
        })}
      </div>

      {/* Resumen precio */}
      <div className="space-y-1.5 border-t border-white/5 pt-3">
        <div className="flex justify-between text-[11px] text-zinc-500">
          <span>{qty} × {money(unit)}</span>
          {(tier.pct > 0) && <span className="text-emerald-400">-{tier.pct}% volumen</span>}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-zinc-300">Total</span>
          <span className="text-3xl font-black text-auto-500">{money(total)}</span>
        </div>
        {product.precio_original && product.precio_original > base && (
          <p className="text-[10px] text-zinc-600 flex items-center gap-1">
            <BadgePercent className="w-3 h-3" /> Antes {money(product.precio_original)} · ahorra {money(Math.round((product.precio_original - base) * qty * 100) / 100)}
          </p>
        )}
      </div>

      {/* CTA comprar */}
      <button type="button" onClick={() => setModal(true)}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-auto-600 text-white font-black text-sm hover:bg-auto-500 transition-colors shadow-lg shadow-auto-600/20 active:scale-[0.98]">
        <ShoppingCart className="w-5 h-5" /> Comprar ahora
      </button>
      <p className="text-[10px] text-zinc-600 text-center flex items-center justify-center gap-1">
        <Lock className="w-3 h-3" /> Pago seguro con tarjeta vía Izipay
      </p>

      {/* Modal Izipay */}
      <AnimatePresence>
        {modal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
              className="w-full max-w-md">
              {!checkout ? (
                <div className="bg-zinc-900 border border-white/10 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-black text-zinc-50">Finalizar compra</p>
                    <button type="button" onClick={() => setModal(false)} className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 hover:bg-zinc-700">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex justify-between text-xs text-zinc-400">
                    <span>{product.titulo}</span>
                    <span className="font-bold text-zinc-200">{money(total)}</span>
                  </div>
                  <input
                    type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="Tu correo para el recibo"
                    className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-zinc-800 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-auto-600/20"
                  />
                  {error && <p className="text-xs text-red-400">{error}</p>}
                  <button type="button" onClick={startCheckout} disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-auto-600 text-white text-sm font-black hover:bg-auto-500 transition-colors disabled:opacity-60">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                    {loading ? "Conectando..." : `Pagar ${money(total)}`}
                  </button>
                </div>
              ) : (
                <div className="rounded-2xl overflow-hidden">
                  <IzipayCheckout
                    formToken={checkout.formToken}
                    publicKey={checkout.publicKey}
                    orderId={checkout.orderId}
                    totalLabel={checkout.totalLabel}
                    displayMode={checkout.displayMode as "popup" | "embedded"}
                    onSuccess={() => fetch("/api/izipay/confirm-product-order", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId: checkout.orderId }) }).catch(() => {})}
                    onClose={() => { setModal(false); setCheckout(null); }}
                    successRedirect={"/auto/app/marketplace"}
                    successCtaLabel="Volver al Marketplace"
                  />
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
