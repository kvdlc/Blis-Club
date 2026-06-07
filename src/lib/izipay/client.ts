import crypto from 'crypto'
import type {
  IzipayCreatePaymentRequest,
  IzipayCreatePaymentResponse,
  IzipayConfig,
} from './types'
import { MICUENTAWEB_URLS } from './types'

export async function createPayment(
  params: IzipayCreatePaymentRequest,
  config: IzipayConfig
): Promise<IzipayCreatePaymentResponse> {
  const authString = Buffer.from(`${config.shopId}:${config.secretKey}`).toString('base64')
  const apiUrl = `${MICUENTAWEB_URLS[config.environment].api}/api-payment/V4/Charge/CreatePayment`

  const body: Record<string, unknown> = {
    amount: params.amount,
    currency: params.currency,
    orderId: params.orderId,
    formAction: 'REGISTER_PAY',
    customer: {
      email: params.customer.email,
    },
  }

  if (params.customer.reference) {
    (body.customer as Record<string, unknown>).reference = params.customer.reference
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 12000)

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    })
    clearTimeout(timeout)

    const data = await response.json().catch(() => null)

    if (!data || !response.ok || data.status === 'ERROR') {
      console.error('[Izipay] CreatePayment error:', { status: response.status, data })
      return {
        webService: 'Charge',
        version: '4.0',
        applicationVersion: '',
        status: 'ERROR',
        answer: { formToken: '', orderId: params.orderId },
      }
    }

    return data as IzipayCreatePaymentResponse
  } catch (err: unknown) {
    clearTimeout(timeout)
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[Izipay] CreatePayment exception:', msg)
    return {
      webService: 'Charge',
      version: '4.0',
      applicationVersion: '',
      status: 'ERROR',
      answer: { formToken: '', orderId: params.orderId },
    }
  }
}

export function verifyKRHash(
  krAnswer: string,
  krHash: string,
  hmacKey: string
): boolean {
  try {
    const computed = crypto.createHmac('sha256', hmacKey).update(krAnswer).digest('hex')
    return computed === krHash
  } catch {
    return false
  }
}

export function getIzipayScriptUrl(): string {
  return 'https://static.micuentaweb.pe/static/js/krypton-client/V4.0/stable/kr-payment-form.min.js'
}
