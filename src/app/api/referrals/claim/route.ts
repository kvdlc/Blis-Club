import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Leer cookie de referral o del metadata del usuario
    const cookieStore = await cookies();
    const cookieRef = cookieStore.get("blis_referral_code")?.value;
    const metadataRef = user.user_metadata?.referral_code;
    const referralCode = cookieRef || metadataRef;

    if (!referralCode) {
      return NextResponse.json({ success: true, claimed: false, reason: "No hay código de referido" });
    }

    const code = referralCode.toUpperCase().replace(/[^A-Z0-9]/g, "");
    const service = createServiceClient();

    // Evitar autoreferido o doble reclamo
    const { data: existing } = await service
      .from("referrals")
      .select("id")
      .eq("referred_user_id", user.id)
      .maybeSingle();
    if (existing) {
      return NextResponse.json({ success: true, claimed: false, reason: "Ya reclamado" });
    }

    // Buscar quién tiene ese código (los primeros 6 chars del UUID, sin guiones)
    const { data: allProfiles } = await service.from("profiles").select("id");
    const referrer = (allProfiles || []).find(
      (p: any) => p.id.replace(/-/g, "").slice(0, 6).toUpperCase() === code
    );

    if (!referrer) {
      return NextResponse.json({ success: true, claimed: false, reason: "Código no válido" });
    }

    if (referrer.id === user.id) {
      return NextResponse.json({ success: true, claimed: false, reason: "No puedes referirte a ti mismo" });
    }

    const { error } = await service.from("referrals").insert({
      referrer_user_id: referrer.id,
      referred_user_id: user.id,
      referral_code: code,
      status: "pending",
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
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
