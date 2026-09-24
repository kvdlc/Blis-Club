// ─────────────────────────────────────────────────────────────
// Kids Club · Tipos y utilidades compartidas
// ─────────────────────────────────────────────────────────────

export type KidsCategorySlug =
  | "colorear"
  | "crucigrama"
  | "laberinto"
  | "sopa_letras"
  | "unir_puntos"
  | "cuento";

export interface KidsCategory {
  id: string;
  slug: KidsCategorySlug;
  name: string;
  emoji: string | null;
  description: string | null;
  color: string | null;
  cover_url: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface KidsActivity {
  id: string;
  user_id: string | null;
  category_slug: KidsCategorySlug;
  title: string;
  description: string | null;
  cover_url: string | null;
  age_min: number;
  age_max: number;
  difficulty: "facil" | "medio" | "dificil";
  is_free: boolean;
  is_published: boolean;
  is_ai_generated: boolean;
  tags: string[];
  data: any;
  likes_count: number;
  downloads_count: number;
  created_at: string;
  updated_at: string;
}

export interface KidsProfile {
  id: string;
  user_id: string;
  name: string;
  avatar: string | null;
  avatar_url?: string | null;
  birth_year: number | null;
  color: string;
  created_at: string;
}

export interface KidsProgress {
  id: string;
  user_id: string;
  child_id: string | null;
  activity_id: string;
  status: "in_progress" | "completed";
  score: number;
  stars: number;
  data: any;
  completed_at: string | null;
  updated_at: string;
}

// ── Metadatos visuales por categoría (fallback si la DB no responde) ──
export const CATEGORY_META: Record<
  string,
  { name: string; emoji: string; color: string; soft: string; text: string; path: string }
> = {
  colorear: {
    name: "Colorear",
    emoji: "🖍️",
    color: "#EF4444",
    soft: "bg-red-50",
    text: "text-red-600",
    path: "/kids/app/interactivos?categoria=colorear",
  },
  crucigrama: {
    name: "Crucigramas",
    emoji: "✏️",
    color: "#3B82F6",
    soft: "bg-blue-50",
    text: "text-blue-600",
    path: "/kids/app/juegos?categoria=crucigrama",
  },
  laberinto: {
    name: "Laberintos",
    emoji: "🧩",
    color: "#10B981",
    soft: "bg-emerald-50",
    text: "text-emerald-600",
    path: "/kids/app/juegos?categoria=laberinto",
  },
  sopa_letras: {
    name: "Sopa de letras",
    emoji: "🔤",
    color: "#8B5CF6",
    soft: "bg-violet-50",
    text: "text-violet-600",
    path: "/kids/app/juegos?categoria=sopa_letras",
  },
  unir_puntos: {
    name: "Unir puntos",
    emoji: "🔢",
    color: "#F59E0B",
    soft: "bg-amber-50",
    text: "text-amber-600",
    path: "/kids/app/juegos?categoria=unir_puntos",
  },
  cuento: {
    name: "Cuentos",
    emoji: "📖",
    color: "#EC4899",
    soft: "bg-pink-50",
    text: "text-pink-600",
    path: "/kids/app/interactivos?categoria=cuento",
  },
};

export function categoryMeta(slug: string) {
  return (
    CATEGORY_META[slug] ?? {
      name: slug.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      emoji: "🎨",
      color: "#F97316",
      soft: "bg-orange-50",
      text: "text-orange-600",
      path: `/kids/app/imprimibles?categoria=${slug}`,
    }
  );
}

export const DIFFICULTY_LABEL: Record<string, string> = {
  facil: "Fácil",
  medio: "Medio",
  dificil: "Difícil",
};

export const KID_AVATAR_COLORS = [
  "#FDE68A", "#FCA5A5", "#A7F3D0", "#BFDBFE", "#DDD6FE", "#FBCFE8",
  "#FED7AA", "#C7D2FE", "#BBF7D0", "#FECDD3",
];

// ─────────────────────────────────────────────────────────────
// RNG determinista (para generar puzzles iguales por semilla)
// ─────────────────────────────────────────────────────────────
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(arr: T[], rnd: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─────────────────────────────────────────────────────────────
// Crucigrama
// ─────────────────────────────────────────────────────────────
export interface CrosswordWord {
  answer: string;
  clue: string;
}
export interface CrosswordPlacement {
  answer: string;
  clue: string;
  number: number;
  row: number;
  col: number;
  dir: "across" | "down";
}
export interface Crossword {
  rows: number;
  cols: number;
  /** Letra por celda o null si no participa */
  grid: (string | null)[][];
  /** Número por celda (inicio de palabra) */
  numbers: (number | null)[][];
  words: CrosswordPlacement[];
}

export function generateCrossword(input: CrosswordWord[]): Crossword {
  const words = input
    .map((w) => ({ ...w, answer: w.answer.toUpperCase().replace(/[^A-ZÑ]/g, "") }))
    .filter((w) => w.answer.length >= 2)
    .sort((a, b) => b.answer.length - a.answer.length);

  const cells = new Map<string, string>(); // "r,c" -> letter
  const placed: { answer: string; clue: string; row: number; col: number; dir: "across" | "down" }[] = [];
  const key = (r: number, c: number) => `${r},${c}`;

  function canPlace(answer: string, row: number, col: number, dir: "across" | "down") {
    const dr = dir === "down" ? 1 : 0;
    const dc = dir === "across" ? 1 : 0;
    // celdas antes y despues deben estar vacias (no pegar palabras)
    if (dir === "across") {
      if (cells.has(key(row, col - 1)) || cells.has(key(row, col + answer.length))) return false;
    } else {
      if (cells.has(key(row - 1, col)) || cells.has(key(row + answer.length, col))) return false;
    }
    let crossings = 0;
    for (let i = 0; i < answer.length; i++) {
      const r = row + dr * i;
      const c = col + dc * i;
      const existing = cells.get(key(r, c));
      if (existing) {
        if (existing !== answer[i]) return false;
        crossings++;
      } else {
        // lado perpendicular debe estar libre
        if (dir === "across") {
          if (cells.has(key(r - 1, c)) || cells.has(key(r + 1, c))) return false;
        } else {
          if (cells.has(key(r, c - 1)) || cells.has(key(r, c + 1))) return false;
        }
      }
    }
    return crossings > 0;
  }

  function place(answer: string, clue: string, row: number, col: number, dir: "across" | "down") {
    const dr = dir === "down" ? 1 : 0;
    const dc = dir === "across" ? 1 : 0;
    for (let i = 0; i < answer.length; i++) cells.set(key(row + dr * i, col + dc * i), answer[i]);
    placed.push({ answer, clue, row, col, dir });
  }

  if (words.length) {
    const first = words[0];
    place(first.answer, first.clue, 0, 0, "across");
    for (let w = 1; w < words.length; w++) {
      const word = words[w];
      let best: { row: number; col: number; dir: "across" | "down"; score: number } | null = null;
      // buscar letra en comun
      for (let i = 0; i < word.answer.length; i++) {
        const ch = word.answer[i];
        for (const [k, letter] of cells) {
          if (letter !== ch) continue;
          const [r, c] = k.split(",").map(Number);
          // intentar across y down
          const tryDirs: ("across" | "down")[] = ["across", "down"];
          for (const dir of tryDirs) {
            const sr = dir === "down" ? r - i : r;
            const sc = dir === "across" ? c - i : c;
            if (canPlace(word.answer, sr, sc, dir)) {
              const score = word.answer.length;
              if (!best || score > best.score) best = { row: sr, col: sc, dir, score };
            }
          }
        }
      }
      if (best) place(word.answer, word.clue, best.row, best.col, best.dir);
    }
  }

  // normalizar a bounds
  let minR = Infinity, maxR = -Infinity, minC = Infinity, maxC = -Infinity;
  for (const k of cells.keys()) {
    const [r, c] = k.split(",").map(Number);
    minR = Math.min(minR, r); maxR = Math.max(maxR, r);
    minC = Math.min(minC, c); maxC = Math.max(maxC, c);
  }
  if (!isFinite(minR)) { minR = 0; maxR = 0; minC = 0; maxC = 0; }

  const rows = maxR - minR + 1;
  const cols = maxC - minC + 1;
  const grid: (string | null)[][] = Array.from({ length: rows }, () => Array(cols).fill(null));
  const numbers: (number | null)[][] = Array.from({ length: rows }, () => Array(cols).fill(null));

  for (const [k, letter] of cells) {
    const [r, c] = k.split(",").map(Number);
    grid[r - minR][c - minC] = letter;
  }

  // numerar inicios de palabra
  const starts = new Map<string, number>();
  let counter = 0;
  const sortedPlaced = [...placed].sort((a, b) => a.row - b.row || a.col - b.col);
  const placements: CrosswordPlacement[] = [];
  for (const p of sortedPlaced) {
    const r = p.row - minR;
    const c = p.col - minC;
    const skey = key(r, c);
    let num = starts.get(skey);
    if (!num) {
      counter++;
      num = counter;
      starts.set(skey, num);
      numbers[r][c] = num;
    }
    placements.push({ answer: p.answer, clue: p.clue, number: num, row: r, col: c, dir: p.dir });
  }

  return { rows, cols, grid, numbers, words: placements };
}

// ─────────────────────────────────────────────────────────────
// Sopa de letras
// ─────────────────────────────────────────────────────────────
export interface WordSearchPlacement {
  word: string;
  cells: { r: number; c: number }[];
}
export interface WordSearch {
  size: number;
  grid: string[][];
  words: WordSearchPlacement[];
  allWords: string[];
}

export function generateWordSearch(words: string[], size = 10, seed = 1): WordSearch {
  const rnd = mulberry32(seed);
  const clean = words
    .map((w) => w.toUpperCase().replace(/[^A-ZÑ]/g, ""))
    .filter((w) => w.length <= size)
    .sort((a, b) => b.length - a.length);

  const grid: (string | null)[][] = Array.from({ length: size }, () => Array(size).fill(null));
  const placements: WordSearchPlacement[] = [];
  const DIRS = [
    [0, 1], [1, 0], [1, 1], [1, -1], [0, -1], [-1, 0], [-1, -1], [-1, 1],
  ];

  for (const word of clean) {
    let done = false;
    for (let attempt = 0; attempt < 200 && !done; attempt++) {
      const [dr, dc] = DIRS[Math.floor(rnd() * DIRS.length)];
      const r0 = Math.floor(rnd() * size);
      const c0 = Math.floor(rnd() * size);
      const endR = r0 + dr * (word.length - 1);
      const endC = c0 + dc * (word.length - 1);
      if (endR < 0 || endR >= size || endC < 0 || endC >= size) continue;
      let ok = true;
      const cellsPlaced: { r: number; c: number }[] = [];
      for (let i = 0; i < word.length; i++) {
        const r = r0 + dr * i;
        const c = c0 + dc * i;
        const cur = grid[r][c];
        if (cur && cur !== word[i]) { ok = false; break; }
        cellsPlaced.push({ r, c });
      }
      if (!ok) continue;
      for (let i = 0; i < word.length; i++) grid[r0 + dr * i][c0 + dc * i] = word[i];
      placements.push({ word, cells: cellsPlaced });
      done = true;
    }
  }

  const letters = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ";
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!grid[r][c]) grid[r][c] = letters[Math.floor(rnd() * letters.length)];
    }
  }

  return {
    size,
    grid: grid as string[][],
    words: placements,
    allWords: clean,
  };
}

