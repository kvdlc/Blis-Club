import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import BilleteraClient from "./BilleteraClient";
import { generateReferralCode, getCommissionsSummary, getReferralTree, maturePendingCommissions } from "@/lib/referrals";
import type { ReferralNode, CommissionsSummary } from "@/types/database";

export default async function BilleteraPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  // Obtener o crear recompensas
  const { data: rewardsData } = await supabase
    .from("user_rewards")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  let rewards = rewardsData;
  if (!rewards) {
    const { data: created } = await supabase
      .from("user_rewards")
      .insert({ user_id: user.id })
      .select()
      .single();
    rewards = created;
  }

  // Obtener suscripción para verificar estado activo
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("status")
    .eq("user_id", user.id)
    .maybeSingle();

  const isSubscriptionActive = subscription?.status === "active";

  // Obtener referidos (legado, para compatibilidad)
  const { data: referrals } = await supabase
    .from("referrals")
    .select(`
      *,
      referred_user:referred_user_id(
        id, email, first_name, display_name
      ),
      referred_subscription:referred_user_id(
        subscriptions(status, current_period_end, plan_id, created_at)
      )
    `)
    .eq("referrer_user_id", user.id)
    .order("created_at", { ascending: false });

  // Obtener árbol de referidos multinivel
  const tree: ReferralNode[] = await getReferralTree(user.id);
  const summary: CommissionsSummary = await getCommissionsSummary(user.id);

  // Auto-mature pending commissions
  await maturePendingCommissions(user.id);

  // Obtener retiros
  const { data: withdrawals } = await supabase
    .from("withdrawal_requests")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Obtener perfil de facturación
  const { data: billingProfile } = await supabase
    .from("billing_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  // Obtener comisiones
  const { data: commissions } = await supabase
    .from("referral_commissions")
    .select(`
      *,
      referral:referral_id(
        referred_user_id,
        referred:referred_user_id(id, email, first_name, display_name)
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Obtener ledger
  const { data: ledger } = await supabase
    .from("user_reward_transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  // Obtener historial de cobros
  const { data: payments } = await supabase
    .from("subscription_payments")
    .select("*, plan:plan_id(name)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const referralCode = generateReferralCode(user.id);

  const finalRewards = rewards && (rewards.total_cash_usd > 0 || rewards.total_months_free > 0)
    ? rewards
    : null;
  const finalPayments = (payments && payments.length > 0) ? payments : null;
  const finalReferrals = (referrals && referrals.length > 0) ? referrals : null;

  return (
    <BilleteraClient
      rewards={finalRewards}
      referrals={finalReferrals}
      tree={tree}
      summary={summary}
      withdrawals={(withdrawals ?? []) as any[]}
      payments={finalPayments}
      referralCode={referralCode}
      userId={user.id}
      isSubscriptionActive={isSubscriptionActive}
      billingProfile={billingProfile}
      commissions={(commissions ?? []) as any[]}
      ledger={(ledger ?? []) as any[]}
    />
  );
}
