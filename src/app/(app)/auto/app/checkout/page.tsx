"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import IzipayCheckout from "@/components/IzipayCheckout";
import { Loader2, ArrowLeft } from "lucide-react";

export default function AutoCheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = searchParams.get("plan");

  const [formToken, setFormToken] = useState("");
  const [publicKey, setPublicKey] = useState("");
  const [orderId, setOrderId] = useState("");
  const [displayMode, setDisplayMode] = useState<"popup" | "embedded">("embedded");
  const [totalLabel, setTotalLabel] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!planId) {
      router.push("/auto/app/suscripcion");
      return;
    }

    fetch("/api/izipay/create-subscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId, appId: "auto" }),
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
      .catch(() => {
        setError("Error de conexión");
        setLoading(false);
      });
  }, [planId, router]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-auto-500 animate-spin" />
        <p className="text-sm text-zinc-400">Preparando tu pago seguro...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4">
        <p className="text-sm text-red-600 font-semibold text-center">{error}</p>
        <button
          onClick={() => router.push("/auto/app/suscripcion")}
          className="flex items-center gap-2 text-sm text-auto-400 font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Volver a planes
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-zinc-100">Checkout</h1>

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
            } catch {}
          }
          router.replace("/auto/app?payment=success");
        }}
        onError={(msg) => setError(msg)}
        successRedirect="/auto/app"
        successCtaLabel="Ir a la App"
      />
    </div>
  );
}
