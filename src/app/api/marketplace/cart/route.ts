import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

/** GET: lista el carrito del usuario con datos del producto. */
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { data, error } = await supabase
    .from("cart_items")
    .select("*, product:marketplace_products(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ items: data ?? [] });
}

/** POST: agrega (o actualiza cantidad) un producto al carrito. Body: { productId, quantity? } */
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const productId = body.productId as string | undefined;
  if (!productId) return NextResponse.json({ error: "productId requerido" }, { status: 400 });
  const qty = Math.max(1, Math.min(99, Math.floor(Number(body.quantity) || 1)));

  const service = createServiceClient();

  // Validar producto activo
  const { data: product } = await service.from("marketplace_products").select("id, activo, stock").eq("id", productId).eq("activo", true).maybeSingle();
  if (!product) return NextResponse.json({ error: "Producto no disponible" }, { status: 404 });
  const stock = Number(product.stock ?? 99);
  const finalQty = Math.min(qty, stock);

  // Upsert: si ya existe, suma; si no, inserta
  const { data: existing } = await supabase.from("cart_items").select("id, quantity").eq("user_id", user.id).eq("product_id", productId).maybeSingle();
  if (existing) {
    const newQty = Math.min(existing.quantity + (qty === 1 && body.quantity === undefined ? 1 : qty), stock);
    await supabase.from("cart_items").update({ quantity: newQty, updated_at: new Date().toISOString() }).eq("id", existing.id);
  } else {
    await supabase.from("cart_items").insert({ user_id: user.id, product_id: productId, quantity: finalQty });
  }

  const { data: items } = await supabase.from("cart_items").select("*, product:marketplace_products(*)").eq("user_id", user.id).order("created_at", { ascending: true });
  return NextResponse.json({ items: items ?? [] });
}

/** PUT: actualiza cantidad exacta. Body: { itemId, quantity } */
export async function PUT(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const itemId = body.itemId as string | undefined;
  const qty = Math.max(1, Math.min(99, Math.floor(Number(body.quantity) || 1)));
  if (!itemId) return NextResponse.json({ error: "itemId requerido" }, { status: 400 });

  await supabase.from("cart_items").update({ quantity: qty, updated_at: new Date().toISOString() }).eq("id", itemId).eq("user_id", user.id);

  const { data: items } = await supabase.from("cart_items").select("*, product:marketplace_products(*)").eq("user_id", user.id).order("created_at", { ascending: true });
  return NextResponse.json({ items: items ?? [] });
}

/** DELETE: elimina item. Query: ?itemId= o ?productId= */
export async function DELETE(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const itemId = searchParams.get("itemId");
  const productId = searchParams.get("productId");

  let query = supabase.from("cart_items").delete().eq("user_id", user.id);
  if (itemId) query = query.eq("id", itemId);
  else if (productId) query = query.eq("product_id", productId);
  else return NextResponse.json({ error: "itemId o productId requerido" }, { status: 400 });
  await query;

  const { data: items } = await supabase.from("cart_items").select("*, product:marketplace_products(*)").eq("user_id", user.id).order("created_at", { ascending: true });
  return NextResponse.json({ items: items ?? [] });
}