// ─────────────────────────────────────────────────────────────
// Laberinto (perfect maze con DFS)
// ─────────────────────────────────────────────────────────────
export interface MazeCell {
  n: boolean; e: boolean; s: boolean; w: boolean; visited: boolean;
}
export interface Maze {
  cols: number;
  rows: number;
  cells: MazeCell[][];
}

export function generateMaze(cols: number, rows: number, seed = 1): Maze {
  const rnd = mulberry32(seed);
  const cells: MazeCell[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({ n: true, e: true, s: true, w: true, visited: false })),
  );
  const stack: [number, number][] = [[0, 0]];
  cells[0][0].visited = true;
  const dirs: [number, number, keyof MazeCell, keyof MazeCell][] = [
    [-1, 0, "n", "s"],
    [0, 1, "e", "w"],
    [1, 0, "s", "n"],
    [0, -1, "w", "e"],
  ];
  while (stack.length) {
    const [r, c] = stack[stack.length - 1];
    const options = shuffle(dirs, rnd).filter(([dr, dc]) => {
      const nr = r + dr;
      const nc = c + dc;
      return nr >= 0 && nr < rows && nc >= 0 && nc < cols && !cells[nr][nc].visited;
    });
    if (!options.length) { stack.pop(); continue; }
    const [dr, dc, wall, opposite] = options[0];
    const nr = r + dr;
    const nc = c + dc;
    (cells[r][c][wall] as boolean) = false;
    (cells[nr][nc][opposite] as boolean) = false;
    cells[nr][nc].visited = true;
    stack.push([nr, nc]);
  }
  return { cols, rows, cells };
}

