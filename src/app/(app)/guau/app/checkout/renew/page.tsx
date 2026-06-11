"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import RenewalCheckout from "@/components/RenewalCheckout";
import IzipayCheckout from "@/components/IzipayCheckout";
import { Loader2, ArrowLeft } from "lucide-react";

export default function RenewCheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = searchParams.get("plan");

  const [mode, setMode] = useState<"loading" | "1click" | "full" | "full-checkout">("loading");
  const [formToken, setFormToken] = useState("");
  const [publicKey, setPublicKey] = useState("");
  const [orderId, setOrderId] = useState("");
  const [displayMode, setDisplayMode] = useState<"popup" | "embedded">("embedded");
  const [totalLabel, setTotalLabel] = useState("");
  const [cardLast4, setCardLast4] = useState("");
  const [cardBrand, setCardBrand] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!planId) {
      router.replace("/guau/app/suscripcion", { scroll: false });
      return;
    }

    const init = async () => {
      try {
        const methodsRes = await fetch("/api/izipay/payment-methods");
        const methodsData = await methodsRes.json();

        const hasActiveCard = methodsData.methods && methodsData.methods.length > 0;

        if (hasActiveCard) {
          const token = methodsData.methods[0];
          setCardLast4(token.card_last4);
          setCardBrand(token.card_brand);

          const renewRes = await fetch("/api/izipay/renew-subscription", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paymentTokenId: token.id, planId }),
          });
          const renewData = await renewRes.json();

          if (renewData.formToken) {
            setFormToken(renewData.formToken);
            setPublicKey(renewData.publicKey || "");
            setOrderId(renewData.orderId || "");
            setDisplayMode(renewData.displayMode || "embedded");
            setTotalLabel(renewData.totalLabel || "");
            setCardLast4(renewData.cardLast4 || token.card_last4);
            setCardBrand(renewData.cardBrand || token.card_brand);
            setMode("1click");
          } else {
            setError(renewData.error || "No se pudo iniciar la renovación con tu tarjeta guardada.");
            setMode("full");
          }
        } else {
          setMode("full");
        }
      } catch {
        setError("Error de conexión");
        setMode("full");
      }
    };

    init();
  }, [planId, router]);

  const handleFullCheckout = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/izipay/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, appId: "guau" }),
      });
      const data = await res.json();
      if (data.formToken) {
        setFormToken(data.formToken);
        setPublicKey(data.publicKey || "");
        setOrderId(data.orderId || "");
        setDisplayMode(data.displayMode || "embedded");
        setTotalLabel(data.totalLabel || "");
        setMode("full-checkout");
      } else {
        setError(data.error || "No se pudo iniciar el pago");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  if (mode === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
        <p className="text-sm text-zinc-500">Preparando tu renovación...</p>
      </div>
    );
  }

  if (error && mode === "full") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4">
        <p className="text-sm text-danger-600 font-semibold text-center">{error}</p>
        <p className="text-xs text-zinc-500 text-center">Puedes pagar con una nueva tarjeta:</p>
        <button
          onClick={handleFullCheckout}
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-primary-500/25 transition-all"
        >
          Pagar con nueva tarjeta
        </button>
        <button
          onClick={() => router.push("/guau/app/suscripcion")}
          className="flex items-center gap-2 text-sm text-primary-600 font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Volver a planes
        </button>
      </div>
    );
  }

  if (mode === "1click") {
    return (
      <div className="space-y-4 px-4 pt-4">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/guau/app/perfil/pago")} className="w-9 h-9 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center transition-colors">
            <ArrowLeft className="w-4 h-4 text-zinc-600" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-zinc-900">Renovar Suscripción</h1>
            <p className="text-xs text-zinc-500">Confirma con tu tarjeta guardada</p>
          </div>
        </div>
        <RenewalCheckout
          formToken={formToken}
          publicKey={publicKey}
          orderId={orderId}
          totalLabel={totalLabel}
          cardLast4={cardLast4}
          cardBrand={cardBrand}
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
            router.replace("/guau/app?tab=inicio&payment=renewed");
          }}
          onError={(msg) => setError(msg)}
          successRedirect="/guau/app?tab=inicio"
          successCtaLabel="Ir a la App"
        />
        {error && (
          <p className="text-xs text-danger-600 text-center">{error}</p>
        )}
      </div>
    );
  }

  if (mode === "full-checkout") {
    return (
      <div className="space-y-4 px-4 pt-4">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/guau/app/suscripcion")} className="w-9 h-9 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center transition-colors">
            <ArrowLeft className="w-4 h-4 text-zinc-600" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-zinc-900">Checkout</h1>
            <p className="text-xs text-zinc-500">Plan seleccionado: {planId}</p>
          </div>
        </div>
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
            router.replace("/guau/app?tab=inicio&payment=success");
          }}
          onError={(msg) => setError(msg)}
          successRedirect="/guau/app?tab=inicio"
          successCtaLabel="Ir a la App"
        />
        {error && (
          <p className="text-xs text-danger-600 text-center">{error}</p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
      <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      <p className="text-sm text-zinc-500">Preparando tu pago...</p>
    </div>
  );
}