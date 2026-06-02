/* ─── Billing Profile Validations ─── */
// Country-specific document and billing validations

export interface BillingValidation {
  valid: boolean;
  error?: string;
}

export interface CountryConfig {
  code: string;
  name: string;
  documentTypes: { value: string; label: string; pattern: RegExp; example: string }[];
  currency: string;
}

export const COUNTRY_CONFIGS: Record<string, CountryConfig> = {
  PE: {
    code: "PE",
    name: "Perú",
    documentTypes: [
      { value: "dni", label: "DNI", pattern: /^\d{8}$/, example: "12345678" },
      { value: "ce", label: "Carnet de Extranjería", pattern: /^\d{9,12}$/, example: "12345678901" },
      { value: "passport", label: "Pasaporte", pattern: /^[A-Z0-9]{6,12}$/i, example: "AB123456" },
    ],
    currency: "PEN",
  },
  EC: {
    code: "EC",
    name: "Ecuador",
    documentTypes: [
      { value: "cedula", label: "Cédula", pattern: /^\d{10}$/, example: "1234567890" },
      { value: "ruc", label: "RUC", pattern: /^\d{13}$/, example: "1234567890001" },
      { value: "passport", label: "Pasaporte", pattern: /^[A-Z0-9]{6,12}$/i, example: "AB123456" },
    ],
    currency: "USD",
  },
  CO: {
    code: "CO",
    name: "Colombia",
    documentTypes: [
      { value: "cc", label: "Cédula de Ciudadanía", pattern: /^\d{6,10}$/, example: "1234567890" },
      { value: "ce", label: "Cédula de Extranjería", pattern: /^\d{6,10}$/, example: "1234567890" },
      { value: "nit", label: "NIT", pattern: /^\d{9,10}$/, example: "123456789" },
      { value: "passport", label: "Pasaporte", pattern: /^[A-Z0-9]{6,12}$/i, example: "AB123456" },
    ],
    currency: "COP",
  },
  MX: {
    code: "MX",
    name: "México",
    documentTypes: [
      { value: "curp", label: "CURP", pattern: /^[A-Z]{4}\d{6}[A-Z]{6}\d{2}$/i, example: "ABCD123456HDFABC01" },
      { value: "rfc", label: "RFC", pattern: /^[A-ZÑ&]{3,4}\d{6}[A-Z\d]{3}$/i, example: "ABCD123456ABC" },
      { value: "passport", label: "Pasaporte", pattern: /^[A-Z0-9]{6,12}$/i, example: "AB123456" },
    ],
    currency: "MXN",
  },
  US: {
    code: "US",
    name: "Estados Unidos",
    documentTypes: [
      { value: "ssn", label: "SSN", pattern: /^\d{3}-\d{2}-\d{4}$/, example: "123-45-6789" },
      { value: "tax_id", label: "Tax ID (EIN)", pattern: /^\d{2}-\d{7}$/, example: "12-3456789" },
      { value: "passport", label: "Pasaporte", pattern: /^[A-Z0-9]{6,12}$/i, example: "AB123456" },
    ],
    currency: "USD",
  },
  CL: {
    code: "CL",
    name: "Chile",
    documentTypes: [
      { value: "rut", label: "RUT", pattern: /^\d{7,8}-[\dkK]$/, example: "12345678-9" },
      { value: "passport", label: "Pasaporte", pattern: /^[A-Z0-9]{6,12}$/i, example: "AB123456" },
    ],
    currency: "CLP",
  },
  AR: {
    code: "AR",
    name: "Argentina",
    documentTypes: [
      { value: "dni", label: "DNI", pattern: /^\d{7,8}$/, example: "12345678" },
      { value: "cuit", label: "CUIT/CUIL", pattern: /^\d{2}-\d{8}-\d$/, example: "20-12345678-9" },
      { value: "passport", label: "Pasaporte", pattern: /^[A-Z0-9]{6,12}$/i, example: "AB123456" },
    ],
    currency: "ARS",
  },
  OTHER: {
    code: "OTHER",
    name: "Otro país",
    documentTypes: [
      { value: "passport", label: "Pasaporte", pattern: /^[A-Z0-9]{6,12}$/i, example: "AB123456" },
      { value: "tax_id", label: "Tax ID / ID Fiscal", pattern: /^.{5,50}$/, example: "123456789" },
      { value: "national_id", label: "ID Nacional", pattern: /^.{5,50}$/, example: "123456789" },
    ],
    currency: "USD",
  },
};

export function getCountryConfig(countryCode: string): CountryConfig {
  return COUNTRY_CONFIGS[countryCode.toUpperCase()] || COUNTRY_CONFIGS.OTHER;
}

export function validateDocument(
  countryCode: string,
  documentType: string,
  documentNumber: string
): BillingValidation {
  const config = getCountryConfig(countryCode);
  const docConfig = config.documentTypes.find((d) => d.value === documentType);

  if (!docConfig) {
    return { valid: false, error: `Tipo de documento no válido para ${config.name}` };
  }

  const normalized = documentNumber.trim().replace(/\s/g, "");

  if (!normalized) {
    return { valid: false, error: "Número de documento requerido" };
  }

  if (!docConfig.pattern.test(normalized)) {
    return {
      valid: false,
      error: `Formato inválido. Ejemplo: ${docConfig.example}`,
    };
  }

  return { valid: true };
}

export function validateBillingProfile(data: {
  full_name: string;
  document_type: string;
  document_number: string;
  country_code: string;
  binance_pay_id?: string;
  binance_email?: string;
  paypal_email?: string;
  withdrawal_method: string;
}): BillingValidation {
  if (!data.full_name || data.full_name.trim().length < 3) {
    return { valid: false, error: "Nombre completo requerido (mínimo 3 caracteres)" };
  }

  if (!data.country_code) {
    return { valid: false, error: "País requerido" };
  }

  const docValidation = validateDocument(
    data.country_code,
    data.document_type,
    data.document_number
  );
  if (!docValidation.valid) return docValidation;

  if (data.withdrawal_method === "binance_pay") {
    const hasId = !!data.binance_pay_id && data.binance_pay_id.trim() !== "";
    const hasEmail = !!data.binance_email && data.binance_email.trim() !== "";
    if (!hasId && !hasEmail) {
      return { valid: false, error: "Debes proporcionar tu Binance Pay ID o email de Binance" };
    }
    if (hasEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.binance_email!)) {
      return { valid: false, error: "Email de Binance inválido" };
    }
  }

  if (data.withdrawal_method === "paypal") {
    if (!data.paypal_email || data.paypal_email.trim() === "") {
      return { valid: false, error: "Email de PayPal requerido" };
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.paypal_email)) {
      return { valid: false, error: "Email de PayPal inválido" };
    }
  }

  return { valid: true };
}

export function getWithdrawalFee(amountCents: number, method: string): number {
  if (method === "binance_pay") return 0;
  if (method === "paypal") return Math.round(amountCents * 0.05);
  return 0;
}

export function calculateNetAmount(amountCents: number, method: string): number {
  return amountCents - getWithdrawalFee(amountCents, method);
}

export function getCountryList() {
  return Object.values(COUNTRY_CONFIGS).map((c) => ({
    code: c.code,
    name: c.name,
    currency: c.currency,
  }));
}
