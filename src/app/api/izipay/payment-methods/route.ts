import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { data: tokens, error } = await supabase
      .from("payment_tokens")
      .select("id, card_brand, card_last4, card_expiry, is_active, created_at")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[Payment Methods] Error fetching tokens:", error);
      return NextResponse.json({ error: "Error al obtener métodos de pago" }, { status: 500 });
    }

    return NextResponse.json({ methods: tokens || [] });
  } catch (error) {
    console.error("[Payment Methods] Error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}