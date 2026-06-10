"use client";

import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Printer, Download, Shield } from "lucide-react";
import { ensureShortLink, getShortUrl } from "@/lib/shorten";

interface Props {
  dogId: string;
  dogName: string;
}

export function QRCollar({ dogId, dogName }: Props) {
  const [shortSlug, setShortSlug] = useState<string | null>(null);

  useEffect(() => {
    ensureShortLink(dogId).then(setShortSlug);
  }, [dogId]);

  const profileUrl = typeof window !== "undefined"
    ? (shortSlug ? getShortUrl(shortSlug) : `${window.location.origin}/guau/perro/${dogId}`)
    : "";

  const handleDownloadSvg = () => {
    const svg = document.querySelector(".qrcollar-qr svg");
    if (!svg) return;
    const data = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([data], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `qr-collar-${dogName.toLowerCase().replace(/\s+/g, "-")}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    const svgEl = document.querySelector(".qrcollar-qr svg");
    if (!svgEl) return;
    const data = new XMLSerializer().serializeToString(svgEl);
    w.document.write(`
      <html>
        <head><title>QR Collar - ${dogName}</title></head>
        <body style="display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;">
          <div style="text-align:center">
            <p style="font-family:sans-serif;font-size:18px;font-weight:bold;margin-bottom:12px;color:#333">QR Collar - ${dogName}</p>
            ${data}
            <p style="font-family:sans-serif;color:#888;margin-top:12px;font-size:11px">${profileUrl}</p>
          </div>
        </body>
      </html>
    `);
    w.document.close();
    w.print();
  };

  return (
    <div className="card-soft rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Shield className="w-5 h-5 text-primary-500" />
        <h2 className="font-bold text-zinc-800">QR del Collar</h2>
      </div>

      <p className="text-sm text-zinc-500">
        Imprime este QR y ponlo en el collar de <strong>{dogName}</strong>. Si se pierde, quien lo encuentre podrá escanearlo y contactarte.
      </p>

      <div className="qrcollar-qr flex flex-col items-center gap-3 p-4 bg-white rounded-xl border border-zinc-100">
        {shortSlug ? (
          <QRCodeSVG
            value={profileUrl}
            size={180}
            level="M"
            fgColor="#4a47d4"
          />
        ) : (
          <div className="w-[180px] h-[180px] bg-zinc-100 rounded-lg animate-pulse flex items-center justify-center">
            <span className="text-zinc-400 text-xs">Generando...</span>
          </div>
        )}
        <p className="text-[10px] text-zinc-400 break-all font-mono text-center">
          {profileUrl}
        </p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleDownloadSvg}
          disabled={!shortSlug}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-primary-50 text-primary-700 text-sm font-semibold hover:bg-primary-100 transition-colors disabled:opacity-30"
        >
          <Download className="w-4 h-4" />
          Descargar QR
        </button>
        <button
          onClick={handlePrint}
          disabled={!shortSlug}
          className="flex items-center gap-1.5 py-2.5 px-4 rounded-xl bg-zinc-100 text-zinc-600 text-sm font-semibold hover:bg-zinc-200 transition-colors disabled:opacity-30"
        >
          <Printer className="w-4 h-4" />
          Imprimir
        </button>
      </div>
    </div>
  );
}
