import { NextResponse } from "next/server";
import { generateStructuredContent, checkRateLimit, getRateLimitReset } from "@/lib/gemini";
import { buildLessonPrompt } from "@/lib/gemini-prompts";

export async function POST(request: Request) {
  try {
    const endpoint = "ai/generate-lesson";
    if (!checkRateLimit(endpoint)) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again later.", retryAfter: getRateLimitReset(endpoint) },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { prompt, type, moduleTitle } = body;

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "prompt is required" }, { status: 400 });
    }
    if (!type || typeof type !== "string") {
      return NextResponse.json({ error: "type is required" }, { status: 400 });
    }

    const fullPrompt = buildLessonPrompt({ prompt, type, moduleTitle: moduleTitle || "General" });
    const { text, json } = await generateStructuredContent(fullPrompt);

    if (!json) {
      return NextResponse.json(
        { error: "AI did not return valid JSON", raw: text },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, content_json: json, raw: text });
  } catch (error) {
    console.error("[AI Generate Lesson] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate lesson" },
      { status: 500 }
    );
  }
}
