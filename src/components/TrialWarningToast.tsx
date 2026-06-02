"use client";

import { useState } from "react";
import { Clock, X } from "lucide-react";
import Link from "next/link";

export default function TrialWarningToast({ daysLeft }: { daysLeft: number }) {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="mb-3 rounded-xl bg-warning-50 dark:bg-warning-950/30 border border-warning-200 dark:border-warning-800 p-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-warning-100 dark:bg-warning-900 flex items-center justify-center shrink-0">
          <Clock className="w-4 h-4 text-warning-600" />
        </div>
        <div>
          <p className="text-xs font-semibold text-warning-800 dark:text-warning-200">
            Tu prueba gratis termina en {daysLeft} día{daysLeft !== 1 ? "s" : ""}
          </p>
          <Link
            href="/guau/app/suscripcion"
            className="text-[10px] font-bold text-primary-600 hover:text-primary-700"
          >
            Ver planes de suscripción →
          </Link>
        </div>
      </div>
      <button
        onClick={() => setVisible(false)}
        className="w-6 h-6 rounded-full bg-warning-100 dark:bg-warning-900 flex items-center justify-center shrink-0 hover:bg-warning-200 transition-colors"
      >
        <X className="w-3 h-3 text-warning-600" />
      </button>
    </div>
  );
}
