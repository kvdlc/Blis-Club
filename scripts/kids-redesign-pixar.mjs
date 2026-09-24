// Rediseña TODAS las imágenes de Kids Club con estilo de animación 3D premium
// (sin nombrar marcas), usando Venice flux-2-max + reintentos.
// Uso: node scripts/kids-redesign-pixar.mjs
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
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const VENICE_KEY = env.VENICE_API_KEY;
const MODEL = "flux-2-max";

// ── Súper prompt de estilo (sutil, sin marcas) ───────────────
const STYLE =
  "Ultra-premium 3D computer-animated feature-film aesthetic, modern big-studio family animation, adorable stylized characters with large expressive eyes and soft rounded appealing features, detailed fur and materials with subsurface scattering, cinematic global illumination, volumetric soft light, gentle rim light, shallow depth of field, vibrant harmonious color grading, rich crisp detail, professional character design, highly polished render, 4k.";

const color = (scene) =>
  `A heartwarming still from a premium 3D animated family movie: ${scene}. ${STYLE} Clean centered composition. No text, no letters, no words, no watermark, no logo.`;

const icon = (subject) =>
  `A premium 3D animated movie-style icon: ${subject}. ${STYLE} Centered on a clean soft pastel background, app icon style. No text, no letters, no words, no watermark, no logo.`;

