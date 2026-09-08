"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ShoppingCart, X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import type { CartItemWithProduct } from "@/types/database";
import { useMoney } from "@/lib/money";

interface CartCtx {
  items: CartItemWithProduct[];
  count: number;
  loading: boolean;
  refresh: () => Promise<void>;
  add: (productId: string, qty?: number) => Promise<void>;
  setQty: (itemId: string, qty: number) => Promise<void>;
  remove: (itemId: string) => Promise<void>;
  openCart: () => void;
}

const Ctx = createContext<CartCtx | null>(null);

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart debe usarse dentro de MarketplaceCartProvider");
  return ctx;
}

export function MarketplaceCartProvider({ userId, children }: { userId?: string; children: React.ReactNode }) {
  const [items, setItems] = useState<CartItemWithProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const refresh = useCallback(async () => {
    if (!userId) { setItems([]); return; }
    try {
      const res = await fetch("/api/marketplace/cart");
      const data = await res.json();
      setItems((data.items as CartItemWithProduct[]) ?? []);
    } catch {
      setItems([]);
    }
  }, [userId]);

  useEffect(() => { if (userId) refresh(); }, [userId, refresh]);

  const add = useCallback(async (productId: string, qty = 1) => {
    if (!userId) { router.push("/"); return; }
    setLoading(true);
    try {
      await fetch("/api/marketplace/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: qty }),
      });
      await refresh();
      setOpen(true);
    } finally { setLoading(false); }
  }, [userId, refresh, router]);

  const setQty = useCallback(async (itemId: string, qty: number) => {
    await fetch("/api/marketplace/cart", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId, quantity: qty }),
    });
    await refresh();
  }, [refresh]);

  const remove = useCallback(async (itemId: string) => {
    await fetch(`/api/marketplace/cart?itemId=${itemId}`, { method: "DELETE" });
    await refresh();
  }, [refresh]);

  const count = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <Ctx.Provider value={{ items, count, loading, refresh, add, setQty, remove, openCart: () => setOpen(true) }}>
      {children}
      <CartDrawer open={open} onClose={() => setOpen(false)} items={items} loading={loading}
        setQty={setQty} remove={remove} />
    </Ctx.Provider>
  );
}

function CartDrawer({
  open, onClose, items, loading, setQty, remove,
}: {
  open: boolean; onClose: () => void; items: CartItemWithProduct[];
  loading: boolean;
  setQty: (id: string, q: number) => void; remove: (id: string) => void;
}) {
  const { money } = useMoney();
  const router = useRouter();
  const total = items.reduce((s, i) => s + (i.product.precio ?? 0) * i.quantity, 0);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm" />
          <motion.aside
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="fixed right-0 top-0 bottom-0 z-[85] w-full max-w-sm bg-zinc-950 border-l border-white/10 flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-auto-400" />
                <h3 className="text-sm font-black text-zinc-100">Tu carrito</h3>
                <span className="text-[10px] font-bold text-zinc-500 bg-white/[0.06] px-2 py-0.5 rounded-full">
                  {items.reduce((s, i) => s + i.quantity, 0)}
                </span>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-zinc-400 hover:bg-white/[0.12]"><X className="w-4 h-4" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {items.length === 0 && (
                <div className="text-center py-16 space-y-2">
                  <ShoppingBag className="w-10 h-10 mx-auto text-zinc-700" />
                  <p className="text-xs text-zinc-500">Tu carrito está vacío</p>
                  <button onClick={onClose} className="text-[11px] font-bold text-auto-400">Seguir comprando</button>
                </div>
              )}
              {items.map((i) => {
                const p = i.product;
                return (
                  <div key={i.id} className="flex gap-3 bg-white/[0.04] border border-white/10 rounded-2xl p-2.5">
                    <Link href={`/auto/app/marketplace/producto/${p.id}`} className="w-16 h-16 rounded-xl overflow-hidden bg-zinc-800 shrink-0">
                      {p.imagen_url ? <img src={p.imagen_url} alt="" className="w-full h-full object-cover" /> : <ShoppingBag className="w-6 h-6 m-auto text-zinc-600" />}
                    </Link>
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="text-[11px] font-bold text-zinc-200 line-clamp-1">{p.titulo}</p>
                      <p className="text-xs font-black text-auto-500">{money((p.precio ?? 0) * i.quantity)}</p>
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => setQty(i.id, Math.max(1, i.quantity - 1))} className="w-6 h-6 rounded-lg bg-white/[0.06] flex items-center justify-center text-zinc-300"><Minus className="w-3 h-3" /></button>
                        <span className="w-6 text-center text-xs font-black text-zinc-100 tabular-nums">{i.quantity}</span>
                        <button onClick={() => setQty(i.id, Math.min(99, i.quantity + 1))} className="w-6 h-6 rounded-lg bg-white/[0.06] flex items-center justify-center text-zinc-300"><Plus className="w-3 h-3" /></button>
                        <button onClick={() => remove(i.id)} className="ml-auto text-zinc-500 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {items.length > 0 && (
              <div className="p-4 border-t border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-400">Total</span>
                  <span className="text-xl font-black text-auto-500">{money(total)}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { onClose(); router.push("/auto/app/perfil?tab=compras"); }}
                    className="flex-1 py-3 rounded-xl border border-white/10 text-zinc-300 text-xs font-bold hover:bg-white/[0.05]">
                    Mis compras
                  </button>
                  <button onClick={() => { onClose(); router.push(`/auto/app/marketplace/carrito?items=${items.map((x) => x.product_id).join(",")}`); }}
                    className="flex-[2] py-3 rounded-xl bg-auto-600 text-white text-xs font-black hover:bg-auto-500 flex items-center justify-center gap-1.5">
                    <ShoppingCart className="w-4 h-4" /> Pagar carrito
                  </button>
                </div>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
