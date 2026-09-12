"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";

/**
 * Abre el panel nativo de compartir del teléfono (WhatsApp, Telegram, etc.).
 * Si el dispositivo no lo soporta (ej. desktop), copia el enlace y, como
 * último recurso, ofrece WhatsApp Web.
 */
export function ShareButton({
  url,
  title,
  text,
  className,
  label,
}: {
  url?: string;
  title: string;
  text?: string;
  className?: string;
  label?: string;
}) {
  const [done, setDone] = useState(false);

  const share = async () => {
    let shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");
    if (shareUrl.startsWith("/") && typeof window !== "undefined") {
      shareUrl = window.location.origin + shareUrl;
    }
    const shareText = text || title;

    try {
      if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
        await navigator.share({ title, text: shareText, url: shareUrl });
        return;
      }
    } catch {
      // El usuario canceló el panel nativo: no hacer nada más.
      return;
    }

    try {
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      setDone(true);
      setTimeout(() => setDone(false), 2000);
      return;
    } catch {
      window.open(
        `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`,
        "_blank",
        "noopener,noreferrer"
      );
    }
  };

  return (
    <button
      type="button"
      onClick={share}
      className={className}
      title="Compartir"
      aria-label="Compartir"
    >
      {done ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
      {label && <span>{done ? "Enlace copiado" : label}</span>}
    </button>
  );
}
