"use client";

import { CarSwitcher } from "@/components/CarSwitcher";
import { UserPill } from "@/components/UserPill";
import { SearchOverlay } from "@/components/SearchOverlay";
import { AutoSearchOverlay } from "@/components/AutoSearchOverlay";
import { AdminNotificationsBell } from "@/components/admin/AdminNotificationsBell";
import type { AdminFeed } from "@/lib/admin-notifications-shared";
import { Bell, ShoppingCart } from "lucide-react";
import { useCart } from "@/components/MarketplaceCart";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

export function AutoAppHeader({ feed }: { feed?: AdminFeed | null }) {
  const { count, openCart } = useCart();
  const router = useRouter();
  return (
    <div className="flex items-center justify-between mb-4 h-10 relative z-20 text-zinc-300">
      <div className="flex items-center gap-2.5 min-w-0">
        {/* Logo → inicio */}
        <button
          onClick={() => router.push("/auto/app")}
          aria-label="Ir al inicio"
          className="hidden md:flex items-center gap-2"
        >
          <div className="w-9 h-9 rounded-xl grad-auto flex items-center justify-center shadow-glow-auto">
            <span className="text-white font-black text-sm">B</span>
          </div>
        </button>
        <CarSwitcher variant="dark" />
      </div>
      <div className="flex items-center gap-2">
        <AutoSearchOverlay variant="dark" />
        <AdminNotificationsBell feed={feed ?? null} dark />
        {/* Carrito */}
        <button
          onClick={openCart}
          aria-label="Carrito"
          className="relative w-9 h-9 rounded-full bg-white/5 border border-white/10 text-zinc-400 flex items-center justify-center transition-all hover:scale-105 active:scale-95 hover:text-zinc-100 hover:bg-white/10"
        >
          <ShoppingCart className="w-4 h-4" />
          <AnimatePresence>
            {count > 0 && (
              <motion.span
                key={count}
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.4, opacity: 0 }}
                className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-auto-500 text-white text-[9px] font-black flex items-center justify-center tabular-nums"
              >
                {count}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
        <button
          onClick={() => router.push("/auto/app/perfil?tab=compras")}
          aria-label="Mis compras"
          className="hidden sm:flex w-9 h-9 rounded-full bg-white/5 border border-white/10 text-zinc-400 items-center justify-center transition-all hover:scale-105 active:scale-95 hover:text-zinc-100 hover:bg-white/10"
        >
          <Bell className="w-4 h-4" />
        </button>
        <UserPill appSlug="auto" variant="dark" />
      </div>
    </div>
  );
}
