"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import IzipayCheckout from "@/components/IzipayCheckout";
import { Loader2, ArrowLeft } from "lucide-react";

export default function KidsCheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = searchParams.get("plan");

  const [formToken, setFormToken] = useState("");
  const [publicKey, setPublicKey] = useState("");
  const [orderId, setOrderId] = useState("");
  const [displayMode, setDisplayMode] = useState<"popup" | "embedded">("embedded");
  const [totalLabel, setTotalLabel] = useState("$19.90/trimestre");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!planId) {
      router.push("/kids/app/suscripcion");
      return;
    }
    fetch("/api/izipay/create-subscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId, appId: "kids" }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.formToken) {
          setFormToken(data.formToken);
          setPublicKey(data.publicKey || "");
          setOrderId(data.orderId || "");
          setDisplayMode(data.displayMode || "embedded");
          if (data.totalLabel) setTotalLabel(data.totalLabel);
        } else {
          setError(data.error || "No se pudo iniciar el pago");
        }
        setLoading(false);
      })
      .catch(() => { setError("Error de conexión"); setLoading(false); });
  }, [planId, router]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-kids-500" />
        <p className="text-sm font-semibold text-zinc-500">Preparando tu pago seguro...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4">
        <p className="text-center text-sm font-bold text-red-500">{error}</p>
        <button onClick={() => router.push("/kids/app/suscripcion")} className="flex items-center gap-2 text-sm font-black text-kids-600">
          <ArrowLeft className="h-4 w-4" /> Volver a planes
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-black text-zinc-900">Checkout · Kids Club</h1>
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
            } catch { /* webhook handles it */ }
          }
          router.replace("/kids/app?payment=success");
        }}
        onError={(msg) => setError(msg)}
        successRedirect="/kids/app"
        successCtaLabel="Ir a Kids Club"
      />
    </div>
  );
}
