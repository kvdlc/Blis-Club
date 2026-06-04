/**
 * Venice AI Image Generation Service
 * Uses Venice.ai API (OpenAI-compatible) for text-to-image generation.
 * Models: flux-2-pro, flux-2-max, gpt-image-2, etc.
 * Requires VENICE_API_KEY environment variable.
 */

const VENICE_API_KEY = process.env.VENICE_API_KEY;

function getVeniceKey(): string {
  if (!VENICE_API_KEY) {
    throw new Error("VENICE_API_KEY environment variable is required");
  }
  return VENICE_API_KEY;
}

const VENICE_BASE_URL = "https://api.venice.ai/api/v1";

interface GenerateImageParams {
  prompt: string;
  model?: string;
  size?: "1024x1024" | "1792x1024" | "1024x1792";
  n?: number;
}

export async function generateImage(params: GenerateImageParams): Promise<{
  success: boolean;
  url?: string;
  error?: string;
}> {
  const { prompt, model = "flux-2-pro", size = "1024x1024", n = 1 } = params;

  try {
    const res = await fetch(`${VENICE_BASE_URL}/images/generations`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getVeniceKey()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        prompt,
        n,
        size,
        response_format: "url",
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("[Venice Image] HTTP error:", res.status, errText);
      return { success: false, error: `HTTP ${res.status}: ${errText}` };
    }

    const data = await res.json();

    if (data.data && data.data.length > 0 && data.data[0].url) {
      return { success: true, url: data.data[0].url };
    }

    return { success: false, error: "No image URL in response" };
  } catch (e) {
    console.error("[Venice Image] Error:", e);
    return { success: false, error: String(e) };
  }
}

/** Build an optimized prompt for recipe food photography */
export function buildRecipeImagePrompt(recipeDescription: string): string {
  return `Professional food photography, top-down flat lay view of a healthy homemade dog meal: ${recipeDescription}. Served in a modern ceramic pet food bowl, isolated on pure clean white background (#FFFFFF), square format, soft diffused natural lighting from above, appetizing presentation, restaurant-quality food styling, minimal composition, sharp focus, 8k ultra detailed, vibrant natural colors. NO text, NO letters, NO words, NO typography, NO watermarks, NO logos`;
}
