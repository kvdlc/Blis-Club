export interface VolumeTier { min: number; pct: number; label: string; }

export const VOLUME_TIERS: VolumeTier[] = [
  { min: 16, pct: 25, label: "Mayorista" },
  { min: 6, pct: 18, label: "Al por mayor" },
  { min: 2, pct: 10, label: "Pack" },
  { min: 1, pct: 0, label: "Unitario" },
];

export function tierFor(qty: number): VolumeTier {
  return VOLUME_TIERS.find((t) => qty >= t.min) || VOLUME_TIERS[VOLUME_TIERS.length - 1];
}

export function unitPriceWithDiscount(unitPrice: number, qty: number): number {
  const tier = tierFor(qty);
  return Math.round(unitPrice * (1 - tier.pct / 100) * 100) / 100;
}
