import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { createPayment } from "@/lib/izipay/client";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fieldId, value } = body as { fieldId: string; value: string };

    if (!fieldId || !value) {
      return NextResponse.json({ valid: false, error: "fieldId y value requeridos" });
    }

    // ─── Izipay test ───
    if (fieldId.startsWith("izipay_")) {
      const supabase = createServiceClient();
      const { data: keys } = await supabase
        .from("api_keys")
        .select("key_name, key_value")
        .in("key_name", ["izipay_shop_id", "izipay_secret_key", "izipay_public_key", "izipay_hmac_key", "izipay_environment", "izipay_display_mode"]);

      const map: Record<string, string> = {};
      for (const row of keys || []) {
        map[row.key_name] = row.key_value;
      }

      const shopId = map["izipay_shop_id"];
      const secretKey = map["izipay_secret_key"];
      const envRaw = (map["izipay_environment"] || "sandbox").toLowerCase();
      const environment = envRaw.includes("prod") ? "production" as const : "sandbox" as const;

      if (!shopId || !secretKey) {
        return NextResponse.json({ valid: false, error: "Faltan credenciales de Izipay (shop_id o secret_key)" });
      }

      const testOrderId = `test_${Date.now()}`;
      const response = await createPayment(
        {
          amount: 100,
          currency: "USD",
          orderId: testOrderId,
          customer: {
            email: "test@blis.club",
            reference: "test-user",
          },
        },
        {
          shopId,
          secretKey,
          publicKey: map["izipay_public_key"] || "",
          hmacKey: map["izipay_hmac_key"] || "",
          environment,
          displayMode: "popup",
        }
      );

      if (response.status === "SUCCESS" && response.answer.formToken) {
        return NextResponse.json({ valid: true });
      }
      return NextResponse.json({ valid: false, error: "No se pudo generar formToken. Revisa las credenciales." });
    }

    // ─── Gemini test ───
    if (fieldId === "gemini_key") {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${encodeURIComponent(value)}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "Say 'OK' if you can read this." }] }],
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
          return NextResponse.json({ valid: true });
        }
      }
      const err = await res.json().catch(() => ({}));
      return NextResponse.json({ valid: false, error: err.error?.message || "Clave inválida o sin cuota" });
    }

    // ─── Venice test ───
    if (fieldId === "venice_key") {
      const res = await fetch("https://api.venice.ai/api/v1/models", {
        headers: { Authorization: `Bearer ${value}` },
      });
      if (res.ok) {
        return NextResponse.json({ valid: true });
      }
      return NextResponse.json({ valid: false, error: "Clave inválida o sin acceso" });
    }

    return NextResponse.json({ valid: false, error: "Test no implementado para este campo" });
  } catch (err: any) {
    return NextResponse.json({ valid: false, error: err?.message || "Error en test" });
  }
}
