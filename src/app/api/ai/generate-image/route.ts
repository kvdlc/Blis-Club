import { NextResponse } from "next/server";
import { generateImage, buildRecipeImagePrompt } from "@/lib/venice-image";
import { checkRateLimit, getRateLimitReset } from "@/lib/gemini"; // Reuse rate limiter

export async function POST(request: Request) {
  try {
    const endpoint = "ai/generate-image";
    if (!checkRateLimit(endpoint)) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again later.", retryAfter: getRateLimitReset(endpoint) },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { recipeDescription, model, size } = body;

    if (!recipeDescription || typeof recipeDescription !== "string") {
      return NextResponse.json({ error: "recipeDescription is required" }, { status: 400 });
    }

    const prompt = buildRecipeImagePrompt(recipeDescription);
    const result = await generateImage({
      prompt,
      model: model || "flux-2-pro",
      size: size || "1024x1024",
      n: 1,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error || "Image generation failed" }, { status: 502 });
    }

    return NextResponse.json({ success: true, imageUrl: result.url });
  } catch (error) {
    console.error("[AI Generate Image] Error:", error);
    return NextResponse.json({ error: "Failed to generate image" }, { status: 500 });
  }
}
