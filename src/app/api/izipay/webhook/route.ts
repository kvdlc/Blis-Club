import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { verifyKRHash } from "@/lib/izipay/client";
import type { IzipayIPNAnswer } from "@/lib/izipay/types";

function generatePassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$";
  const length = 16;
  const array = new Uint32Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (v) => chars[v % chars.length]).join("");
}

async function ensureUserByEmail(
  supabase: ReturnType<typeof createServiceClient>,
  email: string,
  firstName?: string,
  lastName?: string
): Promise<string | null> {
  const normalizedEmail = email.trim().toLowerCase();

  // Try to find existing user
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existing = existingUsers?.users?.find(
    (u) => u.email?.toLowerCase() === normalizedEmail
  );
  if (existing) return existing.id;

  // Create new user
  const password = generatePassword();
  const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
    email: normalizedEmail,
    password,
    email_confirm: true,
    user_metadata: {
      first_name: firstName || "",
      last_name: lastName || "",
    },
  });

  if (createError || !newUser?.user) {
    console.error("[Webhook] Error creating user:", createError);
    return null;
  }

  const userId = newUser.user.id;

  // Create profile
  await supabase.from("profiles").upsert({
    id: userId,
    first_name: firstName || "",
    last_name: lastName || "",
    email: normalizedEmail,
    is_lead: true,
  }, { onConflict: "id" });

  // Send welcome email with password
  try {
    const { sendTemplateEmail } = await import("@/lib/email/sendTemplateEmail");
    sendTemplateEmail({
      evento: "bienvenida",
      to: normalizedEmail,
      variables: {
        nombre: firstName || normalizedEmail.split("@")[0],
        display_name: `${firstName || ""} ${lastName || ""}`.trim() || normalizedEmail.split("@")[0],
        email: normalizedEmail,
        password,
        app_name: "Blis Club",
        app_name_suffix: " a Blis Club",
        app_url: "https://blis.club/guau/app",
      },
    }).catch((err: unknown) => console.error("[Webhook] Welcome email failed:", err));
  } catch {}

  return userId;
}

