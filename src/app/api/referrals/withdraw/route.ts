import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { amountUsd, method, accountInfo } = await request.json();
    if (!amountUsd || !method) {
      return NextResponse.json({ error: "amountUsd y method requeridos" }, { status: 400 });
    }

    // Verificar balance
    const { data: rewards } = await supabase
      .from("user_rewards")
      .select("available_cash_usd")
      .eq("user_id", user.id)
      .single();

    const available = rewards?.available_cash_usd || 0;
    const amountCents = Math.round(amountUsd * 100);

    if (amountCents > available) {
      return NextResponse.json({ error: "Saldo insuficiente" }, { status: 400 });
    }

    if (amountCents < 1000) {
      return NextResponse.json({ error: "Mínimo $10.00 USD para retirar" }, { status: 400 });
    }

    // Crear solicitud de retiro
    const { data, error } = await supabase
      .from("withdrawal_requests")
      .insert({
        user_id: user.id,
        amount_usd: amountCents,
        method,
        account_info: accountInfo || {},
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Restar del balance disponible
    await supabase
      .from("user_rewards")
      .update({ available_cash_usd: available - amountCents })
      .eq("user_id", user.id);

    return NextResponse.json({ success: true, request: data });
  } catch (error) {
    console.error("[Withdrawal] Error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
