import { generateCrossword, generateWordSearch, generateMaze, dotPoints, categoryMeta, type KidsActivity } from "@/lib/kids";
import { COLORING_TEMPLATES } from "./tools/coloring-templates";

/** Portada de una actividad: mockup de libro (imágenes) o vista previa generada
 *  del propio puzzle/plantilla (nítida, sin placeholders). */
export function ActivityCover({ activity }: { activity: KidsActivity }) {
  const data = (activity.data ?? {}) as any;
  const meta = categoryMeta(activity.category_slug);
  const firstPage = Array.isArray(data.pages) ? data.pages.find((p: any) => p?.image_url)?.image_url : null;
  const img = firstPage || activity.cover_url;

  if (img) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-200 via-fuchsia-200 to-sky-200 p-2">
        <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-lg bg-white shadow-[0_6px_16px_-6px_rgba(0,0,0,0.35)]">
          <span className="absolute left-0 top-0 h-full w-1.5" style={{ backgroundColor: meta.color }} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img} alt="" className="h-full w-full object-contain p-1.5" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center p-2" style={{ background: `linear-gradient(135deg, ${meta.color}26, ${meta.color}0d)` }}>
      {preview(activity, meta.color)}
    </div>
  );
}

function preview(activity: KidsActivity, color: string) {
  const data = (activity.data ?? {}) as any;
  const cat = activity.category_slug;
  const r = (n: number) => Math.round(n * 100) / 100;

  if (cat === "colorear" && data.template && COLORING_TEMPLATES[data.template]) {
    const tpl = COLORING_TEMPLATES[data.template];
    return (
      <svg viewBox={tpl.viewBox} className="h-full w-auto max-w-full rounded bg-white shadow-inner" preserveAspectRatio="xMidYMid meet">
        <g fill="#ffffff" stroke="#1f2937" strokeWidth={6} strokeLinejoin="round">
          {tpl.regions.map((rg) => (
            <g key={rg.id}>{rg.node}</g>
          ))}
        </g>
      </svg>
    );
  }

  if (cat === "crucigrama") {
    const words = Array.isArray(data.words) ? data.words : [];
    const p = generateCrossword(words);
    const s = Math.min(22, 120 / Math.max(p.cols, p.rows));
    return (
      <svg viewBox={`0 0 ${r(p.cols * s)} ${r(p.rows * s)}`} className="h-full w-auto max-w-full" preserveAspectRatio="xMidYMid meet">
        {p.grid.map((row, rr) => row.map((cell, c) =>
          cell ? <rect key={`${rr}-${c}`} x={r(c * s)} y={r(rr * s)} width={r(s - 1.3)} height={r(s - 1.3)} rx={2} fill={color} opacity={0.85} /> : null,
        ))}
      </svg>
    );
  }

  if (cat === "sopa_letras") {
    const words = Array.isArray(data.words) ? data.words : [];
    const size = data.size ?? 10;
    const p = generateWordSearch(words, size, data.seed ?? 1);
    const s = 100 / p.size;
    return (
      <svg viewBox={`0 0 ${r(p.size * s)} ${r(p.size * s)}`} className="h-full w-auto max-w-full" preserveAspectRatio="xMidYMid meet">
        {p.grid.map((row, rr) => row.map((letter, c) => (
          <text key={`${rr}-${c}`} x={r(c * s + s / 2)} y={r(rr * s + s / 2 + s * 0.28)} textAnchor="middle" fontSize={r(s * 0.72)} fontWeight={800} fill={color} opacity={0.85}>{letter}</text>
        )))}
      </svg>
    );
  }

  if (cat === "laberinto") {
    const cols = data.cols ?? 10, rows = data.rows ?? 10;
    const m = generateMaze(cols, rows, data.seed ?? 1);
    const s = 100 / Math.max(cols, rows);
    return (
      <svg viewBox={`0 0 ${r(cols * s)} ${r(rows * s)}`} className="h-full w-auto max-w-full" preserveAspectRatio="xMidYMid meet" stroke={color} strokeWidth={r(Math.max(1, s * 0.16))} strokeLinecap="square">
        {m.cells.map((row, rr) => row.map((cell, c) => {
          const x = r(c * s), y = r(rr * s);
          return (
            <g key={`${rr}-${c}`}>
              {cell.n && <line x1={x} y1={y} x2={r(x + s)} y2={y} />}
              {cell.s && <line x1={x} y1={r(y + s)} x2={r(x + s)} y2={r(y + s)} />}
              {cell.w && <line x1={x} y1={y} x2={x} y2={r(y + s)} />}
              {cell.e && <line x1={r(x + s)} y1={y} x2={r(x + s)} y2={r(y + s)} />}
            </g>
          );
        }))}
      </svg>
    );
  }

  if (cat === "unir_puntos") {
    const pts = dotPoints(data.shape ?? "star", data.count ?? 12);
    const S = 100, PAD = 10;
    const mapped = pts.map(([x, y]) => [r(PAD + x * (S - 2 * PAD)), r(PAD + y * (S - 2 * PAD))]);
    return (
      <svg viewBox={`0 0 ${S} ${S}`} className="h-full w-auto max-w-full" preserveAspectRatio="xMidYMid meet">
        <polygon points={mapped.map((p) => p.join(",")).join(" ")} fill={`${color}33`} stroke={color} strokeWidth={2} />
        {mapped.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r={2.2} fill={color} />)}
      </svg>
    );
  }

  return <span className="text-3xl font-black text-white/90">{activity.title.charAt(0).toUpperCase()}</span>;
}
