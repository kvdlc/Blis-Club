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

    const serviceSupabase = createServiceClient();

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

    // Crear suscripción con service_role para bypass RLS
    const { data: order, error: orderError } = await serviceSupabase
      .from("subscriptions")
      .insert({
        user_id: user.id,
        plan_id: planId,
        status: "pending",
        plan_type: "premium",
        current_period_start: new Date().toISOString(),
        current_period_end: null,
      })
      .select()
      .single();

    if (orderError || !order) {
      console.error("[Izipay Create Subscription] Error creating subscription:", orderError);
      return NextResponse.json({ error: "Error al crear la suscripción. Intenta de nuevo." }, { status: 500 });
    }

    const orderId = order.id;

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
      // Clean up the pending subscription since payment wasn't initiated
      await serviceSupabase.from("subscriptions").delete().eq("id", orderId);
      return NextResponse.json({
        error: "Error al conectar con la pasarela de pago. Intenta de nuevo.",
      }, { status: 502 });
    }

    // Intentar guardar metadata con service_role para bypass RLS
    try {
      await serviceSupabase
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
    } catch {
      // metadata column might not exist yet, ignore
    }

    return NextResponse.json({
      success: true,
      formToken: paymentResponse.answer.formToken,
      publicKey: config.publicKey,
      orderId,
      displayMode: config.displayMode,
      totalLabel: plan.billing_interval === "quarter"
        ? `$${(plan.price_cents / 100).toFixed(2)}/trimestre`
        : plan.billing_interval === "year"
          ? `$${(plan.price_cents / 100).toFixed(2)}/año`
          : `$${(plan.price_cents / 100).toFixed(2)}/mes`,
    });
  } catch (error) {
    console.error("[IziPay Create Subscription] Error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
