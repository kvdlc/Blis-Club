import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, getRateLimitReset } from "@/lib/gemini";
import {
  buildKidsPrompt,
  generateKidsImage,
  getKidsImageConfig,
  storeKidsGeneratedImage,
  type KidsImageProvider,
} from "@/lib/kids/image-providers";

export const maxDuration = 60;

export async function GET() {
  const config = await getKidsImageConfig();
  return NextResponse.json(config);
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const endpoint = `kids-generate-${user.id}`;
    if (!checkRateLimit(endpoint)) {
      return NextResponse.json(
        { error: "Demasiadas creaciones seguidas. Espera un momento.", retryAfter: getRateLimitReset(endpoint) },
        { status: 429 },
      );
    }

    const body = await request.json().catch(() => ({}));
    const category: string = body.category || "colorear";
    const subject: string = (body.subject || "").trim();
    const provider: KidsImageProvider | undefined = body.provider || undefined;

    if (!subject || subject.length < 3) {
      return NextResponse.json({ error: "Describe lo que quieres crear (mínimo 3 letras)." }, { status: 400 });
    }
    if (subject.length > 300) {
      return NextResponse.json({ error: "La descripción es demasiado larga." }, { status: 400 });
    }

    const prompt = buildKidsPrompt(category, subject);
    const result = await generateKidsImage(prompt, provider);

    if (!result.success) {
      return NextResponse.json({ error: result.error || "No se pudo generar la imagen", provider: result.provider }, { status: 502 });
    }

    const stored = await storeKidsGeneratedImage(result, user.id);
    if ("error" in stored) {
      return NextResponse.json({ error: `La imagen se generó pero no se pudo guardar: ${stored.error}` }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      imageUrl: stored.url,
      provider: result.provider,
      prompt,
    });
  } catch (error) {
    console.error("[Kids Generate] Error:", error);
    return NextResponse.json({ error: "Error al generar la imagen" }, { status: 500 });
  }
}
