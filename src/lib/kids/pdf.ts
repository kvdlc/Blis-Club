import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { generateWordSearch, generateCrossword, generateMaze, dotPoints, categoryMeta } from "@/lib/kids";
import { buildPuzzlePageSpec } from "@/lib/kids/book-content";

export interface PdfPage {
  image_url?: string;
  text?: string;
  i?: number;
  puzzle?: { category: string; spec: any };
}

export interface PdfDocSpec {
  title: string;
  subtitle?: string;
  category: string;
  coverUrl?: string | null;
  ageText?: string;
  pages: PdfPage[];
}

const A4: [number, number] = [595.28, 841.89];
const MARGIN = 42;
const KIDS = { r: 0.49, g: 0.23, b: 0.93 }; // violeta Blis
const STAR_PATH = "M12 2l2.7 6.3 6.8.6-5.1 4.5 1.5 6.6L12 16.9 6.1 20l1.5-6.6L2.5 8.9l6.8-.6z";

async function fetchImage(url: string): Promise<{ bytes: ArrayBuffer; type: "png" | "jpg" } | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const bytes = await res.arrayBuffer();
    const u8 = new Uint8Array(bytes);
    let type: "png" | "jpg" = "jpg";
    if (u8[0] === 0x89 && u8[1] === 0x50 && u8[2] === 0x4e && u8[3] === 0x47) type = "png";
    else if (u8[0] === 0xff && u8[1] === 0xd8) type = "jpg";
    return { bytes, type };
  } catch { return null; }
}

