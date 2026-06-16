import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { createClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const role = profile?.role;
  return role === "admin" || role === "superadmin" || role === "empleado";
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  const { id } = await params;
  const supabase = createServiceClient();

  const { data } = await supabase
    .from("user_apps")
    .select("app_slug")
    .eq("user_id", id);

  return NextResponse.json({ apps: (data ?? []).map((a: any) => a.app_slug) });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  const { id } = await params;
  const body = await request.json();
  const { app_slug } = body;
  if (!app_slug) return NextResponse.json({ error: "app_slug required" }, { status: 400 });

  const supabase = createServiceClient();

  const { error } = await supabase.from("user_apps").insert({
    user_id: id,
    app_slug,
    status: "active",
  });

  if (error && error.code !== "23505") {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const app_slug = searchParams.get("app_slug");
  if (!app_slug) return NextResponse.json({ error: "app_slug required" }, { status: 400 });

  const supabase = createServiceClient();

  await supabase
    .from("user_apps")
    .delete()
    .eq("user_id", id)
    .eq("app_slug", app_slug);

  return NextResponse.json({ success: true });
}
