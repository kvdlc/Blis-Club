export const MICUENTAWEB_URLS = {
  sandbox: {
    api: 'https://api.micuentaweb.pe',
    sdk: 'https://static.micuentaweb.pe/static/js/krypton-client/V4.0/stable/kr-payment-form.min.js',
    panel: 'https://secure.micuentaweb.pe',
  },
  production: {
    api: 'https://api.micuentaweb.pe',
    sdk: 'https://static.micuentaweb.pe/static/js/krypton-client/V4.0/stable/kr-payment-form.min.js',
    panel: 'https://secure.micuentaweb.pe',
  },
} as const

export type IzipayEnvironment = 'sandbox' | 'production'
export type IzipayDisplayMode = 'popup' | 'embedded'

export interface IzipayConfig {
  shopId: string
  secretKey: string
  publicKey: string
  hmacKey: string
  environment: IzipayEnvironment
  displayMode: IzipayDisplayMode
}

export interface IzipayCreatePaymentRequest {
  amount: number
  currency: string
  orderId: string
  customer: {
    email: string
    reference?: string
    shippingDetails?: {
      firstName?: string
      lastName?: string
      country?: string
    }
  }
}

export interface IzipayCreatePaymentResponse {
  webService: string
  version: string
  applicationVersion: string
  status: 'SUCCESS' | 'ERROR'
  answer: {
    formToken: string
    orderId: string
  }
  ticket?: string
  serverDate?: string
}

export interface KROnSubmitResponse {
  clientAnswer: {
    orderStatus: string
    orderId: string
    orderCycle?: string
    transactions: Array<{
      uuid: string
      status: string
      amount: number
      currency: string
      paymentMethodType: string
      paymentMethodToken?: string
      cardDetails?: {
        pan: string
        brand: string
        expiryMonth: string
        expiryYear: string
        effectiveBrand?: string
      }
      paymentReceiptEmail?: string
    }>
  }
  serverAnswer?: unknown
}

export interface IzipayIPNPayload {
  'kr-hash': string
  'kr-answer': string
  'kr-hash-algorithm': 'sha256_hmac'
  'kr-answer-type': 'text/json'
}

export interface IzipayIPNAnswer {
  orderStatus: string
  orderId: string
  orderCycle?: string
  orderDetails?: {
    orderId?: string
    orderNumber?: string
    orderTotalAmount?: number
  }
  customer?: {
    email?: string
    reference?: string
  }
  transactions: Array<{
    uuid: string
    status: string
    amount: number
    currency: string
    paymentMethodType: string
    paymentMethodToken?: string
    cardDetails?: {
      pan: string
      brand: string
      expiryMonth: string
      expiryYear: string
    }
  }>
}

declare global {
  interface Window {
    KR: {
      setFormToken: (token: string) => void
      onSubmit: (callback: (response: KROnSubmitResponse) => boolean) => boolean
      onError: (callback: (error: { message: string }) => boolean) => boolean
      onFormReady: (callback: () => void) => boolean
      removeForms: () => void
      openPopup: () => void
      [key: string]: unknown
    }
  }
}
