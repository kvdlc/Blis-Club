import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { calculateWithdrawalBreakdown, reserveWithdrawalBalance, recordTransaction } from "@/lib/withdrawals";
import { getWithdrawalFee } from "@/lib/billing";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const { amountUsd, method } = body;

    if (!amountUsd || !method) {
      return NextResponse.json({ error: "amountUsd y method requeridos" }, { status: 400 });
    }

    const amountCents = Math.round(amountUsd * 100);

    if (amountCents < 1000) {
      return NextResponse.json({ error: "Mínimo $10.00 USD para retirar" }, { status: 400 });
    }

    // Verify billing profile exists
    const { data: billingProfile } = await supabase
      .from("billing_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!billingProfile) {
      return NextResponse.json(
        { error: "Debes completar tu perfil de facturación antes de retirar", code: "NO_BILLING_PROFILE" },
        { status: 400 }
      );
    }

    // Verify method matches saved profile
    if (billingProfile.withdrawal_method !== method) {
      return NextResponse.json(
        { error: "El método de retiro no coincide con tu perfil de facturación" },
        { status: 400 }
      );
    }

    // Verify balance
    const { data: rewards } = await supabase
      .from("user_rewards")
      .select("available_cash_usd, total_cash_usd")
      .eq("user_id", user.id)
      .single();

    const available = rewards?.available_cash_usd || 0;

    if (amountCents > available) {
      return NextResponse.json({ error: "Saldo insuficiente" }, { status: 400 });
    }

    // Calculate fees
    const { feeCents, netCents } = calculateWithdrawalBreakdown(amountCents, method);

    // Build withdrawal details from billing profile
    const withdrawalDetails: Record<string, string | null> = {};
    if (method === "binance_pay") {
      withdrawalDetails.binance_pay_id = billingProfile.binance_pay_id;
      withdrawalDetails.binance_email = billingProfile.binance_email;
    } else if (method === "paypal") {
      withdrawalDetails.paypal_email = billingProfile.paypal_email;
    }

    // Reserve balance (deduct from available)
    const reserved = await reserveWithdrawalBalance(user.id, amountCents);
    if (!reserved) {
      return NextResponse.json({ error: "No se pudo reservar el saldo" }, { status: 500 });
    }

    // Create withdrawal request
    // Build payload defensively: some columns may not exist if migration hasn't run
    const basePayload: any = {
      user_id: user.id,
      amount_usd: amountCents,
      method: method,
      status: "pending",
      account_info: withdrawalDetails, // legacy column that stores payment details
    };

    // Try insert with new columns first
    let withdrawal: any = null;
    let withdrawalError: any = null;

    try {
      const result = await supabase
        .from("withdrawal_requests")
        .insert({
          ...basePayload,
          withdrawal_method: method,
          billing_profile_id: billingProfile.id,
          fee_cents: feeCents,
          net_amount_cents: netCents,
        })
        .select()
        .single();
      withdrawal = result.data;
      withdrawalError = result.error;
    } catch (e: any) {
      // If new columns don't exist, fallback to legacy insert
      if (e.message?.includes("does not exist") || e.message?.includes("column")) {
        const result = await supabase
          .from("withdrawal_requests")
          .insert(basePayload)
          .select()
          .single();
        withdrawal = result.data;
        withdrawalError = result.error;
      } else {
        throw e;
      }
    }

    if (withdrawalError) {
      // Rollback: return the reserved balance
      await supabase
        .from("user_rewards")
        .update({ available_cash_usd: available })
        .eq("user_id", user.id);

      return NextResponse.json({ error: withdrawalError.message }, { status: 500 });
    }

    // Record in ledger
    await recordTransaction({
      userId: user.id,
      type: "withdrawal_reserved",
      amountCents: -amountCents,
      referenceId: withdrawal.id,
      referenceTable: "withdrawal_requests",
      description: `Retiro solicitado vía ${method === "binance_pay" ? "Binance Pay" : "PayPal"}`,
    });

    return NextResponse.json({
      success: true,
      request: withdrawal,
      breakdown: {
        amount_cents: amountCents,
        fee_cents: feeCents,
        net_cents: netCents,
      },
    });
  } catch (error) {
    console.error("[Withdrawal] Error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
