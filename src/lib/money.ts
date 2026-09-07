"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getCountryConfig } from "@/lib/countries";

/* ═══════════════════════ Monedas ═══════════════════════ */

export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
  locale: string;
}

export const CURRENCIES: Record<string, CurrencyInfo> = {
  PEN: { code: "PEN", symbol: "S/", name: "Sol peruano", locale: "es-PE" },
  USD: { code: "USD", symbol: "$", name: "Dólar", locale: "en-US" },
  MXN: { code: "MXN", symbol: "$", name: "Peso mexicano", locale: "es-MX" },
  COP: { code: "COP", symbol: "$", name: "Peso colombiano", locale: "es-CO" },
  CLP: { code: "CLP", symbol: "$", name: "Peso chileno", locale: "es-CL" },
  ARS: { code: "ARS", symbol: "$", name: "Peso argentino", locale: "es-AR" },
  BOB: { code: "BOB", symbol: "Bs", name: "Boliviano", locale: "es-BO" },
  PYG: { code: "PYG", symbol: "₲", name: "Guaraní", locale: "es-PY" },
  UYU: { code: "UYU", symbol: "$", name: "Peso uruguayo", locale: "es-UY" },
};

/** Formatea un monto en la moneda indicada. */
export function formatMoney(amount: number, currency = "PEN", decimals?: number): string {
  const info = CURRENCIES[currency] ?? CURRENCIES.PEN;
  const max = decimals !== undefined ? decimals : (Math.abs(amount % 1) < 0.005 ? 0 : 2);
  try {
    return new Intl.NumberFormat(info.locale, {
      style: "currency",
      currency: info.code,
      minimumFractionDigits: decimals !== undefined ? decimals : 0,
      maximumFractionDigits: max,
    }).format(amount);
  } catch {
    return `${info.symbol} ${amount.toLocaleString("es-PE", { maximumFractionDigits: max })}`;
  }
}

/** Devuelve solo el símbolo de la moneda. */
export function getCurrencySymbol(code: string): string {
  return (CURRENCIES[code] ?? CURRENCIES.PEN).symbol;
}

/** Devuelve la moneda del usuario logueado según su país (default PEN). */
export async function getCurrentCurrency(): Promise<string> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return "PEN";
    const { data } = await supabase.from("profiles").select("currency, country").eq("id", user.id).single();
    const p = data as { currency: string | null; country: string | null } | null;
    if (p?.currency) return p.currency;
    // Derivar de la moneda configurada por país (Ecuador → USD, etc.)
    if (p?.country) return getCountryConfig(p.country).currency;
    return "PEN";
  } catch {
    return "PEN";
  }
}

/** Hook: moneda del usuario + helper de formato. */
export function useMoney() {
  const [currency, setCurrency] = useState("PEN");

  useEffect(() => {
    getCurrentCurrency().then((c) => setCurrency(c));
  }, []);

  const money = (amount: number, decimals?: number) => formatMoney(amount, currency, decimals);
  const symbol = getCurrencySymbol(currency);

  return { currency, symbol, money };
}
