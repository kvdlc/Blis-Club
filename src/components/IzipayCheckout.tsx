"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, CheckCircle2, AlertCircle, Shield,
  ArrowRight, Lock, CreditCard, X, ShieldCheck, Zap, Building2
} from "lucide-react";
import Link from "next/link";

interface IzipayCheckoutProps {
  formToken: string;
  publicKey: string;
  orderId: string;
  totalLabel: string;
  displayMode?: 'popup' | 'embedded';
  onSuccess?: () => void;
  onError?: (msg: string) => void;
  onClose?: () => void;
  successRedirect?: string;
  successCtaLabel?: string;
}

type FormState = 'loading' | 'ready' | 'processing' | 'success' | 'error';

const BASE_URL = 'https://static.micuentaweb.pe/static/js/krypton-client/V4.0/stable';

export default function IzipayCheckout({
  formToken,
  publicKey,
  orderId,
  totalLabel,
  displayMode = 'embedded',
  onSuccess,
  onError,
  onClose,
  successRedirect = "/guau/app",
  successCtaLabel = "Ir a la App",
}: IzipayCheckoutProps) {
  const [formState, setFormState] = useState<FormState>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [sdkLogs, setSdkLogs] = useState<string[]>([]);
  const krContainerId = useRef(`kr-container-${Math.random().toString(36).slice(2)}`).current;
  const styleId = useRef(`kr-glue-style-${Math.random().toString(36).slice(2)}`).current;
  const initializedRef = useRef(false);

  const addLog = useCallback((msg: string) => {
    console.log(`[IzipayCheckout] ${msg}`);
    setSdkLogs(prev => [...prev.slice(-20), `[${new Date().toLocaleTimeString()}] ${msg}`]);
  }, []);

  useEffect(() => {
    if (initializedRef.current || typeof window === 'undefined') return;
    initializedRef.current = true;
    addLog(`Iniciando SDK. formToken=${formToken.slice(0, 8)}... displayMode=${displayMode}`);

    const init = async () => {
      try {
        // 1. Cargar tema Classic CSS
        if (!document.getElementById('izipay-kr-classic-css')) {
          const link = document.createElement('link');
          link.id = 'izipay-kr-classic-css';
          link.rel = 'stylesheet';
          link.href = `${BASE_URL}/ext/classic-reset.css`;
          document.head.appendChild(link);
        }

        // 2. Cargar tema Classic JS
        if (!document.getElementById('izipay-kr-classic-js')) {
          const s = document.createElement('script');
          s.id = 'izipay-kr-classic-js';
          s.src = `${BASE_URL}/ext/classic.js`;
          s.async = true;
          document.head.appendChild(s);
          // Esperar a que el tema JS cargue
          await new Promise((resolve) => {
            s.onload = resolve;
            s.onerror = resolve; // continuar igual si falla
          });
        }

        // 3. Inyectar estilos custom (después del tema)
        injectCustomStyles(styleId);

        // 4. Crear contenedor con sub-componentes explícitos
        let container = document.getElementById(krContainerId);
        if (!container) {
          container = document.createElement('div');
          container.id = krContainerId;
          container.style.width = '100%';
          const parent = document.getElementById('kr-root-anchor');
          if (parent) parent.appendChild(container);
        }

        while (container.firstChild) {
          container.removeChild(container.firstChild);
        }

        const krDiv = document.createElement('div');
        krDiv.className = 'kr-embedded';
        krDiv.setAttribute('kr-form-token', formToken);
        krDiv.setAttribute('kr-public-key', publicKey);
        krDiv.setAttribute('kr-language', 'es-ES');
        krDiv.style.width = '100%';

        // Sub-componentes explícitos (igual que blis-corp)
        const panDiv = document.createElement('div');
        panDiv.className = 'kr-pan';
        krDiv.appendChild(panDiv);

        const expiryDiv = document.createElement('div');
        expiryDiv.className = 'kr-expiry';
        krDiv.appendChild(expiryDiv);

        const securityDiv = document.createElement('div');
        securityDiv.className = 'kr-security-code';
        krDiv.appendChild(securityDiv);

        container.appendChild(krDiv);

        // 5. Cargar SDK principal
        const script = await loadScript(displayMode);
        addLog('Script cargado exitosamente');

        // 6. Esperar a que KR esté disponible
        const KR = await waitForKR();
        addLog('KR SDK disponible');

        // 7. setFormToken es async
        addLog('Ejecutando setFormToken...');
        await KR.setFormToken(formToken);
        addLog('setFormToken completado');

        // 8. Registrar callbacks
        KR.onFormReady(() => {
          addLog('KR.onFormReady: Formulario listo');
          setFormState('ready');
        });

        KR.onSubmit((response: any) => {
          addLog(`KR.onSubmit: orderStatus=${response?.clientAnswer?.orderStatus}`);
          const st = response?.clientAnswer?.orderStatus;
          if (st === 'PAID') {
            setFormState('success');
            onSuccess?.();
          } else {
            setFormState('error');
            setErrorMsg(st ? `Pago rechazado (${st})` : 'El pago fue rechazado por la pasarela.');
          }
          return true;
        });

        KR.onError((error: any) => {
          addLog(`KR.onError: ${JSON.stringify(error)}`);
          setFormState('error');
          setErrorMsg(error?.message || 'Error en la pasarela de pago. Intenta de nuevo.');
          onError?.(error?.message || 'Error en la pasarela de pago.');
          return true;
        });

        // Fallback
        setTimeout(() => {
          setFormState(prev => {
            if (prev === 'loading') {
              addLog('Fallback: onFormReady no disparó en 15s');
              return 'ready';
            }
            return prev;
          });
        }, 15000);

      } catch (err: any) {
        addLog(`Error de inicialización: ${err?.message || err}`);
        setFormState('error');
        setErrorMsg(err?.message || 'Error al inicializar la pasarela de pago.');
      }
    };

    init();

    return () => {
      addLog('Cleanup: removeForms');
      try { window.KR?.removeForms(); } catch { /* ignore */ }
      const existingStyle = document.getElementById(styleId);
      if (existingStyle) existingStyle.remove();
    };
  }, [formToken, publicKey, displayMode, addLog, onSuccess, onError, styleId, krContainerId]);

  return (
    <div className="bg-white rounded-[1.25rem] border border-zinc-200 shadow-sm overflow-hidden max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-zinc-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/25">
            <CreditCard className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-extrabold text-zinc-800 text-sm">Blis Bank</p>
            <p className="text-[10px] text-zinc-400 font-medium">PASARELA DE PAGO SEGURA</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-zinc-500" />
          </button>
        )}
      </div>

      {/* Trust bar */}
      <div className="flex items-center justify-center gap-3 px-5 py-2 border-b border-zinc-100">
        <span className="flex items-center gap-1 text-[10px] text-zinc-400 font-medium">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> SSL 256-BIT
        </span>
        <span className="flex items-center gap-1 text-[10px] text-zinc-400 font-medium">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> PCI-DSS L1
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {formState === 'loading' && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-5 py-6 space-y-4">
              <div className="bg-[#f4f4f5] rounded-3xl p-5 space-y-3">
                <div className="h-12 bg-white rounded-xl border border-zinc-200/60 animate-pulse" />
                <div className="grid grid-cols-2 gap-3">
                  <div className="h-12 bg-white rounded-xl border border-zinc-200/60 animate-pulse" />
                  <div className="h-12 bg-white rounded-xl border border-zinc-200/60 animate-pulse" />
                </div>
                <div className="h-12 bg-white rounded-xl border border-zinc-200/60 animate-pulse" />
                <div className="h-12 bg-white rounded-xl border border-zinc-200/60 animate-pulse" />
                <div className="h-12 bg-white rounded-xl border border-zinc-200/60 animate-pulse" />
                <div className="h-12 bg-white rounded-xl border border-zinc-200/60 animate-pulse" />
                <div className="h-12 bg-emerald-500/30 rounded-xl animate-pulse mt-2" />
              </div>
              <div className="flex items-center justify-center gap-3 py-2">
                <Loader2 className="w-5 h-5 text-primary-500 animate-spin" />
                <p className="text-sm text-zinc-400 font-medium">Conectando con la pasarela de pago...</p>
              </div>
            </motion.div>
          )}

          {formState === 'ready' && (
            <motion.div key="ready" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-4 py-3">
              {/* El formulario de Izipay se renderiza aquí automáticamente por el SDK */}
            </motion.div>
          )}

          {formState === 'processing' && (
            <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-5 pb-8 text-center py-10">
              <Loader2 className="w-8 h-8 text-primary-500 animate-spin mx-auto mb-4" />
              <p className="text-zinc-600 font-medium">Procesando tu pago...</p>
              <p className="text-xs text-zinc-400 mt-1">No cierres esta ventana</p>
            </motion.div>
          )}

          {formState === 'success' && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ type: "spring", bounce: 0.4 }} className="px-5 pb-8 text-center py-10">
              <motion.div initial={{ scale: 0, rotate: -15 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", bounce: 0.5, delay: 0.05 }} className="relative mx-auto mb-8 w-28 h-28">
                <div className="absolute inset-0 bg-emerald-400/20 rounded-[2rem] blur-2xl animate-pulse" />
                <div className="relative w-full h-full bg-emerald-100 border-2 border-emerald-200 rounded-3xl flex items-center justify-center shadow-[0_0_60px_rgba(16,185,129,0.15)]">
                  <CheckCircle2 className="w-14 h-14 text-emerald-500" />
                </div>
              </motion.div>
              <div className="space-y-3 mb-10">
                <h3 className="text-3xl font-black text-zinc-800">¡Suscripción Activada!</h3>
                <p className="text-zinc-500">Hemos procesado tu suscripción{totalLabel ? ` por ${totalLabel}` : ''}.</p>
                <div className="inline-flex gap-2 px-4 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1" />
                  <span className="text-xs text-emerald-700 font-medium">Pago confirmado</span>
                </div>
              </div>
              <div className="space-y-3">
                <Link href={successRedirect} className="inline-flex items-center justify-center gap-2 px-10 py-4 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-black uppercase text-sm rounded-2xl transition-all shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 group">
                  {successCtaLabel} <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </motion.div>
          )}

          {formState === 'error' && (
            <motion.div key="error" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="px-5 pb-8 text-center py-10">
              <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-xl font-black text-zinc-800 mb-2">Pago no completado</h3>
              <p className="text-sm text-zinc-500 mb-6 max-w-sm mx-auto">{errorMsg || 'No se pudo procesar el pago.'}</p>
              
              {sdkLogs.length > 0 && (
                <div className="mb-6 mx-auto max-w-sm">
                  <details className="text-left">
                    <summary className="text-[10px] text-zinc-400 cursor-pointer hover:text-zinc-600">Ver logs técnicos</summary>
                    <div className="mt-2 p-2 bg-zinc-100 rounded-lg text-[10px] text-zinc-600 font-mono max-h-32 overflow-y-auto">
                      {sdkLogs.map((log, i) => (
                        <div key={i} className="truncate">{log}</div>
                      ))}
                    </div>
                  </details>
                </div>
              )}
              
              <div className="space-y-3">
                <button onClick={() => window.location.reload()} className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-primary-500/25">
                  <Shield className="w-4 h-4" /> Reintentar Pago
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div id="kr-root-anchor" className={`w-full px-5 ${formState === 'loading' ? 'hidden' : ''}`} />
      </div>

      {/* Footer - Badges + Card logos */}
      <div className="border-t border-zinc-100">
        {/* Security badges */}
        <div className="flex items-center justify-center gap-2 px-5 py-2 border-b border-zinc-100">
          <span className="flex items-center gap-1 text-[10px] text-zinc-400 font-medium">
            <Lock className="w-3 h-3 text-emerald-500" /> Conexión cifrada activa
          </span>
          <span className="flex items-center gap-1 text-[10px] text-zinc-400 font-medium">
            <Lock className="w-3 h-3 text-zinc-300" /> E2E Encryption
          </span>
        </div>

        {/* 3 feature badges */}
        <div className="grid grid-cols-3 gap-2 px-5 py-3">
          <div className="flex flex-col items-center gap-1.5 py-2 px-1 rounded-xl bg-emerald-50/50">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span className="text-[9px] text-emerald-700 font-semibold text-center leading-tight">Datos<br/>encriptados</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 py-2 px-1 rounded-xl bg-amber-50/50">
            <Zap className="w-5 h-5 text-amber-600" />
            <span className="text-[9px] text-amber-700 font-semibold text-center leading-tight">Pago<br/>instantáneo</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 py-2 px-1 rounded-xl bg-blue-50/50">
            <Building2 className="w-5 h-5 text-blue-600" />
            <span className="text-[9px] text-blue-700 font-semibold text-center leading-tight">Respaldo<br/>bancario</span>
          </div>
        </div>

        {/* Card brand logos */}
        <div className="flex items-center justify-center gap-3 px-5 py-3 border-t border-zinc-100">
          <img src="/marcas/visa.svg" alt="Visa" className="w-8 h-5" />
          <img src="/marcas/mastercard.svg" alt="Mastercard" className="w-8 h-5" />
          <img src="/marcas/amex.svg" alt="Amex" className="w-8 h-5" />
          <img src="/marcas/diners-club.svg" alt="Diners" className="w-8 h-5" />
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════

function injectCustomStyles(styleId: string) {
  if (document.getElementById(styleId)) return;

  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    /* ═══════════════════════════════════════════════
       Custom overrides sobre tema Classic
       ═══════════════════════════════════════════════ */

    /* Contenedor principal */
    .kr-embedded {
      background: #f4f4f5 !important;
      border-radius: 1.25rem !important;
      padding: 0.75rem !important;
    }

    /* Campos de entrada (contenedores) */
    .kr-embedded .kr-pan,
    .kr-embedded .kr-expiry,
    .kr-embedded .kr-security-code,
    .kr-embedded .kr-card-holder-name,
    .kr-embedded .kr-installment-number,
    .kr-embedded .kr-first-installment-delay {
      background: #ffffff !important;
      border: 1px solid #e4e4e7 !important;
      border-radius: 0.75rem !important;
      margin-bottom: 0.5rem !important;
      min-height: 48px !important;
      height: auto !important;
      overflow: hidden !important;
      transition: border-color 0.2s ease, box-shadow 0.2s ease !important;
    }

    /* Focus state */
    .kr-embedded .kr-pan.kr-field-focused,
    .kr-embedded .kr-expiry.kr-field-focused,
    .kr-embedded .kr-security-code.kr-field-focused,
    .kr-embedded .kr-card-holder-name.kr-field-focused,
    .kr-embedded .kr-installment-number.kr-field-focused,
    .kr-embedded .kr-first-installment-delay.kr-field-focused {
      border-color: #10b981 !important;
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.12) !important;
    }

    /* Iframes: forzar altura compacta */
    .kr-embedded .kr-pan iframe,
    .kr-embedded .kr-expiry iframe,
    .kr-embedded .kr-security-code iframe,
    .kr-embedded .kr-installment-number iframe,
    .kr-embedded .kr-first-installment-delay iframe,
    .kr-embedded .kr-card-holder-name iframe {
      background: transparent !important;
      height: 44px !important;
      min-height: 44px !important;
      max-height: 44px !important;
      border: none !important;
    }

    /* Selects nativos (cuotas / diferido) */
    .kr-embedded .kr-installment-number select,
    .kr-embedded .kr-first-installment-delay select {
      background: #ffffff !important;
      border: none !important;
      border-radius: 0.75rem !important;
      height: 44px !important;
      min-height: 44px !important;
      padding: 0 0.75rem !important;
      font-size: 0.875rem !important;
      color: #27272a !important;
      font-family: inherit !important;
      width: 100% !important;
      cursor: pointer !important;
      outline: none !important;
      -webkit-appearance: none !important;
      -moz-appearance: none !important;
      appearance: none !important;
      background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e") !important;
      background-position: right 0.5rem center !important;
      background-repeat: no-repeat !important;
      background-size: 1.25em !important;
      padding-right: 2rem !important;
    }

    /* Labels visibles y compactos */
    .kr-embedded .kr-field-label {
      color: #71717a !important;
      font-size: 0.625rem !important;
      font-weight: 600 !important;
      text-transform: uppercase !important;
      letter-spacing: 0.05em !important;
      margin-bottom: 0.125rem !important;
      padding-left: 0.25rem !important;
    }

    /* Botón de pago verde */
    .kr-embedded .kr-payment-button {
      background: #10b981 !important;
      color: #ffffff !important;
      font-weight: 800 !important;
      font-size: 0.875rem !important;
      text-transform: uppercase !important;
      letter-spacing: 0.025em !important;
      border: none !important;
      border-radius: 0.875rem !important;
      padding: 0.875rem 1.25rem !important;
      width: 100% !important;
      cursor: pointer !important;
      font-family: inherit !important;
      transition: all 0.2s ease !important;
      box-shadow: 0 4px 14px rgba(16, 185, 129, 0.25) !important;
      margin-top: 0.25rem !important;
    }

    .kr-embedded .kr-payment-button:hover {
      background: #059669 !important;
      box-shadow: 0 6px 20px rgba(16, 185, 129, 0.35) !important;
    }

    /* Errores */
    .kr-embedded .kr-form-error {
      color: #ef4444 !important;
      font-size: 0.75rem !important;
      margin-top: 0.25rem !important;
      padding-left: 0.25rem !important;
    }

    .kr-embedded .kr-field-error .kr-pan,
    .kr-embedded .kr-field-error .kr-expiry,
    .kr-embedded .kr-field-error .kr-security-code {
      border-color: rgba(239, 68, 68, 0.5) !important;
    }

    /* Ocultar barra de test de Micuentaweb (solo sandbox) */
    .kr-embedded .kr-test-bar,
    .kr-embedded .kr-smart-form-test-bar,
    .kr-test-bar,
    .kr-smart-form-test-bar {
      display: none !important;
    }
  `;

  document.head.appendChild(style);
}

function loadScript(displayMode: string): Promise<HTMLScriptElement> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[src*="kr-payment-form"]') as HTMLScriptElement;
    if (existing) {
      resolve(existing);
      return;
    }

    const script = document.createElement('script');
    const baseUrl = 'https://static.micuentaweb.pe/static/js/krypton-client/V4.0/stable/kr-payment-form.min.js';
    script.src = displayMode === 'embedded'
      ? `${baseUrl}?mode=embedded&container=.kr-embedded`
      : `${baseUrl}?mode=popup`;
    script.async = true;
    script.id = 'kr-payment-script';
    
    script.onload = () => resolve(script);
    script.onerror = () => reject(new Error('Failed to load KR SDK'));
    
    document.head.appendChild(script);
  });
}

function waitForKR(): Promise<typeof window.KR> {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const maxAttempts = 40;
    
    const check = () => {
      attempts++;
      if (window.KR) {
        resolve(window.KR);
      } else if (attempts < maxAttempts) {
        setTimeout(check, 300);
      } else {
        reject(new Error('KR SDK not available after 40 attempts'));
      }
    };
    
    check();
  });
}
