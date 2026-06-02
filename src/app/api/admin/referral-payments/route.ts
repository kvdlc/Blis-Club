import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function GET() {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("withdrawal_requests")
    .select("*, profiles:user_id (email, display_name)")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function PUT(request: Request) {
  const supabase = createServiceClient();
  const body = await request.json();
  const { id, status, admin_notes } = body;

  if (!id || !status) {
    return NextResponse.json({ error: "id and status are required" }, { status: 400 });
  }

  if (!["completed", "rejected"].includes(status)) {
    return NextResponse.json({ error: "status must be 'completed' or 'rejected'" }, { status: 400 });
  }

  const updates: Record<string, unknown> = { status };
  if (admin_notes !== undefined) updates.admin_notes = admin_notes;

  const { data, error } = await supabase
    .from("withdrawal_requests")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
