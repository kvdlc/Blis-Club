import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { createClient } from "@/lib/supabase/server";

const SYMBOLS = ["PEN", "MXN", "COP", "CLP", "ARS", "BOB", "PYG", "UYU"];

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const role = profile?.role;
  return role === "admin" || role === "superadmin" || role === "empleado";
}

/** Sincroniza tasas FX desde frankfurter.app y las guarda. */
export async function POST() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const supabase = createServiceClient();
  try {
    const res = await fetch(`https://api.frankfurter.app/latest?from=USD&to=${SYMBOLS.join(",")}`);
    const json = await res.json();
    if (!json.rates) return NextResponse.json({ error: "API FX no respondió" }, { status: 502 });

    const rows = [{ currency_code: "USD", fx_usd_rate: 1, updated_at: new Date().toISOString() }];
    for (const sym of SYMBOLS) {
      if (typeof json.rates[sym] === "number") {
        rows.push({ currency_code: sym, fx_usd_rate: json.rates[sym], updated_at: new Date().toISOString() });
      }
    }
    await supabase.from("fx_rates").upsert(rows);
    return NextResponse.json({ success: true, count: rows.length });
  } catch {
    return NextResponse.json({ error: "Error al sincronizar FX" }, { status: 500 });
  }
}

/** Devuelve las tasas cacheadas. */
export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  const supabase = createServiceClient();
  const { data } = await supabase.from("fx_rates").select("*").order("currency_code");
  return NextResponse.json({ rates: data ?? [] });
}
