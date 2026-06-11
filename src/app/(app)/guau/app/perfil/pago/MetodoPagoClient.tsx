"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard, Plus, Trash2, ArrowLeft, Shield, Loader2,
  AlertCircle, CheckCircle2, Clock, Crown
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import IzipayCheckout from "@/components/IzipayCheckout";

interface PaymentMethod {
  id: string;
  card_brand: string;
  card_last4: string;
  card_expiry: string;
  is_active: boolean;
  created_at: string;
}

interface Subscription {
  id: string;
  status: string;
  plan_type: string;
  current_period_start: string | null;
  current_period_end: string | null;
  plan_id: string | null;
  plans: {
    name: string;
    price_cents: number;
    billing_interval: string;
  } | null;
}

const BRAND_CONFIG: Record<string, { gradient: string; logo: string; bg: string }> = {
  VISA: {
    gradient: "from-blue-700 via-blue-500 to-sky-400",
    logo: "visa",
    bg: "bg-blue-600",
  },
  MASTERCARD: {
    gradient: "from-red-600 via-orange-500 to-yellow-400",
    logo: "mastercard",
    bg: "bg-red-600",
  },
  AMEX: {
    gradient: "from-blue-900 via-indigo-600 to-blue-400",
    logo: "amex",
    bg: "bg-indigo-700",
  },
  DINERS: {
    gradient: "from-cyan-700 via-teal-500 to-cyan-400",
    logo: "diners-club",
    bg: "bg-teal-600",
  },
};

const DEFAULT_BRAND = {
  gradient: "from-zinc-700 via-zinc-600 to-zinc-400",
  logo: "",
  bg: "bg-zinc-600",
};

