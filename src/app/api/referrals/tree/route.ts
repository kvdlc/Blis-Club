import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getReferralTree, getCommissionsSummary } from "@/lib/referrals";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const [tree, summary] = await Promise.all([
      getReferralTree(user.id),
      getCommissionsSummary(user.id),
    ]);

    return NextResponse.json({ tree, summary });
  } catch (error) {
    console.error("[Referral Tree] Error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
