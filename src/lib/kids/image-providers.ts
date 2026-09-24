import { createServiceClient } from "@/lib/supabase/service";

// ─────────────────────────────────────────────────────────────
// Kids Club · Generador de imágenes configurable (Venice + Gemini/Imagen)
// La preferencia y las claves se leen de la tabla `api_keys` (is_global)
// y, si no existen, de variables de entorno.
// ─────────────────────────────────────────────────────────────

export type KidsImageProvider = "auto" | "venice" | "gemini";

export interface KidsImageResult {
  success: boolean;
  provider: "venice" | "gemini";
  /** URL remota (Venice) */
  url?: string;
  /** Imagen en base64 (Gemini/Imagen) */
  b64?: string;
  mimeType?: string;
  prompt: string;
  error?: string;
}

interface ResolvedKeys {
  provider: KidsImageProvider;
  venice?: string;
  gemini?: string;
}

async function resolveKeys(preferred?: KidsImageProvider): Promise<ResolvedKeys> {
  const out: ResolvedKeys = {
    provider: preferred ?? "auto",
    venice: process.env.VENICE_API_KEY || undefined,
    gemini: process.env.GEMINI_API_KEY || undefined,
  };
  try {
    const supabase = createServiceClient();
    const { data } = await supabase
      .from("api_keys")
      .select("key_name, key_value")
      .eq("is_global", true)
      .in("key_name", ["venice_api_key", "gemini_api_key", "kids_image_provider"]);
    for (const row of data ?? []) {
      if (row.key_name === "venice_api_key" && row.key_value) out.venice = row.key_value;
      if (row.key_name === "gemini_api_key" && row.key_value) out.gemini = row.key_value;
      if (row.key_name === "kids_image_provider" && row.key_value && !preferred) {
        out.provider = row.key_value as KidsImageProvider;
      }
    }
  } catch {
    // sin DB: usar env
  }
  return out;
}

export async function getKidsImageConfig(): Promise<{
  provider: KidsImageProvider;
  venice: boolean;
  gemini: boolean;
}> {
  const keys = await resolveKeys();
  return { provider: keys.provider, venice: !!keys.venice, gemini: !!keys.gemini };
}

async function generateWithVenice(prompt: string, key: string): Promise<KidsImageResult> {
  const res = await fetch("https://api.venice.ai/api/v1/images/generations", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "flux-2-pro", prompt, n: 1, size: "1024x1024", response_format: "url" }),
  });
  if (!res.ok) {
    const t = await res.text();
    return { success: false, provider: "venice", prompt, error: `HTTP ${res.status}: ${t.slice(0, 300)}` };
  }
  const data = await res.json();
  const url = data?.data?.[0]?.url;
  if (!url) return { success: false, provider: "venice", prompt, error: "Sin URL en la respuesta" };
  return { success: true, provider: "venice", url, prompt };
}

async function generateWithGemini(prompt: string, key: string): Promise<KidsImageResult> {
  // Modelos de imagen de Gemini vía generateContent (inlineData)
  const models = ["gemini-2.5-flash-image", "gemini-3.1-flash-image", "gemini-3-pro-image-preview"];
  let lastError = "Sin respuesta de Gemini";
  for (const model of models) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseModalities: ["IMAGE"] },
          }),
        },
      );
      if (!res.ok) {
        const t = await res.text();
        lastError = `HTTP ${res.status}: ${t.slice(0, 300)}`;
        continue;
      }
      const data = await res.json();
      const parts = data?.candidates?.[0]?.content?.parts ?? [];
      const imgPart = parts.find((p: any) => p?.inlineData?.data);
      if (imgPart) {
        return {
          success: true,
          provider: "gemini",
          b64: imgPart.inlineData.data,
          mimeType: imgPart.inlineData.mimeType || "image/png",
          prompt,
        };
      }
      lastError = "Sin imagen en la respuesta";
    } catch (e) {
      lastError = String(e);
    }
  }
  return { success: false, provider: "gemini", prompt, error: lastError };
}

