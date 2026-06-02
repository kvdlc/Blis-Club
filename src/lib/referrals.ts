import { createClient } from "@/lib/supabase/client";

/* ─── Constants ─── */
export const PLAN_PRICE_CENTS = 1000; // $10.00 real (público $9.99)
export const HOLD_DAYS = 14;

export const COMMISSION = {
  LEVEL_1: 200, // $2.00 — directo
  LEVEL_2: 100, // $1.00 — segundo nivel
  LEVEL_3: 50,  // $0.50 — tercer nivel
} as const;

export function generateReferralCode(userId: string): string {
  return userId.replace(/-/g, "").slice(0, 6).toUpperCase();
}

/* ─── Wallet ─── */
export async function getOrCreateUserRewards(userId: string) {
  const supabase = createClient();
  const { data: existing } = await supabase
    .from("user_rewards")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) return existing;

  const { data: created } = await supabase
    .from("user_rewards")
    .insert({ user_id: userId })
    .select()
    .single();

  return created;
}

/* ─── Record ledger transaction ─── */
async function recordTransaction(params: {
  userId: string;
  type: string;
  amountCents: number;
  referenceId?: string;
  referenceTable?: string;
  description?: string;
}) {
  const supabase = createClient();

  const { data: rewards } = await supabase
    .from("user_rewards")
    .select("available_cash_usd")
    .eq("user_id", params.userId)
    .single();

  const balanceAfter = (rewards?.available_cash_usd || 0) + params.amountCents;

  await supabase.from("user_reward_transactions").insert({
    user_id: params.userId,
    type: params.type,
    amount_cents: params.amountCents,
    balance_after_cents: balanceAfter,
    reference_id: params.referenceId,
    reference_table: params.referenceTable,
    description: params.description || params.type,
  });
}

