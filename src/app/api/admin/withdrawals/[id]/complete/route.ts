import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { completeWithdrawal } from "@/lib/withdrawals";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServiceClient();
    const { id } = await params;
    const body = await request.json();
    const { payment_reference } = body;

    if (!payment_reference) {
      return NextResponse.json({ error: "payment_reference requerido" }, { status: 400 });
    }

    // Get the withdrawal to find the user and amount
    const { data: withdrawal, error: fetchError } = await supabase
      .from("withdrawal_requests")
      .select("*")
      .eq("id", id)
      .eq("status", "processing")
      .single();

    if (fetchError || !withdrawal) {
      return NextResponse.json({ error: "Solicitud no encontrada o no está en procesamiento" }, { status: 404 });
    }

    // Update status
    const { data, error } = await supabase
      .from("withdrawal_requests")
      .update({
        status: "completed",
        payment_reference: payment_reference,
        processed_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Record ledger
    await completeWithdrawal(withdrawal.user_id, id, withdrawal.amount_usd);

    return NextResponse.json({ success: true, withdrawal: data });
  } catch (e) {
    console.error("[Admin Complete Withdrawal] Error:", e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
