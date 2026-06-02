import { NextResponse } from "next/server";
import { processMultiLevelCommissions } from "@/lib/referrals";

export async function POST(request: Request) {
  try {
    const { referredUserId, planPriceCents } = await request.json();

    if (!referredUserId || !planPriceCents) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    const levels = await processMultiLevelCommissions(referredUserId, planPriceCents);

    return NextResponse.json({ success: true, levels });
  } catch (error) {
    console.error("[Referral Reward] Error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
