import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function GET() {
  const supabase = createServiceClient();
  
  // 1. Obtener perfiles
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, email, display_name, role, avatar_url, created_at")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const userIds = profiles?.map((p) => p.id) || [];

  // 2. Obtener last_sign_in_at de auth.users via RPC (service_role puede acceder a auth schema)
  let lastSignInMap: Record<string, string> = {};
  
  try {
    const { data: signInData } = await supabase.rpc("get_users_last_sign_in", {
      user_ids: userIds,
    });
    
    if (signInData) {
      signInData.forEach((u: any) => {
        lastSignInMap[u.id] = u.last_sign_in_at;
      });
    }
  } catch {
    // RPC no existe, intentar fallback con query directa
    if (userIds.length > 0) {
      try {
        const { data: rawAuth } = await supabase
          .schema("auth")
          .from("users")
          .select("id, last_sign_in_at")
          .in("id", userIds);
        
        if (rawAuth) {
          rawAuth.forEach((u: any) => {
            lastSignInMap[u.id] = u.last_sign_in_at;
          });
        }
      } catch {
        // Si auth schema no es accesible, dejar map vacío
      }
    }
  }

  // 3. Obtener aplicación asignada por suscripción activa más reciente
  const { data: subs } = await supabase
    .from("subscriptions")
    .select("user_id, plan_id, status")
    .in("user_id", userIds)
    .eq("status", "active");

  const planIds = subs?.map((s) => s.plan_id).filter(Boolean) || [];
  const { data: plansWithApps } = await supabase
    .from("plans")
    .select("id, application_id, name")
    .in("id", planIds);

  const appIds = plansWithApps?.map((p) => p.application_id).filter(Boolean) || [];
  const { data: apps } = await supabase
    .from("applications")
    .select("id, name, slug")
    .in("id", appIds);

  const appMap: Record<string, { name: string; slug: string }> = {};
  apps?.forEach((a) => {
    appMap[a.id] = { name: a.name, slug: a.slug };
  });

  const planMap: Record<string, { application_id: string; name: string }> = {};
  plansWithApps?.forEach((p) => {
    planMap[p.id] = { application_id: p.application_id, name: p.name };
  });

  const userAppMap: Record<string, { name: string; slug: string }> = {};
  subs?.forEach((s) => {
    const plan = planMap[s.plan_id];
    if (plan) {
      const app = appMap[plan.application_id];
      if (app) {
        userAppMap[s.user_id] = app;
      }
    }
  });

  // 4. Combinar datos
  const enrichedUsers = profiles?.map((p) => ({
    ...p,
    last_sign_in_at: lastSignInMap[p.id] || null,
    assigned_app: userAppMap[p.id] || null,
  }));

  return NextResponse.json({ data: enrichedUsers });
}

export async function PUT(request: Request) {
  const supabase = createServiceClient();
  const body = await request.json();
  const { id, ...updates } = body;

  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const validFields: Record<string, unknown> = {};
  const allowed = ["email", "display_name", "role", "avatar_url"];
  for (const key of allowed) {
    if (updates[key] !== undefined) validFields[key] = updates[key];
  }

  const { data, error } = await supabase
    .from("profiles")
    .update(validFields)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
