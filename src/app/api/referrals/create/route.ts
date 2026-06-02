import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateReferralCode } from "@/lib/referrals";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { referredUserId } = await request.json();
    if (!referredUserId) {
      return NextResponse.json({ error: "referredUserId requerido" }, { status: 400 });
    }

    const code = generateReferralCode(user.id);

    const { data, error } = await supabase
      .from("referrals")
      .insert({
        referrer_user_id: user.id,
        referred_user_id: referredUserId,
        referral_code: code,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, referral: data });
  } catch (error) {
    console.error("[Referral Create] Error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
