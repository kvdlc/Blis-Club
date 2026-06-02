import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServiceClient();
    const { id } = await params;

    const { data, error } = await supabase
      .from("withdrawal_requests")
      .update({
        status: "processing",
        processed_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("status", "pending") // Only from pending
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Solicitud no encontrada o ya no está pendiente" }, { status: 404 });
    }

    return NextResponse.json({ success: true, withdrawal: data });
  } catch (e) {
    console.error("[Admin Process Withdrawal] Error:", e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
