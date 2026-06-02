import { createClient } from "@/lib/supabase/client";

export function getShortSlug(dogId: string): string {
  return dogId.replace(/-/g, "").substring(0, 8);
}

export function getShortUrl(slug: string): string {
  const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
  return `${origin}/g/${slug}`;
}

export async function ensureShortLink(dogId: string): Promise<string> {
  const supabase = createClient();
  const slug = getShortSlug(dogId);

  const { data: existing } = await supabase
    .from("short_links")
    .select("slug")
    .eq("slug", slug)
    .single();

  if (existing) return slug;

  const targetUrl = `/guau/perro/${dogId}`;
  await supabase.from("short_links").insert({ slug, target_url: targetUrl });

  return slug;
}
