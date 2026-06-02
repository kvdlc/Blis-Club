import { createServiceClient } from "@/lib/supabase/service";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const supabase = createServiceClient();
  const { data } = await supabase
    .from("short_links")
    .select("target_url")
    .eq("slug", slug)
    .single();

  if (!data) {
    return NextResponse.redirect(new URL("/", _request.url));
  }

  const target = (data as { target_url: string }).target_url;
  const base = new URL(_request.url).origin;
  return NextResponse.redirect(new URL(target, base));
}