/* ─── Credit wallet with commission (HOLD: adds to total, NOT available yet) ─── */
async function creditPendingCommission(userId: string, commissionCents: number, commissionId: string) {
  const supabase = createClient();
  const rewards = await getOrCreateUserRewards(userId);

  // Only add to total_cash_usd (historical earnings)
  // available_cash_usd will be updated after hold period
  await supabase
    .from("user_rewards")
    .update({
      total_cash_usd: (rewards.total_cash_usd || 0) + commissionCents,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  // Record in ledger as earned (pending)
  await recordTransaction({
    userId,
    type: "commission_earned",
    amountCents: 0, // No change to available balance yet
    referenceId: commissionId,
    referenceTable: "referral_commissions",
    description: `Comisión generada - en hold ${HOLD_DAYS} días`,
  });
}

/* ─── Build the ancestor chain for a user up to 3 levels ─── */
async function buildReferralChain(
  supabase: any,
  referredUserId: string
): Promise<{ user_id: string; referral_id: string; level: number }[]> {
  const chain: { user_id: string; referral_id: string; level: number }[] = [];

  // Level 1 — direct referrer of referredUserId
  const { data: ref1 } = await supabase
    .from("referrals")
    .select("id, referrer_user_id, status")
    .eq("referred_user_id", referredUserId)
    .maybeSingle();

  if (!ref1?.referrer_user_id) return chain;

  chain.push({ user_id: ref1.referrer_user_id, referral_id: ref1.id, level: 1 });

  // Level 2 — who referred the level 1 referrer
  const { data: ref2 } = await supabase
    .from("referrals")
    .select("id, referrer_user_id, status")
    .eq("referred_user_id", ref1.referrer_user_id)
    .maybeSingle();

  if (ref2?.referrer_user_id) {
    chain.push({ user_id: ref2.referrer_user_id, referral_id: ref2.id, level: 2 });

    // Level 3 — who referred the level 2 referrer
    const { data: ref3 } = await supabase
      .from("referrals")
      .select("id, referrer_user_id, status")
      .eq("referred_user_id", ref2.referrer_user_id)
      .maybeSingle();

    if (ref3?.referrer_user_id) {
      chain.push({ user_id: ref3.referrer_user_id, referral_id: ref3.id, level: 3 });
    }
  }

  return chain;
}

/* ─── Multi-level commission processing with HOLD ─── */
export async function processMultiLevelCommissions(
  referredUserId: string,
  planPriceCents: number,
  options?: { subscriptionPaymentId?: string; periodStart?: string; periodEnd?: string }
) {
  const supabase = createClient();
  const applied: number[] = [];

  const availableAfter = new Date();
  availableAfter.setDate(availableAfter.getDate() + HOLD_DAYS);

  const chain = await buildReferralChain(supabase, referredUserId);
  if (chain.length === 0) return applied;

  // Mark the direct referral as paid if it was still pending (first payment only)
  const directRef = chain[0];
  const { data: directRefData } = await supabase
    .from("referrals")
    .select("status")
    .eq("id", directRef.referral_id)
    .single();

  if (directRefData?.status === "pending") {
    await supabase
      .from("referrals")
      .update({
        status: "paid",
        level: 1,
        cash_reward_usd: COMMISSION.LEVEL_1,
        reward_granted: true,
        paid_at: new Date().toISOString(),
      })
      .eq("id", directRef.referral_id);
  }

  for (const node of chain) {
    const commissionCents =
      node.level === 1 ? COMMISSION.LEVEL_1 :
      node.level === 2 ? COMMISSION.LEVEL_2 :
      COMMISSION.LEVEL_3;

    const { data: comm } = await supabase
      .from("referral_commissions")
      .insert({
        user_id: node.user_id,
        referral_id: node.referral_id,
        level: node.level,
        commission_cents: commissionCents,
        status: "pending",
        available_after: availableAfter.toISOString(),
        subscription_payment_id: options?.subscriptionPaymentId || null,
        billing_period_start: options?.periodStart || null,
        billing_period_end: options?.periodEnd || null,
      })
      .select()
      .single();

    await creditPendingCommission(node.user_id, commissionCents, comm?.id);
    applied.push(node.level);
  }

  return applied;
}

/* ─── Mature pending commissions (call on page load or via cron) ─── */
export async function maturePendingCommissions(userId?: string) {
  const supabase = createClient();

  let query = supabase
    .from("referral_commissions")
    .select("id, user_id, commission_cents")
    .eq("status", "pending")
    .lte("available_after", new Date().toISOString());

  if (userId) {
    query = query.eq("user_id", userId);
  }

  const { data: pendingComms, error } = await query;

  if (error || !pendingComms || pendingComms.length === 0) return [];

  const matured: any[] = [];

  for (const comm of pendingComms) {
    const c = comm as any;

    // Mark as available
    await supabase
      .from("referral_commissions")
      .update({ status: "available" })
      .eq("id", c.id);

    // Add to available balance
    const { data: rewards } = await supabase
      .from("user_rewards")
      .select("available_cash_usd")
      .eq("user_id", c.user_id)
      .single();

    await supabase
      .from("user_rewards")
      .update({ available_cash_usd: (rewards?.available_cash_usd || 0) + c.commission_cents })
      .eq("user_id", c.user_id);

    // Record in ledger
    await recordTransaction({
      userId: c.user_id,
      type: "commission_available",
      amountCents: c.commission_cents,
      referenceId: c.id,
      referenceTable: "referral_commissions",
      description: `Comisión disponible después de ${HOLD_DAYS} días`,
    });

    matured.push(c);
  }

  return matured;
}

/* ─── Fetch referral tree for a user ─── */
export async function getReferralTree(userId: string) {
  const supabase = createClient();

  // Get all referrals where user is the root referrer
  const { data: directReferrals } = await supabase
    .from("referrals")
    .select(`
      id,
      referral_code,
      level,
      status,
      cash_reward_usd,
      created_at,
      paid_at,
      subscription_id,
      referred_user_id,
      referred_user:referred_user_id(
        id, email, first_name, display_name, avatar_url
      ),
      referred_sub:referred_user_id(
        subscriptions(status, current_period_end, created_at)
      )
    `)
    .eq("referrer_user_id", userId)
    .order("created_at", { ascending: false });

  const tree = (directReferrals ?? []).map((ref: any) => {
    const profile = ref.referred_user;
    const subs = (ref.referred_sub as any[]) ?? [];
    const sub = subs.length > 0 ? subs[0] : null;

    return {
      id: ref.id,
      referralCode: ref.referral_code,
      level: ref.level ?? 1,
      status: ref.status,
      cashRewardUsd: ref.cash_reward_usd ?? 0,
      createdAt: ref.created_at,
      paidAt: ref.paid_at,
      endedAt: sub?.status === "canceled"
        ? sub.current_period_end
        : null,
      user: profile ? {
        id: profile.id,
        code: generateReferralCode(profile.id),
        displayName: profile.first_name
          ? `${profile.first_name} ${(profile.last_name || "").charAt(0)}.`.trim()
          : profile.display_name || profile.email?.split("@")[0] || "Usuario",
        email: profile.email,
        avatarUrl: profile.avatar_url,
      } : null,
      subscription: sub ? {
        status: sub.status,
        periodEnd: sub.current_period_end,
      } : null,
    };
  });

  return tree;
}

/* ─── Calculate total earned per level ─── */
export async function getCommissionsSummary(userId: string) {
  const supabase = createClient();

  const { data: commissions } = await supabase
    .from("referral_commissions")
    .select("level, commission_cents")
    .eq("user_id", userId);

  const summary = {
    level1Cents: 0,
    level2Cents: 0,
    level3Cents: 0,
    totalCents: 0,
  };

  (commissions ?? []).forEach((c: any) => {
    summary.totalCents += c.commission_cents;
    if (c.level === 1) summary.level1Cents += c.commission_cents;
    if (c.level === 2) summary.level2Cents += c.commission_cents;
    if (c.level === 3) summary.level3Cents += c.commission_cents;
  });

  return summary;
}
