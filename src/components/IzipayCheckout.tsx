"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface Props {
  formToken: string;
  publicKey: string;
  onSuccess: () => void;
  onError: (msg: string) => void;
  onClose: () => void;
}

export default function IzipayCheckout({ formToken, publicKey, onSuccess, onError, onClose }: Props) {
  const [loading, setLoading] = useState(true);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl w-full max-w-lg mx-4 max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs">B</span>
            </div>
            <span className="font-bold text-sm text-zinc-800 dark:text-zinc-200">Pago seguro con IziPay</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center hover:bg-zinc-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form container */}
        <div className="flex-1 overflow-y-auto p-4 bg-[#f1f2f4] dark:bg-zinc-800/50">
          <div
            className="kr-embedded"
            data-kr-form-token={formToken}
            data-kr-public-key={publicKey}
            data-kr-language="es-ES"
          >
            <div className="kr-pan" />
            <div className="kr-expiry" />
            <div className="kr-security-code" />
            <button className="kr-payment-button" />
            <div className="kr-form-error" />
          </div>
          {loading && (
            <div className="text-center py-8 text-zinc-500 text-sm">
              Cargando formulario seguro...
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 text-center">
          <p className="text-[10px] text-zinc-400">
            Tus datos de tarjeta están protegidos por IziPay. No almacenamos información de pago.
          </p>
        </div>
      </div>

      {/* Script loader */}
      <IzipayScriptLoader
        publicKey={publicKey}
        onReady={() => setLoading(false)}
        onSuccess={onSuccess}
        onError={onError}
      />
    </div>
  );
}

function IzipayScriptLoader({
  publicKey,
  onReady,
  onSuccess,
  onError,
}: {
  publicKey: string;
  onReady: () => void;
  onSuccess: () => void;
  onError: (msg: string) => void;
}) {
  // Este componente inyecta el script del SDK de IziPay
  // En producción, usará el script real de Micuentaweb

  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            if (window.KR_READY) return;
            window.KR_READY = true;
            console.warn("[IziPay] SDK esqueleto cargado. Falta script real de Micuentaweb.");
            setTimeout(() => { window.dispatchEvent(new Event("kr-ready")); }, 500);
          })();
          window.addEventListener("kr-ready", function() {
            // onReady callback simulado
          });
        `,
      }}
    />
  );
}
