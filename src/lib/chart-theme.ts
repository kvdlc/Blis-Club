export const CHART = {
  emerald: "#10b981",
  emeraldSoft: "rgba(16,185,129,0.18)",
  amber: "#f59e0b",
  amberSoft: "rgba(245,158,11,0.18)",
  teal: "#0d9488",
  tealSoft: "rgba(13,148,136,0.18)",
  violet: "#8b5cf6",
  violetSoft: "rgba(139,92,246,0.18)",
  cyan: "#06b6d4",
  cyanSoft: "rgba(6,182,212,0.18)",
  blue: "#3b82f6",
  blueSoft: "rgba(59,130,246,0.18)",
  orange: "#fb923c",
  orangeSoft: "rgba(251,146,60,0.18)",
  grid: "rgba(255,255,255,0.06)",
  axis: "#71717a",
};

export const CATEGORIA_COLOR: Record<string, { color: string; soft: string; label: string }> = {
  combustible: { color: CHART.amber, soft: CHART.amberSoft, label: "Combustible" },
  mantenimiento: { color: CHART.violet, soft: CHART.violetSoft, label: "Mantenimiento" },
  mejoras: { color: CHART.blue, soft: CHART.blueSoft, label: "Repuestos/Accesorios" },
  rendimiento: { color: CHART.teal, soft: CHART.tealSoft, label: "Rendimiento" },
  eficiencia: { color: CHART.emerald, soft: CHART.emeraldSoft, label: "Eficiencia" },
  tramites: { color: CHART.orange, soft: CHART.orangeSoft, label: "Trámites" },
};
