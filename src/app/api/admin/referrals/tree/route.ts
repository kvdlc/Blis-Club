import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function GET() {
  try {
    const supabase = createServiceClient();

    // 1. Get all referrals with profiles and subscription info
    const { data: referrals, error: refErr } = await supabase
      .from("referrals")
      .select(`
        id,
        referrer_user_id,
        referred_user_id,
        referral_code,
        level,
        status,
        cash_reward_usd,
        created_at,
        paid_at,
        referred:profiles!referred_user_id(id, email, first_name, last_name, display_name, avatar_url),
        referrer:profiles!referrer_user_id(id, email, first_name, last_name, display_name, avatar_url)
      `)
      .order("created_at", { ascending: false });

    if (refErr) {
      return NextResponse.json({ error: refErr.message }, { status: 500 });
    }

    // 2. Get all commissions per user
    const { data: commissions } = await supabase
      .from("referral_commissions")
      .select("user_id, level, commission_cents, status, billing_period_start, billing_period_end");

    // 3. Get all subscriptions for referred users
    const { data: subscriptions } = await supabase
      .from("subscriptions")
      .select("user_id, status, current_period_end, created_at");

    // Build user commission summary
    const commissionSummary: Record<string, { total: number; level1: number; level2: number; level3: number; pending: number; available: number }> = {};
    (commissions || []).forEach((c: any) => {
      if (!commissionSummary[c.user_id]) {
        commissionSummary[c.user_id] = { total: 0, level1: 0, level2: 0, level3: 0, pending: 0, available: 0 };
      }
      commissionSummary[c.user_id].total += c.commission_cents;
      if (c.level === 1) commissionSummary[c.user_id].level1 += c.commission_cents;
      if (c.level === 2) commissionSummary[c.user_id].level2 += c.commission_cents;
      if (c.level === 3) commissionSummary[c.user_id].level3 += c.commission_cents;
      if (c.status === "pending") commissionSummary[c.user_id].pending += c.commission_cents;
      if (c.status === "available") commissionSummary[c.user_id].available += c.commission_cents;
    });

    // Build subscription map
    const subMap: Record<string, any> = {};
    (subscriptions || []).forEach((s: any) => {
      subMap[s.user_id] = s;
    });

    // Build tree: for each referrer, list their direct referrals
    const tree: any[] = [];
    const allReferrers = [...new Set((referrals || []).map((r: any) => r.referrer_user_id))];

    for (const referrerId of allReferrers) {
      const firstRef = (referrals || []).find((r: any) => r.referrer_user_id === referrerId);
      // Supabase returns joined tables as arrays; grab first element
      const referrerArr = firstRef?.referrer as any[] | undefined;
      const referrerProfile = referrerArr?.[0];
      const directReferrals = (referrals || []).filter((r: any) => r.referrer_user_id === referrerId && r.referred_user_id);

      const children = directReferrals.map((ref: any) => {
        const referredArr = ref.referred as any[] | undefined;
        const referredProfile = referredArr?.[0];
        const summary = commissionSummary[ref.referred_user_id] || { total: 0, level1: 0, level2: 0, level3: 0, pending: 0, available: 0 };
        const sub = subMap[ref.referred_user_id];

        return {
          id: ref.id,
          referred_user_id: ref.referred_user_id,
          code: ref.referral_code,
          status: ref.status,
          created_at: ref.created_at,
          paid_at: ref.paid_at,
          cash_reward_usd: ref.cash_reward_usd || 0,
          profile: referredProfile ? {
            id: referredProfile.id,
            display_name: referredProfile.display_name || `${referredProfile.first_name || ""} ${referredProfile.last_name || ""}`.trim() || referredProfile.email,
            email: referredProfile.email,
            avatar_url: referredProfile.avatar_url,
          } : null,
          subscription: sub ? {
            status: sub.status,
            current_period_end: sub.current_period_end,
          } : null,
          commissions: summary,
        };
      });

      tree.push({
        referrer_id: referrerId,
        referrer_profile: referrerProfile ? {
          id: referrerProfile.id,
          display_name: referrerProfile.display_name || `${referrerProfile.first_name || ""} ${referrerProfile.last_name || ""}`.trim() || referrerProfile.email,
          email: referrerProfile.email,
          avatar_url: referrerProfile.avatar_url,
        } : null,
        direct_count: children.length,
        children,
      });
    }

    return NextResponse.json({ tree });
  } catch (error) {
    console.error("[Admin Referral Tree] Error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
