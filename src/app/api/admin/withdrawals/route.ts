import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function GET(request: Request) {
  try {
    const supabase = createServiceClient();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const method = searchParams.get("method");

    // NOTE: withdrawal_requests may not have billing_profile_id column yet (legacy data).
    // We query the base table and enrich profiles separately to avoid broken joins.
    let query = supabase
      .from("withdrawal_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    // Support both old 'method' column and new 'withdrawal_method' column
    if (method) {
      query = query.or(`method.eq.${method},withdrawal_method.eq.${method}`);
    }

    const { data: withdrawals, error } = await query;

    if (error) {
      console.error("[Admin Withdrawals GET] Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Enrich with profile data
    const userIds = [...new Set((withdrawals || []).map((w: any) => w.user_id).filter(Boolean))];
    let profilesMap: Record<string, any> = {};
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, email, display_name, first_name, last_name")
        .in("id", userIds);
      profilesMap = Object.fromEntries((profiles || []).map((p: any) => [p.id, p]));
    }

    // Enrich with billing profile if column exists (defensive)
    const enriched = (withdrawals || []).map((w: any) => ({
      ...w,
      profiles: profilesMap[w.user_id] || null,
      // Normalize old 'method' to new 'withdrawal_method' for frontend
      withdrawal_method: w.withdrawal_method || w.method || "unknown",
      fee_cents: w.fee_cents || 0,
      net_amount_cents: w.net_amount_cents || w.amount_usd || 0,
    }));

    return NextResponse.json({ withdrawals: enriched });
  } catch (e) {
    console.error("[Admin Withdrawals GET] Error:", e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