export async function POST(request: Request) {
  try {
    const raw = await request.text();
    console.log("[Izipay Webhook] Raw body (first 500):", raw.substring(0, 500));

    let krHash: string | null = null;
    let krAnswer: string | null = null;

    try {
      const jsonBody = JSON.parse(raw);
      krHash = jsonBody["kr-hash"] || jsonBody.kr_hash || null;
      krAnswer = jsonBody["kr-answer"] || jsonBody.kr_answer || null;
      if (typeof krAnswer === "object") krAnswer = JSON.stringify(krAnswer);
    } catch {
      const params = new URLSearchParams(raw);
      krHash = params.get("kr-hash");
      krAnswer = params.get("kr-answer");
    }

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

    const supabase = createServiceClient();

    const { data: keys } = await supabase
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
    const isTokenizationOnly = referenceOrderId.startsWith("addcard_") || (Number(tx?.amount) === 0);

    console.log(`[Izipay Webhook] Buscando orden: ${referenceOrderId}, isTokenization: ${isTokenizationOnly}`);

    // ═══ TOKENIZATION-ONLY FLOW (add card, $0 verification) ═══
    if (isTokenizationOnly) {
      let userId: string | null = null;

      // Try to find user by customer reference, then by email
      const customerRef = customer?.reference as string;
      const customerEmail = customer?.email as string;

      if (customerRef && customerRef.includes("@")) {
        // Reference is an email (guest checkout) — look up by email
        userId = await ensureUserByEmail(supabase, customerRef);
      } else if (customerRef) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", customerRef)
          .maybeSingle();
        userId = profile?.id || null;
      }
      if (!userId && customerEmail) {
        userId = await ensureUserByEmail(supabase, customerEmail);
      }

      if (tx?.paymentMethodToken && userId) {
        const { data: existingToken } = await supabase
          .from("payment_tokens")
          .select("id")
          .eq("card_token", tx.paymentMethodToken)
          .eq("user_id", userId)
          .maybeSingle();

        if (!existingToken) {
          await supabase.from("payment_tokens").insert({
            user_id: userId,
            card_token: tx.paymentMethodToken,
            card_brand: tx.cardDetails?.brand || "",
            card_last4: String(tx.cardDetails?.pan || "").slice(-4),
            card_expiry: tx.cardDetails
              ? `${tx.cardDetails.expiryMonth || ""}/${tx.cardDetails.expiryYear || ""}`
              : "",
            is_active: true,
            metadata: {
              izipay_transaction_uuid: tx.uuid,
              izipay_order_id: orderId,
              registration_type: "REGISTER",
            },
          });
          console.log(`[Izipay Webhook] Token guardado (addcard) para usuario ${userId}`);
        }
      }

      return NextResponse.json({ received: true });
    }

    // ═══ PAYMENT FLOW (PAID, UNPAID, CANCELLED) ═══

    // Find subscription by orderId
    let { data: subscription } = await supabase
      .from("subscriptions")
      .select("id, user_id, plan_id, status, metadata")
      .eq("id", referenceOrderId)
      .maybeSingle();

    // If subscription not found by ID, try to find by izipay_subscription_id or create
    if (!subscription) {
      console.error(`[Izipay Webhook] Suscripción no encontrada: ${referenceOrderId}. Creando nueva suscripción para el pago.`);
      const customerEmail = customer?.email as string;
      const customerRef = customer?.reference as string;

      // Resolve or create user
      let userId: string | null = null;

      if (customerRef && !customerRef.includes("@")) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", customerRef)
          .maybeSingle();
        userId = profile?.id || null;
      }
      if (!userId && customerEmail) {
        userId = await ensureUserByEmail(supabase, customerEmail);
      }

      if (!userId) {
        return NextResponse.json({ error: "No se pudo determinar el usuario" }, { status: 404 });
      }

      // Find default plan
      let planId: string | null = null;
      if (!planId) {
        const { data: defaultPlan } = await supabase
          .from("plans")
          .select("id")
          .eq("billing_interval", "quarter")
          .order("price_cents", { ascending: true })
          .limit(1)
          .maybeSingle();
        planId = defaultPlan?.id || null;
      }

      const now = new Date();
      const periodEnd = new Date(now);
      periodEnd.setMonth(periodEnd.getMonth() + 3);

      const { data: created, error: createError } = await supabase
        .from("subscriptions")
        .insert({
          user_id: userId,
          plan_id: planId,
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

    if (!subscription) {
      return NextResponse.json({ error: "No se pudo encontrar ni crear la suscripción" }, { status: 500 });
    }

    console.log(`[Izipay Webhook] Suscripción ${subscription.id} encontrada, estado actual: ${subscription.status}`);

    // For guest checkout subscriptions (no user_id), resolve or create user
    if (!subscription.user_id) {
      console.log("[Izipay Webhook] Suscripción sin user_id — resolviendo usuario...");
      const customerEmail = customer?.email as string;
      const customerRef = customer?.reference as string;
      const subMetadata = (subscription.metadata as Record<string, unknown>) || {};
      const metaFirstName = subMetadata.guest_first_name as string | undefined;
      const metaLastName = subMetadata.guest_last_name as string | undefined;
      const metaEmail = subMetadata.guest_email as string | undefined;

      let userId: string | null = null;

      if (customerRef && !customerRef.includes("@")) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", customerRef)
          .maybeSingle();
        userId = profile?.id || null;
      }
      if (!userId && (customerEmail || metaEmail)) {
        userId = await ensureUserByEmail(supabase, customerEmail || metaEmail || "", metaFirstName, metaLastName);
      }

      if (userId) {
        await supabase
          .from("subscriptions")
          .update({ user_id: userId })
          .eq("id", subscription.id);
        subscription.user_id = userId;
        console.log(`[Izipay Webhook] Suscripción ${subscription.id} vinculada al usuario ${userId}`);
      } else {
        console.error(`[Izipay Webhook] No se pudo resolver usuario para suscripción huérfana ${subscription.id}`);
      }
    }

    if (orderStatus === "PAID") {
      const now = new Date();

      // If still no plan_id, find default
      if (!subscription.plan_id) {
        const { data: defaultPlan } = await supabase
          .from("plans")
          .select("id, billing_interval")
          .eq("billing_interval", "quarter")
          .order("price_cents", { ascending: true })
          .limit(1)
          .maybeSingle();

        if (defaultPlan) {
          subscription.plan_id = defaultPlan.id;
        }
      }

      const { data: billingPlan } = subscription.plan_id
        ? await supabase
            .from("plans")
            .select("billing_interval")
            .eq("id", subscription.plan_id)
            .maybeSingle()
        : { data: null };

      const periodEnd = new Date(now);
      const interval = billingPlan?.billing_interval || "quarter";
      if (interval === "year") {
        periodEnd.setMonth(periodEnd.getMonth() + 12);
      } else if (interval === "quarter") {
        periodEnd.setMonth(periodEnd.getMonth() + 3);
      } else {
        periodEnd.setMonth(periodEnd.getMonth() + 1);
      }

      const updateData: Record<string, unknown> = {
        status: "active",
        plan_type: "premium",
        current_period_start: now.toISOString(),
        current_period_end: periodEnd.toISOString(),
        expires_at: null,
        izipay_subscription_id: orderId,
      };
      if (subscription.plan_id) {
        updateData.plan_id = subscription.plan_id;
      }
      if (subscription.user_id) {
        updateData.user_id = subscription.user_id;
      }

      await Promise.all([
        supabase
          .from("subscriptions")
          .update(updateData)
          .eq("id", subscription.id),
        ...(subscription.user_id
          ? [supabase.from("profiles").update({ is_lead: false }).eq("id", subscription.user_id)]
          : []),
      ]);

      try {
        await supabase
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
      } catch {}

      if (tx?.paymentMethodToken && subscription.user_id) {
        const { data: existingToken } = await supabase
          .from("payment_tokens")
          .select("id")
          .eq("card_token", tx.paymentMethodToken)
          .eq("user_id", subscription.user_id)
          .maybeSingle();

        if (!existingToken) {
          await supabase.from("payment_tokens").insert({
            user_id: subscription.user_id,
            subscription_id: subscription.id,
            card_token: tx.paymentMethodToken,
            card_brand: tx.cardDetails?.brand || "",
            card_last4: String(tx.cardDetails?.pan || "").slice(-4),
            card_expiry: tx.cardDetails
              ? `${tx.cardDetails.expiryMonth || ""}/${tx.cardDetails.expiryYear || ""}`
              : "",
            is_active: true,
            metadata: {
              izipay_transaction_uuid: tx.uuid,
              izipay_order_id: orderId,
              registration_type: "REGISTER_PAY",
            },
          });
        }
      }

      // Record payment + process commissions
      if (subscription.plan_id) {
        const { data: plan } = await supabase
          .from("plans")
          .select("id, name, price_cents")
          .eq("id", subscription.plan_id)
          .single();

        if (plan && subscription.user_id) {
          const txAmount = tx?.amount ? Math.round(tx.amount) : plan.price_cents;

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
      }

      console.log(`[Izipay Webhook] Suscripción ${subscription.id} ACTIVADA`);
    } else if (orderStatus === "UNPAID" || orderStatus === "CANCELLED") {
      const updateData: Record<string, unknown> = {
        status: "canceled",
        metadata: {
          ...((subscription.metadata as Record<string, unknown>) || {}),
          izipay_status: orderStatus,
        },
      };

      await Promise.all([
        supabase
          .from("subscriptions")
          .update(updateData)
          .eq("id", subscription.id),
        ...(subscription.user_id
          ? [supabase.from("profiles").update({ is_lead: true }).eq("id", subscription.user_id)]
          : []),
      ]);

      console.log(`[Izipay Webhook] Suscripción ${subscription.id} CANCELADA.`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[Izipay Webhook] Error:", msg);
    return NextResponse.json({ error: "Webhook error" }, { status: 400 });
  }
}