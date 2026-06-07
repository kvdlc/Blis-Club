"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, CheckCircle2, AlertCircle, Shield,
  ArrowRight, Lock, CreditCard, X, ExternalLink
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
  isModal?: boolean;
}

type FormState = 'loading' | 'ready' | 'processing' | 'success' | 'error';

export default function IzipayCheckout({
  formToken,
  publicKey,
  orderId,
  totalLabel,
  displayMode = 'popup',
  onSuccess,
  onError,
  onClose,
  successRedirect = "/guau/app",
  successCtaLabel = "Ir a la App",
  isModal = true,
}: IzipayCheckoutProps) {
  const [formState, setFormState] = useState<FormState>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [sdkLogs, setSdkLogs] = useState<string[]>([]);
  const krContainerId = useRef(`kr-container-${Math.random().toString(36).slice(2)}`).current;
  const initializedRef = useRef(false);
  const scriptLoadedRef = useRef(false);

  const addLog = useCallback((msg: string) => {
    console.log(`[IzipayCheckout] ${msg}`);
    setSdkLogs(prev => [...prev.slice(-20), `[${new Date().toLocaleTimeString()}] ${msg}`]);
  }, []);

  useEffect(() => {
    if (initializedRef.current || typeof window === 'undefined') return;
    initializedRef.current = true;
    addLog(`Iniciando SDK. formToken=${formToken.slice(0, 8)}... displayMode=${displayMode}`);

    // Crear contenedor
    let container = document.getElementById(krContainerId);
    if (!container) {
      container = document.createElement('div');
      container.id = krContainerId;
      container.style.width = '100%';
      container.style.minHeight = displayMode === 'embedded' ? '500px' : '0';
      if (displayMode === 'popup') {
        container.style.height = '0';
        container.style.overflow = 'hidden';
      }
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
    krDiv.style.minHeight = displayMode === 'embedded' ? '500px' : '0';
    container.appendChild(krDiv);

    const loadScript = () => {
      // Verificar si el script ya existe
      const existingScript = document.querySelector('script[src*="kr-payment-form"]');
      if (existingScript) {
        addLog('Script ya existe en DOM, reutilizando...');
        initKR();
        return;
      }

      const script = document.createElement('script');
      const baseUrl = 'https://static.micuentaweb.pe/static/js/krypton-client/V4.0/stable/kr-payment-form.min.js';
      script.src = displayMode === 'embedded'
        ? `${baseUrl}?mode=embedded&container=.kr-embedded`
        : `${baseUrl}?mode=popup`;
      script.async = true;
      script.id = 'kr-payment-script';
      
      script.onload = () => {
        addLog('Script cargado exitosamente');
        scriptLoadedRef.current = true;
        initKR();
      };
      
      script.onerror = () => {
        addLog('ERROR: Falló carga del script');
        setFormState('error');
        setErrorMsg('Error al cargar el SDK de pago. Verifica tu conexión.');
      };
      
      document.head.appendChild(script);
    };

    const initKR = () => {
      let attempts = 0;
      const maxAttempts = 40; // 12 segundos max
      
      const wait = () => {
        attempts++;
        if (window.KR) {
          addLog(`KR SDK disponible (intento ${attempts})`);
          
          try {
            window.KR.setFormToken?.(formToken);
            addLog('setFormToken ejecutado');
          } catch (e: any) {
            addLog(`setFormToken error: ${e?.message}`);
          }

          // KR.onFormReady: el formulario está listo
          window.KR.onFormReady(() => {
            addLog('KR.onFormReady: Formulario listo');
            setFormState('ready');
          });

          // KR.onSubmit: usuario envió el pago
          window.KR.onSubmit((response: any) => {
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

          // KR.onError: error en el formulario
          window.KR.onError((error: any) => {
            addLog(`KR.onError: ${JSON.stringify(error)}`);
            setFormState('error');
            setErrorMsg(error?.message || 'Error en la pasarela de pago. Intenta de nuevo.');
            onError?.(error?.message || 'Error en la pasarela de pago.');
            return true;
          });

          // Fallback: si onFormReady no dispara en 10s, mostrar botón manual
          setTimeout(() => {
            setFormState(prev => {
              if (prev === 'loading') {
                addLog('Fallback: onFormReady no disparó, mostrando botón manual');
                return 'ready';
              }
              return prev;
            });
          }, 10000);

        } else if (attempts < maxAttempts) {
          setTimeout(wait, 300);
        } else {
          addLog('ERROR: KR SDK no disponible después de 40 intentos');
          setFormState('error');
          setErrorMsg('La pasarela de pago no respondió. Intenta recargar la página.');
        }
      };
      
      wait();
    };

    loadScript();

    return () => {
      addLog('Cleanup: removeForms');
      try { window.KR?.removeForms(); } catch { /* ignore */ }
    };
  }, [formToken, publicKey, displayMode, addLog, onSuccess, onError]);

  const handleOpenPopup = useCallback(() => {
    addLog('Intentando abrir popup manualmente...');
    try {
      if (window.KR?.openPopup) {
        window.KR.openPopup();
        addLog('openPopup ejecutado');
      } else {
        addLog('KR.openPopup no disponible');
        setErrorMsg('No se pudo abrir la ventana de pago. Intenta recargar la página.');
        setFormState('error');
      }
    } catch (e: any) {
      addLog(`Error en openPopup: ${e?.message}`);
    }
  }, [addLog]);

  const cardBrands = ['visa', 'mastercard', 'amex', 'diners'];

  const headerBar = (
    <div className="flex items-center justify-between p-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/25">
          <CreditCard className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-extrabold text-zinc-800 text-sm">Blis Bank</p>
          <p className="text-[10px] text-zinc-400 font-medium">Pasarela de pago segura</p>
        </div>
      </div>
      {isModal && onClose && (
        <button onClick={onClose} className="w-9 h-9 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center transition-colors">
          <X className="w-4 h-4 text-zinc-500" />
        </button>
      )}
    </div>
  );

  const trustBar = (
    <div className="flex items-center justify-center gap-3 px-5 pb-2">
      <span className="flex items-center gap-1 text-[10px] text-zinc-400 font-medium">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> SSL 256-bit
      </span>
      <span className="flex items-center gap-1 text-[10px] text-zinc-400 font-medium">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> PCI-DSS L1
      </span>
      <div className="flex items-center gap-1.5 ml-2">
        {cardBrands.map((brand) => (
          <div key={brand} className="w-5 h-3.5 rounded bg-zinc-200 opacity-40" title={brand} />
        ))}
      </div>
    </div>
  );

  const confidenceFooter = (
    <div className="flex items-center justify-center gap-6 py-3 border-t border-zinc-100">
      <span className="flex items-center gap-1.5 text-[10px] text-zinc-400">
        <Shield className="w-3 h-3" /> E2E Encryption
      </span>
      <span className="flex items-center gap-1.5 text-[10px] text-zinc-400">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Pago instantáneo
      </span>
      <span className="flex items-center gap-1.5 text-[10px] text-zinc-400">
        <Lock className="w-3 h-3" /> Respaldo bancario
      </span>
    </div>
  );

  const content = (
    <>
      <AnimatePresence mode="wait">
        {formState === 'loading' && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-5 pb-8 space-y-5">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="h-3 w-20 bg-zinc-100 rounded-full animate-pulse" />
                <div className="h-12 bg-zinc-100 rounded-2xl animate-pulse" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="h-3 w-16 bg-zinc-100 rounded-full animate-pulse" />
                  <div className="h-12 bg-zinc-100 rounded-2xl animate-pulse" />
                </div>
                <div className="space-y-1.5">
                  <div className="h-3 w-12 bg-zinc-100 rounded-full animate-pulse" />
                  <div className="h-12 bg-zinc-100 rounded-2xl animate-pulse" />
                </div>
              </div>
              <div className="h-14 bg-zinc-100 rounded-2xl animate-pulse" />
            </div>
            <div className="flex items-center justify-center gap-3 py-2">
              <Loader2 className="w-5 h-5 text-primary-500 animate-spin" />
              <p className="text-sm text-zinc-400 font-medium">Conectando con la pasarela de pago...</p>
            </div>
          </motion.div>
        )}

        {formState === 'ready' && displayMode === 'popup' && (
          <motion.div key="ready-popup" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="px-5 pb-8 text-center">
            <div className="py-6 space-y-5">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-primary-50 border border-primary-100 flex items-center justify-center">
                <Shield className="w-8 h-8 text-primary-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-zinc-800">Verificación de pago</h3>
                <p className="text-sm text-zinc-400 max-w-sm mx-auto">Se abrirá una ventana emergente con el formulario de pago seguro de Izipay.</p>
                {totalLabel && (
                  <p className="text-xs text-zinc-500 font-medium">{totalLabel}</p>
                )}
              </div>
              <div className="inline-flex gap-2 px-4 py-2 bg-primary-50 border border-primary-100 rounded-full">
                <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse mt-1" />
                <span className="text-xs text-primary-600 font-bold">Esperando pasarela...</span>
              </div>
              
              {/* Botón manual de fallback */}
              <button
                onClick={handleOpenPopup}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-primary-500/25"
              >
                <ExternalLink className="w-4 h-4" /> Abrir ventana de pago
              </button>
              
              <p className="text-[10px] text-zinc-400">
                Si la ventana no se abrió automáticamente, haz clic en el botón arriba.
              </p>
            </div>
          </motion.div>
        )}

        {formState === 'ready' && displayMode === 'embedded' && (
          <motion.div key="ready-embedded" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-5 pb-4">
            <div className="border-t border-zinc-100 pt-4 mt-2">
              <div className="flex items-center justify-center gap-2 text-xs text-zinc-400">
                <Lock className="w-3 h-3" />
                <span>Tus datos están protegidos con encriptación de extremo a extremo</span>
              </div>
            </div>
          </motion.div>
        )}

        {formState === 'processing' && (
          <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-5 pb-8 text-center py-8">
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
            
            {/* Logs de debug (solo visibles en desarrollo o si hay error) */}
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

      <div id="kr-root-anchor" className="w-full" />
    </>
  );

  if (!isModal) {
    return (
      <div className="bg-white rounded-3xl shadow-xl border border-zinc-100 overflow-hidden">
        {headerBar}
        {trustBar}
        {content}
        {confidenceFooter}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] flex flex-col overflow-hidden"
      >
        {headerBar}
        {trustBar}
        <div className="flex-1 overflow-y-auto">
          {content}
        </div>
        {confidenceFooter}
      </motion.div>
    </div>
  );
}
