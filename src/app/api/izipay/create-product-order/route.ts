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
      "izipay_shop_id",
      "izipay_secret_key",
      "izipay_public_key",
      "izipay_hmac_key",
      "izipay_environment",
      "izipay_display_mode",
    ]);

  if (error || !keys) return null;

  const map: Record<string, string> = {};
  for (const row of keys) map[row.key_name] = row.key_value;

  const shopId = map["izipay_shop_id"];
  const secretKey = map["izipay_secret_key"];
  const publicKey = map["izipay_public_key"];
  const hmacKey = map["izipay_hmac_key"];
  const displayMode = (map["izipay_display_mode"] || "embedded") as IzipayConfig["displayMode"];
  const envRaw = (map["izipay_environment"] || "sandbox").toLowerCase();
  const environment = envRaw.includes("prod") ? "production" as const : "sandbox" as const;

  if (!shopId || !secretKey || !publicKey || !hmacKey) return null;
  return { shopId, secretKey, publicKey, hmacKey, environment, displayMode };
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { productId, quantity, email, firstName, lastName, shipping } = body as {
      productId?: string;
      quantity?: number;
      email?: string;
      firstName?: string;
      lastName?: string;
      shipping?: Record<string, string>;
    };

    const qty = Math.max(1, Math.min(50, Math.floor(Number(quantity) || 1)));

    if (!productId) {
      return NextResponse.json({ error: "productId requerido" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const serviceSupabase = createServiceClient();

    let customerEmail = "";
    let customerReference = "";
    let userId: string | null = null;

    if (user) {
      customerEmail = user.email || "";
      customerReference = user.id;
      userId = user.id;
    } else {
      if (!email) {
        return NextResponse.json({ error: "Email requerido para continuar" }, { status: 400 });
      }
      customerEmail = email.trim().toLowerCase();
      customerReference = customerEmail;
      const { data: existingUsers } = await serviceSupabase.auth.admin.listUsers();
      const existing = existingUsers?.users?.find(
        (u) => u.email?.toLowerCase() === customerEmail
      );
      if (existing) {
        userId = existing.id;
        customerReference = existing.id;
      }
    }

    let shipFirstName = firstName?.trim() || "";
    let shipLastName = lastName?.trim() || "";
    if (userId && !shipFirstName) {
      const { data: profile } = await serviceSupabase
        .from("profiles")
        .select("first_name, last_name")
        .eq("id", userId)
        .maybeSingle();
      shipFirstName = profile?.first_name || "";
      shipLastName = profile?.last_name || "";
    }

    // Producto
    const { data: product } = await serviceSupabase
      .from("marketplace_products")
      .select("*")
      .eq("id", productId)
      .eq("activo", true)
      .single();

    if (!product) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    const unitPrice = Number(product.precio);
    const tier = tierFor(qty);
    const unitDiscounted = Math.round(unitPrice * (1 - tier.pct / 100) * 100) / 100;
    const total = Math.round(unitDiscounted * qty * 100);
    const totalDollars = total / 100;

    const config = await getIzipayConfig();
    if (!config) {
      return NextResponse.json({ error: "Izipay no está configurado." }, { status: 500 });
    }

    // Crear la orden
    const { data: order, error: orderError } = await serviceSupabase
      .from("product_orders")
      .insert({
        user_id: userId || undefined,
        product_id: productId,
        quantity: qty,
        unit_price_cents: Math.round(unitDiscounted * 100),
        total_price_cents: total,
        currency: "USD",
        status: "pending",
        payment_method: "izipay",
        shipping_address: shipping || null,
        metadata: {
          guest_email: customerEmail,
          guest_first_name: shipFirstName,
          guest_last_name: shipLastName,
          discount_pct: tier.pct,
          tier_label: tier.label,
          unit_price_before_discount: unitPrice,
          product_titulo: product.titulo,
          created_via: user ? "izipay_product" : "izipay_product_guest",
        },
      })
      .select()
      .single();

    if (orderError || !order) {
      console.error("[Izipay Product] Error creando orden:", orderError);
      return NextResponse.json({ error: "Error al crear la orden. Intenta de nuevo." }, { status: 500 });
    }

    const orderId = order.id;

    const paymentResponse = await createPayment(
      {
        amount: total,
        currency: "USD",
        orderId,
        customer: {
          email: customerEmail,
          reference: customerReference,
          ...(shipFirstName || shipLastName ? {
            shippingDetails: { firstName: shipFirstName, lastName: shipLastName },
          } : {}),
        },
      },
      config
    );

    if (paymentResponse.status !== "SUCCESS" || !paymentResponse.answer.formToken) {
      console.error("[Izipay Product] Error generando formToken:", paymentResponse);
      await serviceSupabase.from("product_orders").delete().eq("id", orderId);
      return NextResponse.json({ error: "Error al conectar con la pasarela de pago. Intenta de nuevo." }, { status: 502 });
    }

    try {
      await serviceSupabase
        .from("product_orders")
        .update({ metadata: { ...(order.metadata as Record<string, unknown> || {}), izipay_form_token: paymentResponse.answer.formToken } })
        .eq("id", orderId);
    } catch {}

    return NextResponse.json({
      success: true,
      formToken: paymentResponse.answer.formToken,
      publicKey: config.publicKey,
      orderId,
      displayMode: config.displayMode,
      productId,
      quantity: qty,
      unitPrice: unitDiscounted,
      discountPct: tier.pct,
      tierLabel: tier.label,
      totalLabel: `$${totalDollars.toFixed(2)}`,
    });
  } catch (error) {
    console.error("[Izipay Product] Error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
