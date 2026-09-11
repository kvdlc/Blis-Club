"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  images: string[];
  index?: number;
  onClose: () => void;
  title?: string;
}

/** Visor de imágenes a pantalla completa (lightbox). Cierra con X, clic en el fondo o Esc. */
export function ImageViewer({ images, index = 0, onClose, title }: Props) {
  const [i, setI] = useState(Math.min(Math.max(0, index), Math.max(0, images.length - 1)));
  const total = images.length;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" && total > 1) setI((p) => (p + 1) % total);
      if (e.key === "ArrowLeft" && total > 1) setI((p) => (p - 1 + total) % total);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, total]);

  if (!images.length) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[120] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {title && (
          <p className="absolute top-5 left-5 right-16 text-white/90 text-sm font-bold truncate">{title}</p>
        )}

        {total > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setI((p) => (p - 1 + total) % total); }}
              aria-label="Anterior"
              className="absolute left-3 w-10 h-10 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setI((p) => (p + 1) % total); }}
              aria-label="Siguiente"
              className="absolute right-3 w-10 h-10 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        <motion.img
          key={i}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          src={images[i]}
          alt=""
          onClick={(e) => e.stopPropagation()}
          className="max-w-full max-h-[85vh] object-contain rounded-2xl"
        />

        {total > 1 && (
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
            {images.map((_, k) => (
              <button
                key={k}
                type="button"
                onClick={(e) => { e.stopPropagation(); setI(k); }}
                aria-label={`Foto ${k + 1}`}
                className={`w-2 h-2 rounded-full transition-colors ${k === i ? "bg-white" : "bg-white/40"}`}
              />
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
