import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Gemini AI Configuration
 * Requires GEMINI_API_KEY environment variable.
 */
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

function getGeminiAI(): GoogleGenerativeAI {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY environment variable is required");
  }
  return new GoogleGenerativeAI(GEMINI_API_KEY);
}

/** Model selection — using Gemini 2.5 Pro for maximum quality */
export const AI_MODEL = "gemini-2.5-pro";

/** Rate limiting: in-memory store (resets on server restart) */
const requestTimestamps: Record<string, number[]> = {};

const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10;   // max 10 requests per endpoint per minute

export function checkRateLimit(endpoint: string): boolean {
  const now = Date.now();
  const timestamps = requestTimestamps[endpoint] || [];
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  requestTimestamps[endpoint] = recent;

  if (recent.length >= RATE_LIMIT_MAX_REQUESTS) {
    return false; // rate limited
  }

  recent.push(now);
  return true;
}

export function getRateLimitReset(endpoint: string): number {
  const timestamps = requestTimestamps[endpoint] || [];
  if (timestamps.length === 0) return 0;
  const oldest = timestamps[0];
  return Math.ceil((oldest + RATE_LIMIT_WINDOW_MS - Date.now()) / 1000);
}

/** Generate content with structured output */
export async function generateStructuredContent<T>(
  prompt: string,
  modelName: string = AI_MODEL
): Promise<{ text: string; json: T | null }> {
  const genAI = getGeminiAI();
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 8192,
    },
  });

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  // Try to extract JSON from code blocks or raw text
  let json: T | null = null;
  try {
    const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    const jsonStr = codeBlockMatch ? codeBlockMatch[1] : text;
    json = JSON.parse(jsonStr) as T;
  } catch {
    // JSON parsing failed — return raw text and null json
  }

  return { text, json };
}
