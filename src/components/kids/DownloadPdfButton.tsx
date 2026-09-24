import { ExternalLink } from "lucide-react";

/** Botón compacto de descarga: solo "PDF" (el ícono ya es conocido). */
export function DownloadPdfButton({
  url,
  filename,
  label = "PDF",
  className,
}: {
  url: string;
  filename: string;
  label?: string;
  className?: string;
}) {
  const safe = (filename || "kids-club").replace(/[^\w\-. ]+/g, "_").trim() || "kids-club";
  const name = safe.toLowerCase().endsWith(".pdf") ? safe : `${safe}.pdf`;
  return (
    <a
      href={url}
      download={name}
      className={
        className ??
        "inline-flex items-center justify-center rounded-lg bg-emerald-500 px-3 py-2 text-xs font-black text-white shadow-sm transition-transform hover:scale-105 active:scale-95"
      }
    >
      {label}
    </a>
  );
}

/** Abre el PDF en el visor del navegador. */
export function OpenPdfLink({
  url,
  className,
  label,
}: {
  url: string;
  className?: string;
  label?: string;
}) {
  const href = url.includes("?") ? `${url}&inline=1` : `${url}?inline=1`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title="Ver PDF"
      className={
        className ??
        "inline-flex items-center justify-center rounded-lg bg-violet-100 px-2.5 py-2 text-violet-600 shadow-sm transition-transform hover:scale-105 active:scale-95"
      }
    >
      <ExternalLink className="h-4 w-4" />
      {label}
    </a>
  );
}
