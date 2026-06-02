import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { releaseWithdrawalBalance } from "@/lib/withdrawals";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServiceClient();
    const { id } = await params;
    const body = await request.json();
    const { rejection_reason } = body;

    if (!rejection_reason) {
      return NextResponse.json({ error: "rejection_reason requerido" }, { status: 400 });
    }

    // Get the withdrawal
    const { data: withdrawal, error: fetchError } = await supabase
      .from("withdrawal_requests")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !withdrawal) {
      return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 });
    }

    if (withdrawal.status === "completed") {
      return NextResponse.json({ error: "No se puede rechazar un retiro ya completado" }, { status: 400 });
    }

    // Update status
    const { data, error } = await supabase
      .from("withdrawal_requests")
      .update({
        status: "rejected",
        rejection_reason: rejection_reason,
        processed_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Return balance to user
    await releaseWithdrawalBalance(
      withdrawal.user_id,
      withdrawal.amount_usd,
      rejection_reason,
      id
    );

    return NextResponse.json({ success: true, withdrawal: data });
  } catch (e) {
    console.error("[Admin Reject Withdrawal] Error:", e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