export async function generateKidsImage(
  prompt: string,
  preferred?: KidsImageProvider,
): Promise<KidsImageResult> {
  const keys = await resolveKeys(preferred);
  const order: ("venice" | "gemini")[] = [];
  if (keys.provider === "venice") order.push("venice", "gemini");
  else if (keys.provider === "gemini") order.push("gemini", "venice");
  else {
    // auto: el que tenga clave; venice primero si ambos
    if (keys.venice) order.push("venice");
    if (keys.gemini) order.push("gemini");
    if (!order.length) { order.push("venice"); order.push("gemini"); }
  }

  let lastError = "No hay proveedor de imágenes configurado";
  for (const provider of order) {
    const key = provider === "venice" ? keys.venice : keys.gemini;
    if (!key) continue;
    const result =
      provider === "venice" ? await generateWithVenice(prompt, key) : await generateWithGemini(prompt, key);
    if (result.success) return result;
    lastError = result.error || lastError;
  }
  return { success: false, provider: order[0] ?? "venice", prompt, error: lastError };
}

// ── Prompts por tipo de contenido ─────────────────────────────
export function buildKidsPrompt(category: string, subject: string): string {
  const s = subject.trim();
  switch (category) {
    case "colorear":
      return `Coloring book page for young children: ${s}. Pure black and white line art, thick clean outlines, no shading, no gray, no color, large simple shapes, plenty of white space, centered full-page composition, white background. No text, no letters, no watermark.`;
    case "cuento":
      return `Children's storybook illustration in a cute, friendly cartoon style: ${s}. Bright cheerful colors, soft rounded shapes, simple background, whimsical, suitable for ages 4-8. No text, no letters, no watermark.`;
    case "crucigrama":
    case "sopa_letras":
      return `Cheerful flat illustration icon for a kids word game about ${s}. Bright colors, simple shapes, white background, centered, playful. No text, no letters, no words, no watermark.`;
    case "laberinto":
      return `Cute cartoon character for a kids maze game: ${s}. Friendly, big eyes, bright colors, plain white background, centered. No text, no letters, no watermark.`;
    case "unir_puntos":
      return `Simple cute cartoon line drawing of ${s}, black and white outline, for a connect-the-dots activity. Thick clear lines, white background, centered. No text, no numbers, no watermark.`;
    default:
      return `Cute, bright, friendly illustration for children: ${s}. No text, no letters, no watermark.`;
  }
}

// ── Guardar una imagen generada en el bucket `kids-assets` ─────
export async function storeKidsGeneratedImage(
  result: KidsImageResult,
  userId: string,
): Promise<{ url: string } | { error: string }> {
  const supabase = createServiceClient();
  const stamp = Date.now();
  const rand = Math.random().toString(36).slice(2, 8);

  try {
    let bytes: ArrayBuffer;
    let contentType: string;
    let ext: string;

    if (result.b64) {
      const bin = Buffer.from(result.b64, "base64");
      bytes = bin.buffer.slice(bin.byteOffset, bin.byteOffset + bin.byteLength);
      contentType = result.mimeType || "image/png";
      ext = contentType.includes("jpeg") || contentType.includes("jpg") ? "jpg" : "png";
    } else if (result.url) {
      const imgRes = await fetch(result.url);
      if (!imgRes.ok) return { error: `No se pudo descargar la imagen (${imgRes.status})` };
      bytes = await imgRes.arrayBuffer();
      contentType = imgRes.headers.get("content-type") || "image/png";
      ext = contentType.includes("jpeg") || contentType.includes("jpg") ? "jpg" : "png";
    } else {
      return { error: "Resultado de imagen vacío" };
    }

    const path = `${userId}/generated/${stamp}-${rand}.${ext}`;
    const { error } = await supabase.storage
      .from("kids-assets")
      .upload(path, bytes, { contentType, upsert: false });
    if (error) return { error: error.message };

    const { data } = supabase.storage.from("kids-assets").getPublicUrl(path);
    return { url: data.publicUrl };
  } catch (e) {
    return { error: String(e) };
  }
}
