import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { createPayment } from "@/lib/izipay/client";
import type { IzipayConfig } from "@/lib/izipay/types";
import { tierFor } from "@/lib/volumeTiers";

async function getIzipayConfig(): Promise<IzipayConfig | null> {
  const supabase = createServiceClient();
  const { data: keys, error } = await supabase
    .from("api_keys")
    .select("key_name, key_value")
    .eq("is_global", true)
    .in("key_name", [
      "izipay_shop_id", "izipay_secret_key", "izipay_public_key", "izipay_hmac_key",
      "izipay_environment", "izipay_display_mode",
    ]);
  if (error || !keys) return null;
  const map: Record<string, string> = {};
  for (const row of keys) map[row.key_name] = row.key_value;
  const shopId = map["izipay_shop_id"];
  const secretKey = map["izipay_secret_key"];
  const publicKey = map["izipay_public_key"];
  const hmacKey = map["izipay_hmac_key"];
  const displayMode = (map["izipay_display_mode"] || "embedded") as IzipayConfig["displayMode"];
  const environment = (map["izipay_environment"] || "sandbox").toLowerCase().includes("prod") ? "production" as const : "sandbox" as const;
  if (!shopId || !secretKey || !publicKey || !hmacKey) return null;
  return { shopId, secretKey, publicKey, hmacKey, environment, displayMode };
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

    const service = createServiceClient();

    // Items del carrito del usuario (con producto)
    const { data: items, error: cartError } = await service
      .from("cart_items")
      .select("id, product_id, quantity, product:marketplace_products(*)")
      .eq("user_id", user.id);

    if (cartError || !items?.length) {
      return NextResponse.json({ error: "Tu carrito está vacío." }, { status: 400 });
    }

    // Calcular totales (descuento por volumen aplicado por línea)
    let totalCents = 0;
    const lines: { product_id: string; quantity: number; unit: number; unitCents: number; totalCents: number; discountPct: number; tier: string; titulo: string }[] = [];

    for (const it of items as any[]) {
      const product = it.product as any;
      const unitPrice = Number(product.precio);
      const qty = Math.max(1, Math.floor(Number(it.quantity) || 1));
      const tier = tierFor(qty);
      const unit = Math.round(unitPrice * (1 - tier.pct / 100) * 100) / 100;
      const lineTotal = Math.round(unit * qty * 100);
      totalCents += lineTotal;
      lines.push({
        product_id: it.product_id, quantity: qty, unit, unitCents: Math.round(unit * 100),
        totalCents: lineTotal, discountPct: tier.pct, tier: tier.label, titulo: product.titulo || "",
      });
    }

    const config = await getIzipayConfig();
    if (!config) return NextResponse.json({ error: "Izipay no está configurado." }, { status: 500 });

    // Crear cabecera de checkout
    const { data: checkout, error: coErr } = await service.from("product_checkouts").insert({
      user_id: user.id,
      total_price_cents: totalCents,
      currency: "USD",
      status: "pending",
      payment_method: "izipay",
      metadata: {
        guest_email: user.email || "",
        created_via: "izipay_cart_checkout",
        line_count: lines.length,
        lines: lines.map((l) => ({ product_id: l.product_id, quantity: l.quantity, titulo: l.titulo })),
      },
    }).select().single();
    if (coErr || !checkout) return NextResponse.json({ error: "Error al crear el checkout." }, { status: 500 });

    // Insertar las líneas product_orders vinculadas
    for (const l of lines) {
      await service.from("product_orders").insert({
        user_id: user.id,
        product_id: l.product_id,
        quantity: l.quantity,
        unit_price_cents: l.unitCents,
        total_price_cents: l.totalCents,
        currency: "USD",
        status: "pending",
        payment_method: "izipay",
        checkout_id: checkout.id,
        metadata: {
          discount_pct: l.discountPct, tier_label: l.tier,
          unit_price_before_discount: undefined, product_titulo: l.titulo,
          created_via: "izipay_cart_checkout",
        },
      });
    }

    const paymentResponse = await createPayment(
      { amount: totalCents, currency: "USD", orderId: checkout.id, customer: { email: user.email || "", reference: user.id } },
      config
    );

    if (paymentResponse.status !== "SUCCESS" || !paymentResponse.answer.formToken) {
      console.error("[Izipay Cart] Error generando formToken:", paymentResponse);
      await service.from("product_checkouts").delete().eq("id", checkout.id);
      return NextResponse.json({ error: "Error al conectar con la pasarela de pago. Intenta de nuevo." }, { status: 502 });
    }

    try {
      await service.from("product_checkouts").update({ metadata: { ...(checkout.metadata || {}), izipay_form_token: paymentResponse.answer.formToken } }).eq("id", checkout.id);
    } catch {}

    return NextResponse.json({
      success: true,
      formToken: paymentResponse.answer.formToken,
      publicKey: config.publicKey,
      orderId: checkout.id,
      displayMode: config.displayMode,
      totalLabel: `$${(totalCents / 100).toFixed(2)}`,
      lineCount: lines.length,
    });
  } catch (error) {
    console.error("[Izipay Cart] Error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
