import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { orderId } = body as { orderId?: string };
    if (!orderId) return NextResponse.json({ error: "orderId requerido" }, { status: 400 });

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

    const service = createServiceClient();
    const { data: checkout } = await service.from("product_checkouts").select("id, user_id, status").eq("id", orderId).single();
    if (!checkout) return NextResponse.json({ error: "Checkout no encontrado" }, { status: 404 });
    if (checkout.user_id && checkout.user_id !== user.id) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

    if (checkout.status === "pending") {
      await service.from("product_checkouts").update({ status: "paid", updated_at: new Date().toISOString() }).eq("id", orderId);
      const { data: lines } = await service.from("product_orders").select("id, product_id, quantity").eq("checkout_id", orderId);
      for (const line of (lines as Array<{ id: string; product_id: string; quantity: number }> | null) ?? []) {
        await service.from("product_orders").update({ status: "paid", updated_at: new Date().toISOString() }).eq("id", line.id);
        if (line.product_id) {
          try { await service.rpc("decrement_product_stock", { p_product_id: line.product_id, p_qty: Number(line.quantity) || 1 }); } catch {}
        }
      }
    }

    return NextResponse.json({ success: true, status: "paid" });
  } catch (error) {
    console.error("[Izipay ConfirmCart] Error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
