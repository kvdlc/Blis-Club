"use client";

import { ChevronDown, ChevronRight, CircleDollarSign } from "lucide-react";

interface TreeNode {
  id: string;
  profile: { display_name: string; email: string; avatar_url: string | null } | null;
  subscription: { status: string; current_period_end: string } | null;
  commissions: { total: number; pending: number; available: number; paid_out: number; count: number };
  referral_count: number;
  children: TreeNode[];
}

interface Props {
  node: TreeNode;
  depth: number;
  expandedNodes: Set<string>;
  onToggle: (id: string) => void;
  onSelect: (node: TreeNode) => void;
  selectedId: string | null;
  highlightedId: string | null;
  filter: string;
}

const LEVEL_COLORS = [
  { border: "border-primary-400", bg: "bg-primary-50", badge: "bg-primary-100 text-primary-700" },
  { border: "border-accent-400", bg: "bg-accent-50", badge: "bg-accent-100 text-accent-700" },
  { border: "border-warning-400", bg: "bg-warning-50", badge: "bg-warning-100 text-warning-700" },
  { border: "border-zinc-400", bg: "bg-zinc-50", badge: "bg-zinc-100 text-zinc-700" },
];

const AVATAR_SIZE = 72;
const CARD_WIDTH = 220;

export function ReferralTreeNode({ node, depth, expandedNodes, onToggle, onSelect, selectedId, highlightedId, filter }: Props) {
  const isExpanded = expandedNodes.has(node.id);
  const hasChildren = node.children && node.children.length > 0;
  const colors = LEVEL_COLORS[depth % LEVEL_COLORS.length];
  const isSelected = selectedId === node.id;
  const isHighlighted = highlightedId === node.id;

  const formatMoney = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  return (
    <div className="flex flex-col items-center select-none">
      {/* Node Card */}
      <div
        data-tree-node={node.id}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(node);
        }}
        className={`relative cursor-pointer group transition-all duration-200 select-none ${ isSelected ? "scale-110 z-20" : "hover:scale-105 z-10" } ${isHighlighted ? "animate-pulse" : ""}`}
      >
        <div
          className={`w-[${CARD_WIDTH}px] bg-white rounded-2xl border-2 ${colors.border} shadow-md hover:shadow-xl transition-all p-4 text-center relative`}
          style={{ width: CARD_WIDTH }}
        >
          {/* Selected ring */}
          {isSelected && (
            <div className="absolute -inset-1 rounded-2xl border-2 border-primary-500 animate-pulse" />
          )}

          {/* Avatar */}
          <div
            className={`w-[${AVATAR_SIZE}px] h-[${AVATAR_SIZE}px] rounded-full mx-auto mb-3 overflow-hidden border-3 ${colors.border} ${colors.bg} flex items-center justify-center shadow-inner`}
            style={{ width: AVATAR_SIZE, height: AVATAR_SIZE, borderWidth: 3 }}
          >
            {node.profile?.avatar_url ? (
              <img src={node.profile.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-bold text-zinc-500">
                {(node.profile?.display_name || "?").charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          {/* Name */}
          <p className="text-sm font-bold text-zinc-800 truncate px-1 leading-tight">
            {node.profile?.display_name || "Usuario"}
          </p>
          <p className="text-[10px] text-zinc-400 truncate px-1 mt-0.5">{node.profile?.email}</p>

          {/* Badges */}
          <div className="mt-2.5 flex items-center justify-center gap-1.5 flex-wrap">
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${colors.badge}`}>
              Nivel {depth}
            </span>
            {node.subscription?.status === "active" && (
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-secondary-100 text-secondary-700">
                Activo
              </span>
            )}
            {node.referral_count > 0 && (
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-primary-100 text-primary-700">
                {node.referral_count} ref
              </span>
            )}
          </div>

          {/* Earnings */}
          {node.commissions.total > 0 && (
            <div className="mt-2.5 flex items-center justify-center gap-1 text-primary-600">
              <CircleDollarSign className="w-3.5 h-3.5" />
              <span className="text-xs font-bold">{formatMoney(node.commissions.total)}</span>
            </div>
          )}

          {/* Commission count */}
          <p className="text-[9px] text-zinc-400 mt-1.5">{node.commissions.count} comisiones</p>
        </div>
      </div>

      {/* Expand/Collapse Button */}
      {hasChildren && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle(node.id);
          }}
          className="mt-2 mb-2 w-7 h-7 rounded-full bg-white border border-zinc-200 shadow-sm flex items-center justify-center hover:bg-zinc-50 transition-colors z-10"
        >
          {isExpanded ? (
            <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
          )}
        </button>
      )}

      {/* Children */}
      {isExpanded && hasChildren && (
        <div className="relative pt-6">
          <div className="relative flex items-start gap-8">
            {node.children.map((child) => (
              <ReferralTreeNode
                key={child.id}
                node={child}
                depth={depth + 1}
                expandedNodes={expandedNodes}
                onToggle={onToggle}
                onSelect={onSelect}
                selectedId={selectedId}
                highlightedId={highlightedId}
                filter={filter}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
