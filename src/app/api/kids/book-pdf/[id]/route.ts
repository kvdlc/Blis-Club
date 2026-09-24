import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { buildKidsPdf, type PdfPage } from "@/lib/kids/pdf";

export const maxDuration = 60;

function slug(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 60);
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const inline = new URL(req.url).searchParams.get("inline") === "1";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { data: activity } = await supabase.from("kids_activities").select("*").eq("id", id).maybeSingle();
  if (!activity) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const service = createServiceClient();
  const objPath = `official/pdfs/book-${id}.pdf`;

  let bytes: Uint8Array;
  const cached = await service.storage.from("kids-assets").download(objPath);
  if (cached.data) {
    bytes = new Uint8Array(await cached.data.arrayBuffer());
  } else {
    const raw = Array.isArray(activity.data?.pages) ? activity.data.pages : [];
    const pages: PdfPage[] = raw.map((p: any) => ({ image_url: p.image_url, text: p.text, i: p.i }));
    const firstPage = pages.find((p) => p.image_url)?.image_url ?? null;
    const built = await buildKidsPdf({
      title: activity.title,
      subtitle: activity.description ?? undefined,
      category: activity.category_slug,
      coverUrl: firstPage ?? activity.cover_url,
      ageText: `${activity.age_min}–${activity.age_max} años`,
      pages,
    });
    bytes = built;
    await service.storage.from("kids-assets").upload(objPath, Buffer.from(built), { contentType: "application/pdf", upsert: true });
  }

  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="${slug(activity.title)}.pdf"`,
      "Cache-Control": "public, max-age=86400",
    },
  });
}
