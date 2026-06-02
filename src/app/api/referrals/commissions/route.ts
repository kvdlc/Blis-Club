import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { maturePendingCommissions } from "@/lib/referrals";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Auto-mature any commissions that have passed the hold period
    await maturePendingCommissions(user.id);

    const { data, error } = await supabase
      .from("referral_commissions")
      .select(`
        *,
        referral:referral_id(
          referred_user_id,
          referred:referred_user_id(id, email, first_name, display_name, avatar_url)
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const now = new Date();
    const enriched = (data || []).map((c: any) => {
      const availableAfter = c.available_after ? new Date(c.available_after) : null;
      const daysRemaining = availableAfter
        ? Math.max(0, Math.ceil((availableAfter.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
        : 0;

      return {
        ...c,
        days_remaining: daysRemaining,
        is_available: c.status === "available",
        is_pending: c.status === "pending",
        is_reversed: c.status === "reversed",
        referred_name: c.referral?.referred?.display_name
          || c.referral?.referred?.email?.split("@")[0]
          || "Usuario",
      };
    });

    return NextResponse.json({ commissions: enriched });
  } catch (e) {
    console.error("[Commissions GET] Error:", e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
