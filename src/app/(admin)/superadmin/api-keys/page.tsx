"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AdminGuard from "@/components/admin/AdminGuard";
import { useApiConfig } from "@/hooks/use-api-config";
import { API_CATALOG } from "@/lib/api-catalog";
import { getAppIdeas } from "@/lib/api-ideas";
import type { ApiApp, ApiCategory, ApiField } from "@/types/api-cloud";
import {
  Cloud, CreditCard, Brain, Sparkles, Image, Search, Filter, Star, Copy, Check,
  RefreshCw, Eye, EyeOff, Save, ChevronDown, ChevronUp, Lightbulb, Globe,
  Download, Upload, X, Loader2, CheckCircle2, XCircle, AlertCircle, Clock,
  Zap, ShieldCheck, ExternalLink, Pencil
} from "lucide-react";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  CreditCard,
  Brain,
  Sparkles,
  Image,
};

const COST_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  gratis: { bg: "bg-emerald-50", text: "text-emerald-700", label: "GRATIS" },
  freemium: { bg: "bg-blue-50", text: "text-blue-700", label: "FREEMIUM" },
  pagado: { bg: "bg-amber-50", text: "text-amber-700", label: "PAGADO" },
};

const ACCESS_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  Pública: { bg: "bg-blue-50", text: "text-blue-700", label: "PÚBLICA" },
  Privada: { bg: "bg-red-50", text: "text-red-700", label: "PRIVADA" },
};

const STATUS_DOT: Record<string, string> = {
  untested: "#9ca3af",
  testing: "#f59e0b",
  success: "#10b981",
  error: "#ef4444",
  limit: "#f97316",
};

const STATUS_LABEL: Record<string, string> = {
  untested: "SIN PROBAR",
  testing: "PROBANDO...",
  success: "OK",
  error: "ERROR",
  limit: "LÍMITE",
};

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color: string }) {
  return (
    <div className="bg-white rounded-[1.25rem] border border-zinc-200 p-4 flex items-center gap-3 shadow-sm">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div>
        <p className="text-xs text-zinc-500 font-medium">{label}</p>
        <p className="text-lg font-extrabold text-zinc-800">{value}</p>
      </div>
    </div>
  );
}

