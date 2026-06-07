"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import IzipayCheckout from "@/components/IzipayCheckout";
import { Loader2, ArrowLeft, Zap, ShieldCheck, Lock, Mail, CheckCircle, User, Pencil } from "lucide-react";
import Link from "next/link";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = searchParams.get("plan") ?? "monthly";

  const [step, setStep] = useState<"auth" | "details" | "payment">("auth");
  const [email, setEmail] = useState("");
  const [magicSent, setMagicSent] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");

  const [formToken, setFormToken] = useState("");
  const [publicKey, setPublicKey] = useState("");
  const [orderId, setOrderId] = useState("");
  const [displayMode, setDisplayMode] = useState<"popup" | "embedded">("popup");
  const [paymentLoading, setPaymentLoading] = useState(true);
  const [paymentError, setPaymentError] = useState("");

  const supabase = createClient();

  // Check if user is already authenticated (e.g. returned from magic link)
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        // If already has first_name, skip details step
        supabase.from("profiles").select("first_name, last_name").eq("id", user.id).single()
          .then(({ data }) => {
            if (data?.first_name && data?.last_name) {
              setStep("payment");
            } else {
              setStep("details");
            }
          });
      }
    });
  }, []);

  // Listen for auth state changes (magic link callback sets session)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        supabase.auth.getUser().then(({ data: { user } }) => {
          if (user) {
            supabase.from("profiles").select("first_name, last_name").eq("id", user.id).single()
              .then(({ data }) => {
                if (data?.first_name && data?.last_name) {
                  setStep("payment");
                } else {
                  setStep("details");
                }
              });
          }
        });
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // Fetch formToken when entering payment step
  useEffect(() => {
    if (step !== "payment") return;
    setPaymentLoading(true);
    fetch("/api/izipay/create-subscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId, appId: "guau" }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.formToken) {
          setFormToken(data.formToken);
          setPublicKey(data.publicKey || "");
          setOrderId(data.orderId || "");
          setDisplayMode(data.displayMode || "popup");
        } else {
          setPaymentError(data.error || "No se pudo iniciar el pago");
        }
        setPaymentLoading(false);
      })
      .catch(() => {
        setPaymentError("Error de conexión");
        setPaymentLoading(false);
      });
  }, [step, planId]);

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(`/guau/web/checkout?plan=${planId}`)}`,
      },
    });
    if (error) setAuthError(error.message);
    else setMagicSent(true);
    setAuthLoading(false);
  };

  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setDetailsLoading(true);
    setDetailsError("");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setDetailsError("Sesión expirada. Por favor vuelve a ingresar tu correo.");
      setStep("auth");
      setDetailsLoading(false);
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({ first_name: firstName.trim(), last_name: lastName.trim() })
      .eq("id", user.id);

    if (error) {
      setDetailsError("Error al guardar datos. Intenta de nuevo.");
    } else {
      setStep("payment");
    }
    setDetailsLoading(false);
  };

  // ═══ Auth step ═══
  if (step === "auth") {
    return (
      <div className="min-h-[100dvh] bg-primary-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <Link href="/guau/web" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-primary-600 mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Volver
          </Link>

          {magicSent ? (
            <div className="bg-white rounded-3xl p-8 text-center space-y-4 shadow-xl border border-primary-100">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-100 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-xl font-extrabold text-zinc-800">Magic Link enviado</h2>
              <p className="text-sm text-zinc-500">
                Revisa <span className="font-semibold text-zinc-700">{email}</span>. Te enviamos un enlace mágico para continuar con tu compra.
              </p>
              <p className="text-xs text-zinc-400">
                Al hacer clic en el enlace volverás aquí para completar el pago.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-primary-100 space-y-6">
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-extrabold text-lg mx-auto mb-4">B</div>
                <h1 className="text-2xl font-extrabold text-zinc-800">Casi listo</h1>
                <p className="text-sm text-zinc-500 mt-2">
                  Ingresa tu correo para continuar al pago seguro.
                </p>
              </div>

              <div className="bg-primary-50 rounded-2xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Plan</span>
                  <span className="font-bold text-zinc-800">Pro Mensual</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Precio</span>
                  <span className="font-bold text-zinc-800">$9.99/mes</span>
                </div>
              </div>

              <form onSubmit={handleMagicLink} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-zinc-700 mb-2">Correo electrónico</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tutor@blis.club"
                      className="w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-11 pr-4 py-3.5 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    />
                  </div>
                </div>

                {authError && (
                  <p className="text-sm text-red-600 bg-red-50 rounded-xl p-3">{authError}</p>
                )}

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white py-3.5 font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-primary-500/25"
                >
                  {authLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Zap className="w-4 h-4" />
                  )}
                  {authLoading ? "Enviando..." : "Continuar al pago"}
                </button>
              </form>

              <div className="flex items-center justify-center gap-4 text-[10px] text-zinc-400">
                <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-primary-500" />Garantía 14 días</span>
                <span className="flex items-center gap-1"><Lock className="w-3 h-3 text-primary-500" />Pago seguro</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ═══ Details step ═══
  if (step === "details") {
    return (
      <div className="min-h-[100dvh] bg-primary-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <Link href="/guau/web" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-primary-600 mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Volver
          </Link>

          <div className="bg-white rounded-3xl p-8 shadow-xl border border-primary-100 space-y-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-extrabold text-lg mx-auto mb-4">
                <User className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-extrabold text-zinc-800">Completa tus datos</h1>
              <p className="text-sm text-zinc-500 mt-2">
                Necesitamos tu nombre para el comprobante de pago.
              </p>
            </div>

            <form onSubmit={handleSaveDetails} className="space-y-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-semibold text-zinc-700 mb-2">Nombre</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    id="firstName"
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Juan"
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-11 pr-4 py-3.5 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-semibold text-zinc-700 mb-2">Apellido</label>
                <div className="relative">
                  <Pencil className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    id="lastName"
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Pérez"
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-11 pr-4 py-3.5 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>
              </div>

              {detailsError && (
                <p className="text-sm text-red-600 bg-red-50 rounded-xl p-3">{detailsError}</p>
              )}

              <button
                type="submit"
                disabled={detailsLoading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white py-3.5 font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-primary-500/25"
              >
                {detailsLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Zap className="w-4 h-4" />
                )}
                {detailsLoading ? "Guardando..." : "Continuar al pago"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ═══ Payment step ═══
  return (
    <div className="min-h-[100dvh] bg-primary-50">
      {paymentLoading ? (
        <div className="flex items-center justify-center min-h-[100dvh]">
          <div className="bg-white rounded-3xl p-12 text-center space-y-4 shadow-xl border border-primary-100">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin mx-auto" />
            <p className="text-sm text-zinc-500">Preparando tu pago seguro...</p>
          </div>
        </div>
      ) : paymentError ? (
        <div className="flex items-center justify-center min-h-[100dvh] px-4">
          <div className="bg-white rounded-3xl p-8 text-center space-y-4 shadow-xl border border-red-100 max-w-md w-full">
            <p className="text-sm text-red-600 font-semibold">{paymentError}</p>
            <button
              onClick={() => router.push("/guau/web")}
              className="flex items-center gap-2 mx-auto text-sm text-primary-600 font-semibold"
            >
              <ArrowLeft className="w-4 h-4" /> Volver al inicio
            </button>
          </div>
        </div>
      ) : (
        <IzipayCheckout
          formToken={formToken}
          publicKey={publicKey}
          orderId={orderId}
          totalLabel="$9.99/mes"
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
            setTimeout(() => router.push("/guau/web?payment=success"), 1500);
          }}
          onError={(msg) => setPaymentError(msg)}
          onClose={() => router.push("/guau/web")}
          successRedirect="/guau/app"
          successCtaLabel="Ir a la App"
          isModal={true}
        />
      )}
    </div>
  );
}

export default function WebCheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[100dvh] bg-primary-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
