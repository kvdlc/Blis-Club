import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function GET() {
  try {
    const supabase = createServiceClient();

    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    const { data: pending, error: pendingError } = await supabase
      .from("withdrawal_requests")
      .select("amount_usd, fee_cents, net_amount_cents, withdrawal_method")
      .eq("status", "pending");

    if (pendingError) throw pendingError;

    const { data: processing, error: processingError } = await supabase
      .from("withdrawal_requests")
      .select("amount_usd, fee_cents, net_amount_cents, withdrawal_method")
      .eq("status", "processing");

    if (processingError) throw processingError;

    const { data: completed, error: completedError } = await supabase
      .from("withdrawal_requests")
      .select("amount_usd, fee_cents, net_amount_cents, withdrawal_method")
      .eq("status", "completed");

    if (completedError) throw completedError;

    const stats = {
      month: currentMonth,
      pending: {
        count: pending?.length || 0,
        total_usd: (pending || []).reduce((s: number, w: any) => s + (w.amount_usd || 0), 0),
        by_method: {
          binance_pay: (pending || []).filter((w: any) => w.withdrawal_method === "binance_pay").length,
          paypal: (pending || []).filter((w: any) => w.withdrawal_method === "paypal").length,
        },
      },
      processing: {
        count: processing?.length || 0,
        total_usd: (processing || []).reduce((s: number, w: any) => s + (w.amount_usd || 0), 0),
      },
      completed: {
        count: completed?.length || 0,
        total_usd: (completed || []).reduce((s: number, w: any) => s + (w.amount_usd || 0), 0),
      },
    };

    return NextResponse.json({ stats });
  } catch (e) {
    console.error("[Admin Withdrawals Stats] Error:", e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