// ─────────────────────────────────────────────────────────────
// Unir puntos · figuras predefinidas (coordenadas normalizadas 0..1)
// ─────────────────────────────────────────────────────────────
export const DOT_SHAPES: Record<string, [number, number][]> = {
  star: (() => {
    const pts: [number, number][] = [];
    const spikes = 5;
    for (let i = 0; i < spikes * 2; i++) {
      const r = i % 2 === 0 ? 0.42 : 0.18;
      const a = (Math.PI / spikes) * i - Math.PI / 2;
      pts.push([0.5 + r * Math.cos(a), 0.5 + r * Math.sin(a)]);
    }
    return pts;
  })(),
  heart: [
    [0.5, 0.92], [0.15, 0.55], [0.12, 0.3], [0.28, 0.15], [0.5, 0.3],
    [0.72, 0.15], [0.88, 0.3], [0.85, 0.55],
  ],
  fish: [
    [0.16, 0.5], [0.32, 0.33], [0.56, 0.3], [0.72, 0.4], [0.82, 0.5],
    [0.72, 0.6], [0.56, 0.7], [0.32, 0.67], [0.16, 0.5], [0.6, 0.45],
  ],
  house: [
    [0.5, 0.12], [0.86, 0.42], [0.78, 0.42], [0.78, 0.86], [0.58, 0.86],
    [0.58, 0.62], [0.42, 0.62], [0.42, 0.86], [0.22, 0.86], [0.22, 0.42], [0.14, 0.42],
  ],
  rocket: [
    [0.5, 0.08], [0.64, 0.3], [0.64, 0.6], [0.78, 0.8], [0.58, 0.8],
    [0.5, 0.92], [0.42, 0.8], [0.22, 0.8], [0.36, 0.6], [0.36, 0.3],
  ],
  flower: (() => {
    const petals = 6;
    const pts: [number, number][] = [];
    for (let i = 0; i < petals; i++) {
      const a = (Math.PI * 2 * i) / petals;
      pts.push([0.5 + 0.34 * Math.cos(a), 0.5 + 0.34 * Math.sin(a)]);
      const a2 = a + Math.PI / petals;
      pts.push([0.5 + 0.2 * Math.cos(a2), 0.5 + 0.2 * Math.sin(a2)]);
    }
    return pts;
  })(),
};

/** Devuelve `count` puntos distribuidos alrededor de la figura indicada. */
export function dotPoints(shape: string, count?: number): [number, number][] {
  const base = DOT_SHAPES[shape] ?? DOT_SHAPES.star;
  if (!count || count <= 0 || count >= base.length) return base;
  const out: [number, number][] = [];
  for (let i = 0; i < count; i++) out.push(base[Math.round((i * (base.length - 1)) / (count - 1))]);
  return out;
}
