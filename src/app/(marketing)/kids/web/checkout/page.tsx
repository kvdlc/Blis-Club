"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import IzipayCheckout from "@/components/IzipayCheckout";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const planId = searchParams.get("plan") ?? "";
  const email = searchParams.get("email") ?? "";
  const firstName = searchParams.get("firstName") ?? "";
  const lastName = searchParams.get("lastName") ?? "";

  const [formToken, setFormToken] = useState("");
  const [publicKey, setPublicKey] = useState("");
  const [orderId, setOrderId] = useState("");
  const [displayMode, setDisplayMode] = useState<"popup" | "embedded">("embedded");
  const [paymentLoading, setPaymentLoading] = useState(true);
  const [paymentError, setPaymentError] = useState("");
  const [totalLabel, setTotalLabel] = useState("$19.90/trimestre");

  useEffect(() => {
    const init = async () => {
      setPaymentLoading(true);
      try {
        const res = await fetch("/api/izipay/create-subscription", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            planId,
            appId: "kids",
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
    <div className="min-h-[100dvh] bg-kids-gradient">
      {paymentLoading ? (
        <div className="flex min-h-[100dvh] items-center justify-center">
          <div className="space-y-4 rounded-3xl border border-orange-100 bg-white p-12 text-center shadow-xl">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-kids-500" />
            <p className="text-sm font-semibold text-zinc-500">Preparando tu pago seguro...</p>
          </div>
        </div>
      ) : paymentError ? (
        <div className="flex min-h-[100dvh] items-center justify-center px-4">
          <div className="w-full max-w-md space-y-4 rounded-3xl border border-red-100 bg-white p-8 text-center shadow-xl">
            <p className="text-sm font-bold text-red-600">{paymentError}</p>
            <Link href="/kids/web" className="mx-auto flex items-center gap-2 text-sm font-black text-kids-600">
              <ArrowLeft className="h-4 w-4" /> Volver al inicio
            </Link>
          </div>
        </div>
      ) : (
        <div className="px-4 py-8">
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
            successRedirect="/kids/app"
            successCtaLabel="Ir a Kids Club"
          />
        </div>
      )}
    </div>
  );
}

export default function KidsWebCheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[100dvh] items-center justify-center bg-kids-gradient">
          <Loader2 className="h-8 w-8 animate-spin text-kids-500" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
