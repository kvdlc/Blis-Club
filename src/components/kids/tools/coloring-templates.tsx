import type { ReactNode } from "react";

// ─────────────────────────────────────────────────────────────
// Kids Club · Plantillas SVG para colorear (regiones rellenables)
// ─────────────────────────────────────────────────────────────

export interface SvgRegion {
  id: string;
  node: ReactNode;
}

function starPoints(cx: number, cy: number, outer: number, inner: number, spikes: number) {
  const pts: string[] = [];
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI / spikes) * i - Math.PI / 2;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`);
  }
  return pts.join(" ");
}

function petal(cx: number, cy: number, angleDeg: number, rx: number, ry: number, dist: number) {
  const a = (angleDeg * Math.PI) / 180;
  const px = cx + dist * Math.cos(a);
  const py = cy + dist * Math.sin(a);
  return <ellipse cx={px} cy={py} rx={rx} ry={ry} transform={`rotate(${angleDeg} ${px} ${py})`} />;
}

export const COLORING_TEMPLATES: Record<
  string,
  { viewBox: string; regions: SvgRegion[] }
> = {
  star: {
    viewBox: "0 0 400 400",
    regions: [
      { id: "sky", node: <rect x="0" y="0" width="400" height="400" rx="24" /> },
      { id: "star", node: <polygon points={starPoints(200, 210, 140, 58, 5)} /> },
      { id: "s1", node: <polygon points={starPoints(70, 70, 28, 12, 5)} /> },
      { id: "s2", node: <polygon points={starPoints(330, 90, 24, 10, 5)} /> },
      { id: "s3", node: <polygon points={starPoints(340, 310, 30, 13, 5)} /> },
      { id: "s4", node: <polygon points={starPoints(64, 320, 22, 9, 5)} /> },
      { id: "moon", node: <path d="M300 40 a40 40 0 1 0 40 60 a32 32 0 1 1 -40 -60 Z" /> },
    ],
  },
  fish: {
    viewBox: "0 0 400 400",
    regions: [
      { id: "water", node: <rect x="0" y="0" width="400" height="400" rx="24" /> },
      { id: "tail", node: <polygon points="100,210 40,150 40,270" /> },
      { id: "body", node: <ellipse cx="220" cy="210" rx="125" ry="82" /> },
      { id: "finTop", node: <path d="M200 132 q30 -60 70 -6 q-34 4 -70 6 Z" /> },
      { id: "finBottom", node: <path d="M200 288 q30 60 70 6 q-34 -4 -70 -6 Z" /> },
      { id: "stripe1", node: <rect x="200" y="128" width="18" height="164" rx="9" /> },
      { id: "stripe2", node: <rect x="250" y="132" width="18" height="156" rx="9" /> },
      { id: "eye", node: <circle cx="150" cy="190" r="20" /> },
      { id: "b1", node: <circle cx="70" cy="90" r="16" /> },
      { id: "b2", node: <circle cx="110" cy="60" r="12" /> },
      { id: "b3", node: <circle cx="330" cy="330" r="14" /> },
    ],
  },
  house: {
    viewBox: "0 0 400 400",
    regions: [
      { id: "sky", node: <rect x="0" y="0" width="400" height="400" rx="24" /> },
      { id: "sun", node: <circle cx="330" cy="70" r="40" /> },
      { id: "cloud", node: <path d="M70 90 a30 30 0 0 1 55 -12 a28 28 0 0 1 48 12 Z" /> },
      { id: "grass", node: <rect x="0" y="320" width="400" height="80" rx="16" /> },
      { id: "wall", node: <rect x="110" y="190" width="180" height="150" rx="8" /> },
      { id: "roof", node: <polygon points="200,90 90,200 310,200" /> },
      { id: "door", node: <rect x="175" y="250" width="50" height="90" rx="6" /> },
      { id: "window", node: <rect x="130" y="220" width="40" height="40" rx="6" /> },
      { id: "window2", node: <rect x="230" y="220" width="40" height="40" rx="6" /> },
      { id: "tree", node: <circle cx="60" cy="270" r="46" /> },
      { id: "trunk", node: <rect x="50" y="300" width="20" height="50" rx="6" /> },
    ],
  },
  rocket: {
    viewBox: "0 0 400 400",
    regions: [
      { id: "space", node: <rect x="0" y="0" width="400" height="400" rx="24" /> },
      { id: "body", node: <path d="M200 40 C255 110 265 210 260 300 L140 300 C135 210 145 110 200 40 Z" /> },
      { id: "window", node: <circle cx="200" cy="170" r="34" /> },
      { id: "finL", node: <polygon points="140,230 90,320 142,300" /> },
      { id: "finR", node: <polygon points="260,230 310,320 258,300" /> },
      { id: "flame", node: <path d="M170 300 q30 70 30 70 q0 0 30 -70 Z" /> },
      { id: "planet", node: <circle cx="70" cy="80" r="30" /> },
      { id: "star1", node: <polygon points={starPoints(330, 90, 22, 9, 5)} /> },
      { id: "star2", node: <polygon points={starPoints(90, 330, 20, 8, 5)} /> },
      { id: "star3", node: <polygon points={starPoints(330, 340, 18, 7, 5)} /> },
    ],
  },
  flower: {
    viewBox: "0 0 400 400",
    regions: [
      { id: "sky", node: <rect x="0" y="0" width="400" height="400" rx="24" /> },
      { id: "stem", node: <rect x="190" y="220" width="20" height="150" rx="8" /> },
      { id: "leafL", node: <ellipse cx="150" cy="310" rx="42" ry="20" transform="rotate(-30 150 310)" /> },
      { id: "leafR", node: <ellipse cx="255" cy="270" rx="42" ry="20" transform="rotate(30 255 270)" /> },
      { id: "p1", node: petal(200, 160, 0, 42, 64, 70) },
      { id: "p2", node: petal(200, 160, 60, 42, 64, 70) },
      { id: "p3", node: petal(200, 160, 120, 42, 64, 70) },
      { id: "p4", node: petal(200, 160, 180, 42, 64, 70) },
      { id: "p5", node: petal(200, 160, 240, 42, 64, 70) },
      { id: "p6", node: petal(200, 160, 300, 42, 64, 70) },
      { id: "center", node: <circle cx="200" cy="160" r="46" /> },
    ],
  },
  heart: {
    viewBox: "0 0 400 400",
    regions: [
      { id: "bg", node: <rect x="0" y="0" width="400" height="400" rx="24" /> },
      {
        id: "heart",
        node: (
          <path d="M200 340 C60 250 60 130 130 110 C170 98 200 130 200 130 C200 130 230 98 270 110 C340 130 340 250 200 340 Z" />
        ),
      },
      { id: "h2", node: <path d="M90 250 C40 210 40 160 70 150 C90 144 100 158 100 158 C100 158 110 144 130 150 C160 160 160 210 110 250 C104 254 96 254 90 250 Z" /> },
      { id: "h3", node: <path d="M300 130 C270 108 270 78 288 72 C300 68 308 80 308 80 C308 80 316 68 328 72 C346 78 346 108 316 130 Z" /> },
    ],
  },
};

export const COLORING_TEMPLATE_NAMES = Object.keys(COLORING_TEMPLATES);
