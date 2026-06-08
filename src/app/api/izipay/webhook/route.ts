import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { verifyKRHash } from "@/lib/izipay/client";
import type { IzipayIPNAnswer } from "@/lib/izipay/types";

export async function POST(request: Request) {
  try {
    const raw = await request.text();
    console.log("[Izipay Webhook] Raw body (first 300):", raw.substring(0, 300));

    const params = new URLSearchParams(raw);
    const krHash = params.get("kr-hash");
    const krAnswer = params.get("kr-answer");

    if (!krHash || !krAnswer) {
      console.error("[Izipay Webhook] Falta kr-hash o kr-answer");
      return NextResponse.json({ error: "Faltan parámetros requeridos" }, { status: 400 });
    }

    let answerData: IzipayIPNAnswer;
    try {
      answerData = JSON.parse(krAnswer);
    } catch {
      console.error("[Izipay Webhook] kr-answer no es JSON válido");
      return NextResponse.json({ error: "kr-answer inválido" }, { status: 400 });
    }

    console.log("[Izipay Webhook] orderStatus:", answerData.orderStatus);

    const serviceSupabase = createServiceClient();
    const supabase = await createClient();

    const { data: keys } = await serviceSupabase
      .from("api_keys")
      .select("key_name, key_value")
      .eq("is_global", true)
      .eq("key_name", "izipay_hmac_key")
      .single();

    const hmacKey = keys?.key_value;
    if (!hmacKey) {
      console.error("[Izipay Webhook] HMAC key no configurada en api_keys");
      return NextResponse.json({ error: "Configuración incompleta" }, { status: 500 });
    }

    const isValid = verifyKRHash(krAnswer, krHash, hmacKey);
    if (!isValid) {
      console.error("[Izipay Webhook] Firma HMAC inválida");
      return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
    }

    console.log("[Izipay Webhook] HMAC verificado OK");

    const orderDetails = (answerData as unknown as Record<string, unknown>).orderDetails as Record<string, unknown> | undefined;
    const customer = (answerData as unknown as Record<string, unknown>).customer as Record<string, unknown> | undefined;
    const orderId = answerData.orderId;
    const tx = answerData.transactions?.[0];
    const orderStatus = answerData.orderStatus;

    const referenceOrderId = orderDetails?.orderId as string || orderId;

    console.log(`[Izipay Webhook] Buscando orden: ${referenceOrderId}`);

    let { data: subscription } = await supabase
      .from("subscriptions")
      .select("id, user_id, plan_id, status, metadata")
      .eq("id", referenceOrderId)
      .maybeSingle();

    if (!subscription) {
      console.error(`[Izipay Webhook] Suscripción no encontrada: ${referenceOrderId}. Creando nueva suscripción para el pago.`);
      // Extraer user_id del customer.reference o customer.email
      const customerEmail = customer?.email as string;
      let userId: string | null = null;
      if (customerEmail) {
        const { data: profile } = await serviceSupabase
          .from("profiles")
          .select("id")
          .eq("email", customerEmail.toLowerCase())
          .maybeSingle();
        userId = profile?.id || null;
      }
      if (!userId) {
        return NextResponse.json({ error: "Suscripción no encontrada y no se pudo determinar el usuario" }, { status: 404 });
      }

      // Crear suscripción nueva
      const now = new Date();
      const periodEnd = new Date(now);
      periodEnd.setMonth(periodEnd.getMonth() + 1);

      const { data: created, error: createError } = await serviceSupabase
        .from("subscriptions")
        .insert({
          id: referenceOrderId,
          user_id: userId,
          status: "active",
          plan_type: "premium",
          current_period_start: now.toISOString(),
          current_period_end: periodEnd.toISOString(),
          expires_at: null,
          izipay_subscription_id: orderId,
        })
        .select()
        .single();

      if (createError) {
        console.error(`[Izipay Webhook] Error creando suscripción:`, createError);
        return NextResponse.json({ error: "Error creando suscripción" }, { status: 500 });
      }

      subscription = created;
    }

    console.log(`[Izipay Webhook] Suscripción ${subscription.id} encontrada, estado actual: ${subscription.status}`);

    if (orderStatus === "PAID") {
      const now = new Date();
      const periodEnd = new Date(now);
      periodEnd.setMonth(periodEnd.getMonth() + 1);

      // Activar suscripción Premium y mantener como cliente
    // Usar service_role para bypass RLS
    await Promise.all([
      serviceSupabase
        .from("subscriptions")
        .update({
          status: "active",
          plan_type: "premium",
          current_period_start: now.toISOString(),
          current_period_end: periodEnd.toISOString(),
          expires_at: null,
          izipay_subscription_id: orderId,
        })
        .eq("id", subscription.id),
      serviceSupabase
        .from("profiles")
        .update({ is_lead: false })
        .eq("id", subscription.user_id),
    ]);

    // Intentar guardar metadata por separado (ignorar error si columna no existe)
    try {
      await serviceSupabase
        .from("subscriptions")
        .update({
          metadata: {
            ...((subscription.metadata as Record<string, unknown>) || {}),
            izipay_status: "PAID",
            izipay_webhook_received_at: new Date().toISOString(),
            izipay_transaction_uuid: tx?.uuid || "",
            izipay_payment_method: tx?.paymentMethodType || "",
            izipay_card_brand: tx?.cardDetails?.brand || "",
            izipay_card_last4: String(tx?.cardDetails?.pan || "").slice(-4),
          },
        })
        .eq("id", subscription.id);
    } catch {
      // metadata column might not exist yet
    }

      if (tx?.paymentMethodToken) {
        const { data: existingToken } = await supabase
          .from("payment_tokens")
          .select("id")
          .eq("card_token", tx.paymentMethodToken)
          .eq("user_id", subscription.user_id)
          .maybeSingle();

        if (!existingToken) {
          await supabase.from("payment_tokens").insert({
            user_id: subscription.user_id,
            card_token: tx.paymentMethodToken,
            card_brand: tx.cardDetails?.brand || "",
            card_last4: String(tx.cardDetails?.pan || "").slice(-4),
            card_expiry: tx.cardDetails
              ? `${tx.cardDetails.expiryMonth || ""}/${tx.cardDetails.expiryYear || ""}`
              : "",
            metadata: {
              izipay_transaction_uuid: tx.uuid,
              izipay_order_id: orderId,
            },
          });
        }
      }

      const { data: plan } = await supabase
        .from("plans")
        .select("id, name, price_cents")
        .eq("id", subscription.plan_id)
        .single();

      if (plan) {
        const txAmount = tx?.amount ? Math.round(tx.amount * 100) : plan.price_cents;

        const { data: paymentRecord, error: paymentErr } = await supabase
          .from("subscription_payments")
          .upsert({
            user_id: subscription.user_id,
            subscription_id: subscription.id,
            plan_id: plan.id,
            amount_cents: txAmount,
            currency: tx?.currency || "USD",
            status: "succeeded",
            payment_method: tx?.paymentMethodType || "card",
            description: `Suscripción ${plan.name}`,
            izipay_transaction_id: tx?.uuid || `${orderId}_${Date.now()}`,
            izipay_subscription_id: orderId,
            metadata: {
              izipay_event_type: "webhook.paid",
              izipay_order_id: orderId,
              izipay_card_brand: tx?.cardDetails?.brand,
              izipay_card_last4: String(tx?.cardDetails?.pan || "").slice(-4),
            },
          }, { onConflict: "izipay_transaction_id" })
          .select()
          .single();

        if (paymentErr) {
          console.error("[Izipay Webhook] Error saving payment:", paymentErr);
        }

        const paymentId = paymentRecord?.id;

        if (paymentId) {
          const { data: referral } = await supabase
            .from("referrals")
            .select("id, referrer_user_id, status, subscription_id")
            .eq("referred_user_id", subscription.user_id)
            .maybeSingle();

          if (referral) {
            if (!referral.subscription_id && subscription.id) {
              await supabase
                .from("referrals")
                .update({ subscription_id: subscription.id })
                .eq("id", referral.id);
            }

            const { data: existingCommissions } = await supabase
              .from("referral_commissions")
              .select("id")
              .eq("subscription_payment_id", paymentId)
              .limit(1);

            if (!existingCommissions || existingCommissions.length === 0) {
              const { processMultiLevelCommissions } = await import("@/lib/referrals");
              const levels = await processMultiLevelCommissions(
                subscription.user_id,
                plan.price_cents,
                {
                  subscriptionPaymentId: paymentId,
                  periodStart: now.toISOString(),
                  periodEnd: periodEnd.toISOString(),
                }
              );
              console.log(`[Izipay Webhook] Comisiones procesadas niveles: ${levels.join(", ")} para pago ${paymentId}`);

              await supabase
                .from("subscription_payments")
                .update({ commission_generated: true })
                .eq("id", paymentId);
            } else {
              console.log(`[Izipay Webhook] Comisiones ya existen para pago ${paymentId}, skipping.`);
            }
          }
        }
      }

      console.log(`[Izipay Webhook] Suscripción ${subscription.id} ACTIVADA`);
    } else if (orderStatus === "UNPAID" || orderStatus === "CANCELLED") {
      await Promise.all([
        supabase
          .from("subscriptions")
          .update({ status: "canceled", metadata: { ...((subscription.metadata as Record<string, unknown>) || {}), izipay_status: orderStatus } })
          .eq("id", subscription.id),
        supabase
          .from("profiles")
          .update({ is_lead: true })
          .eq("id", subscription.user_id),
      ]);
      console.log(`[Izipay Webhook] Suscripción ${subscription.id} CANCELADA. Usuario marcado como lead.`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[Izipay Webhook] Error:", msg);
    return NextResponse.json({ error: "Webhook error" }, { status: 400 });
  }
}
