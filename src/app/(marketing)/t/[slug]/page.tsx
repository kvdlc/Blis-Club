import type { Metadata } from "next";
import { getContactBySlug, tallerMetadata } from "@/lib/publicTaller";
import { PublicTallerView, TallerNotFound } from "@/components/PublicTallerView";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return tallerMetadata(await getContactBySlug(slug));
}

export default async function ShortTallerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = await getContactBySlug(slug);
  if (!c) return <TallerNotFound />;
  return <PublicTallerView c={c} />;
}
