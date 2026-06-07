import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { createPayment } from "@/lib/izipay/client";
import type { IzipayConfig } from "@/lib/izipay/types";

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

  if (error || !keys) {
    console.error("[Izipay] Error fetching config:", error);
    return null;
  }

  const map: Record<string, string> = {};
  for (const row of keys) {
    map[row.key_name] = row.key_value;
  }

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
    const { planId, appId } = body as { planId?: string; appId?: string };

    if (!planId) {
      return NextResponse.json({ error: "planId requerido" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { data: plan } = await supabase
      .from("plans")
      .select("*")
      .eq("id", planId)
      .single();

    if (!plan) {
      return NextResponse.json({ error: "Plan no encontrado" }, { status: 404 });
    }

    const config = await getIzipayConfig();
    if (!config) {
      return NextResponse.json({
        error: "Izipay no está configurado. Agrega las claves en tabla api_keys (izipay_shop_id, izipay_secret_key, izipay_public_key, izipay_hmac_key).",
      }, { status: 500 });
    }

    // Leer nombre/apellido del perfil
    const { data: profile } = await supabase
      .from("profiles")
      .select("first_name, last_name")
      .eq("id", user.id)
      .single();

    const { data: order, error: orderError } = await supabase
      .from("subscriptions")
      .insert({
        user_id: user.id,
        plan_id: planId,
        status: "pending",
        current_period_start: new Date().toISOString(),
        current_period_end: null,
        metadata: {
          app_id: appId || null,
          plan_name: plan.name,
          created_via: "izipay_checkout",
        },
      })
      .select()
      .single();

    const orderId = order?.id || `sub_${Date.now()}_${user.id.slice(0, 8)}`;

    const paymentResponse = await createPayment(
      {
        amount: plan.price_cents,
        currency: "USD",
        orderId,
        customer: {
          email: user.email || "",
          reference: user.id,
          shippingDetails: {
            firstName: profile?.first_name || "",
            lastName: profile?.last_name || "",
          },
        },
      },
      config
    );

    if (paymentResponse.status !== "SUCCESS" || !paymentResponse.answer.formToken) {
      console.error("[Izipay Create Subscription] Error generando formToken:", paymentResponse);
      return NextResponse.json({
        error: "Error al conectar con la pasarela de pago. Intenta de nuevo.",
      }, { status: 502 });
    }

    if (order) {
      await supabase
        .from("subscriptions")
        .update({
          metadata: {
            app_id: appId || null,
            plan_name: plan.name,
            created_via: "izipay_checkout",
            izipay_form_token: paymentResponse.answer.formToken,
          },
        })
        .eq("id", order.id);
    }

    return NextResponse.json({
      success: true,
      formToken: paymentResponse.answer.formToken,
      publicKey: config.publicKey,
      orderId,
      displayMode: config.displayMode,
    });
  } catch (error) {
    console.error("[IziPay Create Subscription] Error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
