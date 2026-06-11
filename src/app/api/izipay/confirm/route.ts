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

    // Usar service_role para actualizar sin restricciones RLS
    const serviceSupabase = createServiceClient();

    const { data: subscription } = await serviceSupabase
      .from("subscriptions")
      .select("id, user_id, plan_id, status, plan_type")
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

    const { data: billingPlan } = await serviceSupabase
      .from("plans")
      .select("billing_interval")
      .eq("id", subscription.plan_id)
      .maybeSingle();

    const interval = billingPlan?.billing_interval || "quarter";
    if (interval === "year") {
      periodEnd.setMonth(periodEnd.getMonth() + 12);
    } else if (interval === "quarter") {
      periodEnd.setMonth(periodEnd.getMonth() + 3);
    } else {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    }

    // Activar como Premium y convertir a Cliente
    const updateData: Record<string, unknown> = {
      status: "active",
      plan_type: "premium",
      current_period_start: now.toISOString(),
      current_period_end: periodEnd.toISOString(),
      expires_at: null,
    };

    const { data: updated, error: updateError } = await serviceSupabase
      .from("subscriptions")
      .update(updateData)
      .eq("id", orderId)
      .select()
      .single();

    if (updateError) {
      console.error("[Izipay Confirm] Error actualizando suscripción:", updateError);
      return NextResponse.json({ error: "Error al confirmar" }, { status: 500 });
    }

    // Intentar actualizar metadata por separado (ignorar error si columna no existe)
    try {
      await serviceSupabase
        .from("subscriptions")
        .update({
          metadata: {
            ...((subscription as any).metadata || {}),
            izipay_confirmed_at: now.toISOString(),
            confirmed_via: "client",
          },
        })
        .eq("id", orderId);
    } catch {
      // metadata column might not exist yet
    }

    // Marcar como Cliente (pagó)
    await serviceSupabase
      .from("profiles")
      .update({ is_lead: false })
      .eq("id", subscription.user_id);

    return NextResponse.json({ success: true, status: updated?.status });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[Izipay Confirm] Error:", msg);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
