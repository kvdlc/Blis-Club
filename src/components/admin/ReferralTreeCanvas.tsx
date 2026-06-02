"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { ReferralTreeNode } from "./ReferralTreeNode";
import { ReferralTreeDrawer } from "./ReferralTreeDrawer";
import { ReferralTreeToolbar } from "./ReferralTreeToolbar";

interface TreeNode {
  id: string;
  profile: { display_name: string; email: string; avatar_url: string | null } | null;
  subscription: { status: string; current_period_end: string } | null;
  commissions: { total: number; pending: number; available: number; paid_out: number; count: number };
  referral_count: number;
  children: TreeNode[];
}

interface Props {
  trees: TreeNode[];
  apps: { id: string; slug: string; name: string }[];
  selectedApp: string;
  onAppChange: (slug: string) => void;
  onRefresh: () => void;
  totalMembers: number;
  totalEarnings: number;
}

function countAllNodes(node: TreeNode): number {
  return 1 + node.children.reduce((sum, child) => sum + countAllNodes(child), 0);
}

function findNodeById(node: TreeNode, id: string): TreeNode | null {
  if (node.id === id) return node;
  for (const child of node.children) {
    const found = findNodeById(child, id);
    if (found) return found;
  }
  return null;
}

function flattenNodes(node: TreeNode): TreeNode[] {
  return [node, ...node.children.flatMap(flattenNodes)];
}

