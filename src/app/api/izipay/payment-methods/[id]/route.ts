import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { data: token, error: fetchError } = await supabase
      .from("payment_tokens")
      .select("id, user_id")
      .eq("id", id)
      .eq("is_active", true)
      .maybeSingle();

    if (fetchError || !token) {
      return NextResponse.json({ error: "Tarjeta no encontrada" }, { status: 404 });
    }

    if (token.user_id !== user.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const serviceSupabase = createServiceClient();
    const { error: updateError } = await serviceSupabase
      .from("payment_tokens")
      .update({ is_active: false })
      .eq("id", id);

    if (updateError) {
      console.error("[Payment Methods] Error deleting token:", updateError);
      return NextResponse.json({ error: "Error al eliminar tarjeta" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Payment Methods DELETE] Error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}