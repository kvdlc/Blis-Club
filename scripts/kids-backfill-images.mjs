// Genera y sube las imágenes de Kids Club (actividades, cuentos, categorías e imprimibles).
// Usa Venice y cae automáticamente a Gemini (imagen) si Venice no está disponible.
// Uso: node scripts/kids-backfill-images.mjs
import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

function loadEnv() {
  const env = {};
  const txt = fs.readFileSync(".env.local", "utf8");
  for (const line of txt.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].trim();
  }
  return env;
}

const env = loadEnv();
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE = env.SUPABASE_SERVICE_ROLE_KEY;
const VENICE_KEY = env.VENICE_API_KEY;
const GEMINI_KEY = env.GEMINI_API_KEY;

if (!SUPABASE_URL || !SERVICE) throw new Error("Faltan credenciales de Supabase en .env.local");

const supabase = createClient(SUPABASE_URL, SERVICE, { auth: { persistSession: false } });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function veniceImage(prompt) {
  const res = await fetch("https://api.venice.ai/api/v1/images/generations", {
    method: "POST",
    headers: { Authorization: `Bearer ${VENICE_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "flux-2-pro", prompt, n: 1, size: "1024x1024", response_format: "url" }),
  });
  if (!res.ok) throw new Error(`venice ${res.status}`);
  const data = await res.json();
  const url = data?.data?.[0]?.url;
  if (!url) throw new Error("venice sin url");
  const img = await fetch(url);
  if (!img.ok) throw new Error(`venice descarga ${img.status}`);
  return { bytes: Buffer.from(await img.arrayBuffer()), contentType: img.headers.get("content-type") || "image/png", provider: "venice" };
}

async function geminiImage(prompt) {
  const models = ["gemini-2.5-flash-image", "gemini-3.1-flash-image", "gemini-3-pro-image-preview"];
  let last = "gemini error";
  for (const model of models) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(GEMINI_KEY)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseModalities: ["IMAGE"] } }),
      },
    );
    if (!res.ok) { last = `gemini ${model} ${res.status}`; continue; }
    const data = await res.json();
    const part = (data?.candidates?.[0]?.content?.parts ?? []).find((p) => p?.inlineData?.data);
    if (part) return { bytes: Buffer.from(part.inlineData.data, "base64"), contentType: part.inlineData.mimeType || "image/png", provider: "gemini" };
    last = `gemini ${model} sin imagen`;
  }
  throw new Error(last);
}

async function generate(prompt) {
  try { return await veniceImage(prompt); }
  catch (e) { process.stdout.write(`[venice→gemini] `); return await geminiImage(prompt); }
}

let uploaded = 0;
async function upload(bytes, contentType, folder, name) {
  const ext = contentType.includes("png") ? "png" : "jpg";
  const path = `official/${folder}/${name}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
  const { error } = await supabase.storage.from("kids-assets").upload(path, bytes, { contentType, upsert: false });
  if (error) throw new Error(`upload: ${error.message}`);
  uploaded++;
  return supabase.storage.from("kids-assets").getPublicUrl(path).data.publicUrl;
}

// ── Prompts ──────────────────────────────────────────────────
const lineArt = (s) =>
  `Coloring book page for young children: ${s}. Pure black and white line art, thick clean outlines, no shading, no gray, no color, large simple shapes, plenty of white space, centered composition, plain white background. No text, no letters, no watermark.`;
const colorCover = (s) =>
  `Children's storybook illustration in a cute, friendly cartoon style: ${s}. Bright cheerful colors, soft rounded shapes, simple background, whimsical, suitable for ages 4 to 8, centered. No text, no letters, no watermark.`;
const icon = (s) =>
  `Cute colorful flat illustration icon representing ${s}. Simple playful shapes, centered on a plain white background, children's app icon style. No text, no letters, no watermark.`;

// ── Definición de trabajos ───────────────────────────────────
const ACTIVITY_JOBS = [
  { title: "Estrella feliz", kind: "lineart", subject: "a big happy star with a smiling face and three little stars around it" },
  { title: "Pecesito del mar", kind: "lineart", subject: "a cute fish swimming with bubbles and a small fin" },
  { title: "Casita del bosque", kind: "lineart", subject: "a cozy little house with a tree and a sun in a forest" },
  { title: "La estrella marina", kind: "lineart", subject: "a starfish on the sand with small shells" },
  { title: "El cohete espacial", kind: "lineart", subject: "a rocket flying among stars and planets" },
  { title: "Animales de la granja", kind: "color", subject: "farm animals: a cow, a duck, a cat and a dog together in a green field" },
  { title: "Frutas divertidas", kind: "color", subject: "colorful fruits: a mango, a pear, grapes, a kiwi and a blackberry with happy faces" },
  { title: "Ayuda al conejo", kind: "color", subject: "a cute rabbit looking at a big carrot at the end of a garden path" },
  { title: "Tito el gatito viajero", kind: "color", subject: "a cute kitten with a butterfly in a colorful garden" },
];

const STORY_ACTIVITY_PAGES = {
  "Tito el gatito viajero": [
    "a cute gray kitten sitting in front of a little blue house, children illustration",
    "a cute kitten meeting a friendly butterfly in a sunny meadow, children illustration",
    "a cute kitten and a butterfly in a garden full of colorful flowers, children illustration",
    "a happy kitten back home at the door of a blue house, children illustration",
  ],
};

const CATEGORY_JOBS = [
  { slug: "colorear", subject: "a box of crayons and a paintbrush with colorful paint" },
  { slug: "crucigrama", subject: "a crossword puzzle grid with a pencil" },
  { slug: "laberinto", subject: "a maze with a cute character finding the way" },
  { slug: "sopa_letras", subject: "scattered alphabet letters in a word search grid" },
  { slug: "unir_puntos", subject: "numbered dots forming a star shape" },
  { slug: "cuento", subject: "an open storybook with a glowing star and a rainbow" },
];

const PRINTABLE_JOBS = [
  { title: "Crucigrama de transportes", kind: "color", subject: "a car, a train, an airplane and a boat together" },
  { title: "Sopa de letras: frutas", kind: "color", subject: "colorful fruits: an apple, a banana, a strawberry, a watermelon, an orange and grapes" },
  { title: "Laberinto del tesoro", kind: "color", subject: "a friendly little dragon guarding a treasure chest" },
  { title: "Unir puntos: estrella de mar", kind: "lineart", subject: "a starfish and a small fish under the sea" },
  { title: "Lamina para colorear: gatito", kind: "lineart", subject: "a playful kitten with a ball of yarn" },
  { title: "Cuento: la nube viajera", kind: "color", subject: "a cute smiling cloud floating in a bright blue sky" },
];

const PROMPT = { lineart: lineArt, color: colorCover, icon };
const slugify = (s) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

async function runPool(jobs, worker, concurrency = 3) {
  let i = 0;
  const results = [];
  async function next() {
    while (i < jobs.length) {
      const idx = i++;
      try { results[idx] = await worker(jobs[idx], idx); }
      catch (e) { results[idx] = { error: String(e) }; }
    }
  }
  await Promise.all(Array.from({ length: concurrency }, next));
  return results;
}

async function main() {
  console.log("== Kids backfill de imágenes ==");
  console.log(`Supabase: ${SUPABASE_URL}`);

  // ── Actividades ──
  const { data: activities } = await supabase.from("kids_activities").select("id,title,category_slug,data").is("user_id", null);
  const byTitle = new Map((activities ?? []).map((a) => [a.title, a]));
  console.log(`Actividades oficiales: ${activities?.length ?? 0}`);

  await runPool(ACTIVITY_JOBS, async (job) => {
    const act = byTitle.get(job.title);
    if (!act) return { skip: job.title };
    const prompt = PROMPT[job.kind](job.subject);
    const img = await generate(prompt);
    const url = await upload(img.bytes, img.contentType, "activities", slugify(job.title));
    const patch = { cover_url: url };
    if (act.category_slug === "colorear") patch.data = { ...(act.data ?? {}), image_url: url };
    const { error } = await supabase.from("kids_activities").update(patch).eq("id", act.id);
    if (error) throw new Error(error.message);
    console.log(`✓ actividad [${img.provider}] ${job.title}`);
    return { title: job.title, url };
  }, 3);

  // ── Páginas de cuentos de actividades ──
  for (const [storyTitle, prompts] of Object.entries(STORY_ACTIVITY_PAGES)) {
    const act = byTitle.get(storyTitle);
    if (!act) continue;
    const pages = [...(act.data?.pages ?? [])];
    for (let p = 0; p < prompts.length && p < pages.length; p++) {
      try {
        const img = await generate(colorCover(prompts[p]));
        const url = await upload(img.bytes, img.contentType, "stories", slugify(storyTitle) + "-p" + (p + 1));
        pages[p] = { ...pages[p], image_url: url };
        console.log(`✓ cuento [${img.provider}] ${storyTitle} p${p + 1}`);
      } catch (e) { console.log(`✗ cuento ${storyTitle} p${p + 1}: ${e}`); }
    }
    await supabase.from("kids_activities").update({ data: { ...(act.data ?? {}), pages } }).eq("id", act.id);
  }

  // ── Categorías ──
  const { data: cats } = await supabase.from("kids_categories").select("id,slug");
  await runPool(CATEGORY_JOBS, async (job) => {
    const cat = (cats ?? []).find((c) => c.slug === job.slug);
    if (!cat) return { skip: job.slug };
    const img = await generate(icon(job.subject));
    const url = await upload(img.bytes, img.contentType, "categories", job.slug);
    await supabase.from("kids_categories").update({ cover_url: url }).eq("id", cat.id);
    console.log(`✓ categoría [${img.provider}] ${job.slug}`);
    return { slug: job.slug, url };
  }, 3);

  // ── Imprimibles ──
  const { data: printables } = await supabase.from("kids_printables").select("id,title,category_slug,data").is("user_id", null);
  const pByTitle = new Map((printables ?? []).map((p) => [p.title, p]));
  await runPool(PRINTABLE_JOBS, async (job) => {
    const item = pByTitle.get(job.title);
    if (!item) return { skip: job.title };
    const img = await generate(PROMPT[job.kind](job.subject));
    const url = await upload(img.bytes, img.contentType, "printables", slugify(job.title));
    const patch = { cover_url: url };
    if (item.category_slug === "colorear") patch.data = { ...(item.data ?? {}), image_url: url };
    await supabase.from("kids_printables").update(patch).eq("id", item.id);
    console.log(`✓ imprimible [${img.provider}] ${job.title}`);
    return { title: job.title, url };
  }, 3);

  // Páginas del cuento imprimible (prompts ya definidos en data.pages[].prompt)
  const storyPrintable = pByTitle.get("Cuento: la nube viajera");
  if (storyPrintable) {
    const pages = [...(storyPrintable.data?.pages ?? [])];
    for (let p = 0; p < pages.length; p++) {
      if (!pages[p]?.prompt) continue;
      try {
        const img = await generate(colorCover(pages[p].prompt));
        const url = await upload(img.bytes, img.contentType, "printables-story", "nube-viajera-p" + (p + 1));
        pages[p] = { ...pages[p], image_url: url };
        console.log(`✓ imprimible cuento [${img.provider}] p${p + 1}`);
      } catch (e) { console.log(`✗ imprimible cuento p${p + 1}: ${e}`); }
    }
    await supabase.from("kids_printables").update({ data: { ...(storyPrintable.data ?? {}), pages } }).eq("id", storyPrintable.id);
  }

  console.log(`\n== Listo. Imágenes subidas: ${uploaded} ==`);
}

main().catch((e) => { console.error("FATAL", e); process.exit(1); });
