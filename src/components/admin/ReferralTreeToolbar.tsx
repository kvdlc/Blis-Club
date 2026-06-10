"use client";

import { Search, ZoomIn, ZoomOut, Home, Maximize, Minimize, Filter, Download, ChevronDown, ChevronUp, X } from "lucide-react";
import { useState } from "react";

interface Props {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSearch: () => void;
  totalMembers: number;
  totalEarnings: number;
  filter: string;
  onFilterChange: (f: string) => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  onExport: () => void;
}

export function ReferralTreeToolbar({
  zoom,
  onZoomIn,
  onZoomOut,
  onReset,
  onToggleFullscreen,
  isFullscreen,
  searchQuery,
  onSearchChange,
  onSearch,
  totalMembers,
  totalEarnings,
  filter,
  onFilterChange,
  onExpandAll,
  onCollapseAll,
  onExport,
}: Props) {
  const [showFilters, setShowFilters] = useState(false);

  const zoomPercent = Math.round(zoom * 100);

  return (
    <div className="bg-white border border-zinc-200 rounded-xl shadow-sm px-4 py-3 flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="flex items-center gap-2 flex-1 min-w-[200px] max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSearch()}
            placeholder="Buscar afiliado..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-zinc-200 bg-zinc-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
        </div>
        <button
          onClick={onSearch}
          className="bg-primary-600 text-white rounded-lg px-4 py-2 text-sm font-bold hover:bg-primary-700 transition-colors"
        >
          Buscar
        </button>
      </div>

      {/* Stats */}
      <div className="hidden md:flex items-center gap-4 text-xs text-zinc-500 border-l border-zinc-200 pl-4">
        <span><strong className="text-zinc-800">{totalMembers}</strong> miembros</span>
        <span><strong className="text-zinc-800">${(totalEarnings / 100).toFixed(2)}</strong> generado</span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Filters */}
      <div className="relative">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${ showFilters ? "bg-primary-100 text-primary-700" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200" }`}
        >
          <Filter className="w-4 h-4" /> Filtros {showFilters ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
        {showFilters && (
          <div className="absolute top-full right-0 mt-2 bg-white border border-zinc-200 rounded-xl shadow-lg p-3 w-48 z-20">
            <p className="text-xs font-semibold text-zinc-500 mb-2">Mostrar:</p>
            {[
              { key: "all", label: "Todos" },
              { key: "active", label: "Solo activos" },
              { key: "with_earnings", label: "Con earnings" },
              { key: "with_referrals", label: "Con referidos" },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => { onFilterChange(f.key); setShowFilters(false); }}
                className={`block w-full text-left text-sm px-2 py-1.5 rounded-lg transition-colors ${ filter === f.key ? "bg-primary-50 text-primary-700 font-semibold" : "text-zinc-600 hover:bg-zinc-50" }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Expand/Collapse */}
      <div className="flex items-center gap-1 bg-zinc-100 rounded-lg p-1">
        <button onClick={onExpandAll} className="p-1.5 rounded hover:bg-white transition-colors" title="Expandir todo">
          <ChevronDown className="w-4 h-4 text-zinc-600" />
        </button>
        <button onClick={onCollapseAll} className="p-1.5 rounded hover:bg-white transition-colors" title="Colapsar todo">
          <ChevronUp className="w-4 h-4 text-zinc-600" />
        </button>
      </div>

      {/* Zoom Controls */}
      <div className="flex items-center gap-1 bg-zinc-100 rounded-lg p-1">
        <button onClick={onZoomOut} className="p-1.5 rounded hover:bg-white transition-colors" title="Alejar">
          <ZoomOut className="w-4 h-4 text-zinc-600" />
        </button>
        <span className="text-xs font-bold text-zinc-600 w-12 text-center">{zoomPercent}%</span>
        <button onClick={onZoomIn} className="p-1.5 rounded hover:bg-white transition-colors" title="Acercar">
          <ZoomIn className="w-4 h-4 text-zinc-600" />
        </button>
      </div>

      {/* Reset */}
      <button onClick={onReset} className="p-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 transition-colors" title="Centrar vista">
        <Home className="w-4 h-4 text-zinc-600" />
      </button>

      {/* Export */}
      <button onClick={onExport} className="p-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 transition-colors" title="Exportar imagen">
        <Download className="w-4 h-4 text-zinc-600" />
      </button>

      {/* Fullscreen Toggle */}
      <button
        onClick={onToggleFullscreen}
        className="p-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white transition-colors"
        title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
      >
        {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
      </button>
    </div>
  );
}
