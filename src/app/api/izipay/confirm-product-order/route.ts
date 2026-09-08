import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { orderId } = body as { orderId?: string };

    if (!orderId) {
      return NextResponse.json({ error: "orderId requerido" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const serviceSupabase = createServiceClient();

    const { data: order } = await serviceSupabase
      .from("product_orders")
      .select("id, user_id, product_id, quantity, status")
      .eq("id", orderId)
      .single();

    if (!order) {
      return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 });
    }

    if (order.user_id && order.user_id !== user.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    // Confirmar si sigue pendiente
    if (order.status === "pending") {
      await serviceSupabase
        .from("product_orders")
        .update({ status: "paid", updated_at: new Date().toISOString() })
        .eq("id", orderId);

      if (order.product_id && order.quantity) {
        try {
          await serviceSupabase.rpc("decrement_product_stock", {
            p_product_id: order.product_id,
            p_qty: order.quantity,
          });
        } catch {}
      }
    }

    return NextResponse.json({ success: true, status: "paid" });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[Izipay ConfirmProduct] Error:", msg);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
