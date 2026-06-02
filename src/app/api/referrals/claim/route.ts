import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Leer cookie de referral
    const cookieStore = await cookies();
    const referralCode = cookieStore.get("blis_referral_code")?.value;

    if (!referralCode) {
      return NextResponse.json({ success: true, claimed: false, reason: "No hay código de referido" });
    }

    // Buscar quién tiene ese código (el referrer)
    const { data: referrer } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", referralCode.toLowerCase())
      .maybeSingle();

    if (!referrer) {
      // Intentar buscar por los primeros 6 chars del UUID
      const { data: allProfiles } = await supabase
        .from("profiles")
        .select("id");
      
      const matchingProfile = (allProfiles || []).find(
        (p: any) => p.id.replace(/-/g, "").slice(0, 6).toUpperCase() === referralCode.toUpperCase()
      );

      if (!matchingProfile) {
        return NextResponse.json({ success: true, claimed: false, reason: "Código no válido" });
      }

      // Crear referral
      const { error } = await supabase.from("referrals").insert({
        referrer_user_id: matchingProfile.id,
        referred_user_id: user.id,
        referral_code: referralCode.toUpperCase(),
        status: "pending",
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    } else {
      // Crear referral directo
      const { error } = await supabase.from("referrals").insert({
        referrer_user_id: referrer.id,
        referred_user_id: user.id,
        referral_code: referralCode.toUpperCase(),
        status: "pending",
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    // Limpiar cookie
    const response = NextResponse.json({ success: true, claimed: true });
    response.cookies.set("blis_referral_code", "", { maxAge: 0, path: "/" });
    
    return response;
  } catch (error) {
    console.error("[Referral Claim] Error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
