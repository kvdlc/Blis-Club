import { NextResponse } from "next/server";
import { generateStructuredContent, checkRateLimit, getRateLimitReset } from "@/lib/gemini";
import { buildRecipePrompt } from "@/lib/gemini-prompts";

export async function POST(request: Request) {
  try {
    const endpoint = "ai/generate-recipe";
    if (!checkRateLimit(endpoint)) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again later.", retryAfter: getRateLimitReset(endpoint) },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { prompt, category, difficulty } = body;

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "prompt is required" }, { status: 400 });
    }

    const fullPrompt = buildRecipePrompt({ prompt, category, difficulty });
    const { text, json } = await generateStructuredContent(fullPrompt);

    if (!json) {
      return NextResponse.json(
        { error: "AI did not return valid JSON", raw: text },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, recipe: json, raw: text });
  } catch (error) {
    console.error("[AI Generate Recipe] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate recipe" },
      { status: 500 }
    );
  }
}
