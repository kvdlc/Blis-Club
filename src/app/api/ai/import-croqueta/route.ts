import { NextResponse } from "next/server";
import { generateStructuredContent, checkRateLimit, getRateLimitReset } from "@/lib/gemini";

export async function POST(request: Request) {
  try {
    const endpoint = "ai/import-croqueta";
    if (!checkRateLimit(endpoint)) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again later.", retryAfter: getRateLimitReset(endpoint) },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { query } = body;

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "query is required" }, { status: 400 });
    }

    const prompt = `You are a pet nutrition database assistant. The user wants to import a commercial dog food (croqueta/kibble) into a recipe database.

Search query from user: "${query}"

Find the most accurate official product name and nutritional data. Return ONLY a JSON object with this exact structure (no markdown, no code blocks):

{
  "official_name": "Exact official product name, well-formatted",
  "brand": "Brand name",
  "description": "Short description of the product",
  "category": "croquetas",
  "difficulty": "facil",
  "prep_time_min": 0,
  "kcal_per_100g": 0,
  "protein_type": "Croqueta comercial",
  "is_therapeutic": false,
  "is_detox": false,
  "health_tags": [],
  "nutrition_facts": {
    "protein_g": 0,
    "fat_g": 0,
    "carbs_g": 0,
    "fiber_g": 0,
    "moisture_g": 0,
    "ash_g": 0,
    "calcium_mg": 0,
    "phosphorus_mg": 0,
    "iron_mg": 0,
    "zinc_mg": 0,
    "vitamin_a_ui": 0,
    "vitamin_d_ui": 0,
    "vitamin_e_mg": 0,
    "omega3_g": 0,
    "omega6_g": 0
  },
  "ingredients": [
    {"ingredient_name": "Nombre del ingrediente", "quantity_per_serving_g": 0, "ingredient_type": "otro", "unit_type": "g", "unit_weight_g": 1, "display_unit": "g"}
  ],
  "steps": [
    {"instruction": "Servir la cantidad recomendada según el peso del perro.", "duration_min": 0}
  ],
  "breed_sizes": ["pequeña", "mediana", "grande"],
  "image_search_query": "best search query to find product photo"
}

Important:
- official_name: Use the REAL official product name. Suggest corrections if the user's query was approximate.
- nutrition_facts: Use real values from the product's guaranteed analysis (%). Convert percentages to grams per 100g (e.g., 26% protein = 26g).
- breed_sizes: Array of breed sizes this product is for ("pequeña", "mediana", "grande", "gigante").
- image_search_query: Generate a precise search query to find the official product photo online.
- If you cannot find exact data, estimate from similar products by the same brand but clearly mark estimates.
- Respond ONLY with the JSON object.`;

    const { text, json } = await generateStructuredContent(prompt);

    if (!json) {
      return NextResponse.json(
        { error: "AI did not return valid JSON", raw: text },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, data: json, raw: text });
  } catch (error) {
    console.error("[AI Import Croqueta] Error:", error);
    return NextResponse.json(
      { error: "Failed to import croqueta" },
      { status: 500 }
    );
  }
}
