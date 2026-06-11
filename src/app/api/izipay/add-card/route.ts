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

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { data: existingToken } = await supabase
      .from("payment_tokens")
      .select("id")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .maybeSingle();

    if (existingToken) {
      return NextResponse.json({ error: "Ya tienes una tarjeta guardada. Elimínala primero para agregar otra." }, { status: 409 });
    }

    const config = await getIzipayConfig();
    if (!config) {
      return NextResponse.json({ error: "Izipay no está configurado." }, { status: 500 });
    }

    const orderId = `addcard_${user.id.slice(0, 8)}_${Date.now()}`;

    const paymentResponse = await createPayment(
      {
        amount: 0,
        currency: "USD",
        orderId,
        formAction: "REGISTER",
        customer: {
          email: user.email || "",
          reference: user.id,
        },
      },
      config
    );

    if (paymentResponse.status !== "SUCCESS" || !paymentResponse.answer.formToken) {
      console.error("[Izipay Add Card] Error generando formToken:", paymentResponse);
      return NextResponse.json({ error: "Error al iniciar registro de tarjeta." }, { status: 502 });
    }

    return NextResponse.json({
      success: true,
      formToken: paymentResponse.answer.formToken,
      publicKey: config.publicKey,
      displayMode: config.displayMode,
    });
  } catch (error) {
    console.error("[Izipay Add Card] Error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}