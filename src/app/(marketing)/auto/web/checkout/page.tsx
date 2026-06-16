"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import IzipayCheckout from "@/components/IzipayCheckout";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = searchParams.get("plan") ?? "quarterly";
  const email = searchParams.get("email") ?? "";
  const firstName = searchParams.get("firstName") ?? "";
  const lastName = searchParams.get("lastName") ?? "";

  const [formToken, setFormToken] = useState("");
  const [publicKey, setPublicKey] = useState("");
  const [orderId, setOrderId] = useState("");
  const [displayMode, setDisplayMode] = useState<"popup" | "embedded">("embedded");
  const [paymentLoading, setPaymentLoading] = useState(true);
  const [paymentError, setPaymentError] = useState("");
  const [totalLabel, setTotalLabel] = useState("S/ 1.00/trimestre");

  useEffect(() => {
    const init = async () => {
      setPaymentLoading(true);
      try {
        const res = await fetch("/api/izipay/create-subscription", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            planId,
            appId: "auto",
            ...(email ? { email } : {}),
            ...(firstName ? { firstName } : {}),
            ...(lastName ? { lastName } : {}),
          }),
        });
        const data = await res.json();
        if (data.formToken) {
          setFormToken(data.formToken);
          setPublicKey(data.publicKey || "");
          setOrderId(data.orderId || "");
          setDisplayMode(data.displayMode || "embedded");
          if (data.totalLabel) setTotalLabel(data.totalLabel);
        } else {
          setPaymentError(data.error || "No se pudo iniciar el pago");
        }
      } catch {
        setPaymentError("Error de conexión");
      }
      setPaymentLoading(false);
    };

    init();
  }, [planId, email, firstName, lastName]);

  return (
    <div className="min-h-[100dvh] bg-auto-gradient">
      {paymentLoading ? (
        <div className="flex items-center justify-center min-h-[100dvh]">
          <div className="bg-zinc-900 rounded-3xl p-12 text-center space-y-4 shadow-xl border border-white/10">
            <Loader2 className="w-8 h-8 text-auto-500 animate-spin mx-auto" />
            <p className="text-sm text-zinc-400">Preparando tu pago seguro...</p>
          </div>
        </div>
      ) : paymentError ? (
        <div className="flex items-center justify-center min-h-[100dvh] px-4">
          <div className="bg-zinc-900 rounded-3xl p-8 text-center space-y-4 shadow-xl border border-red-500/20 max-w-md w-full">
            <p className="text-sm text-red-400 font-semibold">{paymentError}</p>
            <Link
              href="/auto/web"
              className="flex items-center gap-2 mx-auto text-sm text-auto-500 font-semibold"
            >
              <ArrowLeft className="w-4 h-4" /> Volver al inicio
            </Link>
          </div>
        </div>
      ) : (
        <div className="py-8 px-4">
          <IzipayCheckout
            formToken={formToken}
            publicKey={publicKey}
            orderId={orderId}
            totalLabel={totalLabel}
            displayMode={displayMode}
            onSuccess={async () => {
              if (orderId) {
                try {
                  await fetch("/api/izipay/confirm", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ orderId }),
                  });
                } catch { /* webhook handles it anyway */ }
              }
            }}
            onError={(msg) => setPaymentError(msg)}
            successRedirect="https://blis.club"
            successCtaLabel="Iniciar sesión"
          />
        </div>
      )}
    </div>
  );
}

export default function AutoWebCheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[100dvh] bg-auto-gradient flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-auto-500 animate-spin" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
