import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifySignature } from "@/lib/izipay/client";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const signature = request.headers.get("x-izipay-signature");

    // TODO: Verificar firma HMAC real cuando tengamos la clave
    const hmacKey = process.env.IZIPAY_HMAC_KEY || "";
    const isValid = verifySignature(JSON.stringify(body), signature || "", hmacKey);
    if (!isValid) {
      console.warn("[IziPay Webhook] Firma inválida (esqueleto)");
      // En producción: return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = body;
    const supabase = await createClient();

    // Eventos de suscripción (creación, actualización, pago recurrente)
    const isPaymentEvent =
      event.type === "subscription.created" ||
      event.type === "subscription.updated" ||
      event.type === "subscription.payment_succeeded" ||
      event.type === "subscription.charge.succeeded" ||
      event.type === "payment.succeeded";

    if (isPaymentEvent) {
      const { data: plan } = await supabase
        .from("plans")
        .select("id, name, price_cents, billing_interval")
        .eq("izipay_price_id", event.data.plan_id)
        .single();

      if (plan) {
        const { data: user } = await supabase
          .from("profiles")
          .select("id")
          .eq("email", event.data.customer_email)
          .single();

        if (user) {
          const now = new Date();
          const periodEnd = new Date(now);
          if ((plan as any).billing_interval === "year") {
            periodEnd.setFullYear(periodEnd.getFullYear() + 1);
          } else {
            periodEnd.setMonth(periodEnd.getMonth() + 1);
          }

          const { data: subscriptionData } = await supabase.from("subscriptions").upsert({
            user_id: user.id,
            plan_id: plan.id,
            status: event.data.status ?? "active",
            current_period_start: now.toISOString(),
            current_period_end: periodEnd.toISOString(),
            izipay_subscription_id: event.data.subscription_id,
          }, { onConflict: "user_id" }).select().single();

          // Guardar token de tarjeta si viene
          const tx = event.data.transactions?.[0];
          if (tx?.paymentMethodToken) {
            await supabase.from("payment_tokens").insert({
              user_id: user.id,
              card_token: tx.paymentMethodToken,
              card_brand: tx.paymentMethodType || "",
              card_last4: tx.cardDetails?.pan?.slice(-4) || "",
              card_expiry: `${tx.cardDetails?.expiryMonth || ""}/${tx.cardDetails?.expiryYear || ""}`,
            });
          }

          // 1. Guardar historial de cobro en subscription_payments
          const txAmount = tx?.amount ? Math.round(tx.amount * 100) : plan.price_cents;
          const txUuid = tx?.uuid || `${event.data.subscription_id}_${now.getTime()}`;

          const { data: paymentRecord, error: paymentErr } = await supabase
            .from("subscription_payments")
            .upsert({
              user_id: user.id,
              subscription_id: subscriptionData?.id,
              plan_id: plan.id,
              amount_cents: txAmount,
              currency: tx?.currency || "USD",
              status: tx?.status === "PAID" || !tx?.status ? "succeeded" : tx.status.toLowerCase(),
              payment_method: tx?.paymentMethodType || "card",
              description: `Suscripción ${plan.name} — ${event.type}`,
              izipay_transaction_id: txUuid,
              izipay_subscription_id: event.data.subscription_id,
              metadata: {
                izipay_event_type: event.type,
                izipay_subscription_id: event.data.subscription_id,
                izipay_order_id: event.data.order_id,
                raw_event: event,
              },
            }, { onConflict: "izipay_transaction_id" })
            .select()
            .single();

          if (paymentErr) {
            console.error("[IziPay Webhook] Error saving payment:", paymentErr);
          }

          const paymentId = paymentRecord?.id;

          // 2. Procesar comisiones multinivel (RECURRENT: every payment generates commissions)
          // Check if this user was referred by anyone
          const { data: referral } = await supabase
            .from("referrals")
            .select("id, referrer_user_id, status, subscription_id")
            .eq("referred_user_id", user.id)
            .maybeSingle();

          if (referral) {
            // Update referral subscription_id on first payment
            if (!referral.subscription_id && subscriptionData?.id) {
              await supabase
                .from("referrals")
                .update({ subscription_id: subscriptionData.id })
                .eq("id", referral.id);
            }

            // Check if commissions ALREADY generated for this specific payment
            const { data: existingCommissions } = await supabase
              .from("referral_commissions")
              .select("id")
              .eq("subscription_payment_id", paymentId)
              .limit(1);

            if (!existingCommissions || existingCommissions.length === 0) {
              const { processMultiLevelCommissions } = await import("@/lib/referrals");
              const levels = await processMultiLevelCommissions(
                user.id,
                plan.price_cents,
                {
                  subscriptionPaymentId: paymentId,
                  periodStart: now.toISOString(),
                  periodEnd: periodEnd.toISOString(),
                }
              );
              console.log(`[IziPay Webhook] Comisiones recurrentes aplicadas niveles: ${levels.join(", ")} para usuario ${user.id}, pago ${paymentId}`);

              // Mark payment as commission_generated
              if (paymentId) {
                await supabase
                  .from("subscription_payments")
                  .update({ commission_generated: true })
                  .eq("id", paymentId);
              }
            } else {
              console.log(`[IziPay Webhook] Comisiones YA existen para pago ${paymentId}, skipping.`);
            }
          }
        }
      }
    }

    if (event.type === "subscription.canceled") {
      await supabase
        .from("subscriptions")
        .update({ status: "canceled" })
        .eq("izipay_subscription_id", event.data.subscription_id);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[IziPay Webhook] Error:", error);
    return NextResponse.json({ error: "Webhook error" }, { status: 400 });
  }
}
