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

    const prompt = `Eres un asistente experto en nutrición canina. El usuario provee información de un alimento comercial (croqueta) y debes extraer los datos al JSON exacto abajo.

NO busques información adicional. NO inventes ni adivines valores faltantes. Deja los campos como null o [] si no están presentes.

INSTRUCCIONES POR CAMPO:

1. **official_name**: El nombre EXACTO del producto tal como aparece en "Nombre del Producto". NO modifiques, NO agregues números ni prefijos/sufijos. Copiar textualmente. null si no aparece.

2. **brand**: El fabricante/marca del campo "Fabricante". null si no aparece.

3. **description**: Una frase corta describiendo el producto, extraída del texto. null si no hay.

4. **category**: Siempre "croquetas".

5. **protein_type**: Extraer el sabor principal + porcentaje de proteína. Buscar en "Sabor Principal" o "Primer Ingrediente" para obtener el ingrediente (ej: "Pollo"). Buscar "Proteína Cruda" para obtener el % (ej: "30%" → 30). Formato EXACTO: "Pollo 30%". Si no hay %, solo el ingrediente. Si no hay información, "Croqueta comercial".

6. **kcal_per_100g**: Si aparece "Energía Metabolizable" o "Kcal/kg", convertir el valor: ej. "3800 Kcal/kg" → 380. Si no hay valor, null.

7. **nutrition_facts**: Extraer del "Análisis Nutricional" o "Análisis Garantizado". Reglas:
   - Valores en % → poner el mismo número en _g (ej: "Proteína: 27%" → protein_g: 27)
   - Calcio/Fósforo en % → convertir a mg (ej: "1.2%" → 1200mg)
   - Si hay múltiples valores (ej: "30% / 28%"), usar el PRIMER valor (30)
   - Omega-3/6: extraer número si existe, si no, null
   - Dejar null si el campo no aparece en el texto

8. **ingredients**: Extraer de "Lista de Ingredientes" o "Lista de Ingredientes Completa". Separar por comas. Para cada ítem, limpiar el nombre (quitar textos entre paréntesis como "(ingrediente principal)" o "(lista parcial...)"):
   {"ingredient_name": "nombre limpio", "quantity_per_serving_g": 0, "ingredient_type": "croqueta", "unit_type": "g", "unit_weight_g": 1, "display_unit": "g"}

9. **breed_sizes**: Extraer del campo "Tamaño de Raza". MAPEAR valores en español:
   - "Razas Pequeñas" o "Miniatura" → "miniatura"
   - "Razas Pequeñas" o "Pequeñas" → "pequena"
   - "Razas Medianas" → "mediana"
   - "Razas Grandes" → "grande"
   - "Razas Gigantes" → "gigante"
   - "Todos los tamaños" o "Todas las razas" → ["miniatura", "pequena", "mediana", "grande", "gigante"]
   Siempre retornar un array, aunque sea vacío.

10. **steps**: Siempre poner el step por defecto de servir la ración.

11. **benefits**: Extraer los "Beneficios Clave" como array de strings. Si no hay, [].

12. **health_tags**: Extraer claims de salud como array (ej: "alta digestibilidad", "salud intestinal", "piel saludable").

13. **storage_instructions**: Las "Indicaciones de Almacenamiento", o null.

14. **source_book**: Mismo valor que brand (fabricante). Si aparece una página web o dominio en la información del producto (ej: "www.bioalimentar.com"), incluirla al final: "Bioalimentar (bioalimentar.com)".

Información del producto:
"""
${query}
"""

Responde SOLO con el JSON. Sin markdown, sin bloques de código, sin texto adicional.

{
  "official_name": null,
  "brand": null,
  "description": null,
  "category": "croquetas",
  "difficulty": "facil",
  "prep_time_min": 0,
  "kcal_per_100g": null,
  "protein_type": "Croqueta comercial",
  "is_therapeutic": false,
  "is_detox": false,
  "health_tags": [],
  "source_book": null,
  "nutrition_facts": {
    "protein_g": null,
    "fat_g": null,
    "carbs_g": null,
    "fiber_g": null,
    "moisture_g": null,
    "ash_g": null,
    "calcium_mg": null,
    "phosphorus_mg": null,
    "iron_mg": null,
    "zinc_mg": null,
    "vitamin_a_ui": null,
    "vitamin_d_ui": null,
    "vitamin_e_mg": null,
    "omega3_g": null,
    "omega6_g": null
  },
  "ingredients": [],
  "steps": [
    {"instruction": "Servir la cantidad recomendada según el peso del perro.", "duration_min": 0}
  ],
  "breed_sizes": [],
  "calories_per_kg": null,
  "benefits": [],
  "storage_instructions": null
}`;

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
