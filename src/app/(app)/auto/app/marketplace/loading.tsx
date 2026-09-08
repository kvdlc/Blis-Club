"use client";

import { motion } from "framer-motion";
import { Car } from "lucide-react";

/** Pantalla de carga por ruta (se muestra mientras el server component resuelve). */
export default function MarketplaceLoading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.6, ease: "linear" }}
            className="w-14 h-14 rounded-full border-2 border-auto-600/20 border-t-auto-500"
          />
          <motion.div
            animate={{ y: [0, -3, 0] }}
            transition={{ repeat: Infinity, duration: 1.2 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Car className="w-6 h-6 text-auto-500" />
          </motion.div>
        </div>
        <p className="text-xs font-bold text-zinc-500 tracking-widest uppercase">Cargando marketplace...</p>
      </div>
    </div>
  );
}
