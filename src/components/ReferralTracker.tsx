"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

/**
 * Detecta ?ref=CODIGO en la URL y guarda en cookie por 60 días.
 * Cuando el usuario se registra, el backend lee esta cookie y crea el referral.
 */
export default function ReferralTracker() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref && ref.length >= 4) {
      // Guardar cookie por 60 días
      const days = 60;
      const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
      document.cookie = `blis_referral_code=${ref};expires=${expires};path=/;SameSite=Lax`;
      console.log("[ReferralTracker] Código guardado:", ref);
    }
  }, [searchParams]);

  return null;
}
