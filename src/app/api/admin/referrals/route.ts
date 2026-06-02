import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function GET() {
  const supabase = createServiceClient();

  // 1. Obtener todas las comisiones con info de usuario
  const { data: commissions, error: commissionsError } = await supabase
    .from("referral_commissions")
    .select("*, referrer:profiles!user_id(id, email, display_name, first_name, last_name), referral:referrals!referral_id(referred_user_id, referrer_user_id, referred:profiles!referred_user_id(email, display_name))")
    .order("created_at", { ascending: false });

  if (commissionsError) {
    return NextResponse.json({ error: commissionsError.message }, { status: 500 });
  }

  // 2. Obtener todas las billeteras
  const { data: wallets, error: walletsError } = await supabase
    .from("user_rewards")
    .select("*, profile:profiles!user_id(id, email, display_name, first_name, last_name)")
    .order("available_cash_usd", { ascending: false });

  if (walletsError) {
    return NextResponse.json({ error: walletsError.message }, { status: 500 });
  }

  // 3. Obtener todas las solicitudes de retiro
  const { data: withdrawals, error: withdrawalsError } = await supabase
    .from("withdrawal_requests")
    .select("*, profiles:user_id(email, display_name)")
    .order("created_at", { ascending: false });

  if (withdrawalsError) {
    return NextResponse.json({ error: withdrawalsError.message }, { status: 500 });
  }

  // 4. Calcular resumen
  const totalPending = (commissions || [])
    .filter((c: any) => c.status === 'pending')
    .reduce((sum: number, c: any) => sum + (c.commission_cents || 0), 0);

  const totalAvailableCommissions = (commissions || [])
    .filter((c: any) => c.status === 'available')
    .reduce((sum: number, c: any) => sum + (c.commission_cents || 0), 0);

  const totalPaidOut = (commissions || [])
    .filter((c: any) => c.status === 'paid_out')
    .reduce((sum: number, c: any) => sum + (c.commission_cents || 0), 0);

  const totalWalletAvailable = (wallets || [])
    .reduce((sum: number, w: any) => sum + (w.available_cash_usd || 0), 0);

  const totalWithdrawn = (withdrawals || [])
    .filter((w: any) => w.status === 'completed')
    .reduce((sum: number, w: any) => sum + (w.amount_usd || 0), 0);

  const totalPendingWithdrawals = (withdrawals || [])
    .filter((w: any) => w.status === 'pending')
    .reduce((sum: number, w: any) => sum + (w.amount_usd || 0), 0);

  return NextResponse.json({
    summary: {
      totalPending,
      totalAvailable: totalAvailableCommissions,
      totalPaidOut,
      totalWalletAvailable,
      totalWithdrawn,
      totalPendingWithdrawals,
      totalCommissions: (commissions || []).length,
      totalUsersWithEarnings: (wallets || []).filter((w: any) => (w.total_cash_usd || 0) > 0).length,
    },
    commissions: commissions || [],
    wallets: wallets || [],
    withdrawals: withdrawals || [],
  });
}

// Marcar comisiones como pagadas
export async function PUT(request: Request) {
  const supabase = createServiceClient();
  const body = await request.json();
  const { commissionIds, status } = body;

  if (!commissionIds || !Array.isArray(commissionIds) || !status) {
    return NextResponse.json({ error: "commissionIds array and status required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("referral_commissions")
    .update({ status })
    .in("id", commissionIds);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
