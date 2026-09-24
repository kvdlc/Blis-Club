import { generateCrossword, generateWordSearch, generateMaze, dotPoints } from "@/lib/kids";

export interface Printable {
  id: string;
  category_slug: string;
  title: string;
  description: string | null;
  cover_url: string | null;
  pdf_url: string | null;
  pages: number;
  age_min: number;
  age_max: number;
  data: any;
}

function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

export function PrintableSheet({ printable }: { printable: Printable }) {
  const { category_slug: cat, data } = printable;

  return (
    <div className="mx-auto w-full max-w-[820px] bg-white p-6 text-zinc-900 print-area">
      {/* Encabezado */}
      <header className="mb-5 border-b-2 border-dashed border-zinc-300 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-widest text-kids-600">Kids Club · Imprimible</p>
            <h1 className="text-2xl font-black">{printable.title}</h1>
            {printable.description && <p className="mt-0.5 text-sm text-zinc-500">{printable.description}</p>}
          </div>
          <div className="text-right text-xs text-zinc-400">
            <p className="font-bold">{printable.age_min}–{printable.age_max} años</p>
            <p>Nombre: __________________</p>
          </div>
        </div>
      </header>

      {cat === "colorear" && <ColoringSheet data={data} cover={printable.cover_url} />}
      {cat === "sopa_letras" && <WordSearchSheet data={data} seed={hashSeed(printable.id)} />}
      {cat === "crucigrama" && <CrosswordSheet data={data} />}
      {cat === "laberinto" && <MazeSheet data={data} />}
      {cat === "unir_puntos" && <DotSheet data={data} />}
      {cat === "cuento" && <StorySheet data={data} />}
    </div>
  );
}

function ColoringSheet({ data, cover }: { data: any; cover: string | null }) {
  const src = data?.image_url || cover;
  if (!src) return <p className="text-sm text-zinc-500">Sin imagen para colorear.</p>;
  return (
    <div className="flex justify-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="Lámina para colorear" className="max-h-[900px] w-full object-contain" />
    </div>
  );
}

function WordSearchSheet({ data, seed }: { data: any; seed: number }) {
  const words: string[] = data?.words ?? ["SOL", "LUNA", "MAR"];
  const size: number = data?.size ?? 12;
  const puzzle = generateWordSearch(words, size, data?.seed ?? seed);
  return (
    <div className="space-y-5">
      <div className="flex justify-center">
        <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${size}, minmax(1.6rem, 1fr))` }}>
          {puzzle.grid.map((row, r) =>
            row.map((letter, c) => (
              <span key={`${r}-${c}`} className="flex aspect-square items-center justify-center border border-zinc-300 text-base font-bold">
                {letter}
              </span>
            )),
          )}
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {puzzle.allWords.map((w) => (
          <span key={w} className="rounded-full border border-zinc-300 px-3 py-1 text-sm font-bold">{w}</span>
        ))}
      </div>
    </div>
  );
}

function CrosswordSheet({ data }: { data: any }) {
  const words = data?.words ?? [];
  const puzzle = generateCrossword(words);
  return (
    <div className="space-y-6">
      <div className="flex justify-center overflow-x-auto">
        <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${puzzle.cols}, minmax(2rem, 1fr))` }}>
          {Array.from({ length: puzzle.rows }).map((_, r) =>
            Array.from({ length: puzzle.cols }).map((_, c) => {
              const sol = puzzle.grid[r][c];
              if (!sol) return <div key={`${r}-${c}`} className="aspect-square" />;
              const num = puzzle.numbers[r][c];
              return (
                <div key={`${r}-${c}`} className="relative aspect-square border-2 border-zinc-700">
                  {num && <span className="absolute left-0.5 top-0 text-[10px] font-black text-zinc-500">{num}</span>}
                </div>
              );
            }),
          )}
        </div>
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        {(["across", "down"] as const).map((dir) => (
          <div key={dir}>
            <h3 className="mb-2 text-sm font-black">{dir === "across" ? "Horizontales" : "Verticales"}</h3>
            <ol className="space-y-1.5">
              {puzzle.words.filter((w) => w.dir === dir).map((w) => (
                <li key={`${w.number}-${w.answer}`} className="text-sm">
                  <span className="font-black text-kids-600">{w.number}.</span> {w.clue}
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </div>
  );
}

function MazeSheet({ data }: { data: any }) {
  const cols = Math.min(18, Math.max(6, data?.cols ?? 12));
  const rows = Math.min(18, Math.max(6, data?.rows ?? 12));
  const maze = generateMaze(cols, rows, data?.seed ?? 1);
  return (
    <div className="flex justify-center">
      <div className="grid overflow-hidden" style={{ gridTemplateColumns: `repeat(${cols}, minmax(1.5rem, 1fr))` }}>
        {maze.cells.map((row, r) =>
          row.map((cell, c) => {
            const isStart = r === 0 && c === 0;
            const isGoal = r === rows - 1 && c === cols - 1;
            return (
              <div
                key={`${r}-${c}`}
                className="relative flex aspect-square items-center justify-center"
                style={{
                  borderTop: cell.n ? "2px solid #111827" : "none",
                  borderBottom: cell.s ? "2px solid #111827" : "none",
                  borderLeft: cell.w ? "2px solid #111827" : "none",
                  borderRight: cell.e ? "2px solid #111827" : "none",
                }}
              >
                {isStart && <span className="text-[9px] font-black text-emerald-600">SAL</span>}
                {isGoal && (
                  <svg viewBox="0 0 24 24" className="h-4 w-4 text-amber-500" fill="currentColor">
                    <path d="M12 2l2.6 6.3L21 9l-4.8 4.1L17.5 20 12 16.6 6.5 20l1.3-6.9L3 9l6.4-.7z" />
                  </svg>
                )}
              </div>
            );
          }),
        )}
      </div>
    </div>
  );
}

function DotSheet({ data }: { data: any }) {
  const pts = dotPoints(data?.shape ?? "star", data?.count ?? 12);
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

function StorySheet({ data }: { data: any }) {
  const pages = data?.pages ?? [];
  return (
    <div className="space-y-8">
      {pages.map((p: any, i: number) => (
        <div key={i} className="page-break">
          {p.image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.image_url} alt="" className="mx-auto max-h-[520px] w-full rounded-xl object-contain" />
          )}
          <p className="mt-4 text-center text-lg font-bold leading-relaxed">{p.text}</p>
          <p className="mt-1 text-center text-xs text-zinc-400">Página {i + 1} de {pages.length}</p>
        </div>
      ))}
    </div>
  );
}
