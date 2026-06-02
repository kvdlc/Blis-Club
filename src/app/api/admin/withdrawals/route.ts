import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function GET(request: Request) {
  try {
    const supabase = createServiceClient();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const method = searchParams.get("method");

    let query = supabase
      .from("withdrawal_requests")
      .select(`
        *,
        profile:profiles!user_id(id, email, display_name, first_name, last_name),
        billing:billing_profile_id(*)
      `)
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    if (method) {
      query = query.eq("withdrawal_method", method);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ withdrawals: data || [] });
  } catch (e) {
    console.error("[Admin Withdrawals GET] Error:", e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