export default function MetodoPagoClient() {
  const router = useRouter();
  const supabase = createClient();

  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showAddCard, setShowAddCard] = useState(false);
  const [addCardState, setAddCardState] = useState<{ formToken: string; publicKey: string; displayMode: string } | null>(null);
  const [addCardLoading, setAddCardLoading] = useState(false);
  const [addCardError, setAddCardError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const fetchMethods = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [methodsRes, subRes] = await Promise.all([
        fetch("/api/izipay/payment-methods"),
        supabase
          .from("subscriptions")
          .select("id, status, plan_type, current_period_start, current_period_end, plan_id, plans(id, name, price_cents, billing_interval)")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      const methodsData = await methodsRes.json();
      if (methodsData.methods) {
        setMethods(methodsData.methods);
      }

      if (subRes.data) {
        setSubscription(subRes.data as unknown as Subscription);
      }
    } catch (err) {
      console.error("Error fetching payment data:", err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchMethods();
  }, [fetchMethods]);

  const handleDeleteCard = async (id: string) => {
    setDeleting(id);
    try {
      const res = await fetch(`/api/izipay/payment-methods/${id}`, { method: "DELETE" });
      if (res.ok) {
        setMethods((prev) => prev.filter((m) => m.id !== id));
        setSuccessMsg("Tarjeta eliminada correctamente");
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch {
      console.error("Error deleting card");
    } finally {
      setDeleting(null);
    }
  };

  const handleAddCard = async () => {
    setAddCardLoading(true);
    setAddCardError("");
    try {
      const res = await fetch("/api/izipay/add-card", { method: "POST" });
      const data = await res.json();
      if (data.formToken) {
        setAddCardState({
          formToken: data.formToken,
          publicKey: data.publicKey,
          displayMode: data.displayMode || "embedded",
        });
        setShowAddCard(true);
      } else {
        setAddCardError(data.error || "No se pudo iniciar el registro de tarjeta.");
      }
    } catch {
      setAddCardError("Error de conexión.");
    } finally {
      setAddCardLoading(false);
    }
  };

  const handleAddCardSuccess = async () => {
    setShowAddCard(false);
    setAddCardState(null);
    setSuccessMsg("Tarjeta guardada correctamente");
    for (let i = 0; i < 10; i++) {
      await new Promise((r) => setTimeout(r, 1500));
      try {
        const res = await fetch("/api/izipay/payment-methods");
        const data = await res.json();
        if (data.methods && data.methods.length > 0) {
          setMethods(data.methods);
          break;
        }
      } catch {}
    }
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("es-PE", { day: "numeric", month: "long", year: "numeric" });
  };

  const getDaysLeft = (endDate: string | null) => {
    if (!endDate) return null;
    const diff = new Date(endDate).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const getBrandConfig = (brand: string) => {
    return BRAND_CONFIG[(brand || "").toUpperCase()] || DEFAULT_BRAND;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
        <p className="text-sm text-zinc-500">Cargando métodos de pago...</p>
      </div>
    );
  }

  if (showAddCard && addCardState) {
    return (
      <div className="space-y-4 px-4 pt-4">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => { setShowAddCard(false); setAddCardState(null); }} className="w-9 h-9 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center transition-colors">
            <ArrowLeft className="w-4 h-4 text-zinc-600" />
          </button>
          <h2 className="text-lg font-bold text-zinc-900">Agregar Tarjeta</h2>
        </div>
        <IzipayCheckout
          formToken={addCardState.formToken}
          publicKey={addCardState.publicKey}
          orderId={`addcard_${Date.now()}`}
          totalLabel="Verificación $0.00"
          displayMode={(addCardState.displayMode as "popup" | "embedded") || "embedded"}
          onSuccess={handleAddCardSuccess}
          onError={(msg) => setAddCardError(msg)}
          successRedirect="/guau/app/perfil/pago"
          successCtaLabel="Volver a Métodos de Pago"
        />
        {addCardError && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <p className="text-xs text-red-600">{addCardError}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 pt-2 pb-8 max-w-lg mx-auto">
      <div className="flex items-center gap-3">
        <button onClick={() => router.push("/guau/app/perfil")} className="w-9 h-9 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center transition-colors">
          <ArrowLeft className="w-4 h-4 text-zinc-600" />
        </button>
        <div>
          <h1 className="text-xl font-black text-zinc-900">Método de Pago</h1>
          <p className="text-xs text-zinc-500">Gestiona tus tarjetas y suscripción</p>
        </div>
      </div>

      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <p className="text-xs text-emerald-700 font-medium">{successMsg}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subscription Status */}
      {subscription && (
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/25">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-zinc-800 text-sm">
                  {subscription.plans?.name || "Plan Premium"}
                </p>
                <p className="text-xs text-zinc-500">
                  {subscription.plans
                    ? `$${(subscription.plans.price_cents / 100).toFixed(2)}/${subscription.plans.billing_interval === "quarter" ? "trimestre" : subscription.plans.billing_interval === "year" ? "año" : "mes"}`
                    : "—"}
                </p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                subscription.status === "active"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-zinc-100 text-zinc-500 border border-zinc-200"
              }`}>
                {subscription.status === "active" ? "Activo" : subscription.status === "trialing" ? "Prueba" : "Inactivo"}
              </span>
            </div>

            {subscription.current_period_end && (
              <div className="mt-3 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                {(() => {
                  const days = getDaysLeft(subscription.current_period_end);
                  if (days === null) return <span className="text-xs text-zinc-500">Sin fecha de vencimiento</span>;
                  const isUrgent = days <= 7;
                  return (
                    <span className={`text-xs font-medium ${isUrgent ? "text-amber-600" : "text-zinc-500"}`}>
                      {days > 0 ? `Vence en ${days} día${days !== 1 ? "s" : ""}` : "Vencida"} — {formatDate(subscription.current_period_end)}
                    </span>
                  );
                })()}
              </div>
            )}
          </div>

          {subscription.status === "active" && getDaysLeft(subscription.current_period_end) !== null && (getDaysLeft(subscription.current_period_end) ?? 0) <= 14 && (
            <div className="px-5 pb-4">
              <button
                onClick={() => router.push("/guau/app/checkout/renew?plan=" + (subscription.plan_id || ""))}
                className="w-full py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-primary-500/25 hover:shadow-xl transition-all"
              >
                Renovar Suscripción
              </button>
            </div>
          )}
        </div>
      )}

      {/* Saved Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-zinc-800">Tarjetas Guardadas</h2>
          <div className="flex items-center gap-1 text-[10px] text-zinc-400">
            <Shield className="w-3 h-3" /> Cifrado de extremo a extremo
          </div>
        </div>

        {methods.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-zinc-300 p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-zinc-100 flex items-center justify-center">
              <CreditCard className="w-8 h-8 text-zinc-400" />
            </div>
            <p className="text-sm font-semibold text-zinc-700 mb-1">Sin tarjetas guardadas</p>
            <p className="text-xs text-zinc-500 mb-4">Agrega una tarjeta para pagos más rápidos</p>
            <button
              onClick={handleAddCard}
              disabled={addCardLoading}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-primary-500/25 disabled:opacity-50"
            >
              {addCardLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Agregar Tarjeta
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {methods.map((method) => {
              const config = getBrandConfig(method.card_brand);
              return (
                <motion.div
                  key={method.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative group"
                >
                  <div className={`relative rounded-2xl bg-gradient-to-br ${config.gradient} p-5 text-white shadow-lg overflow-hidden`}>
                    <div className="absolute top-3 right-4 opacity-20">
                      <svg width="60" height="48" viewBox="0 0 60 48" fill="currentColor"><rect x="0" y="0" width="60" height="48" rx="8" /></svg>
                    </div>
                    <div className="absolute bottom-2 right-3 opacity-10">
                      <svg width="80" height="80" viewBox="0 0 80 80"><circle cx="40" cy="40" r="40" fill="currentColor" /></svg>
                    </div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-5">
                        <span className="text-[11px] font-bold uppercase tracking-widest opacity-80">
                          {method.card_brand || "Tarjeta"}
                        </span>
                        {config.logo && (
                          <img src={`/marcas/${config.logo}.svg`} alt={method.card_brand} className="w-10 h-7 brightness-0 invert" />
                        )}
                      </div>
                      <p className="text-xl tracking-[0.25em] font-mono mb-4">
                        •••• •••• •••• {method.card_last4}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs opacity-70">
                          Exp: {method.card_expiry || "—"}
                        </span>
                        <span className="text-[10px] opacity-50 font-mono">
                          {new Date(method.created_at).toLocaleDateString("es-PE", { month: "short", year: "numeric" })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                    <button
                      onClick={() => handleDeleteCard(method.id)}
                      disabled={deleting === method.id}
                      className="w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm hover:bg-red-500/80 flex items-center justify-center transition-all"
                      title="Eliminar tarjeta"
                    >
                      {deleting === method.id ? (
                        <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5 text-white" />
                      )}
                    </button>
                  </div>
                </motion.div>
              );
            })}

            <button
              onClick={handleAddCard}
              disabled={addCardLoading}
              className="w-full py-4 border-2 border-dashed border-zinc-300 hover:border-primary-400 hover:bg-primary-50/50 rounded-2xl flex items-center justify-center gap-2 text-sm text-zinc-500 hover:text-primary-600 font-semibold transition-all disabled:opacity-50"
            >
              {addCardLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Agregar otra tarjeta
            </button>
          </div>
        )}
      </div>

      {addCardError && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <p className="text-xs text-red-600">{addCardError}</p>
        </div>
      )}

      <div className="flex items-center justify-center gap-4 pt-2 pb-4">
        <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
          <Shield className="w-3.5 h-3.5 text-emerald-500" /> Datos encriptados
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
          <CreditCard className="w-3.5 h-3.5 text-blue-500" /> PCI-DSS Nivel 1
        </div>
      </div>
    </div>
  );
}