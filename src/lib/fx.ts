import { createClient } from "@/lib/supabase/client";

/**
 * Tipo de cambio a USD de una moneda.
 * 1 USD = fx_usd_rate unidades de la moneda.
 */

/** Obtener las tasas cacheadas. */
export async function getCachedFxRates(): Promise<Record<string, number>> {
  const supabase = createClient();
  const { data } = await supabase.from("fx_rates").select("*");
  const out: Record<string, number> = {};
  for (const r of (data ?? []) as { currency_code: string; fx_usd_rate: number }[]) {
    out[r.currency_code] = r.fx_usd_rate;
  }
  return out;
}

/** Obtener (y cachear) tasas desde una API gratuita. */
export async function syncFxRates(): Promise<Record<string, number> | null> {
  const supabase = createClient();
  const base = "USD";
  const symbols = ["PEN", "MXN", "COP", "CLP", "ARS", "BOB", "PYG", "UYU"];
  try {
    const res = await fetch(`https://api.frankfurter.app/latest?from=${base}&to=${symbols.join(",")}`);
    const json = await res.json();
    if (!json.rates) return null;

    const rates: Record<string, number> = { USD: 1 };
    for (const sym of symbols) {
      const r = json.rates[sym];
      if (typeof r === "number") rates[sym] = r;
    }

    const rows = Object.entries(rates).map(([currency_code, fx_usd_rate]) => ({
      currency_code, fx_usd_rate, updated_at: new Date().toISOString(),
    }));
    await supabase.from("fx_rates").upsert(rows);
    return rates;
  } catch {
    return null;
  }
}

/** Convertir un monto de una moneda a otra usando tasas cacheadas. */
export function convertMoney(amount: number, from: string, to: string, rates: Record<string, number>): number {
  if (from === to) return amount;
  const fromUsd = rates[from];
  const toUsd = rates[to];
  if (!fromUsd || !toUsd) return amount; // sin tasa, no convertir
  const usd = amount / fromUsd;
  return usd * toUsd;
}
