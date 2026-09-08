"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Minus, Plus, ShoppingCart, Lock, BadgePercent, Loader2, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import type { MarketplaceProduct } from "@/types/database";
import { useMoney } from "@/lib/money";
import { useCart } from "@/components/MarketplaceCart";
import { VOLUME_TIERS, tierFor } from "@/lib/volumeTiers";

export function ProductCheckout({ product }: { product: MarketplaceProduct }) {
  const { money } = useMoney();
  const router = useRouter();
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const tier = tierFor(qty);
  const base = product.precio ?? 0;
  const unit = Math.round(base * (1 - tier.pct / 100) * 100) / 100;
  const total = Math.round(unit * qty * 100) / 100;

  const onBuy = () => {
    router.push(`/auto/app/marketplace/producto/${product.id}/pago?product=${product.id}&qty=${qty}`);
  };

  const onAddToCart = async () => {
    setAdding(true);
    setAdded(false);
    try {
      await add(product.id, qty);
      setAdded(true);
      setTimeout(() => setAdded(false), 1800);
    } finally { setAdding(false); }
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
      <div className="flex gap-2">
        <motion.button type="button" whileTap={{ scale: 0.97 }} onClick={onAddToCart} disabled={adding}
          className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-2xl bg-white/[0.06] border border-violet-500/30 text-violet-300 text-xs font-black hover:bg-white/[0.1] transition-colors disabled:opacity-60">
          {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : added ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
          {added ? "Agregado" : "Agregar al carrito"}
        </motion.button>
        <motion.button type="button" whileTap={{ scale: 0.97 }} onClick={onBuy}
          className="flex-[1.4] flex items-center justify-center gap-1.5 py-3 rounded-2xl grad-auto text-white font-black text-xs hover:opacity-95 transition-opacity shadow-glow-auto">
          <ShoppingCart className="w-4 h-4" /> Comprar ahora
        </motion.button>
      </div>
      <p className="text-[10px] text-zinc-600 text-center flex items-center justify-center gap-1">
        <Lock className="w-3 h-3" /> Pago seguro con tarjeta vía Izipay
      </p>
    </div>
  );
}