export async function buildKidsPdf(spec: PdfDocSpec): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.setTitle(spec.title);
  pdf.setAuthor("Kids Club");
  pdf.setSubject(categoryMeta(spec.category).name);

  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const regular = await pdf.embedFont(StandardFonts.Helvetica);

  const meta = categoryMeta(spec.category);

  // ── Portada ──
  {
    const page = pdf.addPage(A4);
    const { width, height } = page.getSize();
    page.drawRectangle({ x: 0, y: height - 150, width, height: 150, color: rgb(KIDS.r, KIDS.g, KIDS.b) });
    page.drawRectangle({ x: 0, y: height - 150, width, height: 10, color: rgb(0.92, 0.4, 0.85) });
    for (const [sx, sy, sc] of [[26, height - 52, 1.0], [64, height - 92, 0.6], [width - 44, height - 58, 0.9], [width - 92, height - 100, 0.5]] as [number, number, number][]) {
      page.drawSvgPath(STAR_PATH, { x: sx, y: sy, scale: sc, color: rgb(1, 0.94, 0.7) });
    }
    page.drawText("KIDS CLUB", { x: MARGIN, y: height - 60, size: 14, font: bold, color: rgb(1, 1, 1) });
    page.drawText(meta.name.toUpperCase(), { x: MARGIN, y: height - 84, size: 11, font: regular, color: rgb(1, 1, 1) });

    const titleLines = wrap(spec.title, bold, 26, width - MARGIN * 2);
    let ty = height - 210;
    for (const line of titleLines.slice(0, 3)) {
      page.drawText(line, { x: MARGIN, y: ty, size: 26, font: bold, color: rgb(0.1, 0.1, 0.12) });
      ty -= 32;
    }
    if (spec.subtitle) {
      for (const line of wrap(spec.subtitle, regular, 13, width - MARGIN * 2).slice(0, 3)) {
        page.drawText(line, { x: MARGIN, y: ty, size: 13, font: regular, color: rgb(0.4, 0.4, 0.45) });
        ty -= 18;
      }
    }

    if (spec.coverUrl) {
      const img = await fetchImage(spec.coverUrl);
      if (img) {
        const embedded = img.type === "png" ? await pdf.embedPng(img.bytes) : await pdf.embedJpg(img.bytes);
        const maxW = width - MARGIN * 2;
        const maxH = ty - 150;
        const scale = Math.min(maxW / embedded.width, maxH / embedded.height);
        const w = embedded.width * scale, h = embedded.height * scale;
        page.drawImage(embedded, { x: (width - w) / 2, y: ty - h - 10, width: w, height: h });
      }
    }

    page.drawText(`${spec.pages.length} páginas${spec.ageText ? " · " + spec.ageText : ""}`, { x: MARGIN, y: 70, size: 12, font: regular, color: rgb(0.3, 0.3, 0.35) });
    page.drawText("Imprime y disfruta · blis.club", { x: MARGIN, y: 52, size: 10, font: regular, color: rgb(0.55, 0.55, 0.6) });
  }

  // ── Páginas ──
  for (let idx = 0; idx < spec.pages.length; idx++) {
    const p = spec.pages[idx];
    const page = pdf.addPage(A4);
    const { width, height } = page.getSize();
    // Header
    page.drawText(spec.title, { x: MARGIN, y: height - 30, size: 9, font: regular, color: rgb(0.55, 0.55, 0.6) });
    const pn = `${idx + 1} / ${spec.pages.length}`;
    page.drawText(pn, { x: width - MARGIN - regular.widthOfTextAtSize(pn, 9), y: height - 30, size: 9, font: regular, color: rgb(0.55, 0.55, 0.6) });
    page.drawLine({ start: { x: MARGIN, y: height - 38 }, end: { x: width - MARGIN, y: height - 38 }, thickness: 0.7, color: rgb(0.85, 0.85, 0.88) });

    const top = height - 60;
    const bottom = 46;

    if (p.image_url) {
      const img = await fetchImage(p.image_url);
      if (img) {
        const embedded = img.type === "png" ? await pdf.embedPng(img.bytes) : await pdf.embedJpg(img.bytes);
        const maxW = width - MARGIN * 2;
        const maxH = top - bottom;
        const scale = Math.min(maxW / embedded.width, maxH / embedded.height);
        const w = embedded.width * scale, h = embedded.height * scale;
        page.drawImage(embedded, { x: (width - w) / 2, y: bottom + (maxH - h) / 2, width: w, height: h });
      }
    } else if (spec.category === "cuento" && p.text) {
      const lines = wrap(p.text, bold, 16, width - MARGIN * 2);
      let y = top - 40;
      for (const line of lines) {
        page.drawText(line, { x: MARGIN, y, size: 16, font: bold, color: rgb(0.15, 0.15, 0.2) });
        y -= 24;
      }
    } else {
      const pSpec = p.puzzle ? p.puzzle.spec : buildPuzzlePageSpec(spec.category, typeof p.i === "number" ? p.i : idx);
      const pCat = p.puzzle ? p.puzzle.category : spec.category;
      drawPuzzle(page, pCat, pSpec, { bold, regular });
    }
  }

  return await pdf.save();
}

