import { generateWordSearch, generateCrossword, generateMaze, dotPoints, categoryMeta } from "@/lib/kids";
import { buildPuzzlePageSpec } from "@/lib/kids/book-content";

interface BookActivity {
  category_slug: string;
  title: string;
  cover_url: string | null;
  data: any;
}

function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

export function BookPrintSheet({ activity }: { activity: BookActivity }) {
  const category = activity.category_slug;
  const pages: any[] = Array.isArray(activity.data?.pages) ? activity.data.pages : [];
  const meta = categoryMeta(category);

  return (
    <div className="mx-auto w-full max-w-[820px] bg-white p-6 text-zinc-900 print-area">
      {/* Portada */}
      <section className="page-break mb-8">
        <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
          {activity.cover_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={activity.cover_url} alt="" className="max-h-[420px] w-full max-w-[420px] rounded-2xl object-contain" />
          )}
          <p className="mt-6 text-[11px] font-black uppercase tracking-widest text-kids-600">Kids Club · {meta.name}</p>
          <h1 className="mt-2 text-4xl font-black leading-tight">{activity.title}</h1>
          <p className="mt-3 text-sm text-zinc-500">{pages.length} páginas · Nombre: ______________________</p>
        </div>
      </section>

      {pages.map((p, idx) => (
        <section key={idx} className="page-break mb-8">
          <header className="mb-3 flex items-center justify-between border-b-2 border-dashed border-zinc-300 pb-2">
            <span className="text-xs font-black uppercase tracking-widest text-zinc-400">{meta.name}</span>
            <span className="text-xs font-bold text-zinc-400">Página {idx + 1} de {pages.length}</span>
          </header>
          <PageBody category={category} activityId={activity.title} page={p} index={idx} />
        </section>
      ))}

      <p className="mt-6 text-center text-xs text-zinc-400">Blis Club · Kids Club</p>
    </div>
  );
}

function PageBody({ category, activityId, page, index }: { category: string; activityId: string; page: any; index: number }) {
  if (page?.image_url && category !== "cuento") {
    return (
      <div className="flex justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={page.image_url} alt="" className="max-h-[900px] w-full object-contain" />
      </div>
    );
  }

  if (category === "colorear") {
    const src = page?.image_url;
    if (!src) return null;
    return (
      <div className="flex justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" className="max-h-[900px] w-full object-contain" />
      </div>
    );
  }

  if (category === "cuento") {
    return (
      <div className="space-y-4">
        {page?.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={page.image_url} alt="" className="mx-auto max-h-[520px] w-full rounded-xl object-contain" />
        )}
        <p className="text-center text-lg font-bold leading-relaxed">{page?.text}</p>
      </div>
    );
  }

  const spec = buildPuzzlePageSpec(category, typeof page?.i === "number" ? page.i : index);

  if (category === "sopa_letras") {
    const puzzle = generateWordSearch(spec.words, spec.size, spec.seed);
    return (
      <div className="space-y-4">
        <div className="flex justify-center">
          <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${puzzle.size}, minmax(1.5rem, 1fr))` }}>
            {puzzle.grid.map((row, r) => row.map((letter, c) => (
              <span key={`${r}-${c}`} className="flex aspect-square items-center justify-center border border-zinc-300 text-sm font-bold">{letter}</span>
            )))}
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {puzzle.allWords.map((w) => <span key={w} className="rounded-full border border-zinc-300 px-3 py-1 text-sm font-bold">{w}</span>)}
        </div>
      </div>
    );
  }

  if (category === "crucigrama") {
    const puzzle = generateCrossword(spec.words);
    return (
      <div className="space-y-5">
        <div className="flex justify-center">
          <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${puzzle.cols}, minmax(1.8rem, 1fr))` }}>
            {Array.from({ length: puzzle.rows }).map((_, r) => Array.from({ length: puzzle.cols }).map((_, c) => {
              const sol = puzzle.grid[r][c];
              if (!sol) return <div key={`${r}-${c}`} className="aspect-square" />;
              const num = puzzle.numbers[r][c];
              return (
                <div key={`${r}-${c}`} className="relative aspect-square border-2 border-zinc-700">
                  {num && <span className="absolute left-0.5 top-0 text-[10px] font-black text-zinc-500">{num}</span>}
                </div>
              );
            }))}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {(["across", "down"] as const).map((dir) => (
            <div key={dir}>
              <h3 className="mb-1 text-sm font-black">{dir === "across" ? "Horizontales" : "Verticales"}</h3>
              <ol className="space-y-1">
                {puzzle.words.filter((w) => w.dir === dir).map((w) => (
                  <li key={`${w.number}-${w.answer}`} className="text-sm"><span className="font-black text-kids-600">{w.number}.</span> {w.clue}</li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (category === "laberinto") {
    const maze = generateMaze(spec.cols, spec.rows, spec.seed);
    return (
      <div className="flex justify-center">
        <div className="grid overflow-hidden" style={{ gridTemplateColumns: `repeat(${maze.cols}, minmax(1.4rem, 1fr))` }}>
          {maze.cells.map((row, r) => row.map((cell, c) => (
            <div key={`${r}-${c}`} className="aspect-square"
              style={{
                borderTop: cell.n ? "2px solid #111827" : "none",
                borderBottom: cell.s ? "2px solid #111827" : "none",
                borderLeft: cell.w ? "2px solid #111827" : "none",
                borderRight: cell.e ? "2px solid #111827" : "none",
              }} />
          )))}
        </div>
      </div>
    );
  }

  if (category === "unir_puntos") {
    const pts = dotPoints(spec.shape, spec.count);
    const S = 560, PAD = 50;
    const mapped = pts.map(([x, y]) => ({ x: PAD + x * (S - 2 * PAD), y: PAD + y * (S - 2 * PAD) }));
    return (
      <div className="flex justify-center">
        <svg viewBox={`0 0 ${S} ${S}`} className="w-full max-w-[560px]">
          {mapped.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r={5} fill="#111827" />
              <text x={p.x} y={p.y - 12} textAnchor="middle" fontSize={16} fontWeight={800} fill="#374151">{i + 1}</text>
            </g>
          ))}
        </svg>
      </div>
    );
  }

  return null;
}
