// Corrige portadas con riesgo de parecerse a personajes conocidos (peces),
// usando diseños originales. Uso: node scripts/kids-fix-fish.mjs
import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

function loadEnv() {
  const env = {};
  for (const line of fs.readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].trim();
  }
  return env;
}
const env = loadEnv();
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const STYLE =
  "Ultra-premium 3D computer-animated feature-film aesthetic, modern big-studio family animation, adorable stylized characters with large expressive eyes and soft rounded appealing features, cinematic global illumination, volumetric soft light, shallow depth of field, vibrant harmonious color grading, highly polished render, 4k. All characters are 100% original designs and do not resemble any existing copyrighted character or brand. No text, no letters, no watermark, no logo.";

const color = (scene) => `A heartwarming still from a premium 3D animated family movie: ${scene}. ${STYLE} Clean centered composition.`;

async function generate(prompt) {
  const res = await fetch("https://api.venice.ai/api/v1/images/generations", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.VENICE_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "flux-2-max", prompt, n: 1, size: "1024x1024", response_format: "url" }),
  });
  if (!res.ok) throw new Error(`venice ${res.status}`);
  const data = await res.json();
  const item = data?.data?.[0];
  if (!item) throw new Error("sin imagen");
  if (item.b64_json) return Buffer.from(item.b64_json, "base64");
  const url = item.url;
  if (url.startsWith("data:")) return Buffer.from(url.split(",")[1], "base64");
  const img = await fetch(url);
  return Buffer.from(await img.arrayBuffer());
}

async function upload(bytes, name) {
  const path = `official/v2/fixes/${name}-${Date.now()}.jpg`;
  const { error } = await supabase.storage.from("kids-assets").upload(path, bytes, { contentType: "image/jpeg", upsert: false });
  if (error) throw new Error(error.message);
  return supabase.storage.from("kids-assets").getPublicUrl(path).data.publicUrl;
}

const slug = (s) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-");

async function main() {
  // Actividades
  const acts = [
    { title: "Pecesito del mar", prompt: color("an adorable original little teal and yellow fish with big kind eyes swimming among bubbles in a colorful coral reef, unique original animal design") },
    { title: "La estrella marina", prompt: color("an adorable original purple starfish character resting on a sandy beach with little shells and a small original green fish, unique original animal design") },
  ];
  for (const a of acts) {
    const bytes = await generate(a.prompt);
    const url = await upload(bytes, slug(a.title));
    const { error } = await supabase.from("kids_activities").update({ cover_url: url }).eq("title", a.title).is("user_id", null);
    console.log(error ? `✗ ${a.title}: ${error.message}` : `✓ actividad ${a.title}`);
  }

  // Imprimible
  const pr = {
    title: "Unir puntos: estrella de mar",
    prompt: color("an adorable original purple starfish and a small original teal fish under the sea with bubbles, unique original animal designs"),
  };
  const bytes = await generate(pr.prompt);
  const url = await upload(bytes, slug(pr.title));
  const { error } = await supabase.from("kids_printables").update({ cover_url: url }).eq("title", pr.title).is("user_id", null);
  console.log(error ? `✗ ${pr.title}: ${error.message}` : `✓ imprimible ${pr.title}`);

  console.log("== Listo ==");
}
main().catch((e) => { console.error("FATAL", e); process.exit(1); });
