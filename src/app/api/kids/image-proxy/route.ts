import { NextResponse } from "next/server";

// Proxy de imágenes de Supabase para poder usar canvas (evita CORS).
// Solo permite URLs del proyecto Supabase configurado.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");
  if (!url) return new NextResponse("Falta url", { status: 400 });

  const host = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  let allowed = false;
  try {
    allowed = !!host && new URL(url).origin === new URL(host).origin;
  } catch {
    allowed = false;
  }
  if (!allowed) return new NextResponse("No permitido", { status: 403 });

  const res = await fetch(url);
  if (!res.ok) return new NextResponse("Error al obtener la imagen", { status: res.status });

  const buf = await res.arrayBuffer();
  return new NextResponse(buf, {
    headers: {
      "Content-Type": res.headers.get("content-type") || "image/png",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
