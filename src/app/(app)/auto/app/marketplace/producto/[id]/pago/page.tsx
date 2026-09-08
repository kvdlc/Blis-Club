"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import IzipayCheckout from "@/components/IzipayCheckout";
import { Loader2, ArrowLeft, CreditCard, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

function ProductCheckoutPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get("product");
  const qty = Math.max(1, Math.min(50, Number(searchParams.get("qty")) || 1));

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [needEmail, setNeedEmail] = useState(false);
  const [error, setError] = useState("");
  const [checkout, setCheckout] = useState<{
    formToken: string; publicKey: string; orderId: string; displayMode: string; totalLabel: string; productTitulo: string;
  } | null>(null);

  // Si hay sesión, no pedimos correo
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!active) return;
        if (user?.email) setEmail(user.email);
        else setNeedEmail(true);
      } catch {
        if (active) setNeedEmail(true);
      }
    })();
    return () => { active = false; };
  }, []);

  const startCheckout = async (correo?: string) => {
    if (!productId) { setError("Producto no válido."); setLoading(false); return; }
    if (needEmail && !correo?.trim()) { setError("Escribe tu correo para el recibo."); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/izipay/create-product-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: qty, email: (correo || email)?.trim() }),
      });
      const data = await res.json();
      if (data.formToken) {
        setCheckout({
          formToken: data.formToken, publicKey: data.publicKey || "", orderId: data.orderId,
          displayMode: data.displayMode || "embedded", totalLabel: data.totalLabel || "", productTitulo: data.titulo || "",
        });
      } else {
        setError(data.error || "No se pudo iniciar el pago.");
      }
    } catch {
      setError("Fallo de conexión. Intenta de nuevo.");
    }
    setLoading(false);
  };

  // Lanzar el pago automáticamente cuando ya sabemos si necesita email o no
  useEffect(() => {
    if (!loading || needEmail) return;
    startCheckout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needEmail]);

  if (loading && !checkout) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-auto-500 animate-spin" />
        <p className="text-sm text-zinc-500">Preparando tu pago seguro...</p>
      </div>
    );
  }

  // Pedir email (solo invitados)
  if (needEmail && !checkout) {
    return (
      <div className="max-w-md mx-auto mt-8 space-y-4">
        <Link href={`/auto/app/marketplace/producto/${productId}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-auto-500">
          <ArrowLeft className="w-4 h-4" /> Volver al producto
        </Link>
        <div className="bg-zinc-900 border border-white/10 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-auto-600/15 flex items-center justify-center"><CreditCard className="w-5 h-5 text-auto-400" /></div>
            <div>
              <p className="text-sm font-black text-zinc-50">Finalizar compra</p>
              <p className="text-[10px] text-zinc-500">Pago seguro con tarjeta</p>
            </div>
          </div>
          <p className="text-xs text-zinc-400">Escribe tu correo para recibir el comprobante de tu compra.</p>
          <input
            type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && startCheckout(email)}
            placeholder="tu@correo.com" autoFocus
            className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-zinc-800 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-auto-600/20"
          />
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button type="button" onClick={() => startCheckout(email)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-auto-600 text-white text-sm font-black hover:bg-auto-500 transition-colors">
            <CreditCard className="w-4 h-4" /> Continuar al pago
          </button>
        </div>
      </div>
    );
  }

  // Error
  if (error && !checkout) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4">
        <div className="w-14 h-14 rounded-2xl bg-red-500/15 flex items-center justify-center"><X className="w-7 h-7 text-red-400" /></div>
        <p className="text-sm text-red-400 font-semibold text-center">{error}</p>
        <button onClick={() => { setError(""); setLoading(true); setNeedEmail(!email); }} className="flex items-center gap-2 text-sm text-auto-500 font-semibold">
          <ArrowLeft className="w-4 h-4" /> Reintentar
        </button>
      </div>
    );
  }

  // Checkout Izipay
  if (!checkout) return null;
  return (
    <div className="space-y-4">
      <Link href={`/auto/app/marketplace/producto/${productId}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-auto-500">
        <ArrowLeft className="w-4 h-4" /> Volver al producto
      </Link>
      <h1 className="text-lg font-black text-zinc-100">Finalizar compra</h1>

      <IzipayCheckout
        formToken={checkout.formToken}
        publicKey={checkout.publicKey}
        orderId={checkout.orderId}
        totalLabel={checkout.totalLabel}
        displayMode={checkout.displayMode as "popup" | "embedded"}
        onSuccess={async () => {
          if (checkout.orderId) {
            try {
              await fetch("/api/izipay/confirm-product-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId: checkout.orderId }),
              });
            } catch {}
          }
          router.replace("/auto/app/marketplace?comprado=1");
        }}
        onClose={() => router.back()}
        onError={(msg) => setError(msg)}
        successRedirect="/auto/app/marketplace"
        successCtaLabel="Volver al Marketplace"
      />
    </div>
  );
}

export default function ProductCheckoutPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 text-auto-500 animate-spin" /></div>}>
      <ProductCheckoutPageInner />
    </Suspense>
  );
}
