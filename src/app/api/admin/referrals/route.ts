import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function GET() {
  const supabase = createServiceClient();

  // 1. Get all commissions with user info
  const { data: commissionsRaw, error: commissionsError } = await supabase
    .from("referral_commissions")
    .select("*, referrer:profiles!user_id(id, email, display_name, first_name, last_name), referral:referrals!referral_id(referred_user_id, referrer_user_id, referred:profiles!referred_user_id(email, display_name))")
    .order("created_at", { ascending: false });

  if (commissionsError) {
    return NextResponse.json({ error: commissionsError.message }, { status: 500 });
  }

  // Fallback: if available_after is null, calculate it as created_at + 14 days
  const commissions = (commissionsRaw || []).map((c: any) => {
    if (!c.available_after && c.created_at) {
      const created = new Date(c.created_at);
      created.setDate(created.getDate() + 14);
      c.available_after = created.toISOString();
    }
    return c;
  });

  // 2. Get withdrawals
  const { data: withdrawals, error: withdrawalsError } = await supabase
    .from("withdrawal_requests")
    .select("*, profiles:user_id(email, display_name)")
    .order("created_at", { ascending: false });

  if (withdrawalsError) {
    return NextResponse.json({ error: withdrawalsError.message }, { status: 500 });
  }

  // 3. Build wallets dynamically from commissions (source of truth)
  // Group commissions by user_id
  const userCommissionMap: Record<string, { total: number; available: number; pending: number; paid_out: number; count: number }> = {};

  (commissions || []).forEach((c: any) => {
    const uid = c.user_id;
    if (!userCommissionMap[uid]) {
      userCommissionMap[uid] = { total: 0, available: 0, pending: 0, paid_out: 0, count: 0 };
    }
    userCommissionMap[uid].total += c.commission_cents || 0;
    userCommissionMap[uid].count += 1;
    if (c.status === 'available') userCommissionMap[uid].available += c.commission_cents || 0;
    if (c.status === 'pending') userCommissionMap[uid].pending += c.commission_cents || 0;
    if (c.status === 'paid_out') userCommissionMap[uid].paid_out += c.commission_cents || 0;
  });

  // 4. Get profiles for users with commissions
  const userIds = Object.keys(userCommissionMap);
  let profilesMap: Record<string, any> = {};
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, email, display_name, first_name, last_name")
      .in("id", userIds);
    profilesMap = Object.fromEntries((profiles || []).map((p: any) => [p.id, p]));
  }

  // Build wallets array dynamically
  const wallets = userIds.map((uid) => {
    const stats = userCommissionMap[uid];
    const profile = profilesMap[uid];
    return {
      user_id: uid,
      total_cash_usd: stats.total,
      available_cash_usd: stats.available,
      pending_cash_usd: stats.pending,
      paid_out_cash_usd: stats.paid_out,
      commission_count: stats.count,
      profile: profile ? {
        id: profile.id,
        email: profile.email,
        display_name: profile.display_name,
        first_name: profile.first_name,
        last_name: profile.last_name,
      } : null,
    };
  }).sort((a, b) => (b.total_cash_usd || 0) - (a.total_cash_usd || 0));

  // 5. Calculate summary
  const totalPending = (commissions || [])
    .filter((c: any) => c.status === 'pending')
    .reduce((sum: number, c: any) => sum + (c.commission_cents || 0), 0);

  const totalAvailableCommissions = (commissions || [])
    .filter((c: any) => c.status === 'available')
    .reduce((sum: number, c: any) => sum + (c.commission_cents || 0), 0);

  const totalPaidOut = (commissions || [])
    .filter((c: any) => c.status === 'paid_out')
    .reduce((sum: number, c: any) => sum + (c.commission_cents || 0), 0);

  const totalWalletAvailable = wallets.reduce((sum: number, w: any) => sum + (w.available_cash_usd || 0), 0);

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
      totalUsersWithEarnings: wallets.length,
    },
    commissions: commissions || [],
    wallets: wallets,
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
