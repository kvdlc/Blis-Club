import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json({ error: "code requerido" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: referral } = await supabase
      .from("referrals")
      .select("referrer_user_id, status")
      .eq("referral_code", code)
      .maybeSingle();

    if (!referral) {
      return NextResponse.json({ valid: false, error: "Código no encontrado" });
    }

    if (referral.status === "paid") {
      return NextResponse.json({ valid: false, error: "Código ya utilizado" });
    }

    return NextResponse.json({ valid: true, referrerId: referral.referrer_user_id });
  } catch (error) {
    console.error("[Referral Validate] Error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
