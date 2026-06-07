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
        // 1. Inyectar estilos KR-Glue
        injectKRGlueStyles(styleId);

        // 2. Crear contenedor
        let container = document.getElementById(krContainerId);
        if (!container) {
          container = document.createElement('div');
          container.id = krContainerId;
          container.style.width = '100%';
          const parent = document.getElementById('kr-root-anchor');
          if (parent) parent.appendChild(container);
        }

        // Limpiar contenido previo
        while (container.firstChild) {
          container.removeChild(container.firstChild);
        }

        const krDiv = document.createElement('div');
        krDiv.className = 'kr-embedded';
        krDiv.setAttribute('kr-form-token', formToken);
        krDiv.setAttribute('kr-public-key', publicKey);
        krDiv.setAttribute('kr-language', 'es-ES');
        krDiv.style.width = '100%';
        krDiv.style.minHeight = '400px';
        container.appendChild(krDiv);

        // 3. Cargar script
        const script = await loadScript(displayMode);
        addLog('Script cargado exitosamente');

        // 4. Esperar a que KR esté disponible
        const KR = await waitForKR();
        addLog('KR SDK disponible');

        // 5. KR.setFormToken es ASYNC - usar await
        addLog('Ejecutando setFormToken...');
        await KR.setFormToken(formToken);
        addLog('setFormToken completado');

        // 6. Registrar callbacks DESPUÉS de setFormToken
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

        // Fallback: si onFormReady no dispara en 15s
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
      // Remover estilos inyectados
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
              {/* Skeleton que replica el formulario de blis-corp */}
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
                <div className="h-14 bg-emerald-500/30 rounded-xl animate-pulse mt-2" />
              </div>
              <div className="flex items-center justify-center gap-3 py-2">
                <Loader2 className="w-5 h-5 text-primary-500 animate-spin" />
                <p className="text-sm text-zinc-400 font-medium">Conectando con la pasarela de pago...</p>
              </div>
            </motion.div>
          )}

          {formState === 'ready' && (
            <motion.div key="ready" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-5 py-4">
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

        <div id="kr-root-anchor" className="w-full px-5" />
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
          {/* Visa */}
          <div className="w-8 h-5 relative">
            <svg viewBox="0 0 48 32" className="w-full h-full" fill="none">
              <rect width="48" height="32" rx="3" fill="#1A1F71"/>
              <path d="M19.5 21.5L21.5 10.5H24L22 21.5H19.5Z" fill="white"/>
              <path d="M32 10.5C31.2 10.2 30 10 28.5 10C25.2 10 22.8 11.8 22.8 14.2C22.8 15.8 24.3 16.7 25.3 17.2C26.4 17.7 26.8 18 26.8 18.5C26.8 19.2 25.9 19.5 25 19.5C23.6 19.5 22.8 19.2 22.1 18.9L21.7 18.7L21.2 21C22 21.4 23.4 21.7 24.8 21.7C28.3 21.7 30.6 19.9 30.6 17.3C30.6 16.1 29.7 15.2 28.1 14.5C27.1 14 26.4 13.7 26.4 13.1C26.4 12.6 27 12.2 28.1 12.2C29.2 12.2 30 12.5 30.5 12.7L30.8 12.9L32 10.5Z" fill="white"/>
              <path d="M36.5 10.5H34.5C34 10.5 33.5 10.6 33.2 11.2L28.5 21.5H31.2L31.8 19.9H35.2L35.5 21.5H37.8L36.5 10.5ZM32.5 17.5L34 13.5L34.8 17.5H32.5Z" fill="white"/>
              <path d="M15.5 10.5L12.8 21.5H15.3L17.9 10.5H15.5Z" fill="white"/>
              <path d="M12.5 10.5L9.5 17.8L9.1 16.2C8.3 14 6.5 11.5 6.5 11.5L9.5 21.5H12.2L16.5 10.5H12.5Z" fill="white"/>
            </svg>
          </div>
          {/* Mastercard */}
          <div className="w-8 h-5 relative">
            <svg viewBox="0 0 48 32" className="w-full h-full" fill="none">
              <rect width="48" height="32" rx="3" fill="#F7F7F7"/>
              <circle cx="18" cy="16" r="10" fill="#EB001B"/>
              <circle cx="30" cy="16" r="10" fill="#F79E1B"/>
              <path d="M24 8.5C26.2 10.2 27.5 12.9 27.5 16C27.5 19.1 26.2 21.8 24 23.5C21.8 21.8 20.5 19.1 20.5 16C20.5 12.9 21.8 10.2 24 8.5Z" fill="#FF5F00"/>
            </svg>
          </div>
          {/* Amex */}
          <div className="w-8 h-5 relative">
            <svg viewBox="0 0 48 32" className="w-full h-full" fill="none">
              <rect width="48" height="32" rx="3" fill="#016FD0"/>
              <path d="M4 12H8L10 14V10H18L19.5 13L21 10H44V22H21L19.5 19L18 22H10V18L8 20H4V12Z" fill="white"/>
              <text x="24" y="20" fontSize="7" fontWeight="bold" fill="#016FD0" textAnchor="middle">AMEX</text>
            </svg>
          </div>
          {/* Diners */}
          <div className="w-8 h-5 relative">
            <svg viewBox="0 0 48 32" className="w-full h-full" fill="none">
              <rect width="48" height="32" rx="3" fill="#F7F7F7"/>
              <path d="M24 6C14 6 8 12 8 16C8 20 14 26 24 26C34 26 40 20 40 16C40 12 34 6 24 6Z" fill="#FFFFFF" stroke="#E0E0E0" strokeWidth="0.5"/>
              <path d="M24 8C30 8 34 12 34 16C34 20 30 24 24 24C18 24 14 20 14 16C14 12 18 8 24 8Z" fill="#1A1F71"/>
              <path d="M18 10C16 11 15 13 15 16C15 19 16 21 18 22V10Z" fill="white"/>
              <path d="M30 10C32 11 33 13 33 16C33 19 32 21 30 22V10Z" fill="white"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════

function injectKRGlueStyles(styleId: string) {
  if (document.getElementById(styleId)) return;

  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    /* ═══════════════════════════════════════════════
       KR-Glue Theme — Blis Corp Replica
       ═══════════════════════════════════════════════ */

    /* Contenedor gris del form */
    .kr-embedded {
      background: #f4f4f5 !important;
      border-radius: 1.5rem !important;
      padding: 1.25rem !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
    }

    /* Cada grupo de campo */
    .kr-embedded .kr-field,
    .kr-embedded [class*="field"] {
      margin-bottom: 0.75rem !important;
      position: relative !important;
    }

    /* Labels ocultos (usamos placeholder como en blis-corp) */
    .kr-embedded .kr-field-label,
    .kr-embedded label,
    .kr-embedded .kr-label {
      display: none !important;
    }

    /* Inputs: número, fecha, CVV, nombre */
    .kr-embedded input,
    .kr-embedded .kr-field-input,
    .kr-embedded [class*="input"],
    .kr-embedded select {
      background: #ffffff !important;
      border: 1.5px solid #e4e4e7 !important;
      border-radius: 0.875rem !important;
      padding: 0.875rem 1rem !important;
      font-size: 0.875rem !important;
      color: #27272a !important;
      width: 100% !important;
      height: 3rem !important;
      box-sizing: border-box !important;
      font-family: inherit !important;
      transition: all 0.2s ease !important;
      outline: none !important;
      margin: 0 !important;
    }

    .kr-embedded input::placeholder,
    .kr-embedded .kr-field-input::placeholder {
      color: #a1a1aa !important;
      font-size: 0.875rem !important;
    }

    .kr-embedded input:focus,
    .kr-embedded .kr-field-input:focus,
    .kr-embedded select:focus {
      border-color: #10b981 !important;
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.12) !important;
      background: #ffffff !important;
    }

    /* Selects (cuotas, diferido) */
    .kr-embedded select {
      appearance: none !important;
      -webkit-appearance: none !important;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23a1a1aa' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E") !important;
      background-repeat: no-repeat !important;
      background-position: right 0.75rem center !important;
      background-size: 1rem !important;
      padding-right: 2.5rem !important;
    }

    /* Íconos a la derecha (simulados con pseudo-elemento en algunos campos) */
    .kr-embedded .kr-field::after,
    .kr-embedded [class*="field"]::after {
      position: absolute !important;
      right: 1rem !important;
      top: 50% !important;
      transform: translateY(-50%) !important;
      color: #a1a1aa !important;
      font-size: 1rem !important;
      pointer-events: none !important;
    }

    /* Layout de dos columnas para fecha + CVV */
    .kr-embedded .kr-expiry-cvv-row,
    .kr-embedded [class*="expiry"] + [class*="cvv"],
    .kr-embedded [class*="expiration"] + [class*="security"] {
      display: grid !important;
      grid-template-columns: 1fr 1fr !important;
      gap: 0.75rem !important;
    }

    /* Botón de pago verde */
    .kr-embedded .kr-payment-button,
    .kr-embedded button[type="submit"],
    .kr-embedded .kr-submit,
    .kr-embedded [class*="submit"],
    .kr-embedded [class*="payment-button"] {
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
      margin-top: 0.5rem !important;
      cursor: pointer !important;
      font-family: inherit !important;
      transition: all 0.2s ease !important;
      box-shadow: 0 4px 14px rgba(16, 185, 129, 0.25) !important;
    }

    .kr-embedded .kr-payment-button:hover,
    .kr-embedded button[type="submit"]:hover {
      background: #059669 !important;
      transform: translateY(-1px) !important;
      box-shadow: 0 6px 20px rgba(16, 185, 129, 0.35) !important;
    }

    .kr-embedded .kr-payment-button:active,
    .kr-embedded button[type="submit"]:active {
      transform: translateY(0) !important;
    }

    /* Mensajes de error */
    .kr-embedded .kr-form-error,
    .kr-embedded [class*="error"] {
      color: #ef4444 !important;
      font-size: 0.75rem !important;
      margin-top: 0.25rem !important;
      padding-left: 0.25rem !important;
    }

    /* Spinner de carga del SDK */
    .kr-embedded .kr-spinner,
    .kr-embedded [class*="spinner"] {
      color: #10b981 !important;
    }

    /* Checkbox guardar tarjeta */
    .kr-embedded .kr-save-card,
    .kr-embedded [class*="save"] {
      font-size: 0.75rem !important;
      color: #71717a !important;
      margin-top: 0.5rem !important;
    }

    /* Remove any default SDK borders/backgrounds */
    .kr-embedded .kr-form,
    .kr-embedded form,
    .kr-embedded [class*="form"] {
      background: transparent !important;
      border: none !important;
      box-shadow: none !important;
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
