import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = createServiceClient();
    const { id: userId } = await params;
    const body = await request.json();
    const { action } = body; // "suspend" | "reactivate"

    if (!action || !["suspend", "reactivate"].includes(action)) {
      return NextResponse.json({ error: "Acción inválida. Use 'suspend' o 'reactivate'" }, { status: 400 });
    }

    if (action === "suspend") {
      // Update user rewards to block withdrawals
      const { error } = await supabase
        .from("user_rewards")
        .update({ 
          available_cash_usd: 0,
          updated_at: new Date().toISOString()
        })
        .eq("user_id", userId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: "Cuenta suspendida. Saldo bloqueado." });
    } else {
      // Recalculate available balance from commissions
      const { data: commissions } = await supabase
        .from("referral_commissions")
        .select("commission_cents, status")
        .eq("user_id", userId)
        .eq("status", "available");

      const availableBalance = (commissions || []).reduce((sum: number, c: any) => sum + (c.commission_cents || 0), 0);

      const { error } = await supabase
        .from("user_rewards")
        .update({ 
          available_cash_usd: availableBalance,
          updated_at: new Date().toISOString()
        })
        .eq("user_id", userId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: "Cuenta reactivada. Saldo restaurado." });
    }
  } catch (error) {
    console.error("[Admin Suspend Account] Error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
