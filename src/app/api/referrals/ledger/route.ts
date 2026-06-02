import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");

    const { data, error } = await supabase
      .from("user_reward_transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Enrich with readable labels
    const typeLabels: Record<string, string> = {
      commission_earned: "Comisión generada",
      commission_available: "Comisión disponible",
      commission_reversed: "Comisión reversada",
      withdrawal_reserved: "Retiro solicitado",
      withdrawal_completed: "Retiro completado",
      withdrawal_failed_returned: "Retiro fallido (saldo devuelto)",
      withdrawal_rejected_returned: "Retiro rechazado (saldo devuelto)",
    };

    const enriched = (data || []).map((t: any) => ({
      ...t,
      type_label: typeLabels[t.type] || t.type,
      is_positive: t.amount_cents > 0,
      is_negative: t.amount_cents < 0,
    }));

    return NextResponse.json({ transactions: enriched });
  } catch (e) {
    console.error("[Ledger GET] Error:", e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
