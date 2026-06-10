"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, Gift, Zap } from "lucide-react";

interface Props {
  daysLeft: number;
}

export default function TrialModal({ daysLeft }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (daysLeft > 0 && daysLeft <= 5) {
      setOpen(true);
    }
  }, [daysLeft]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[2rem] p-6 w-full max-w-sm shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center hover:bg-zinc-200 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex flex-col items-center text-center gap-4 pt-2">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/20">
            <Gift className="w-8 h-8 text-white" />
          </div>

          <div>
            <h3 className="text-lg font-bold text-zinc-900">
              Tu prueba gratis termina pronto
            </h3>
            <p className="text-sm text-zinc-500 mt-1">
              Quedan <span className="font-bold text-primary-600">{daysLeft} día{daysLeft !== 1 ? "s" : ""}</span> para que termine tu acceso completo a Blis Pro.
            </p>
          </div>

          <div className="w-full bg-primary-50 rounded-2xl p-4 text-left space-y-2">
            <div className="flex items-center gap-2 text-sm text-zinc-700">
              <Zap className="w-4 h-4 text-primary-500" />
              <span>Recetario completo</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-zinc-700">
              <Zap className="w-4 h-4 text-primary-500" />
              <span>Todas las etapas de Academia</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-zinc-700">
              <Zap className="w-4 h-4 text-primary-500" />
              <span>Perros ilimitados</span>
            </div>
          </div>

          <Link
            href="/guau/app/suscripcion"
            onClick={() => setOpen(false)}
            className="w-full rounded-2xl bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white py-3.5 font-bold text-sm shadow-lg shadow-primary-600/20 transition-all active:scale-[0.98] text-center"
          >
            Seguir disfrutando de Blis Pro
          </Link>

          <p className="text-[10px] text-zinc-400">
            Menos de lo que cuesta una galleta al dia. Cancela cuando quieras.
          </p>
        </div>
      </div>
    </div>
  );
}
