import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { isAdmin } from "@/lib/admin";

const PERMANENT_END = "2099-12-31T23:59:59.000Z";

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
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const supabase = createServiceClient();
    const { id: userId } = await params;
    const body = await request.json();
    const { status, plan_type, expires_at, current_period_end } = body;

    const validStatuses = ["active", "canceled", "past_due", "paused", "pending"];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
    }

    const validPlanTypes = ["temporal", "premium", "permanente"];
    if (plan_type && !validPlanTypes.includes(plan_type)) {
      return NextResponse.json({ error: "Tipo de plan inválido" }, { status: 400 });
    }

    // 1. Suscripción más reciente
    const { data: latestSub, error: findError } = await supabase
      .from("subscriptions")
      .select("id, status, plan_type, expires_at, current_period_end, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (findError) {
      return NextResponse.json({ error: findError.message }, { status: 500 });
    }

    // 2. Construir datos de actualización
    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (status) updateData.status = status;
    if (plan_type) updateData.plan_type = plan_type;
    if (expires_at !== undefined) updateData.expires_at = expires_at;
    if (current_period_end !== undefined) updateData.current_period_end = current_period_end;

    const finalPlan = plan_type || latestSub?.plan_type || "temporal";

    // Permanente: sin expiración
    if (finalPlan === "permanente") {
      updateData.expires_at = null;
      updateData.current_period_end = null;
    }

    // 3. Fecha efectiva de fin (para suscripción y para user_apps)
    let effectiveEnd: string | null = null;
    if (finalPlan === "permanente") {
      effectiveEnd = PERMANENT_END;
    } else {
      effectiveEnd =
        current_period_end || expires_at ||
        (updateData.current_period_end as string) || (updateData.expires_at as string) ||
        (latestSub?.current_period_end as string) || (latestSub?.expires_at as string) || null;
    }

    // 4. Defaults si faltan fechas
    if (finalPlan === "temporal" && !effectiveEnd) {
      effectiveEnd = new Date(Date.now() + 60 * 864e5).toISOString();
    }
    if (finalPlan === "premium" && !effectiveEnd) {
      effectiveEnd = new Date(Date.now() + 30 * 864e5).toISOString();
    }
    // Reflejar la fecha efectiva en la suscripción
    if (finalPlan === "temporal") updateData.expires_at = effectiveEnd;
    if (finalPlan === "premium") updateData.current_period_end = effectiveEnd;

    // 5. Actualizar o crear suscripción
    let updatedSub: any = null;
    if (latestSub) {
      const { error: updateError } = await supabase.from("subscriptions").update(updateData).eq("id", latestSub.id);
      if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });
      const { data: refreshed } = await supabase
        .from("subscriptions")
        .select("id, status, plan_type, current_period_start, current_period_end, expires_at, created_at")
        .eq("id", latestSub.id)
        .single();
      updatedSub = refreshed;
    } else {
      const newSub: Record<string, unknown> = {
        user_id: userId,
        status: status || "active",
        plan_type: finalPlan,
        current_period_start: new Date().toISOString(),
        metadata: { created_via: "admin_panel" },
      };
      if (finalPlan === "temporal") newSub.expires_at = effectiveEnd;
      if (finalPlan === "premium") newSub.current_period_end = effectiveEnd;
      const { data: created, error: createError } = await supabase.from("subscriptions").insert(newSub).select().single();
      if (createError) return NextResponse.json({ error: createError.message }, { status: 500 });
      updatedSub = created;
    }

    // 6. SINCRONIZAR user_apps (de aquí lee el acceso real de la app)
    const revoked = status === "canceled";
    const appEnd = revoked
      ? new Date(Date.now() - 864e5).toISOString()
      : (effectiveEnd || new Date(Date.now() + 30 * 864e5).toISOString());

    await supabase
      .from("user_apps")
      .update({
        status: revoked ? "expired" : "active",
        current_period_end: revoked ? null : appEnd,
        trial_ends_at: appEnd,
      })
      .eq("user_id", userId);

    // 7. is_lead según el plan
    if (revoked) {
      await supabase.from("profiles").update({ is_lead: true }).eq("id", userId);
    } else if (finalPlan === "premium" || finalPlan === "permanente") {
      await supabase.from("profiles").update({ is_lead: false }).eq("id", userId);
    } else if (finalPlan === "temporal") {
      await supabase.from("profiles").update({ is_lead: true }).eq("id", userId);
    }

    return NextResponse.json({ success: true, subscription: updatedSub, user_apps_updated: !revoked, effective_end: appEnd });
  } catch (error) {
    console.error("[Admin Update Subscription] Error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
