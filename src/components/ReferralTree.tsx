"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, Users, Crown, Clock, TrendingUp, TrendingDown, Minus, Dog } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { generateReferralCode } from "@/lib/referrals";
import type { ReferralNode, CommissionsSummary } from "@/types/database";

interface Props {
  userId: string;
}

/* ─── Status badge ─── */
function StatusBadge({ status, endedAt }: { status: string; endedAt: string | null }) {
  if (status === "paid" && !endedAt) {
    return (
      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
        <TrendingUp className="w-3 h-3" /> Activo
      </span>
    );
  }
  if (status === "paid" && endedAt) {
    return (
      <span className="flex items-center gap-1 text-[10px] font-bold text-danger-600 bg-danger-50 px-2 py-0.5 rounded-full">
        <TrendingDown className="w-3 h-3" /> Dado de baja
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-[10px] font-bold text-warning-600 bg-warning-50 px-2 py-0.5 rounded-full">
      <Clock className="w-3 h-3" /> Pendiente
    </span>
  );
}

/* ─── Level badge ─── */
function LevelBadge({ level }: { level: number }) {
  const colors: Record<number, string> = {
    1: "bg-primary-100 text-primary-700 border-primary-200",
    2: "bg-accent-100 text-accent-700 border-accent-200",
    3: "bg-zinc-100 text-zinc-600 border-zinc-200",
  };
  const labels: Record<number, string> = {
    1: "Nivel 1",
    2: "Nivel 2",
    3: "Nivel 3",
  };
  return (
    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${colors[level] || colors[3]}`}>
      {labels[level]}
    </span>
  );
}

/* ─── Recursive referral node ─── */
function ReferralNodeCard({
  node,
  depth,
  userId,
}: {
  node: ReferralNode;
  depth: number;
  userId: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const [children, setChildren] = useState<ReferralNode[]>([]);
  const [loadingChildren, setLoadingChildren] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const loadChildren = async () => {
    if (loaded) {
      setExpanded(!expanded);
      return;
    }
    setLoadingChildren(true);
    try {
      const supabase = createClient();
      const referredUserId = node.user?.id;
      if (!referredUserId) { setLoadingChildren(false); return; }

      const { data } = await supabase
        .from("referrals")
        .select(`
          id, referral_code, level, status, cash_reward_usd, created_at, paid_at, subscription_id,
          referred_user_id,
          referred_user:referred_user_id(id, email, first_name, display_name, avatar_url),
          referred_sub:referred_user_id(subscriptions(status, current_period_end, created_at))
        `)
        .eq("referrer_user_id", referredUserId)
        .order("created_at", { ascending: false });

      const parsed: ReferralNode[] = (data ?? []).map((ref: any) => {
        const profile = ref.referred_user;
        const subs = (ref.referred_sub as any[]) ?? [];
        const sub = subs.length > 0 ? subs[0] : null;
        const childLevel = depth + 1;

        return {
          id: ref.id,
          referralCode: ref.referral_code,
          level: childLevel,
          status: ref.status,
          cashRewardUsd: ref.cash_reward_usd ?? 0,
          createdAt: ref.created_at,
          paidAt: ref.paid_at,
          endedAt: sub?.status === "canceled" ? sub.current_period_end : null,
          user: profile ? {
            id: profile.id,
            code: generateReferralCode(profile.id),
            displayName: childLevel <= 1
              ? (profile.first_name ? `${profile.first_name} ${(profile.last_name || "").charAt(0)}.`.trim() : profile.display_name || profile.email?.split("@")[0] || "Usuario")
              : profile.email?.split("@")[0] || "Usuario",
            email: profile.email,
            avatarUrl: profile.avatar_url,
          } : null,
          subscription: sub ? { status: sub.status, periodEnd: sub.current_period_end } : null,
        };
      });

      setChildren(parsed);
      setLoaded(true);
      setExpanded(true);
    } catch {
      // silently fail
    } finally {
      setLoadingChildren(false);
    }
  };

  const showAvatar = depth <= 0; // Only level 1 shows real avatar
  const showName = depth <= 0; // Only level 1 shows real name
  const initials = node.user?.displayName?.slice(0, 2).toUpperCase() || "??";
  const code = node.user?.code || "------";
  const displayName = showName ? (node.user?.displayName || code) : code;

  const borderColor: Record<number, string> = {
    0: "border-l-primary-300",
    1: "border-l-primary-300",
    2: "border-l-accent-300",
    3: "border-l-zinc-200",
  };

  return (
    <div className="relative">
      {/* Vertical connector line */}
      {depth >= 0 && (
        <div className={`absolute left-5 top-10 bottom-0 w-px ${borderColor[depth] || borderColor[3]}`} />
      )}

      <div className={`relative ml-${depth > 0 ? "8" : "0"} mb-2`} style={{ marginLeft: depth > 0 ? 32 : 0 }}>
        <button
          onClick={loadChildren}
          className="w-full card-soft rounded-xl p-3.5 text-left hover:shadow-md transition-all border border-zinc-100"
        >
          <div className="flex items-center gap-3">
            {/* Avatar */}
            {showAvatar && node.user?.avatarUrl ? (
              <img
                src={node.user.avatarUrl}
                alt=""
                className="w-10 h-10 rounded-full object-cover border-2 border-primary-200 shrink-0"
              />
            ) : showAvatar ? (
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-sm font-bold text-primary-600 shrink-0">
                {initials}
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center shrink-0">
                <Dog className="w-5 h-5 text-zinc-400" />
              </div>
            )}

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-zinc-800 truncate">
                  {displayName}
                </p>
                {depth > 0 && (
                  <LevelBadge level={depth} />
                )}
              </div>
              <p className="text-[10px] text-zinc-400 mt-0.5">
                {node.createdAt
                  ? `Desde ${new Date(node.createdAt).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}`
                  : "Fecha no disponible"}
                {node.endedAt && ` · Hasta ${new Date(node.endedAt).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}`}
              </p>
            </div>

            {/* Status + Commission */}
            <div className="flex items-center gap-2 shrink-0">
              <StatusBadge status={node.status} endedAt={node.endedAt} />
              {node.cashRewardUsd > 0 && (
                <span className="flex items-center gap-0.5 text-xs font-bold text-primary-600">
                  <Crown className="w-3 h-3" />
                  ${(node.cashRewardUsd / 100).toFixed(2)}
                </span>
              )}
            </div>

            {/* Expand chevron */}
            <div className="w-6 h-6 rounded-full bg-zinc-100 flex items-center justify-center shrink-0">
              {loadingChildren ? (
                <div className="w-3 h-3 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
              ) : expanded ? (
                <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
              )}
            </div>
          </div>
        </button>

        {/* Children */}
        {expanded && children.length > 0 && (
          <div className="mt-1 pl-4">
            {children.map((child) => (
              <ReferralNodeCard
                key={child.id}
                node={child}
                depth={depth + 1}
                userId={userId}
              />
            ))}
          </div>
        )}

        {expanded && loaded && children.length === 0 && (
          <p className="text-[10px] text-zinc-400 text-center py-3 pl-10">
            Sin sub-referidos
          </p>
        )}
      </div>
    </div>
  );
}

/* ─── Summary bar ─── */
function SummaryBar({ summary }: { summary: CommissionsSummary }) {
  return (
    <div className="grid grid-cols-4 gap-2 mb-4">
      <div className="card-soft rounded-xl p-3 text-center border border-primary-100">
        <p className="text-[10px] text-zinc-400 mb-0.5">Nivel 1</p>
        <p className="text-sm font-extrabold text-primary-600">${(summary.level1Cents / 100).toFixed(2)}</p>
      </div>
      <div className="card-soft rounded-xl p-3 text-center border border-accent-100">
        <p className="text-[10px] text-zinc-400 mb-0.5">Nivel 2</p>
        <p className="text-sm font-extrabold text-accent-600">${(summary.level2Cents / 100).toFixed(2)}</p>
      </div>
      <div className="card-soft rounded-xl p-3 text-center">
        <p className="text-[10px] text-zinc-400 mb-0.5">Nivel 3</p>
        <p className="text-sm font-extrabold text-zinc-500">${(summary.level3Cents / 100).toFixed(2)}</p>
      </div>
      <div className="card-soft rounded-xl p-3 text-center bg-primary-50">
        <p className="text-[10px] text-zinc-400 mb-0.5">Total</p>
        <p className="text-sm font-extrabold text-primary-700">${(summary.totalCents / 100).toFixed(2)}</p>
      </div>
    </div>
  );
}

/* ─── Main component ─── */
export default function ReferralTree({ userId }: Props) {
  const [tree, setTree] = useState<ReferralNode[]>([]);
  const [summary, setSummary] = useState<CommissionsSummary>({
    level1Cents: 0, level2Cents: 0, level3Cents: 0, totalCents: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/referrals/tree")
      .then((r) => r.json())
      .then((data) => {
        if (data.tree) setTree(data.tree);
        if (data.summary) setSummary(data.summary);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="w-8 h-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin mx-auto mb-3" />
        <p className="text-sm text-zinc-400">Cargando tu red...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tree.length > 0 && <SummaryBar summary={summary} />}

      {tree.length > 0 ? (
        <div>
          {tree.map((node) => (
            <ReferralNodeCard
              key={node.id}
              node={node}
              depth={0}
              userId={userId}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto mb-3">
            <Users className="w-8 h-8 text-zinc-400" />
          </div>
          <p className="text-sm font-bold text-zinc-500">Aún no tienes referidos</p>
          <p className="text-xs text-zinc-400 mt-1">
            Comparte tu enlace mágico y cuando alguien se suscriba, ganarás comisiones en 3 niveles.
          </p>
        </div>
      )}
    </div>
  );
}