export function ReferralTreeCanvas({ trees, apps, selectedApp, onAppChange, onRefresh, totalMembers, totalEarnings }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const draggingRef = useRef(false);
  const [dragging, setDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const panStartRef = useRef({ x: 0, y: 0 });

  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [highlightedNode, setHighlightedNode] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [svgLines, setSvgLines] = useState<Array<{ id: string; d: string }>>([]);
  const [nodePositions, setNodePositions] = useState<Map<string, { x: number; y: number }>>(new Map());
  const [mapBounds, setMapBounds] = useState<{ minX: number; minY: number; maxX: number; maxY: number } | null>(null);

  // Auto-expand roots on first load
  useEffect(() => {
    if (trees.length > 0 && expandedNodes.size === 0) {
      setExpandedNodes(new Set(trees.map((t) => t.id)));
    }
  }, [trees]);

  // Fullscreen listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await containerRef.current?.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (e) {
      console.error("Fullscreen error:", e);
    }
  };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    // Don't drag if clicking on a node, button, or any interactive element inside the tree
    if (target.closest("[data-tree-node]") || target.closest("button") || target.closest("input") || target.closest("select") || target.closest("a")) {
      return;
    }
    draggingRef.current = true;
    setDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    panStartRef.current = { x: panX, y: panY };
  }, [panX, panY]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!draggingRef.current) return;
    setPanX(panStartRef.current.x + (e.clientX - dragStartRef.current.x));
    setPanY(panStartRef.current.y + (e.clientY - dragStartRef.current.y));
  }, []);

  const handleMouseUp = useCallback(() => {
    draggingRef.current = false;
    setDragging(false);
  }, []);

  // Wheel zoom towards mouse pointer
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Use direction only for consistent zoom speed across browsers
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.3, Math.min(3, zoom * zoomFactor));

    // Zoom towards mouse position
    const scaleRatio = newZoom / zoom;
    const newPanX = mouseX - (mouseX - panX) * scaleRatio;
    const newPanY = mouseY - (mouseY - panY) * scaleRatio;

    setZoom(newZoom);
    setPanX(newPanX);
    setPanY(newPanY);
  }, [zoom, panX, panY]);

  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
  };

  const expandAll = () => {
    const allIds = new Set<string>();
    const collect = (node: TreeNode) => {
      allIds.add(node.id);
      node.children.forEach(collect);
    };
    trees.forEach(collect);
    setExpandedNodes(allIds);
  };

  const collapseAll = () => {
    setExpandedNodes(new Set(trees.map((t) => t.id)));
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    const allNodes = trees.flatMap(flattenNodes);
    const found = allNodes.find(
      (n) =>
        n.profile?.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.profile?.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (!found) return;

    setHighlightedNode(found.id);
    setSelectedNode(found);
    // Expand all nodes so the found one is visible
    const newExpanded = new Set(expandedNodes);
    allNodes.forEach((n) => newExpanded.add(n.id));
    setExpandedNodes(newExpanded);

    // After DOM update, center viewport on the found node
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const el = document.querySelector(`[data-tree-node="${found.id}"]`) as HTMLElement | null;
        if (el && contentRef.current && containerRef.current) {
          const contentRect = contentRef.current.getBoundingClientRect();
          const elRect = el.getBoundingClientRect();
          const containerRect = containerRef.current.getBoundingClientRect();
          // Position of node center relative to content, in content space
          const nodeCenterX = (elRect.left + elRect.width / 2 - contentRect.left);
          const nodeCenterY = (elRect.top + elRect.height / 2 - contentRect.top);
          // Center container viewport on that node
          setPanX(containerRect.width / 2 / zoom - nodeCenterX);
          setPanY(containerRect.height / 2 / zoom - nodeCenterY);
        }
      });
    });

    setTimeout(() => setHighlightedNode(null), 3000);
  };

  const handleExport = () => {
    if (!mapBounds || nodePositions.size === 0) return;
    const padding = 40;
    const contentW = Math.max(mapBounds.maxX - mapBounds.minX, 1);
    const contentH = Math.max(mapBounds.maxY - mapBounds.minY, 1);
    const svgW = contentW + padding * 2;
    const svgH = contentH + padding * 2;

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgW}" height="${svgH}" viewBox="0 0 ${svgW} ${svgH}">`;
    svg += `<rect width="100%" height="100%" fill="white"/>`;
    // Lines
    svgLines.forEach((line) => {
      const match = line.d.match(/M ([\d.-]+) ([\d.-]+) L ([\d.-]+) ([\d.-]+) L ([\d.-]+) ([\d.-]+) L ([\d.-]+) ([\d.-]+)/);
      if (!match) return;
      const [, x1, y1, x2, y2, x3, y3, x4, y4] = match;
      svg += `<polyline points="${parseFloat(x1) + padding - mapBounds.minX},${parseFloat(y1) + padding - mapBounds.minY} ${parseFloat(x2) + padding - mapBounds.minX},${parseFloat(y2) + padding - mapBounds.minY} ${parseFloat(x3) + padding - mapBounds.minX},${parseFloat(y3) + padding - mapBounds.minY} ${parseFloat(x4) + padding - mapBounds.minX},${parseFloat(y4) + padding - mapBounds.minY}" fill="none" stroke="#d4d4d8" stroke-width="2" stroke-linejoin="round"/>`;
    });
    // Nodes
    nodePositions.forEach((pos, id) => {
      const node = trees.flatMap(flattenNodes).find((n) => n.id === id);
      const name = node?.profile?.display_name || "Usuario";
      const cx = pos.x + padding - mapBounds.minX;
      const cy = pos.y + padding - mapBounds.minY;
      svg += `<circle cx="${cx}" cy="${cy}" r="6" fill="#6366f1"/>`;
      svg += `<text x="${cx}" y="${cy + 18}" text-anchor="middle" font-size="10" font-family="sans-serif" fill="#27272a">${name.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</text>`;
    });
    svg += `</svg>`;

    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `red-referidos-${new Date().toISOString().slice(0, 10)}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSuspend = async (userId: string, action: "suspend" | "reactivate") => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/suspend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        alert(action === "suspend" ? "Cuenta suspendida" : "Cuenta reactivada");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleChangeSubscription = async (userId: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/subscription`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        alert(`Suscripcion cambiada a: ${status}`);
        onRefresh();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleViewNetwork = (nodeId: string) => {
    // Expand only this node's tree
    const newExpanded = new Set<string>();
    const collect = (node: TreeNode) => {
      newExpanded.add(node.id);
      node.children.forEach(collect);
    };
    const root = trees.find((t) => t.id === nodeId) || trees.find((t) => findNodeById(t, nodeId));
    if (root) collect(root);
    setExpandedNodes(newExpanded);
    setZoom(0.8);
    setPanX(0);
    setPanY(50);
  };

  // Filter visible nodes
  const shouldShowNode = (node: TreeNode): boolean => {
    if (filter === "all") return true;
    if (filter === "active") return node.subscription?.status === "active";
    if (filter === "with_earnings") return node.commissions.total > 0;
    if (filter === "with_referrals") return node.referral_count > 0;
    return true;
  };

  // Compute node position relative to content container using offsetLeft/offsetTop chain
  function getNodePosition(el: HTMLElement, container: HTMLElement) {
    let x = 0, y = 0;
    let curr: HTMLElement | null = el;
    while (curr && curr !== container) {
      x += curr.offsetLeft;
      y += curr.offsetTop;
      curr = curr.offsetParent as HTMLElement | null;
    }
    return { x, y };
  }

  // Measure node positions and build SVG connector lines
  const updateSvgLines = useCallback(() => {
    if (!contentRef.current) return;
    const container = contentRef.current;

    const positions = new Map<string, { x: number; y: number; bottom: number; top: number }>();
    container.querySelectorAll("[data-tree-node]").forEach((el) => {
      const id = el.getAttribute("data-tree-node");
      if (!id) return;
      const pos = getNodePosition(el as HTMLElement, container);
      const w = (el as HTMLElement).offsetWidth;
      const h = (el as HTMLElement).offsetHeight;
      positions.set(id, {
        x: pos.x + w / 2,
        y: pos.y + h / 2,
        bottom: pos.y + h,
        top: pos.y,
      });
    });

    const lines: Array<{ id: string; d: string }> = [];
    const posMap = new Map<string, { x: number; y: number }>();
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    positions.forEach((pos, id) => {
      posMap.set(id, { x: pos.x, y: pos.y });
      minX = Math.min(minX, pos.x);
      minY = Math.min(minY, pos.y);
      maxX = Math.max(maxX, pos.x);
      maxY = Math.max(maxY, pos.y);
    });

    const traverse = (node: TreeNode) => {
      const parentPos = positions.get(node.id);
      if (!parentPos) return;
      for (const child of node.children) {
        const childPos = positions.get(child.id);
        if (childPos) {
          const midY = parentPos.bottom + (childPos.top - parentPos.bottom) / 2;
          const path = `M ${parentPos.x} ${parentPos.bottom} L ${parentPos.x} ${midY} L ${childPos.x} ${midY} L ${childPos.x} ${childPos.top}`;
          lines.push({ id: `${node.id}-${child.id}`, d: path });
        }
        traverse(child);
      }
    };
    trees.forEach(traverse);
    setSvgLines(lines);
    setNodePositions(posMap);
    setMapBounds(positions.size > 0 ? { minX, minY, maxX, maxY } : null);
  }, [trees]);

  // Update lines when tree structure changes (not zoom/pan — those don't change relative positions)
  useEffect(() => {
    const timer = setTimeout(updateSvgLines, 50);
    return () => clearTimeout(timer);
  }, [updateSvgLines, expandedNodes, filter]);

  // Debounced update after zoom changes (DOM layout may settle differently)
  useEffect(() => {
    const timer = setTimeout(updateSvgLines, 150);
    return () => clearTimeout(timer);
  }, [zoom, updateSvgLines]);

  return (
    <div className="flex flex-col h-full" ref={containerRef}>
      {/* Toolbar */}
      <div className="shrink-0 mb-3">
        <div className="flex items-center gap-3 mb-3">
          <select
            value={selectedApp}
            onChange={(e) => onAppChange(e.target.value)}
            className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          >
            <option value="">Todas las apps</option>
            {apps.map((app) => (
              <option key={app.id} value={app.slug}>{app.name}</option>
            ))}
          </select>
          <button
            onClick={onRefresh}
            className="flex items-center gap-1.5 bg-primary-600 text-white rounded-lg px-3 py-2 text-xs font-bold hover:bg-primary-700 transition-colors"
          >
            Actualizar
          </button>
        </div>
        <ReferralTreeToolbar
          zoom={zoom}
          onZoomIn={() => setZoom((z) => Math.min(3, z + 0.2))}
          onZoomOut={() => setZoom((z) => Math.max(0.3, z - 0.2))}
          onReset={() => { setZoom(1); setPanX(0); setPanY(0); }}
          onToggleFullscreen={toggleFullscreen}
          isFullscreen={isFullscreen}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearch={handleSearch}
          totalMembers={totalMembers}
          totalEarnings={totalEarnings}
          filter={filter}
          onFilterChange={setFilter}
          onExpandAll={expandAll}
          onCollapseAll={collapseAll}
          onExport={handleExport}
        />
      </div>

      {/* Canvas */}
      <div
        className="flex-1 overflow-hidden card-soft rounded-[1.25rem] relative cursor-grab active:cursor-grabbing select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <div
          ref={canvasRef}
          data-tree-canvas
          className="absolute top-0 left-0 origin-top-left transition-transform will-change-transform"
          style={{
            transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
          }}
        >
          <div className="p-20 min-w-max relative" ref={contentRef}>
            {/* SVG Connector Lines Layer */}
            <svg
              className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-visible"
              style={{ zIndex: 0 }}
            >
              {svgLines.map((line) => (
                <path
                  key={line.id}
                  d={line.d}
                  stroke="currentColor"
                  className="text-zinc-400 dark:text-zinc-400"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}
            </svg>

            {/* Tree Nodes */}
            <div className="relative z-10 flex gap-16">
              {trees.filter(shouldShowNode).map((root) => (
                <ReferralTreeNode
                  key={root.id}
                  node={root}
                  depth={0}
                  expandedNodes={expandedNodes}
                  onToggle={toggleNode}
                  onSelect={setSelectedNode}
                  selectedId={selectedNode?.id || null}
                  highlightedId={highlightedNode}
                  filter={filter}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Mini Map */}
        <div
          className="absolute bottom-4 right-4 w-36 h-28 bg-white/90 dark:bg-zinc-900/90 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-lg overflow-hidden"
          onClick={(e) => {
            if (!mapBounds || !containerRef.current) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = (e.clientX - rect.left) / rect.width;
            const clickY = (e.clientY - rect.top) / rect.height;
            const contentW = mapBounds.maxX - mapBounds.minX;
            const contentH = mapBounds.maxY - mapBounds.minY;
            const targetX = mapBounds.minX + clickX * contentW;
            const targetY = mapBounds.minY + clickY * contentH;
            const containerRect = containerRef.current.getBoundingClientRect();
            setPanX(containerRect.width / 2 / zoom - targetX);
            setPanY(containerRect.height / 2 / zoom - targetY);
          }}
          title="Clic para navegar"
        >
          {mapBounds && nodePositions.size > 0 ? (
            (() => {
              const padding = 4;
              const mapW = 144 - padding * 2; // 144px = w-36
              const mapH = 112 - padding * 2; // 112px = h-28
              const contentW = Math.max(mapBounds.maxX - mapBounds.minX, 1);
              const contentH = Math.max(mapBounds.maxY - mapBounds.minY, 1);
              const scale = Math.min(mapW / contentW, mapH / contentH);
              const offsetX = padding + (mapW - contentW * scale) / 2;
              const offsetY = padding + (mapH - contentH * scale) / 2;

              const toMapX = (x: number) => offsetX + (x - mapBounds.minX) * scale;
              const toMapY = (y: number) => offsetY + (y - mapBounds.minY) * scale;

              // Viewport rect in map coords
              const containerRect = containerRef.current?.getBoundingClientRect();
              const viewW = containerRect ? containerRect.width / zoom : 0;
              const viewH = containerRect ? containerRect.height / zoom : 0;
              const viewX = (-panX);
              const viewY = (-panY);

              return (
                <svg className="w-full h-full">
                  {/* Connection lines */}
                  {svgLines.map((line) => {
                    // Extract coordinates from path string "M x1 y1 L x2 y2 L x3 y3 L x4 y4"
                    const match = line.d.match(/M ([\d.-]+) ([\d.-]+) L ([\d.-]+) ([\d.-]+) L ([\d.-]+) ([\d.-]+) L ([\d.-]+) ([\d.-]+)/);
                    if (!match) return null;
                    const [, x1, y1, x2, y2, x3, y3, x4, y4] = match;
                    return (
                      <polyline
                        key={line.id}
                        points={`${toMapX(parseFloat(x1))},${toMapY(parseFloat(y1))} ${toMapX(parseFloat(x2))},${toMapY(parseFloat(y2))} ${toMapX(parseFloat(x3))},${toMapY(parseFloat(y3))} ${toMapX(parseFloat(x4))},${toMapY(parseFloat(y4))}`}
                        fill="none"
                        stroke="currentColor"
                        className="text-zinc-300 dark:text-zinc-600"
                        strokeWidth="0.5"
                      />
                    );
                  })}
                  {/* Node dots */}
                  {Array.from(nodePositions.entries()).map(([id, pos]) => (
                    <circle
                      key={id}
                      cx={toMapX(pos.x)}
                      cy={toMapY(pos.y)}
                      r="2"
                      className={selectedNode?.id === id ? "fill-primary-500" : "fill-zinc-400 dark:fill-zinc-500"}
                    />
                  ))}
                  {/* Viewport rect */}
                  {containerRef.current && (
                    <rect
                      x={toMapX(viewX)}
                      y={toMapY(viewY)}
                      width={viewW * scale}
                      height={viewH * scale}
                      fill="none"
                      stroke="currentColor"
                      className="text-primary-500"
                      strokeWidth="1"
                      rx="2"
                    />
                  )}
                </svg>
              );
            })()
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[10px] text-zinc-400">
              {trees.length} raiz(es)
            </div>
          )}
        </div>
      </div>

      {/* Drawer */}
      {selectedNode && (
        <ReferralTreeDrawer
          node={selectedNode}
          onClose={() => setSelectedNode(null)}
          onViewNetwork={handleViewNetwork}
          onSuspend={handleSuspend}
          onChangeSubscription={handleChangeSubscription}
          totalNetwork={countAllNodes(selectedNode)}
        />
      )}
    </div>
  );
}
