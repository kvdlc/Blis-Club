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

    console.log(`[Admin PUT Subscription] userId=${userId}, status=${status}, plan_type=${plan_type}`);

    const validStatuses = ["active", "canceled", "past_due", "paused", "pending"];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
    }

    const validPlanTypes = ["temporal", "premium", "permanente"];
    if (plan_type && !validPlanTypes.includes(plan_type)) {
      return NextResponse.json({ error: "Tipo de plan inválido" }, { status: 400 });
    }

    // 1. Buscar la suscripción más reciente del usuario
    const { data: latestSub, error: findError } = await supabase
      .from("subscriptions")
      .select("id, status, plan_type, expires_at, current_period_end, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (findError) {
      console.error("[Admin PUT] Find error:", findError);
      return NextResponse.json({ error: findError.message }, { status: 500 });
    }

    console.log("[Admin PUT] Found subscription:", latestSub);

    let updatedSub: any = null;

    if (latestSub) {
      // 2. Construir datos de actualización
      const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (status) updateData.status = status;
      if (plan_type) updateData.plan_type = plan_type;
      if (expires_at !== undefined) updateData.expires_at = expires_at;

      // Si se asigna permanente, quitar expiración
      if (plan_type === "permanente") updateData.expires_at = null;
      // Si se asigna temporal y no tiene expires_at, poner 60 días
      if (plan_type === "temporal" && !latestSub.expires_at && !expires_at) {
        const sixtyDays = new Date();
        sixtyDays.setDate(sixtyDays.getDate() + 60);
        updateData.expires_at = sixtyDays.toISOString();
      }
      // Si se activa premium y no tiene current_period_end, poner 30 días
      if (plan_type === "premium" && !latestSub.current_period_end) {
        const thirtyDays = new Date();
        thirtyDays.setDate(thirtyDays.getDate() + 30);
        updateData.current_period_end = thirtyDays.toISOString();
      }

      console.log("[Admin PUT] Updating subscription", latestSub.id, "with:", updateData);

      // 3. Actualizar
      const { error: updateError } = await supabase
        .from("subscriptions")
        .update(updateData)
        .eq("id", latestSub.id);

      if (updateError) {
        console.error("[Admin PUT] Update error:", updateError);
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }

      // 4. Volver a leer la suscripción actualizada para devolverla
      const { data: refreshed, error: refreshError } = await supabase
        .from("subscriptions")
        .select("id, status, plan_type, current_period_start, current_period_end, expires_at, created_at")
        .eq("id", latestSub.id)
        .single();

      if (refreshError) {
        console.error("[Admin PUT] Refresh error:", refreshError);
        return NextResponse.json({ error: refreshError.message }, { status: 500 });
      }

      updatedSub = refreshed;
      console.log("[Admin PUT] Refreshed subscription:", updatedSub);
    } else {
      // No hay suscripción: crear una nueva
      console.log("[Admin PUT] No subscription found, creating new one");
      const newSub: Record<string, unknown> = {
        user_id: userId,
        status: status || "active",
        plan_type: plan_type || "temporal",
        current_period_start: new Date().toISOString(),
        metadata: { created_via: "admin_panel" },
      };
      if (plan_type === "temporal") {
        const sixtyDays = new Date();
        sixtyDays.setDate(sixtyDays.getDate() + 60);
        newSub.expires_at = sixtyDays.toISOString();
        newSub.current_period_end = sixtyDays.toISOString();
      } else if (plan_type === "premium") {
        const thirtyDays = new Date();
        thirtyDays.setDate(thirtyDays.getDate() + 30);
        newSub.current_period_end = thirtyDays.toISOString();
      }

      const { data: created, error: createError } = await supabase
        .from("subscriptions")
        .insert(newSub)
        .select()
        .single();

      if (createError) {
        console.error("[Admin PUT] Create error:", createError);
        return NextResponse.json({ error: createError.message }, { status: 500 });
      }
      updatedSub = created;
    }

    // Actualizar is_lead según el plan
    if (status === "canceled") {
      await supabase.from("profiles").update({ is_lead: true }).eq("id", userId);
    } else if (plan_type === "premium" || plan_type === "permanente") {
      await supabase.from("profiles").update({ is_lead: false }).eq("id", userId);
    } else if (plan_type === "temporal") {
      await supabase.from("profiles").update({ is_lead: true }).eq("id", userId);
    } else if (expires_at && new Date(expires_at) < new Date()) {
      await supabase.from("profiles").update({ is_lead: true }).eq("id", userId);
    }

    console.log("[Admin PUT] Success, returning:", updatedSub);
    return NextResponse.json({ success: true, subscription: updatedSub });
  } catch (error) {
    console.error("[Admin Update Subscription] Error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
