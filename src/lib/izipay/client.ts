import type { IzipayPaymentConfig, IzipayCreatePaymentInput, IzipayPaymentResponse } from "./types";

export async function createPayment(
  input: IzipayCreatePaymentInput,
  config: IzipayPaymentConfig
): Promise<IzipayPaymentResponse> {
  // TODO: Implementar llamada real a IziPay REST API
  // Endpoint: POST https://api.micuentaweb.pe/api-payment/V4/Charge/CreatePayment
  // Headers: Authorization: Basic base64(shopId:secretKey)
  // Body: { amount, currency, orderId, customer, etc. }

  console.warn("[IziPay] createPayment es un esqueleto. Falta implementar la llamada real.", { input, config });

  // Simulación temporal
  return {
    status: "SUCCESS",
    answer: {
      formToken: "SIMULATED_TOKEN_" + Date.now(),
    },
  };
}

export function verifySignature(payload: string, signature: string, hmacKey: string): boolean {
  // TODO: Implementar verificación HMAC-SHA256 real
  console.warn("[IziPay] verifySignature es un esqueleto. Falta implementar HMAC.", { payload, signature, hmacKey });
  return true; // Por ahora aceptamos todo
}

export function getIzipayScriptUrl(): string {
  return "https://static.micuentaweb.pe/static/js/krypton-client/V4.0/stable/kr-payment-form.min.js";
}
