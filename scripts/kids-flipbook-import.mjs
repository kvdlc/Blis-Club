// Importador de Flipbooks de Artistly -> Imprimibles (con su PDF real).
// Uso: node scripts/kids-flipbook-import.mjs
// Toma los flipbooks nuevos del endpoint /api/internal/flipbooks, sube el PDF y la
// portada a Supabase y crea entradas en kids_printables (descarga de PDF).
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core";
import { createClient } from "@supabase/supabase-js";

const REPO = process.cwd();
const DIR = "C:\\Users\\kevin\\AppData\\Local\\Temp\\opencode\\kids-artistly";
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

function env() {
  const e = {};
  for (const line of fs.readFileSync(path.join(REPO, ".env.local"), "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) e[m[1]] = m[2].trim();
  }
  return e;
}
const E = env();
const supabase = createClient(E.NEXT_PUBLIC_SUPABASE_URL, E.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const TYPE_CAT = { story_book: "cuento", coloring_book: "colorear", joke_book: "chistes", nursery_rhymes: "cuento" };
const slugify = (s) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 60);

const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const ctx = await browser.newContext({ storageState: `${DIR}\\state.json` });
const page = await ctx.newPage();
await page.goto("https://app.artistly.ai/flipbook", { waitUntil: "domcontentloaded", timeout: 60000 });

const res = await page.request.get("https://app.artistly.ai/api/internal/flipbooks");
const since = Date.now() - 3 * 24 * 60 * 60 * 1000; // solo los últimos 3 días
const books = ((await res.json())?.data ?? []).filter(
  (b) => b.status === "ready" && b.pdf_url && new Date(b.created_at || 0).getTime() >= since,
);

let imported = 0;
for (const b of books) {
  const { data: existing } = await supabase.from("kids_printables").select("id").eq("title", b.title).maybeSingle();
  if (existing?.id) continue;
  try {
    const pdfBytes = Buffer.from(await (await page.request.get(b.pdf_url)).body());
    const coverBytes = b.cover_image ? Buffer.from(await (await page.request.get(b.cover_image)).body()) : null;
    const base = `official/flipbooks/${slugify(b.title)}-${Date.now()}`;
    const pdfUp = await supabase.storage.from("kids-assets").upload(`${base}.pdf`, pdfBytes, { contentType: "application/pdf", upsert: true });
    if (pdfUp.error) throw new Error(pdfUp.error.message);
    const pdfUrl = supabase.storage.from("kids-assets").getPublicUrl(`${base}.pdf`).data.publicUrl;
    let coverUrl = null;
    if (coverBytes) {
      const cUp = await supabase.storage.from("kids-assets").upload(`${base}.png`, coverBytes, { contentType: "image/png", upsert: true });
      if (!cUp.error) coverUrl = supabase.storage.from("kids-assets").getPublicUrl(`${base}.png`).data.publicUrl;
    }
    await supabase.from("kids_printables").insert({
      user_id: null,
      category_slug: TYPE_CAT[b.type] || "cuento",
      title: b.title,
      description: `Libro generado con Artistly (${b.pages_count} páginas). Descárgalo en PDF e imprímelo.`,
      cover_url: coverUrl,
      pdf_url: pdfUrl,
      pages: b.pages_count || 1,
      age_min: 4, age_max: 9, difficulty: "facil",
      is_free: true, is_published: true,
      tags: ["imprimible", "flipbook", b.type],
    });
    imported++;
    console.log("✓", b.title, "->", b.type);
  } catch (e) {
    console.log("✗", b.title, e.message);
  }
}
console.log(`\n== Flipbooks importados: ${imported}/${books.length} ==`);
await browser.close();