const lineArt = (scene) =>
  `A coloring book page for young children: ${scene}. Clean black and white line art, bold smooth thick outlines, no shading, no gray, no color, large simple appealing shapes, plenty of white space, centered. No text, no letters, no words, no watermark.`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function veniceOnce(prompt, size) {
  const res = await fetch("https://api.venice.ai/api/v1/images/generations", {
    method: "POST",
    headers: { Authorization: `Bearer ${VENICE_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: MODEL, prompt, n: 1, size: size || "1024x1024", response_format: "url" }),
  });
  if (!res.ok) throw new Error(`venice ${res.status}`);
  const data = await res.json();
  const item = data?.data?.[0];
  if (!item) throw new Error("venice sin imagen");
  if (item.b64_json) return { bytes: Buffer.from(item.b64_json, "base64"), contentType: "image/jpeg" };
  const url = item.url;
  if (!url) throw new Error("venice sin url");
  if (url.startsWith("data:")) {
    const [meta, b64] = url.split(",");
    const mime = meta.match(/data:([^;]+)/)?.[1] || "image/jpeg";
    return { bytes: Buffer.from(b64, "base64"), contentType: mime };
  }
  const img = await fetch(url);
  if (!img.ok) throw new Error(`descarga ${img.status}`);
  return { bytes: Buffer.from(await img.arrayBuffer()), contentType: img.headers.get("content-type") || "image/png" };
}

async function generate(prompt, size) {
  let last = "";
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      return await veniceOnce(prompt, size);
    } catch (e) {
      last = String(e);
      process.stdout.write(`(intento ${attempt} falló: ${last}) `);
      await sleep(2500);
    }
  }
  throw new Error(last || "generación fallida");
}

let uploaded = 0;
async function upload(bytes, contentType, folder, name) {
  const ext = contentType.includes("png") ? "png" : "jpg";
  const path = `official/v2/${folder}/${name}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`;
  const { error } = await supabase.storage.from("kids-assets").upload(path, bytes, { contentType, upsert: false });
  if (error) throw new Error(error.message);
  uploaded++;
  return supabase.storage.from("kids-assets").getPublicUrl(path).data.publicUrl;
}

const slugify = (s) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

async function pool(jobs, worker, concurrency = 3) {
  let i = 0;
  async function next() {
    while (i < jobs.length) {
      const job = jobs[i++];
      try { await worker(job); } catch (e) { console.log(`✗ ${job.label}: ${e}`); }
    }
  }
  await Promise.all(Array.from({ length: concurrency }, next));
}

// ── Trabajos ─────────────────────────────────────────────────
const ACTIVITY_JOBS = [
  { label: "Estrella feliz (cover)", title: "Estrella feliz", field: "cover", prompt: color("an adorable smiling star character with a tiny cute face, surrounded by little twinkling stars in a dreamy night sky") },
  { label: "Estrella feliz (lámina)", title: "Estrella feliz", field: "page", prompt: lineArt("a big happy star with a smiling face and three little stars around it") },
  { label: "Pecesito del mar (cover)", title: "Pecesito del mar", field: "cover", prompt: color("an adorable little fish with big shiny eyes swimming with bubbles in a colorful coral reef") },
  { label: "Pecesito del mar (lámina)", title: "Pecesito del mar", field: "page", prompt: lineArt("a cute fish swimming with bubbles and a small fin") },
  { label: "Casita del bosque (cover)", title: "Casita del bosque", field: "cover", prompt: color("a cozy little cottage in a sunny forest with a big friendly tree and a smiling sun") },
  { label: "Casita del bosque (lámina)", title: "Casita del bosque", field: "page", prompt: lineArt("a cozy little house with a tree and a sun in a forest") },
  { label: "La estrella marina", title: "La estrella marina", field: "cover", prompt: color("an adorable starfish character on a sandy beach with little shells and a friendly small fish") },
  { label: "El cohete espacial", title: "El cohete espacial", field: "cover", prompt: color("a cute rocket ship zooming through space among colorful planets and twinkling stars") },
  { label: "Animales de la granja", title: "Animales de la granja", field: "cover", prompt: color("an adorable group of farm animals, a cow, a duck, a cat and a dog together in a sunny green field") },
  { label: "Frutas divertidas", title: "Frutas divertidas", field: "cover", prompt: color("adorable smiling fruits: a mango, a pear, grapes, a kiwi and a blackberry, colorful and cheerful") },
  { label: "Ayuda al conejo", title: "Ayuda al conejo", field: "cover", prompt: color("an adorable fluffy rabbit looking at a big juicy carrot in a sunny garden path") },
  { label: "Tito (cover)", title: "Tito el gatito viajero", field: "cover", prompt: color("an adorable gray kitten with a butterfly in a colorful flower garden") },
];

const STORY_ACTIVITY_PAGES = {
  "Tito el gatito viajero": [
    color("an adorable gray kitten sitting happily in front of a little blue house"),
    color("an adorable gray kitten meeting a friendly colorful butterfly in a sunny meadow"),
    color("an adorable gray kitten and a butterfly in a garden full of colorful flowers"),
    color("a happy adorable gray kitten back at the door of a little blue house"),
  ],
};

const CATEGORY_JOBS = [
  { slug: "colorear", subject: "a box of crayons and a paintbrush with colorful paint" },
  { slug: "crucigrama", subject: "a crossword puzzle grid with a pencil" },
  { slug: "laberinto", subject: "a maze with a cute little character finding the way" },
  { slug: "sopa_letras", subject: "colorful alphabet letters scattered in a word grid" },
  { slug: "unir_puntos", subject: "numbered dots forming a star shape" },
  { slug: "cuento", subject: "an open storybook with a glowing star and a rainbow" },
];

const PRINTABLE_JOBS = [
  { title: "Crucigrama de transportes", field: "cover", prompt: color("an adorable car, a train, an airplane and a boat together on a sunny day") },
  { title: "Sopa de letras: frutas", field: "cover", prompt: color("adorable smiling fruits: an apple, a banana, a strawberry, a watermelon, an orange and grapes") },
  { title: "Laberinto del tesoro", field: "cover", prompt: color("an adorable little friendly dragon guarding a treasure chest full of gold") },
  { title: "Unir puntos: estrella de mar", field: "cover", prompt: color("an adorable starfish and a little fish under the sea with bubbles") },
  { title: "Lamina para colorear: gatito", field: "cover", prompt: color("an adorable playful kitten with a ball of yarn") },
  { title: "Lamina para colorear: gatito", field: "page", prompt: lineArt("a playful kitten with a ball of yarn") },
  { title: "Cuento: la nube viajera", field: "cover", prompt: color("an adorable smiling cloud character floating in a bright blue sky") },
];

const PRINTABLE_STORY_PAGES = {
  "Cuento: la nube viajera": [
    color("an adorable little cloud character floating in a bright blue sky, curious and happy"),
    color("an adorable cloud flying over green mountains and a winding river"),
    color("an adorable cloud and a little bird playing together in the sky"),
    color("an adorable cloud at sunset over a cozy little house"),
  ],
};

async function main() {
  console.log("== Kids · rediseño estilo animación 3D ==");

  const { data: acts } = await supabase.from("kids_activities").select("id,title,category_slug,data").is("user_id", null);
  const byTitle = new Map((acts ?? []).map((a) => [a.title, a]));

  await pool(ACTIVITY_JOBS, async (job) => {
    const act = byTitle.get(job.title);
    if (!act) return;
    const img = await generate(job.prompt);
    const url = await upload(img.bytes, img.contentType, "activities", slugify(job.title) + "-" + job.field);
    if (job.field === "cover") {
      await supabase.from("kids_activities").update({ cover_url: url }).eq("id", act.id);
    } else {
      await supabase.from("kids_activities").update({ data: { ...(act.data ?? {}), image_url: url } }).eq("id", act.id);
    }
    console.log(`✓ ${job.label}`);
  }, 3);

  for (const [title, prompts] of Object.entries(STORY_ACTIVITY_PAGES)) {
    const act = byTitle.get(title);
    if (!act) continue;
    const pages = [...(act.data?.pages ?? [])];
    for (let p = 0; p < prompts.length && p < pages.length; p++) {
      try {
        const img = await generate(prompts[p]);
        const url = await upload(img.bytes, img.contentType, "stories", slugify(title) + "-p" + (p + 1));
        pages[p] = { ...pages[p], image_url: url };
        console.log(`✓ ${title} p${p + 1}`);
      } catch (e) { console.log(`✗ ${title} p${p + 1}: ${e}`); }
    }
    await supabase.from("kids_activities").update({ data: { ...(act.data ?? {}), pages } }).eq("id", act.id);
  }

  const { data: cats } = await supabase.from("kids_categories").select("id,slug");
  await pool(CATEGORY_JOBS, async (job) => {
    const cat = (cats ?? []).find((c) => c.slug === job.slug);
    if (!cat) return;
    const img = await generate(icon(job.subject));
    const url = await upload(img.bytes, img.contentType, "categories", job.slug);
    await supabase.from("kids_categories").update({ cover_url: url }).eq("id", cat.id);
    console.log(`✓ categoría ${job.slug}`);
  }, 3);

  const { data: printables } = await supabase.from("kids_printables").select("id,title,category_slug,data").is("user_id", null);
  const pByTitle = new Map((printables ?? []).map((p) => [p.title, p]));
  await pool(PRINTABLE_JOBS, async (job) => {
    const item = pByTitle.get(job.title);
    if (!item) return;
    const img = await generate(job.prompt);
    const url = await upload(img.bytes, img.contentType, "printables", slugify(job.title) + "-" + job.field);
    if (job.field === "cover") {
      await supabase.from("kids_printables").update({ cover_url: url }).eq("id", item.id);
    } else {
      await supabase.from("kids_printables").update({ data: { ...(item.data ?? {}), image_url: url } }).eq("id", item.id);
    }
    console.log(`✓ imprimible ${job.title} (${job.field})`);
  }, 3);

  const story = pByTitle.get("Cuento: la nube viajera");
  if (story) {
    const pages = [...(story.data?.pages ?? [])];
    for (let p = 0; p < pages.length; p++) {
      if (!pages[p]?.prompt) { pages[p] = { ...pages[p] }; continue; }
      try {
        const img = await generate(color(pages[p].prompt));
        const url = await upload(img.bytes, img.contentType, "printables-story", "nube-p" + (p + 1));
        pages[p] = { ...pages[p], image_url: url };
        console.log(`✓ imprimible cuento p${p + 1}`);
      } catch (e) { console.log(`✗ imprimible cuento p${p + 1}: ${e}`); }
    }
    await supabase.from("kids_printables").update({ data: { ...(story.data ?? {}), pages } }).eq("id", story.id);
  }

  console.log(`\n== Listo. Imágenes subidas: ${uploaded} ==`);
}

main().catch((e) => { console.error("FATAL", e); process.exit(1); });
