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

  if (error || !keys) return null;

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
    const { paymentTokenId, planId } = body as { paymentTokenId?: string; planId?: string };

    if (!paymentTokenId || !planId) {
      return NextResponse.json({ error: "paymentTokenId y planId son requeridos" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const serviceSupabase = createServiceClient();

    const { data: token, error: tokenError } = await supabase
      .from("payment_tokens")
      .select("id, card_token, card_brand, card_last4, user_id, is_active")
      .eq("id", paymentTokenId)
      .eq("is_active", true)
      .maybeSingle();

    if (tokenError || !token) {
      return NextResponse.json({ error: "Tarjeta no encontrada" }, { status: 404 });
    }

    if (token.user_id !== user.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { data: plan } = await serviceSupabase
      .from("plans")
      .select("*")
      .eq("id", planId)
      .single();

    if (!plan) {
      return NextResponse.json({ error: "Plan no encontrado" }, { status: 404 });
    }

    const config = await getIzipayConfig();
    if (!config) {
      return NextResponse.json({ error: "Izipay no está configurado." }, { status: 500 });
    }

    let orderId: string;

    const { data: existingSub } = await serviceSupabase
      .from("subscriptions")
      .select("id, status, plan_id")
      .eq("user_id", user.id)
      .in("status", ["active", "trialing", "past_due"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingSub) {
      orderId = existingSub.id;
      await serviceSupabase
        .from("subscriptions")
        .update({ plan_id: planId, status: "pending" })
        .eq("id", existingSub.id);
    } else {
      const { data: newSub, error: orderError } = await serviceSupabase
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

      if (orderError || !newSub) {
        console.error("[Izipay Renew Subscription] Error creating subscription:", orderError);
        return NextResponse.json({ error: "Error al crear la suscripción." }, { status: 500 });
      }

      orderId = newSub.id;
    }

    const paymentResponse = await createPayment(
      {
        amount: plan.price_cents,
        currency: "USD",
        orderId,
        paymentMethodToken: token.card_token,
        customer: {
          email: user.email || "",
          reference: user.id,
        },
      },
      config
    );

    if (paymentResponse.status !== "SUCCESS" || !paymentResponse.answer.formToken) {
      console.error("[Izipay Renew Subscription] Error generando formToken:", paymentResponse);
      if (!existingSub) {
        await serviceSupabase.from("subscriptions").delete().eq("id", orderId);
      }
      return NextResponse.json({ error: "Error al iniciar el cobro. Intenta de nuevo." }, { status: 502 });
    }

    try {
      await serviceSupabase
        .from("subscriptions")
        .update({
          metadata: {
            app_id: "guau",
            plan_name: plan.name,
            created_via: "izipay_renew_1click",
            izipay_form_token: paymentResponse.answer.formToken,
            payment_token_id: paymentTokenId,
          },
        })
        .eq("id", orderId);
    } catch {}

    const totalLabel = plan.billing_interval === "quarter"
      ? `$${(plan.price_cents / 100).toFixed(2)}/trimestre`
      : plan.billing_interval === "year"
        ? `$${(plan.price_cents / 100).toFixed(2)}/año`
        : `$${(plan.price_cents / 100).toFixed(2)}/mes`;

    return NextResponse.json({
      success: true,
      formToken: paymentResponse.answer.formToken,
      publicKey: config.publicKey,
      orderId,
      displayMode: config.displayMode,
      totalLabel,
      cardLast4: token.card_last4,
      cardBrand: token.card_brand,
    });
  } catch (error) {
    console.error("[Izipay Renew Subscription] Error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}