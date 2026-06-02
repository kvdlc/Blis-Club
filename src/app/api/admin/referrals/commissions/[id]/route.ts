import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = createServiceClient();
    const { id: commissionId } = await params;
    const body = await request.json();
    const { commission_cents, status } = body;

    if (commission_cents === undefined && !status) {
      return NextResponse.json({ error: "commission_cents o status requeridos" }, { status: 400 });
    }

    const updateData: any = {};
    if (commission_cents !== undefined) updateData.commission_cents = commission_cents;
    if (status) updateData.status = status;

    const { data, error } = await supabase
      .from("referral_commissions")
      .update(updateData)
      .eq("id", commissionId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, commission: data });
  } catch (error) {
    console.error("[Admin Update Commission] Error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
