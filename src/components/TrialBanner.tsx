"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";

interface Props {
  daysLeft: number;
}

export default function TrialBanner({ daysLeft }: Props) {
  if (daysLeft <= 0 || daysLeft > 5) return null;

  return (
    <div className="bg-warning-50 border-b border-warning-200 px-4 py-2.5">
      <div className="flex items-center justify-between gap-3 max-w-5xl mx-auto">
        <div className="flex items-center gap-2 min-w-0">
          <AlertTriangle className="w-4 h-4 text-warning-600 shrink-0" />
          <p className="text-xs font-bold text-warning-700 truncate">
            Tu experiencia completa termina en {daysLeft} día{daysLeft !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/guau/app/suscripcion"
          className="shrink-0 text-[11px] font-bold bg-warning-500 hover:bg-warning-600 text-white rounded-full px-3 py-1 transition-colors"
        >
          Ver planes
        </Link>
      </div>
    </div>
  );
}
