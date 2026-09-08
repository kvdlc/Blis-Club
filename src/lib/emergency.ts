/* ═══════════════════════ Emergencias viales por país ═══════════════════════ */

export interface EmergencyEntry {
  label: string;
  number: string; // solo dígitos (sin +) para tel:
  emoji?: string;
}

export interface CountryEmergency {
  country: string;
  list: EmergencyEntry[];
}

export const COUNTRY_EMERGENCIES: CountryEmergency[] = [
  {
    country: "PE",
    list: [
      { label: "Policía (PNP)", number: "105", emoji: "👮" },
      { label: "Bomberos", number: "116", emoji: "🚒" },
      { label: "SAMU (ambulancia)", number: "106", emoji: "🚑" },
      { label: "Central de emergencias", number: "911", emoji: "📞" },
    ],
  },
  {
    country: "EC",
    list: [
      { label: "Emergencias ECU-911", number: "911", emoji: "📞" },
      { label: "Policía Nacional", number: "101", emoji: "👮" },
      { label: "Bomberos", number: "102", emoji: "🚒" },
      { label: "Auxilio / Tránsito", number: "103", emoji: "🚗" },
    ],
  },
  {
    country: "MX",
    list: [
      { label: "Emergencias (C4)", number: "911", emoji: "📞" },
      { label: "Cruz Roja", number: "065", emoji: "🚑" },
      { label: "Ángeles Verdes (carretera)", number: "078", emoji: "🛣️" },
    ],
  },
  {
    country: "CO",
    list: [
      { label: "Emergencias", number: "123", emoji: "📞" },
      { label: "Policía de Carreteras", number: "767", emoji: "🛣️" },
      { label: "Bomberos", number: "119", emoji: "🚒" },
    ],
  },
  {
    country: "CL",
    list: [
      { label: "Emergencias", number: "133", emoji: "📞" },
      { label: "Bomberos", number: "132", emoji: "🚒" },
      { label: "Ambulancia SAMU", number: "131", emoji: "🚑" },
      { label: "Carabineros", number: "133", emoji: "👮" },
    ],
  },
  {
    country: "AR",
    list: [
      { label: "Emergencias", number: "911", emoji: "📞" },
      { label: "Bomberos", number: "100", emoji: "🚒" },
      { label: "Ambulancia / SAME", number: "107", emoji: "🚑" },
    ],
  },
  {
    country: "BO",
    list: [
      { label: "Emergencias", number: "911", emoji: "📞" },
      { label: "Policía", number: "110", emoji: "👮" },
      { label: "Bomberos", number: "119", emoji: "🚒" },
    ],
  },
  {
    country: "PY",
    list: [
      { label: "Emergencias", number: "911", emoji: "📞" },
      { label: "Policía", number: "911", emoji: "👮" },
      { label: "Bomberos", number: "132", emoji: "🚒" },
    ],
  },
  {
    country: "UY",
    list: [
      { label: "Emergencias", number: "911", emoji: "📞" },
      { label: "Bomberos", number: "104", emoji: "🚒" },
      { label: "Ambulancia", number: "105", emoji: "🚑" },
    ],
  },
  {
    country: "US",
    list: [{ label: "Emergency", number: "911", emoji: "📞" }],
  },
  {
    country: "ES",
    list: [{ label: "Emergencias", number: "112", emoji: "📞" }],
  },
];

export function emergencyForCountry(country: string | null | undefined): EmergencyEntry[] {
  if (!country) return [{ label: "Emergencias", number: "911", emoji: "📞" }];
  const found = COUNTRY_EMERGENCIES.find((c) => c.country === country.toUpperCase());
  return found ? found.list : [{ label: "Emergencias", number: "911", emoji: "📞" }];
}
