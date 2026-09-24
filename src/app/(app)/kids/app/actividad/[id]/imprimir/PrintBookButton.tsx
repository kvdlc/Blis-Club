"use client";

import { useEffect } from "react";
import { Printer } from "lucide-react";

export function PrintBookButton({ autoPrint = false }: { autoPrint?: boolean }) {
  useEffect(() => {
    if (autoPrint) {
      const t = setTimeout(() => window.print(), 900);
      return () => clearTimeout(t);
    }
  }, [autoPrint]);

  return (
    <button
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-2xl bg-kids-500 px-5 py-3 text-sm font-black text-white shadow-kids-glow print:hidden"
    >
      <Printer className="h-4 w-4" /> Imprimir / Guardar PDF
    </button>
  );
}