function FieldCard({
  field,
  value,
  status,
  lastUpdated,
  copiedId,
  onChange,
  onCopy,
  onTest,
  onShow,
  showValue,
}: {
  field: ApiField;
  value: string;
  status: string;
  lastUpdated?: string;
  copiedId: string | null;
  onChange: (v: string) => void;
  onCopy: () => void;
  onTest: () => void;
  onShow: () => void;
  showValue: boolean;
}) {
  const dotColor = STATUS_DOT[status] || "#9ca3af";
  const statusLabel = STATUS_LABEL[status] || "SIN PROBAR";

  return (
    <div className="bg-zinc-50/60 rounded-xl border border-zinc-100 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-bold text-zinc-800">{field.label}</h4>
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${status === "success" ? "bg-emerald-50 text-emerald-700" : status === "error" ? "bg-red-50 text-red-700" : "bg-zinc-100 text-zinc-500"}`}>
            {statusLabel}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onCopy} className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-primary-600 hover:bg-primary-50 transition-colors" title="Copiar">
            {copiedId === field.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button onClick={onTest} disabled={status === "testing" || !value} className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors disabled:opacity-30" title="Probar conexión">
            {status === "testing" ? <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500" /> : <RefreshCw className="w-3.5 h-3.5" />}
          </button>
          {field.type === "password" && (
            <button onClick={onShow} className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-primary-600 hover:bg-primary-50 transition-colors" title="Mostrar/Ocultar">
              {showValue ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>

      {field.description && <p className="text-xs text-zinc-500">{field.description}</p>}
      {field.getFrom && (
        <p className="text-xs text-zinc-400">
          <span className="font-medium">Obtener en:</span> {field.getFrom}
        </p>
      )}

      {field.type === "select" && field.options ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        >
          {field.options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ) : (
        <div className="relative">
          <input
            type={showValue ? "text" : field.type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.type === "password" ? "••••••••" : "Ingresa el valor"}
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500/20 pr-10"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: value ? dotColor : "#e5e7eb" }} />
          </div>
        </div>
      )}

      {lastUpdated && (
        <p className="text-[10px] text-zinc-400 flex items-center gap-1">
          <Clock className="w-3 h-3" /> Actualizado: {new Date(lastUpdated).toLocaleDateString("es-PE", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
        </p>
      )}
    </div>
  );
}

function AppCard({
  app,
  category,
  values,
  statuses,
  lastUpdated,
  notes,
  isExpanded,
  isFavorite,
  isSaving,
  copiedId,
  showValues,
  onToggle,
  onToggleFavorite,
  onChange,
  onCopy,
  onTest,
  onToggleShow,
  onNoteChange,
  onSaveApp,
  onTestApp,
  onOpenIdeas,
}: {
  app: ApiApp;
  category: ApiCategory;
  values: Record<string, string>;
  statuses: Record<string, string>;
  lastUpdated: Record<string, string>;
  notes: Record<string, string>;
  isExpanded: boolean;
  isFavorite: boolean;
  isSaving: boolean;
  copiedId: string | null;
  showValues: Set<string>;
  onToggle: () => void;
  onToggleFavorite: () => void;
  onChange: (fieldId: string, v: string) => void;
  onCopy: (fieldId: string) => void;
  onTest: (fieldId: string) => void;
  onToggleShow: (fieldId: string) => void;
  onNoteChange: (v: string) => void;
  onSaveApp: () => void;
  onTestApp: () => void;
  onOpenIdeas: () => void;
}) {
  const hasValues = app.fields.some((f) => values[f.id]);
  const appStatus = hasValues ? "success" : "untested";
  const dotColor = STATUS_DOT[appStatus] || "#9ca3af";

  const Icon = ICON_MAP[app.icon] || Cloud;

  return (
    <div className="bg-white rounded-[1.25rem] border border-zinc-200 shadow-sm overflow-hidden">
      {/* App header */}
      <div className="p-5 cursor-pointer" onClick={onToggle}>
        <div className="flex items-start gap-3">
          <button
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
            className={`mt-0.5 ${isFavorite ? "text-amber-400" : "text-zinc-300 hover:text-amber-400"} transition-colors`}
          >
            <Star className="w-4 h-4" fill={isFavorite ? "currentColor" : "none"} />
          </button>

          <div className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: dotColor }} />

          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${app.color}15` }}>
            <Icon className="w-5 h-5" style={{ color: app.color }} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-extrabold text-zinc-800">{app.name}</h3>
              {app.fields.map((f) => {
                const cb = COST_BADGE[f.cost];
                if (!cb) return null;
                return (
                  <span key={f.id} className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${cb.bg} ${cb.text}`}>
                    {cb.label}
                  </span>
                );
              }).filter(Boolean).slice(0, 1)}
              {app.fields.map((f) => {
                const ab = ACCESS_BADGE[f.accessType];
                if (!ab) return null;
                return (
                  <span key={f.id} className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${ab.bg} ${ab.text}`}>
                    {ab.label}
                  </span>
                );
              }).filter(Boolean).slice(0, 1)}
            </div>
            <p className="text-xs text-zinc-500 mt-1 truncate">{app.description}</p>

            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={(e) => { e.stopPropagation(); onTestApp(); }}
                disabled={isSaving}
                className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors disabled:opacity-50"
              >
                <Zap className="w-3 h-3" /> Probar todas
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onOpenIdeas(); }}
                className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors"
              >
                <Lightbulb className="w-3 h-3" /> Ideas
              </button>
              <a
                href={`https://${app.website}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg bg-zinc-100 text-zinc-600 hover:bg-zinc-200 transition-colors"
              >
                <Globe className="w-3 h-3" /> Web
              </a>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); onSaveApp(); }}
              disabled={isSaving}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-primary-600 hover:bg-primary-50 transition-colors disabled:opacity-50"
              title="Guardar app"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin text-primary-500" /> : <Save className="w-4 h-4" />}
            </button>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400">
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </div>
        </div>
      </div>

      {/* Expanded content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", bounce: 0, duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-3">
              {app.fields.map((field) => (
                <FieldCard
                  key={field.id}
                  field={field}
                  value={values[field.id] || ""}
                  status={statuses[field.id] || "untested"}
                  lastUpdated={lastUpdated[field.id]}
                  copiedId={copiedId}
                  onChange={(v) => onChange(field.id, v)}
                  onCopy={() => onCopy(field.id)}
                  onTest={() => onTest(field.id)}
                  onShow={() => onToggleShow(field.id)}
                  showValue={showValues.has(field.id)}
                />
              ))}

              {/* Notes */}
              <div className="bg-zinc-50/60 rounded-xl border border-zinc-100 p-4">
                <label className="block text-xs font-bold text-zinc-600 mb-2 flex items-center gap-1.5">
                  <Pencil className="w-3.5 h-3.5" /> Notas
                </label>
                <textarea
                  value={notes[app.id] || ""}
                  onChange={(e) => onNoteChange(e.target.value)}
                  placeholder="Agrega notas sobre esta API..."
                  rows={3}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 resize-none"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ApiKeysPage() {
  const {
    apiValues, lastUpdated, fieldStatuses, favorites, expandedCategories, expandedApps,
    notes, isLoading, isSaving, isSavingApp, copiedId,
    configuredCount, activeCount, errorCount, limitCount, totalFields, totalFavorites,
    getValue, hasAnyChanges,
    handleValueChange, handleSaveApp, handleSaveAll,
    testConnection, testApp, copyToClipboard,
    toggleFavorite, toggleCategory, toggleApp, handleNoteChange,
    exportConfig, importConfig,
  } = useApiConfig();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterCost, setFilterCost] = useState<string | null>(null);
  const [filterAccess, setFilterAccess] = useState<string | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [ideasModal, setIdeasModal] = useState<string | null>(null);
  const [showValues, setShowValues] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleShowValue = (fieldId: string) => {
    setShowValues((prev) => {
      const next = new Set(prev);
      if (next.has(fieldId)) next.delete(fieldId);
      else next.add(fieldId);
      return next;
    });
  };

  const ideasData = ideasModal ? getAppIdeas(ideasModal) : null;

  const filteredCategories = API_CATALOG.map((cat) => {
    const filteredApps = cat.apps.filter((app) => {
      if (showFavoritesOnly && !favorites.has(app.id)) return false;
      if (filterCost && !app.fields.some((f) => f.cost === filterCost)) return false;
      if (filterAccess && !app.fields.some((f) => f.accessType === filterAccess)) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchName = app.name.toLowerCase().includes(q);
        const matchDesc = app.description.toLowerCase().includes(q);
        const matchField = app.fields.some((f) => f.label.toLowerCase().includes(q) || f.id.toLowerCase().includes(q));
        if (!matchName && !matchDesc && !matchField) return false;
      }
      return true;
    });
    return { ...cat, apps: filteredApps };
  }).filter((cat) => cat.apps.length > 0);

  if (isLoading) {
    return (
      <AdminGuard>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
          <p className="text-sm text-zinc-500">Cargando configuración...</p>
        </div>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary-50 border border-primary-100 flex items-center justify-center">
              <Cloud className="w-7 h-7 text-primary-600" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-zinc-900">APIs & Cloud</h1>
              <p className="text-sm text-zinc-500 mt-0.5">Gestión centralizada de servicios externos</p>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <StatCard icon={ShieldCheck} label="Configuradas" value={`${configuredCount} / ${totalFields}`} color="#6366f1" />
          <StatCard icon={CheckCircle2} label="Activas" value={activeCount} color="#10b981" />
          <StatCard icon={XCircle} label="Error" value={errorCount} color="#ef4444" />
          <StatCard icon={AlertCircle} label="Límite" value={limitCount} color="#f97316" />
          <StatCard icon={Star} label="Favoritas" value={totalFavorites} color="#8b5cf6" />
        </div>

        {/* Search + Filters */}
        <div className="bg-white rounded-[1.25rem] border border-zinc-200 p-4 shadow-sm space-y-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar APIs por nombre o categoría..."
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${showFilters ? "bg-primary-50 text-primary-700 border border-primary-200" : "bg-zinc-100 text-zinc-600 border border-zinc-200 hover:bg-zinc-200"}`}
            >
              <Filter className="w-4 h-4" /> Filtros
            </button>
            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${showFavoritesOnly ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-zinc-100 text-zinc-600 border border-zinc-200 hover:bg-zinc-200"}`}
            >
              <Star className="w-4 h-4" fill={showFavoritesOnly ? "currentColor" : "none"} /> Favoritas
            </button>
            <button onClick={exportConfig} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-zinc-100 text-zinc-600 border border-zinc-200 hover:bg-zinc-200 transition-all">
              <Download className="w-4 h-4" /> Exportar
            </button>
            <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-zinc-100 text-zinc-600 border border-zinc-200 hover:bg-zinc-200 transition-all">
              <Upload className="w-4 h-4" /> Importar
            </button>
            <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) { importConfig(f); e.target.value = ""; } }} />
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="flex items-center gap-2 pt-2 border-t border-zinc-100">
                  <span className="text-xs font-semibold text-zinc-500">COSTO:</span>
                  {(["gratis", "freemium", "pagado"] as const).map((c) => (
                    <button
                      key={c}
                      onClick={() => setFilterCost(filterCost === c ? null : c)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${filterCost === c ? "bg-primary-600 text-white shadow-sm" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"}`}
                    >
                      {c}
                    </button>
                  ))}
                  <span className="text-xs font-semibold text-zinc-500 ml-4">ACCESO:</span>
                  {(["Pública", "Privada"] as const).map((a) => (
                    <button
                      key={a}
                      onClick={() => setFilterAccess(filterAccess === a ? null : a)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${filterAccess === a ? "bg-primary-600 text-white shadow-sm" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"}`}
                    >
                      {a}
                    </button>
                  ))}
                  {(filterCost || filterAccess) && (
                    <button onClick={() => { setFilterCost(null); setFilterAccess(null); }} className="text-xs text-zinc-400 hover:text-zinc-600 underline ml-auto">Limpiar filtros</button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Save All */}
        {hasAnyChanges && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end">
            <button
              onClick={handleSaveAll}
              disabled={isSaving}
              className="flex items-center gap-2 bg-primary-600 text-white rounded-xl px-6 py-3 text-sm font-extrabold hover:bg-primary-700 active:scale-[0.97] transition-all shadow-lg shadow-primary-500/20 disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isSaving ? "Guardando..." : "GUARDAR TODO"}
            </button>
          </motion.div>
        )}

        {/* Categories */}
        <div className="space-y-4">
          {filteredCategories.map((category) => (
            <div key={category.id} className="bg-white rounded-[1.25rem] border border-zinc-200 shadow-sm overflow-hidden">
              {/* Category header */}
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full flex items-center gap-3 px-5 py-4 hover:bg-zinc-50/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${category.color}15` }}>
                  {(() => {
                    const Icon = ICON_MAP[category.icon] || Cloud;
                    return <Icon className="w-5 h-5" style={{ color: category.color }} />;
                  })()}
                </div>
                <div className="flex-1 text-left">
                  <h2 className="text-sm font-extrabold text-zinc-800">{category.title}</h2>
                  <p className="text-xs text-zinc-400">{category.description}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-zinc-400 font-medium">{category.apps.length} apps · {category.apps.reduce((s, a) => s + a.fields.length, 0)} claves</span>
                  {expandedCategories.has(category.id) ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
                </div>
              </button>

              {/* Apps grid */}
              <AnimatePresence>
                {expandedCategories.has(category.id) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {category.apps.map((app) => (
                        <AppCard
                          key={app.id}
                          app={app}
                          category={category}
                          values={Object.fromEntries(app.fields.map((f) => [f.id, getValue(f.id)]))}
                          statuses={Object.fromEntries(app.fields.map((f) => [f.id, fieldStatuses[f.id] || "untested"]))}
                          lastUpdated={lastUpdated}
                          notes={notes}
                          isExpanded={expandedApps.has(app.id)}
                          isFavorite={favorites.has(app.id)}
                          isSaving={isSavingApp === app.id}
                          copiedId={copiedId}
                          showValues={showValues}
                          onToggle={() => toggleApp(app.id)}
                          onToggleFavorite={() => toggleFavorite(app.id)}
                          onChange={(fieldId, v) => handleValueChange(fieldId, v)}
                          onCopy={(fieldId) => copyToClipboard(fieldId)}
                          onTest={async (fieldId) => { await testConnection(fieldId); }}
                          onToggleShow={(fieldId) => toggleShowValue(fieldId)}
                          onNoteChange={(v) => handleNoteChange(app.id, v)}
                          onSaveApp={() => handleSaveApp(app.id)}
                          onTestApp={async () => { await testApp(app.id); }}
                          onOpenIdeas={() => setIdeasModal(app.id)}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {filteredCategories.length === 0 && (
          <div className="text-center py-16">
            <Cloud className="w-12 h-12 mx-auto mb-3 text-zinc-300" />
            <p className="text-sm font-semibold text-zinc-500">No se encontraron APIs</p>
            <p className="text-xs text-zinc-400 mt-1">Prueba con otra búsqueda o limpia los filtros.</p>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-center gap-2 text-xs text-zinc-400 py-4">
          <ShieldCheck className="w-4 h-4" />
          <span>Todas las claves se guardan en Supabase. No se comparten con terceros.</span>
        </div>

        {/* Ideas Modal */}
        <AnimatePresence>
          {ideasModal && ideasData && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
              onClick={() => setIdeasModal(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-[1.25rem] p-6 w-full max-w-lg shadow-2xl border border-zinc-200 max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center">
                      <Lightbulb className="w-5 h-5 text-amber-500" />
                    </div>
                    <h3 className="text-base font-extrabold text-zinc-800">{ideasData.title}</h3>
                  </div>
                  <button onClick={() => setIdeasModal(null)} className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center hover:bg-zinc-200 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-5">
                  {ideasData.categories.map((cat, i) => (
                    <div key={i}>
                      <h4 className="text-sm font-bold text-zinc-700 mb-2">{cat.emoji} {cat.title}</h4>
                      <ul className="space-y-2">
                        {cat.items.map((item, j) => (
                          <li key={j} className="flex items-start gap-2 text-sm text-zinc-600">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-1.5 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AdminGuard>
  );
}
