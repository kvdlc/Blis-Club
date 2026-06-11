"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, CheckCircle2, AlertCircle, Lock, CreditCard, X, ShieldCheck, ArrowRight
} from "lucide-react";
import Link from "next/link";

interface RenewalCheckoutProps {
  formToken: string;
  publicKey: string;
  orderId: string;
  totalLabel: string;
  cardLast4: string;
  cardBrand: string;
  displayMode?: "popup" | "embedded";
  onSuccess?: () => void;
  onError?: (msg: string) => void;
  successRedirect?: string;
  successCtaLabel?: string;
}

type FormState = "loading" | "ready" | "processing" | "success" | "error";

const BRAND_LOGO: Record<string, string> = {
  VISA: "visa",
  MASTERCARD: "mastercard",
  AMEX: "amex",
  DINERS: "diners-club",
  DISCOVER: "discover",
};

const BRAND_GRADIENT: Record<string, string> = {
  VISA: "from-blue-600 via-blue-500 to-sky-400",
  MASTERCARD: "from-red-600 via-orange-500 to-yellow-400",
  AMEX: "from-blue-800 via-indigo-600 to-blue-500",
  DINERS: "from-sky-700 via-blue-500 to-cyan-400",
};

export default function RenewalCheckout({
  formToken,
  publicKey,
  orderId,
  totalLabel,
  cardLast4,
  cardBrand,
  displayMode = "embedded",
  onSuccess,
  onError,
  successRedirect = "/guau/app?tab=inicio",
  successCtaLabel = "Ir a la App",
}: RenewalCheckoutProps) {
  const [formState, setFormState] = useState<FormState>("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const krContainerId = useRef(`kr-renew-${Math.random().toString(36).slice(2)}`).current;
  const styleId = useRef(`kr-renew-style-${Math.random().toString(36).slice(2)}`).current;
  const initializedRef = useRef(false);
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  onSuccessRef.current = onSuccess;
  onErrorRef.current = onError;

  const addLog = useCallback((msg: string) => {
    console.log(`[RenewalCheckout] ${msg}`);
  }, []);

  useEffect(() => {
    if (initializedRef.current || typeof window === "undefined") return;
    initializedRef.current = true;
    addLog(`Iniciando renew. formToken=${formToken.slice(0, 8)}...`);

    const init = async () => {
      try {
        injectRenewalStyles(styleId);

        let container = document.getElementById(krContainerId);
        if (!container) {
          container = document.createElement("div");
          container.id = krContainerId;
          container.style.width = "100%";
          const parent = document.getElementById("kr-renew-anchor");
          if (parent) parent.appendChild(container);
        }

        while (container.firstChild) container.removeChild(container.firstChild);

        const krDiv = document.createElement("div");
        krDiv.className = "kr-embedded";
        krDiv.setAttribute("kr-form-token", formToken);
        krDiv.setAttribute("kr-public-key", publicKey);
        krDiv.setAttribute("kr-language", "es-ES");
        krDiv.style.width = "100%";
        krDiv.style.minHeight = "200px";
        container.appendChild(krDiv);

        const script = await loadScript(displayMode);
        addLog("Script cargado");

        const KR = await waitForKR();
        addLog("KR SDK disponible");

        await KR.setFormToken(formToken);
        addLog("setFormToken completado");

        KR.onFormReady(() => {
          addLog("onFormReady");
          setFormState("ready");
        });

        KR.onSubmit((response: any) => {
          addLog(`onSubmit: orderStatus=${response?.clientAnswer?.orderStatus}`);
          const st = response?.clientAnswer?.orderStatus;
          if (st === "PAID") {
            setFormState("success");
            onSuccessRef.current?.();
          } else {
            setFormState("error");
            setErrorMsg(st ? `Pago rechazado (${st})` : "El pago fue rechazado.");
          }
          return true;
        });

        KR.onError((error: any) => {
          addLog(`onError: ${JSON.stringify(error)}`);
          setFormState("error");
          const errMsg = error?.message || "Error en la pasarela de pago.";
          setErrorMsg(errMsg);
          onErrorRef.current?.(errMsg);
          return true;
        });

        setTimeout(() => {
          setFormState((prev) => {
            if (prev === "loading") {
              addLog("Fallback: onFormReady timeout");
              return "ready";
            }
            return prev;
          });
        }, 15000);
      } catch (err: any) {
        addLog(`Error: ${err?.message || err}`);
        setFormState("error");
        setErrorMsg(err?.message || "Error al iniciar la pasarela.");
      }
    };

    init();

    return () => {
      try { window.KR?.removeForms(); } catch {}
      const el = document.getElementById(styleId);
      if (el) el.remove();
    };
  }, [formToken, publicKey, displayMode, addLog, styleId, krContainerId]);

  const brandKey = (cardBrand || "").toUpperCase();
  const brandSlug = BRAND_LOGO[brandKey] || "";
  const gradient = BRAND_GRADIENT[brandKey] || "from-zinc-700 via-zinc-600 to-zinc-500";

  return (
    <div className="bg-white rounded-[1.25rem] border border-zinc-200 shadow-sm overflow-hidden max-w-md mx-auto">
      <div className="flex items-center justify-between p-5 border-b border-zinc-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/25">
            <CreditCard className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-extrabold text-zinc-800 text-sm">Renovar Suscripción</p>
            <p className="text-[10px] text-zinc-400 font-medium">PAGO 1-CLICK SEGURO</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-3 px-5 py-2 border-b border-zinc-100">
        <span className="flex items-center gap-1 text-[10px] text-zinc-400 font-medium">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> SSL 256-BIT
        </span>
        <span className="flex items-center gap-1 text-[10px] text-zinc-400 font-medium">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> PCI-DSS L1
        </span>
      </div>

      {formState !== "success" && formState !== "error" && (
        <div className="px-5 pt-4">
          <div className={`relative rounded-2xl bg-gradient-to-br ${gradient} p-5 text-white shadow-lg mb-4 overflow-hidden`}>
            <div className="absolute top-3 right-4 opacity-20">
              <svg width="60" height="48" viewBox="0 0 60 48" fill="currentColor"><rect x="0" y="0" width="60" height="48" rx="8" /></svg>
            </div>
            <div className="absolute bottom-2 right-3 opacity-10">
              <svg width="80" height="80" viewBox="0 0 80 80"><circle cx="40" cy="40" r="40" fill="currentColor" /></svg>
            </div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-bold uppercase tracking-widest opacity-80">{cardBrand || "Tarjeta"}</span>
                {brandSlug && <img src={`/marcas/${brandSlug}.svg`} alt={cardBrand} className="w-10 h-7 brightness-0 invert" />}
              </div>
              <p className="text-xl tracking-[0.25em] font-mono mb-4">
                •••• •••• •••• {cardLast4 || "0000"}
              </p>
              <div className="flex items-center justify-between text-xs opacity-70">
                <span>Confirma tu CVV</span>
                <span className="font-mono">{totalLabel}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {formState === "loading" && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-5 py-6 space-y-4">
              <div className="bg-[#f4f4f5] rounded-3xl p-5 space-y-3">
                <div className="h-11 bg-white rounded-xl border border-zinc-200/60 animate-pulse" />
                <div className="h-12 bg-emerald-500/30 rounded-xl animate-pulse" />
              </div>
              <div className="flex items-center justify-center gap-3 py-2">
                <Loader2 className="w-5 h-5 text-primary-500 animate-spin" />
                <p className="text-sm text-zinc-400 font-medium">Conectando con la pasarela...</p>
              </div>
            </motion.div>
          )}

          {formState === "ready" && (
            <motion.div key="ready" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-5 py-2">
              <p className="text-xs text-zinc-500 text-center mb-2">Ingresa tu CVV para confirmar el pago</p>
            </motion.div>
          )}

          {formState === "processing" && (
            <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-5 py-10 text-center">
              <Loader2 className="w-8 h-8 text-primary-500 animate-spin mx-auto mb-4" />
              <p className="text-zinc-600 font-medium">Procesando tu renovación...</p>
              <p className="text-xs text-zinc-400 mt-1">No cierres esta ventana</p>
            </motion.div>
          )}

          {formState === "success" && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", bounce: 0.4 }} className="px-5 py-10 text-center">
              <motion.div initial={{ scale: 0, rotate: -15 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", bounce: 0.5, delay: 0.05 }} className="relative mx-auto mb-8 w-28 h-28">
                <div className="absolute inset-0 bg-emerald-400/20 rounded-[2rem] blur-2xl animate-pulse" />
                <div className="relative w-full h-full bg-emerald-100 border-2 border-emerald-200 rounded-3xl flex items-center justify-center shadow-[0_0_60px_rgba(16,185,129,0.15)]">
                  <CheckCircle2 className="w-14 h-14 text-emerald-500" />
                </div>
              </motion.div>
              <h3 className="text-2xl font-black text-zinc-800 mb-2">¡Renovación Exitosa!</h3>
              <p className="text-zinc-500 text-sm mb-4">Tu suscripción ha sido renovada{totalLabel ? ` por ${totalLabel}` : ""}.</p>
              <div className="inline-flex gap-2 px-4 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full mb-8">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1" />
                <span className="text-xs text-emerald-700 font-medium">Pago confirmado</span>
              </div>
              <div>
                <Link href={successRedirect} className="inline-flex items-center justify-center gap-2 px-10 py-4 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-black uppercase text-sm rounded-2xl shadow-lg shadow-primary-500/25 hover:shadow-xl transition-all group">
                  {successCtaLabel} <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </motion.div>
          )}

          {formState === "error" && (
            <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-5 py-10 text-center">
              <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-xl font-black text-zinc-800 mb-2">Pago no completado</h3>
              <p className="text-sm text-zinc-500 mb-6 max-w-sm mx-auto">{errorMsg || "No se pudo procesar el pago."}</p>
              <button onClick={() => window.location.reload()} className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl shadow-lg shadow-primary-500/25 transition-all">
                <Lock className="w-4 h-4" /> Reintentar
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div id="kr-renew-anchor" className={`w-full px-5 ${formState === "loading" || formState === "success" || formState === "error" ? "hidden" : ""}`} />
      </div>

      <div className="border-t border-zinc-100">
        <div className="flex items-center justify-center gap-2 px-5 py-2 border-b border-zinc-100">
          <span className="flex items-center gap-1 text-[10px] text-zinc-400 font-medium">
            <Lock className="w-3 h-3 text-emerald-500" /> Conexión cifrada
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 px-5 py-3">
          <div className="flex flex-col items-center gap-1.5 py-2 px-1 rounded-xl bg-emerald-50/50">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span className="text-[9px] text-emerald-700 font-semibold text-center leading-tight">Datos<br />encriptados</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 py-2 px-1 rounded-xl bg-blue-50/50">
            <CreditCard className="w-5 h-5 text-blue-600" />
            <span className="text-[9px] text-blue-700 font-semibold text-center leading-tight">Pago<br />1-click</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function injectRenewalStyles(styleId: string) {
  if (document.getElementById(styleId)) return;
  const style = document.createElement("style");
  style.id = styleId;
  style.textContent = `
    .kr-embedded {
      background: #f4f4f5 !important;
      border-radius: 1.5rem !important;
      padding: 1rem 1.25rem !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
    }
    .kr-embedded .kr-field { margin-bottom: 0.5rem !important; }
    .kr-embedded .kr-label { display: none !important; }
    .kr-embedded input {
      background: #ffffff !important;
      border: 1.5px solid #e4e4e7 !important;
      border-radius: 0.875rem !important;
      padding: 0.75rem 0.875rem !important;
      font-size: 0.875rem !important;
      color: #27272a !important;
      width: 100% !important;
      height: 2.75rem !important;
      box-sizing: border-box !important;
      transition: border-color 0.2s ease, box-shadow 0.2s ease !important;
      outline: none !important;
      margin: 0 !important;
    }
    .kr-embedded input:focus {
      border-color: #10b981 !important;
      box-shadow: 0 0 0 3px rgba(16,185,129,0.12) !important;
    }
    .kr-embedded .kr-select,
    .kr-embedded select {
      background: #ffffff !important;
      border: 1.5px solid #e4e4e7 !important;
      border-radius: 0.875rem !important;
      padding: 0.75rem 2.5rem 0.75rem 0.875rem !important;
      font-size: 0.875rem !important;
      color: #71717a !important;
      width: 100% !important;
      height: 2.75rem !important;
      box-sizing: border-box !important;
    }
    .kr-embedded .kr-payment-button {
      background: #10b981 !important;
      color: #ffffff !important;
      font-weight: 800 !important;
      font-size: 0.9375rem !important;
      text-transform: uppercase !important;
      letter-spacing: 0.025em !important;
      border: none !important;
      border-radius: 1rem !important;
      padding: 1rem 1.5rem !important;
      width: 100% !important;
      margin-top: 0.75rem !important;
      cursor: pointer !important;
      box-shadow: 0 4px 14px rgba(16,185,129,0.25) !important;
    }
    .kr-embedded .kr-payment-button:hover {
      background: #059669 !important;
      transform: translateY(-1px) !important;
    }
    .kr-embedded .kr-error {
      color: #ef4444 !important;
      font-size: 0.75rem !important;
      margin-top: 0.25rem !important;
    }
    .kr-embedded iframe {
      width: 100% !important;
      height: 2.75rem !important;
      border: none !important;
    }
    .kr-embedded > div:has(iframe) {
      background: #ffffff !important;
      border: 1.5px solid #e4e4e7 !important;
      border-radius: 0.875rem !important;
      min-height: 2.75rem !important;
      height: 2.75rem !important;
      margin-bottom: 0.5rem !important;
      overflow: hidden !important;
    }
  `;
  document.head.appendChild(style);
}

function loadScript(displayMode: string): Promise<HTMLScriptElement> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[src*="kr-payment-form"]') as HTMLScriptElement;
    if (existing) { resolve(existing); return; }
    const script = document.createElement("script");
    const baseUrl = "https://static.micuentaweb.pe/static/js/krypton-client/V4.0/stable/kr-payment-form.min.js";
    script.src = displayMode === "embedded" ? `${baseUrl}?mode=embedded&container=.kr-embedded` : `${baseUrl}?mode=popup`;
    script.async = true;
    script.id = "kr-payment-script";
    script.onload = () => resolve(script);
    script.onerror = () => reject(new Error("Failed to load KR SDK"));
    document.head.appendChild(script);
  });
}

function waitForKR(): Promise<typeof window.KR> {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const check = () => {
      attempts++;
      if (window.KR) { resolve(window.KR); }
      else if (attempts < 40) { setTimeout(check, 300); }
      else { reject(new Error("KR SDK not available")); }
    };
    check();
  });
}