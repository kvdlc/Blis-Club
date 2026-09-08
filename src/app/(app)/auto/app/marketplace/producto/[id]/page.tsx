import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { MarketplaceProduct } from "@/types/database";
import ProductDetailClient from "./ProductDetailClient";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id || "";
  const userEmail = user?.email || "";

  const { data } = await supabase.from("marketplace_products").select("*").eq("id", id).eq("activo", true).single();
  if (!data) notFound();
  const product = data as MarketplaceProduct;

  // Similares por categoría
  const { data: sim } = product.categoria
    ? await supabase.from("marketplace_products").select("*").eq("activo", true).eq("categoria", product.categoria).neq("id", product.id).limit(6)
    : { data: null };
  const similares = (sim as MarketplaceProduct[] | null) ?? [];

  return <ProductDetailClient product={product} similares={similares} userId={userId} userEmail={userEmail} />;
}
