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

  const { data: printable } = await supabase.from("kids_printables").select("*").eq("id", id).maybeSingle();
  if (!printable) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const service = createServiceClient();
  const objPath = `official/pdfs/printable-${id}.pdf`;

  let bytes: Uint8Array;
  const cached = await service.storage.from("kids-assets").download(objPath);
  if (cached.data) {
    bytes = new Uint8Array(await cached.data.arrayBuffer());
  } else {
    const data = printable.data ?? {};
    let pages: PdfPage[] = [];
    if (data.image_url) pages = [{ image_url: data.image_url }];
    else if (Array.isArray(data.pages) && data.pages.length) pages = data.pages.map((p: any) => ({ text: p.text, image_url: p.image_url }));
    else if (["sopa_letras", "crucigrama", "laberinto", "unir_puntos"].includes(printable.category_slug)) {
      pages = [{ puzzle: { category: printable.category_slug, spec: data } }];
    } else if (printable.cover_url) pages = [{ image_url: printable.cover_url }];

    const built = await buildKidsPdf({
      title: printable.title,
      subtitle: printable.description ?? undefined,
      category: printable.category_slug,
      coverUrl: pages.find((p) => p.image_url)?.image_url ?? printable.cover_url,
      ageText: `${printable.age_min}–${printable.age_max} años`,
      pages,
    });
    bytes = built;
    await service.storage.from("kids-assets").upload(objPath, Buffer.from(built), { contentType: "application/pdf", upsert: true });
  }

  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="${slug(printable.title)}.pdf"`,
      "Cache-Control": "public, max-age=86400",
    },
  });
}
