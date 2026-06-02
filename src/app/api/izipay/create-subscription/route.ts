import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createPayment } from "@/lib/izipay/client";

export async function POST(request: Request) {
  try {
    const { planId } = await request.json();
    if (!planId) {
      return NextResponse.json({ error: "planId requerido" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Obtener plan
    const { data: plan } = await supabase
      .from("plans")
      .select("*")
      .eq("id", planId)
      .single();

    if (!plan) {
      return NextResponse.json({ error: "Plan no encontrado" }, { status: 404 });
    }

    // TODO: Obtener config de IziPay desde tabla api_keys o env vars
    const config = {
      shopId: process.env.IZIPAY_SHOP_ID || "",
      publicKey: process.env.IZIPAY_PUBLIC_KEY || "",
      secretKey: process.env.IZIPAY_SECRET_KEY || "",
      hmacKey: process.env.IZIPAY_HMAC_KEY || "",
      environment: (process.env.IZIPAY_ENVIRONMENT || "sandbox") as "sandbox" | "production",
      displayMode: "popup" as "popup" | "embedded",
    };

    // Crear orden en Supabase
    const { data: order } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        plan_id: planId,
        amount_cents: plan.price_cents,
        status: "pending",
      })
      .select()
      .single();

    // Crear pago en IziPay
    const paymentResponse = await createPayment(
      {
        amount: plan.price_cents,
        currency: "USD",
        orderId: order?.id || `order_${Date.now()}`,
        customer: { email: user.email || "", reference: user.id },
      },
      config
    );

    return NextResponse.json({
      success: true,
      formToken: paymentResponse.answer.formToken,
      publicKey: config.publicKey,
      orderId: order?.id,
    });
  } catch (error) {
    console.error("[IziPay Create Subscription] Error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
