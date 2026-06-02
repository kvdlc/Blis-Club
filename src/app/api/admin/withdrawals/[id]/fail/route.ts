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
    const { failure_reason } = body;

    if (!failure_reason) {
      return NextResponse.json({ error: "failure_reason requerido" }, { status: 400 });
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
      return NextResponse.json({ error: "No se puede marcar como fallido un retiro ya completado" }, { status: 400 });
    }

    // Update status
    const { data, error } = await supabase
      .from("withdrawal_requests")
      .update({
        status: "failed",
        failure_reason: failure_reason,
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
      failure_reason,
      id
    );

    return NextResponse.json({ success: true, withdrawal: data });
  } catch (e) {
    console.error("[Admin Fail Withdrawal] Error:", e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
