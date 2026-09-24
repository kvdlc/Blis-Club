// Genera las imágenes de marketing (web) con Venice y escribe src/lib/kids/web-images.ts
// Uso: node scripts/kids-web-images.mjs
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

function loadEnv() {
  const e = {};
  for (const line of fs.readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) e[m[1]] = m[2].trim();
  }
  return e;
}
const env = loadEnv();
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const MODEL = "flux-2-max";

const STYLE =
  "Ultra-premium 3D computer-animated family film aesthetic, modern big-studio animation, expressive characters with big eyes and soft rounded features, cinematic warm lighting, shallow depth of field, vibrant harmonious colors, highly polished render, 4k. 100% original characters, not resembling any existing copyrighted character. No text, no letters, no watermark, no logo.";

const JOBS = [
  { key: "hero", prompt: `A joyful family (a mother, a father, a little girl and a little boy) sitting together at a cozy table, coloring pages and doing puzzles, warm magical sparkles around them, happy and calm. ${STYLE}` },
  { key: "pain_books", prompt: `A tired parent standing beside an enormous tall pile of coloring books stacked to the ceiling, overwhelmed funny expression, cozy living room. ${STYLE}` },
  { key: "pain_bored", prompt: `A bored little child sitting in front of several identical blank uncolored pages, arms crossed, unimpressed expression, cozy room. ${STYLE}` },
  { key: "pain_screen", prompt: `A little child sitting alone absorbed by a tablet screen with a cold bluish glow in a cozy home, slightly sad lonely mood, gentle. ${STYLE}` },
  { key: "pain_time", prompt: `A tired parent at a desk late at night surrounded by messy papers and printouts, rubbing their forehead, cozy home, gentle. ${STYLE}` },
  { key: "fix_library", prompt: `A little child looking amazed at a magical floating library of colorful coloring pages, puzzles and books swirling like magic around them, glowing whimsical. ${STYLE}` },
  { key: "fix_print", prompt: `A happy little child coloring a freshly printed coloring page at a bright table, smiling proudly, warm light. ${STYLE}` },
  { key: "fix_story", prompt: `A parent and child cuddling while reading an illustrated storybook that glows softly with magic, warm and tender. ${STYLE}` },
  { key: "fix_puzzle", prompt: `A proud little child solving a fun crossword puzzle and a maze on a tablet, smiling, bright cheerful room. ${STYLE}` },
  { key: "avatar1", prompt: `A friendly cheerful portrait of a young mother, head and shoulders, neutral soft background. ${STYLE}` },
  { key: "avatar2", prompt: `A friendly cheerful portrait of a young father, head and shoulders, neutral soft background. ${STYLE}` },
  { key: "avatar3", prompt: `A friendly cheerful portrait of a mother with curly hair, head and shoulders, neutral soft background. ${STYLE}` },
  { key: "avatar4", prompt: `A friendly cheerful portrait of a father with a beard, head and shoulders, neutral soft background. ${STYLE}` },
];

async function gen(prompt) {
  for (let a = 1; a <= 3; a++) {
    try {
      const res = await fetch("https://api.venice.ai/api/v1/images/generations", {
        method: "POST",
        headers: { Authorization: `Bearer ${env.VENICE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: MODEL, prompt, n: 1, size: "1024x1024", response_format: "url" }),
      });
      if (!res.ok) throw new Error(`venice ${res.status}`);
      const data = await res.json();
      const item = data?.data?.[0];
      if (item?.b64_json) return Buffer.from(item.b64_json, "base64");
      const url = item?.url;
      if (!url) throw new Error("sin url");
      if (url.startsWith("data:")) return Buffer.from(url.split(",")[1], "base64");
      const img = await fetch(url);
      return Buffer.from(await img.arrayBuffer());
    } catch (e) {
      if (a === 3) throw e;
      await new Promise((r) => setTimeout(r, 2500));
    }
  }
}

async function upload(bytes, key) {
  const p = `official/web/${key}-${Date.now()}.png`;
  const { error } = await supabase.storage.from("kids-assets").upload(p, bytes, { contentType: "image/png", upsert: true });
  if (error) throw new Error(error.message);
  return supabase.storage.from("kids-assets").getPublicUrl(p).data.publicUrl;
}

const out = {};
for (const j of JOBS) {
  try {
    const bytes = await gen(j.prompt);
    out[j.key] = await upload(bytes, j.key);
    console.log("✓", j.key);
  } catch (e) {
    console.log("✗", j.key, e.message);
  }
}

const ts = `// Imágenes de marketing de la web de Kids Club (generadas con IA).
export const WEB_IMAGES = ${JSON.stringify(out, null, 2)} as Record<string, string>;
`;
const dest = path.join("src", "lib", "kids", "web-images.ts");
fs.writeFileSync(dest, ts);
console.log("Escrito", dest, "con", Object.keys(out).length, "imágenes");
