"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ShoppingBag, Eye, TrendingUp, X } from "lucide-react";
import type { MarketplaceProduct } from "@/types/database";
import { useMoney } from "@/lib/money";

interface Activity {
  kind: "compra" | "vista" | "stock";
  icon: any;
  text: string;
  img?: string | null;
}

const NOMBRES = ["Laura", "Carlos", "María", "Diego", "Ana", "Jorge", "Valentina", "Pedro", "Camila", "Andrés"];
const CIUDADES = ["Quito", "Guayaquil", "Cuenca", "Ambato", "Loja", "Manta", "Ibarra", "Riobamba"];
const OBJETOS = ["su auto nuevo", "un accesorio de lujo", "su primer vehículo", "una pantalla para el auto"];

export function ActivityToasts({ products }: { products: MarketplaceProduct[] }) {
  const { money } = useMoney();
  const [active, setActive] = useState<Activity | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pool = useMemo(() => products.slice(0, 30), [products]);

  useEffect(() => {
    if (!pool.length) return;
    const pick = () => {
      const p = pool[Math.floor(Math.random() * pool.length)];
      const nombre = NOMBRES[Math.floor(Math.random() * NOMBRES.length)];
      const ciudad = CIUDADES[Math.floor(Math.random() * CIUDADES.length)];
      const tipo = Math.floor(Math.random() * 4);
      let act: Activity;
      if (tipo === 0 && p.precio != null) {
        act = { kind: "compra", icon: ShoppingBag, text: `${nombre} de ${ciudad} compró ${p.titulo.toLowerCase()} por ${money(p.precio)}`, img: p.imagen_url };
      } else if (tipo === 1) {
        act = { kind: "vista", icon: Eye, text: `${Math.floor(5 + Math.random() * 18)} personas están viendo ${p.titulo.toLowerCase()}`, img: p.imagen_url };
      } else if (tipo === 2) {
        act = { kind: "stock", icon: TrendingUp, text: `Se vendió ${p.titulo.toLowerCase()} hace ${Math.floor(2 + Math.random() * 20)} min`, img: p.imagen_url };
      } else {
        act = { kind: "compra", icon: ShoppingBag, text: `${nombre} de ${ciudad} aseguró ${OBJETOS[Math.floor(Math.random() * OBJETOS.length)]}`, img: null };
      }
      setActive(act);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(pick, 6000 + Math.random() * 4000);
    };
    const initial = setTimeout(pick, 2500);
    return () => { clearTimeout(initial); if (timerRef.current) clearTimeout(timerRef.current); };
  }, [pool, money]);

  return (
    <div className="fixed bottom-20 md:bottom-5 left-3 md:left-6 z-[60] w-[calc(100vw-1.5rem)] max-w-xs pointer-events-none">
      <AnimatePresence>
        {active && (
          <motion.div
            key={active.text}
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="pointer-events-auto flex items-center gap-2.5 bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-2.5 pr-2 shadow-2xl"
            onMouseEnter={() => { if (timerRef.current) clearTimeout(timerRef.current); }}
          >
            {active.img ? (
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-zinc-800 shrink-0">
                <img src={active.img} alt="" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-auto-600/15 flex items-center justify-center shrink-0">
                <active.icon className="w-4 h-4 text-auto-400" />
              </div>
            )}
            <p className="flex-1 min-w-0 text-[10px] leading-snug text-zinc-300">{active.text}</p>
            <button onClick={() => setActive(null)} className="shrink-0 w-6 h-6 rounded-full hover:bg-white/10 flex items-center justify-center text-zinc-500">
              <X className="w-3 h-3" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
