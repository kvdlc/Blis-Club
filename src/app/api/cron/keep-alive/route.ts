import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function GET(request: Request) {
  // Verificar CRON_SECRET (Vercel/GitHub Actions mandan Authorization: Bearer $CRON_SECRET)
  const auth = request.headers.get("authorization") || "";
  const expected = process.env.CRON_SECRET;
  if (!expected || auth !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    // service_role bypassa RLS → query real exitosa contra la DB
    const supabase = createServiceClient();
    const { error } = await supabase.from("profiles").select("id").limit(1);
    return NextResponse.json({ ok: !error, at: new Date().toISOString() });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
