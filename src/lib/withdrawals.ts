import { createClient } from "@/lib/supabase/client";
import { getWithdrawalFee } from "./billing";

/* ─── Constants ─── */
export const HOLD_DAYS = 14;
export const MINIMUM_WITHDRAWAL_CENTS = 1000; // $10.00

/* ─── Ledger / Transaction Recording ─── */
export async function recordTransaction(params: {
  userId: string;
  type: string;
  amountCents: number;
  referenceId?: string;
  referenceTable?: string;
  description?: string;
}) {
  const supabase = createClient();

  // Get current available balance
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

/* ─── Reserve balance for withdrawal ─── */
export async function reserveWithdrawalBalance(
  userId: string,
  amountCents: number
): Promise<boolean> {
  const supabase = createClient();

  const { data: rewards } = await supabase
    .from("user_rewards")
    .select("available_cash_usd")
    .eq("user_id", userId)
    .single();

  const available = rewards?.available_cash_usd || 0;

  if (amountCents > available) return false;

  await supabase
    .from("user_rewards")
    .update({ available_cash_usd: available - amountCents })
    .eq("user_id", userId);

  return true;
}

/* ─── Release balance back to user (on fail/reject) ─── */
export async function releaseWithdrawalBalance(
  userId: string,
  amountCents: number,
  reason: string,
  withdrawalId: string
): Promise<void> {
  const supabase = createClient();

  const { data: rewards } = await supabase
    .from("user_rewards")
    .select("available_cash_usd")
    .eq("user_id", userId)
    .single();

  const current = rewards?.available_cash_usd || 0;

  await supabase
    .from("user_rewards")
    .update({ available_cash_usd: current + amountCents })
    .eq("user_id", userId);

  await recordTransaction({
    userId,
    type: "withdrawal_failed_returned",
    amountCents,
    referenceId: withdrawalId,
    referenceTable: "withdrawal_requests",
    description: `Saldo devuelto: ${reason}`,
  });
}

/* ─── Mark withdrawal as completed (deduct from total too) ─── */
export async function completeWithdrawal(
  userId: string,
  withdrawalId: string,
  amountCents: number
): Promise<void> {
  const supabase = createClient();

  const { data: rewards } = await supabase
    .from("user_rewards")
    .select("total_cash_usd, available_cash_usd")
    .eq("user_id", userId)
    .single();

  await supabase
    .from("user_rewards")
    .update({
      total_cash_usd: Math.max(0, (rewards?.total_cash_usd || 0) - amountCents),
    })
    .eq("user_id", userId);

  await recordTransaction({
    userId,
    type: "withdrawal_completed",
    amountCents: -amountCents,
    referenceId: withdrawalId,
    referenceTable: "withdrawal_requests",
    description: "Retiro completado",
  });
}

/* ─── Fee calculation ─── */
export function calculateWithdrawalBreakdown(amountCents: number, method: string) {
  const feeCents = getWithdrawalFee(amountCents, method);
  const netCents = amountCents - feeCents;
  return { feeCents, netCents };
}

/* ─── Get user's ledger / transaction history ─── */
export async function getUserLedger(userId: string, limit = 50) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("user_reward_transactions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

/* ─── Get user commissions with hold info ─── */
export async function getUserCommissions(userId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("referral_commissions")
    .select(`
      *,
      referral:referral_id(
        referred_user_id,
        referred:referred_user_id(id, email, first_name, display_name, avatar_url)
      )
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  const now = new Date();

  return (data || []).map((c: any) => {
    const availableAfter = c.available_after ? new Date(c.available_after) : null;
    const daysRemaining = availableAfter
      ? Math.max(0, Math.ceil((availableAfter.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
      : 0;

    return {
      ...c,
      daysRemaining,
      isAvailable: c.status === "available",
      isPending: c.status === "pending",
      isReversed: c.status === "reversed",
      referredName: c.referral?.referred?.display_name || c.referral?.referred?.email?.split("@")[0] || "Usuario",
    };
  });
}

/* ─── Mature pending commissions (called on page load or cron) ─── */
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
