import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("id, user_id, plan_id, status")
      .eq("id", orderId)
      .single();

    if (!subscription) {
      return NextResponse.json({ error: "Suscripción no encontrada" }, { status: 404 });
    }

    if (subscription.user_id !== user.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    const { data: updated, error: updateError } = await supabase
      .from("subscriptions")
      .update({
        status: "active",
        current_period_start: now.toISOString(),
        current_period_end: periodEnd.toISOString(),
        metadata: {
          ...((subscription as Record<string, unknown>).metadata
            ? (subscription as Record<string, unknown>).metadata as Record<string, unknown>
            : {}),
          izipay_confirmed_at: now.toISOString(),
          confirmed_via: "client",
        },
      })
      .eq("id", orderId)
      .select()
      .single();

    if (updateError) {
      console.error("[Izipay Confirm] Error actualizando suscripción:", updateError);
      return NextResponse.json({ error: "Error al confirmar" }, { status: 500 });
    }

    return NextResponse.json({ success: true, status: updated?.status });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[Izipay Confirm] Error:", msg);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
