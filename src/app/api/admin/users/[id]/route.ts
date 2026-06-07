import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = createServiceClient();
    const { id: userId } = await params;

    if (!userId) {
      return NextResponse.json({ error: "ID de usuario requerido" }, { status: 400 });
    }

    // 1. Eliminar suscripciones
    await supabase.from("subscriptions").delete().eq("user_id", userId);

    // 2. Eliminar user_apps
    await supabase.from("user_apps").delete().eq("user_id", userId);

    // 3. Eliminar referrals donde es referrer o referred
    await supabase.from("referrals").delete().eq("referrer_user_id", userId);
    await supabase.from("referrals").delete().eq("referred_user_id", userId);

    // 4. Eliminar referral_commissions
    await supabase.from("referral_commissions").delete().eq("user_id", userId);

    // 5. Eliminar payment_tokens
    await supabase.from("payment_tokens").delete().eq("user_id", userId);

    // 6. Eliminar profile
    await supabase.from("profiles").delete().eq("id", userId);

    // 7. Eliminar usuario de auth (service_role puede hacer esto)
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);

    if (authError) {
      console.error("[Admin Delete User] Auth error:", authError);
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Usuario eliminado permanentemente" });
  } catch (error) {
    console.error("[Admin Delete User] Error:", error);
    return NextResponse.json({ error: "Error interno al eliminar usuario" }, { status: 500 });
  }
}
