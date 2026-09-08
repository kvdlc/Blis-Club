"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import IzipayCheckout from "@/components/IzipayCheckout";
import { Loader2, ArrowLeft, ShoppingCart, X, CreditCard, Check } from "lucide-react";
import { useCart } from "@/components/MarketplaceCart";
import { useMoney } from "@/lib/money";

function CartCheckoutInner() {
  const router = useRouter();
  const { money } = useMoney();
  const { items, refresh, setQty, remove, loading: cartLoading } = useCart();
  const [checkout, setCheckout] = useState<{ formToken: string; publicKey: string; orderId: string; displayMode: string; totalLabel: string } | null>(null);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => { setReady(true); }, []);

  const total = items.reduce((s, i) => s + (i.product.precio ?? 0) * i.quantity, 0);

  const pay = async () => {
    setError("");
    setPaying(true);
    try {
      const res = await fetch("/api/izipay/create-cart-order", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
      const data = await res.json();
      if (!data.formToken) { setError(data.error || "No se pudo iniciar el pago."); setPaying(false); return; }
      setCheckout({ formToken: data.formToken, publicKey: data.publicKey || "", orderId: data.orderId, displayMode: data.displayMode || "embedded", totalLabel: data.totalLabel || "" });
    } catch { setError("Fallo de conexión. Intenta de nuevo."); }
    setPaying(false);
  };

  if (!ready) {
    return <div className="flex items-center justify-center min-h-[50vh]"><Loader2 className="w-7 h-7 text-auto-500 animate-spin" /></div>;
  }

  if (checkout) {
    return (
      <div className="space-y-4">
        <button onClick={() => { setCheckout(null); refresh(); }} className="inline-flex items-center gap-1.5 text-sm font-medium text-auto-500">
          <ArrowLeft className="w-4 h-4" /> Volver al carrito
        </button>
        <h1 className="text-lg font-black text-zinc-100">Pagar carrito</h1>
        <IzipayCheckout
          formToken={checkout.formToken}
          publicKey={checkout.publicKey}
          orderId={checkout.orderId}
          totalLabel={checkout.totalLabel}
          displayMode={checkout.displayMode as "popup" | "embedded"}
          onSuccess={async () => {
            try { await fetch("/api/izipay/confirm-cart-order", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId: checkout.orderId }) }); } catch {}
            refresh();
            router.replace("/auto/app/marketplace?comprado=1");
          }}
          successRedirect="/auto/app/marketplace"
          successCtaLabel="Volver al Marketplace"
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Link href="/auto/app/marketplace" className="inline-flex items-center gap-1.5 text-sm font-medium text-auto-500">
        <ArrowLeft className="w-4 h-4" /> Marketplace
      </Link>
      <div className="flex items-center gap-2">
        <ShoppingCart className="w-5 h-5 text-auto-400" />
        <h1 className="text-lg font-black text-zinc-100">Tu carrito</h1>
      </div>

      {cartLoading && <div className="flex items-center gap-2 text-sm text-zinc-500"><Loader2 className="w-4 h-4 animate-spin" /> Cargando carrito...</div>}

      {items.length === 0 && !cartLoading ? (
        <div className="glass-card border border-white/10 rounded-2xl p-10 text-center">
          <p className="text-sm text-zinc-500">Tu carrito está vacío.</p>
          <Link href="/auto/app/marketplace" className="inline-block mt-3 text-xs font-bold text-auto-400">Explorar productos</Link>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {items.map((i) => (
              <div key={i.id} className="flex gap-3 glass-card border border-white/10 rounded-2xl p-3">
                <Link href={`/auto/app/marketplace/producto/${i.product.id}`} className="w-16 h-16 rounded-xl overflow-hidden glass-input shrink-0">
                  {i.product.imagen_url ? <img src={i.product.imagen_url} alt="" className="w-full h-full object-cover" /> : <span className="flex h-full items-center justify-center"><ShoppingCart className="w-6 h-6 text-zinc-600" /></span>}
                </Link>
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="text-xs font-bold text-zinc-200 line-clamp-1">{i.product.titulo}</p>
                  <p className="text-[10px] text-zinc-500">{i.product.categoria}</p>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setQty(i.id, Math.max(1, i.quantity - 1))} className="w-7 h-7 rounded-lg bg-white/[0.06] flex items-center justify-center text-zinc-300">−</button>
                    <span className="w-6 text-center text-xs font-black text-zinc-100">{i.quantity}</span>
                    <button onClick={() => setQty(i.id, Math.min(99, i.quantity + 1))} className="w-7 h-7 rounded-lg bg-white/[0.06] flex items-center justify-center text-zinc-300">+</button>
                    <button onClick={() => remove(i.id)} className="ml-auto text-zinc-500 hover:text-red-400"><X className="w-4 h-4" /></button>
                  </div>
                </div>
                <p className="text-sm font-black text-auto-500 self-center">{money((i.product.precio ?? 0) * i.quantity)}</p>
              </div>
            ))}
          </div>

          <div className="glass-card border border-white/10 rounded-2xl p-4 space-y-2">
            <div className="flex justify-between text-xs text-zinc-500">
              <span>{items.length} producto(s)</span><span>{money(total)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-black text-zinc-100">Total</span>
              <span className="text-2xl font-black text-auto-500">{money(total)}</span>
            </div>
            {error && <p className="text-xs text-red-400">{error}</p>}
            <button onClick={pay} disabled={paying}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-auto-600 text-white text-sm font-black hover:bg-auto-500 transition-colors disabled:opacity-60">
              {paying ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
              {paying ? "Conectando..." : `Pagar ${money(total)}`}
            </button>
            <p className="text-[10px] text-zinc-600 text-center flex items-center justify-center gap-1"><Check className="w-3 h-3 text-emerald-500" /> Un solo pago seguro con tarjeta (Izipay)</p>
          </div>
        </>
      )}
    </div>
  );
}

export default function CartCheckoutPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh]"><Loader2 className="w-7 h-7 text-auto-500 animate-spin" /></div>}>
      <CartCheckoutInner />
    </Suspense>
  );
}
