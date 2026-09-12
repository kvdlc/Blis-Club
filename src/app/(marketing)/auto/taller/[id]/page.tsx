import type { Metadata } from "next";
import { getContactById, tallerMetadata } from "@/lib/publicTaller";
import { PublicTallerView, TallerNotFound } from "@/components/PublicTallerView";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const c = await getContactById(id);
  const md = tallerMetadata(c);
  if (c?.foto_url) {
    md.openGraph = { ...md.openGraph, images: [c.foto_url] };
  }
  return md;
}

export default async function PublicTallerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const c = await getContactById(id);
  if (!c) return <TallerNotFound />;
  return <PublicTallerView c={c} />;
}
