"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Car } from "lucide-react";

/** Splash de carga a pantalla completa (marca) que se oculta tras ~1.6s. */
export function MarketplaceSplash() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 1600);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0a0a0c]"
        >
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-auto-500/10 blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-violet-500/10 blur-3xl" />
          </div>

          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 16 }}
            className="relative"
          >
            <div className="w-20 h-20 rounded-[1.5rem] bg-gradient-to-br from-auto-600 to-violet-600 flex items-center justify-center shadow-auto-glow">
              <Car className="w-10 h-10 text-white" strokeWidth={2} />
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 text-2xl font-black text-zinc-50 tracking-tight"
          >
            Blis <span className="text-auto-400">Club</span>
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-1 text-[11px] font-bold tracking-widest uppercase text-zinc-500"
          >
            Marketplace de autos
          </motion.p>

          <motion.div
            initial={{ width: 0 }}
            animate={{ width: 160 }}
            transition={{ delay: 0.4, duration: 1, ease: "easeInOut" }}
            className="mt-6 h-1 rounded-full bg-auto-600/20 overflow-hidden"
          >
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ delay: 0.4, duration: 1.1, ease: "easeInOut" }}
              className="h-full bg-auto-500"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
