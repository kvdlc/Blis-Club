import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = createServiceClient();
    const { id: userId } = await params;

    const { data, error } = await supabase
      .from("subscriptions")
      .select("id, status, plan_type, current_period_start, current_period_end, expires_at, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ subscription: data });
  } catch (error) {
    console.error("[Admin Get Subscription] Error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = createServiceClient();
    const { id: userId } = await params;
    const body = await request.json();
    const { status, plan_type, expires_at } = body;

    const validStatuses = ["active", "canceled", "past_due", "paused", "pending"];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
    }

    const validPlanTypes = ["temporal", "premium", "permanente"];
    if (plan_type && !validPlanTypes.includes(plan_type)) {
      return NextResponse.json({ error: "Tipo de plan inválido" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (status) updateData.status = status;
    if (plan_type) updateData.plan_type = plan_type;
    if (expires_at !== undefined) updateData.expires_at = expires_at;

    // Si se asigna permanente, quitar expiración
    if (plan_type === "permanente") updateData.expires_at = null;

    const { data, error } = await supabase
      .from("subscriptions")
      .update(updateData)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Si se cancela o el plan temporal expira, marcar como lead
    if (status === "canceled" || (plan_type === "temporal" && expires_at && new Date(expires_at) < new Date())) {
      await supabase.from("profiles").update({ is_lead: true }).eq("id", userId);
    } else if (status === "active" || plan_type === "premium" || plan_type === "permanente") {
      await supabase.from("profiles").update({ is_lead: false }).eq("id", userId);
    }

    return NextResponse.json({ success: true, subscription: data });
  } catch (error) {
    console.error("[Admin Update Subscription] Error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
