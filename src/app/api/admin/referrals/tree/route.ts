import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function GET(request: Request) {
  try {
    const supabase = createServiceClient();
    const { searchParams } = new URL(request.url);
    const appSlug = searchParams.get("app") || "guau";

    // 1. Get app id
    const { data: app } = await supabase
      .from("applications")
      .select("id")
      .eq("slug", appSlug)
      .single();

    const appId = app?.id;

    // 2. Get all referrals for this app (or all if no app filter)
    let query = supabase
      .from("referrals")
      .select("*");

    if (appId) {
      query = query.eq("application_id", appId);
    }

    const { data: referrals, error: refErr } = await query;
    if (refErr) {
      return NextResponse.json({ error: refErr.message }, { status: 500 });
    }

    // 3. Get all profiles for these referrals
    const userIds = new Set<string>();
    (referrals || []).forEach((r: any) => {
      if (r.referrer_user_id) userIds.add(r.referrer_user_id);
      if (r.referred_user_id) userIds.add(r.referred_user_id);
    });

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, email, first_name, last_name, display_name, avatar_url")
      .in("id", Array.from(userIds));

    const profileMap = Object.fromEntries((profiles || []).map((p: any) => [p.id, p]));

    // 4. Get commissions per user
    const { data: commissions } = await supabase
      .from("referral_commissions")
      .select("user_id, commission_cents, status, level, created_at");

    const userCommissions: Record<string, any[]> = {};
    (commissions || []).forEach((c: any) => {
      if (!userCommissions[c.user_id]) userCommissions[c.user_id] = [];
      userCommissions[c.user_id].push(c);
    });

    // 5. Get subscriptions
    const { data: subscriptions } = await supabase
      .from("subscriptions")
      .select("user_id, status, current_period_end");

    const subMap = Object.fromEntries((subscriptions || []).map((s: any) => [s.user_id, s]));

    // 6. Build tree nodes
    function buildNode(userId: string, depth: number, maxDepth = 3): any {
      const profile = profileMap[userId];
      const userComms = userCommissions[userId] || [];
      const sub = subMap[userId];

      // Find direct referrals where this user is the referrer
      const directReferrals = (referrals || []).filter((r: any) => r.referrer_user_id === userId && r.referred_user_id);

      const children = depth < maxDepth
        ? directReferrals.map((r: any) => buildNode(r.referred_user_id, depth + 1, maxDepth))
        : [];

      return {
        id: userId,
        profile: profile ? {
          id: profile.id,
          display_name: profile.display_name || `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || profile.email,
          email: profile.email,
          avatar_url: profile.avatar_url,
        } : null,
        subscription: sub ? {
          status: sub.status,
          current_period_end: sub.current_period_end,
        } : null,
        commissions: {
          total: userComms.reduce((sum: number, c: any) => sum + (c.commission_cents || 0), 0),
          pending: userComms.filter((c: any) => c.status === "pending").reduce((sum: number, c: any) => sum + (c.commission_cents || 0), 0),
          available: userComms.filter((c: any) => c.status === "available").reduce((sum: number, c: any) => sum + (c.commission_cents || 0), 0),
          paid_out: userComms.filter((c: any) => c.status === "paid_out").reduce((sum: number, c: any) => sum + (c.commission_cents || 0), 0),
          count: userComms.length,
        },
        referral_count: directReferrals.length,
        children,
      };
    }

    // Find root users (users who refer others but aren't referred by anyone in the set)
    const referredIds = new Set((referrals || []).map((r: any) => r.referred_user_id).filter(Boolean));
    const referrerIds = new Set((referrals || []).map((r: any) => r.referrer_user_id).filter(Boolean));
    const rootIds = Array.from(referrerIds).filter((id: any) => !referredIds.has(id));

    // Build tree for each root
    const trees = rootIds.map((id: any) => buildNode(id, 0));

    // 7. Get list of all apps for filtering
    const { data: apps } = await supabase.from("applications").select("id, slug, name").order("name");

    return NextResponse.json({
      trees,
      apps: apps || [],
      totalUsers: userIds.size,
      totalReferrals: (referrals || []).length,
    });
  } catch (error) {
    console.error("[Admin Referral Tree] Error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