function wrap(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? line + " " + w : w;
    if (font.widthOfTextAtSize(test, size) > maxWidth && line) { lines.push(line); line = w; }
    else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

function drawPuzzle(page: PDFPage, category: string, spec: any, fonts: { bold: PDFFont; regular: PDFFont }) {
  const { width, height } = page.getSize();
  const cx = width / 2;
  const top = height - 70;
  const ink = rgb(0.12, 0.12, 0.16);

  if (category === "sopa_letras") {
    const puzzle = generateWordSearch(spec.words, spec.size, spec.seed);
    const cell = Math.min((width - MARGIN * 2) / puzzle.size, 30);
    const gridW = cell * puzzle.size;
    const ox = cx - gridW / 2, oy = top - gridW;
    for (let r = 0; r < puzzle.size; r++) for (let c = 0; c < puzzle.size; c++) {
      const x = ox + c * cell, y = oy + (puzzle.size - 1 - r) * cell;
      page.drawRectangle({ x, y, width: cell, height: cell, borderColor: rgb(0.6, 0.6, 0.65), borderWidth: 0.6 });
      const letter = puzzle.grid[r][c];
      page.drawText(letter, { x: x + cell / 2 - fonts.bold.widthOfTextAtSize(letter, 12) / 2, y: y + cell / 2 - 4, size: 12, font: fonts.bold, color: ink });
    }
    let y = oy - 30;
    page.drawText("Palabras:", { x: MARGIN, y, size: 12, font: fonts.bold, color: ink });
    y -= 18;
    page.drawText(puzzle.allWords.join("   ·   "), { x: MARGIN, y, size: 12, font: fonts.regular, color: ink });
    return;
  }

  if (category === "crucigrama") {
    const puzzle = generateCrossword(spec.words);
    const cell = Math.min((width - MARGIN * 2) / puzzle.cols, 28);
    const gridW = cell * puzzle.cols, gridH = cell * puzzle.rows;
    const ox = cx - gridW / 2, oy = top - gridH;
    for (let r = 0; r < puzzle.rows; r++) for (let c = 0; c < puzzle.cols; c++) {
      if (!puzzle.grid[r][c]) continue;
      const x = ox + c * cell, y = oy + (puzzle.rows - 1 - r) * cell;
      page.drawRectangle({ x, y, width: cell, height: cell, borderColor: ink, borderWidth: 1 });
      const num = puzzle.numbers[r][c];
      if (num) page.drawText(String(num), { x: x + 2, y: y + cell - 9, size: 8, font: fonts.bold, color: rgb(0.4, 0.4, 0.45) });
    }
    let y = oy - 26;
    page.drawText("Horizontales:", { x: MARGIN, y, size: 11, font: fonts.bold, color: ink }); y -= 15;
    for (const w of puzzle.words.filter((x) => x.dir === "across")) {
      page.drawText(`${w.number}. ${w.clue}`, { x: MARGIN, y, size: 10, font: fonts.regular, color: ink }); y -= 13;
    }
    y -= 6;
    page.drawText("Verticales:", { x: MARGIN, y, size: 11, font: fonts.bold, color: ink }); y -= 15;
    for (const w of puzzle.words.filter((x) => x.dir === "down")) {
      page.drawText(`${w.number}. ${w.clue}`, { x: MARGIN, y, size: 10, font: fonts.regular, color: ink }); y -= 13;
    }
    return;
  }

  if (category === "laberinto") {
    const maze = generateMaze(spec.cols, spec.rows, spec.seed);
    const cell = Math.min((width - MARGIN * 2) / maze.cols, (top - 60) / maze.rows);
    const ox = cx - (cell * maze.cols) / 2, oy = top - cell * maze.rows;
    for (let r = 0; r < maze.rows; r++) for (let c = 0; c < maze.cols; c++) {
      const x = ox + c * cell, y = oy + (maze.rows - 1 - r) * cell;
      const m = maze.cells[r][c];
      if (m.n) page.drawLine({ start: { x, y: y + cell }, end: { x: x + cell, y: y + cell }, thickness: 1.2, color: ink });
      if (m.s) page.drawLine({ start: { x, y }, end: { x: x + cell, y }, thickness: 1.2, color: ink });
      if (m.w) page.drawLine({ start: { x, y }, end: { x, y: y + cell }, thickness: 1.2, color: ink });
      if (m.e) page.drawLine({ start: { x: x + cell, y }, end: { x: x + cell, y: y + cell }, thickness: 1.2, color: ink });
    }
    page.drawText("SALIDA", { x: ox + 2, y: oy + cell * maze.rows - 10, size: 8, font: fonts.bold, color: rgb(0.1, 0.6, 0.3) });
    page.drawText("META", { x: ox + cell * maze.cols - 30, y: oy + 2, size: 8, font: fonts.bold, color: rgb(0.85, 0.5, 0.1) });
    return;
  }

  if (category === "unir_puntos") {
    const pts = dotPoints(spec.shape, spec.count);
    const S = Math.min(width - MARGIN * 2, top - 80);
    const ox = cx - S / 2, oy = top - S;
    for (let i = 0; i < pts.length; i++) {
      const x = ox + pts[i][0] * S, y = oy + (1 - pts[i][1]) * S;
      page.drawCircle({ x, y, size: 3, color: ink });
      page.drawText(String(i + 1), { x: x - 4, y: y + 6, size: 10, font: fonts.bold, color: ink });
    }
    return;
  }
}
