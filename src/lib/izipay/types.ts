export interface IzipayPaymentConfig {
  shopId: string;
  publicKey: string;
  secretKey: string;
  hmacKey: string;
  environment: "sandbox" | "production";
  displayMode: "popup" | "embedded";
}

export interface IzipayCreatePaymentInput {
  amount: number; // cents
  currency: string;
  orderId: string;
  customer?: {
    email?: string;
    reference?: string;
  };
}

export interface IzipayPaymentResponse {
  status: string;
  answer: {
    formToken: string;
    orderStatus?: string;
    orderId?: string;
    transactionUuid?: string;
  };
}

export interface IzipayWebhookPayload {
  krHash: string;
  krAnswer: string;
}
