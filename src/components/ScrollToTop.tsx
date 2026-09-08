"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Restaura el scroll al tope cuando cambia la ruta (navegación App Router). */
export function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
