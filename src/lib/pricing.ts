/**
 * Commission / markup engine for hotel bookings.
 *
 * Recommended default: 10% (per Travel Platform research doc).
 * Country overrides mirror the research doc: UAE 9%, Lebanon 12%, Europe 10%, Promo 5%.
 * All markup is applied server-side before net prices reach the client.
 */

const EUROPEAN_COUNTRIES = new Set([
  "FR", "IT", "ES", "DE", "GB", "UK", "NL", "BE", "PT", "GR", "CH", "AT",
  "IE", "SE", "NO", "DK", "FI", "PL", "CZ", "HU", "HR", "SI", "SK", "RO",
  "BG", "EE", "LV", "LT", "LU", "MT", "CY", "IS",
]);

export type MarkupContext = {
  /** ISO-2 country code (e.g. "AE", "LB", "FR"). */
  country?: string;
  /** Flag a specific search/booking as promotional. */
  promo?: boolean;
};

export function markupPctFor({ country, promo }: MarkupContext = {}): number {
  if (promo) return 0.05;
  const c = country?.toUpperCase();
  if (c === "AE") return 0.09;
  if (c === "LB") return 0.12;
  if (c && EUROPEAN_COUNTRIES.has(c)) return 0.10;
  return 0.10; // default
}

export type MarkedUpPrice = {
  net: number;
  markupPct: number;
  commission: number;
  customerTotal: number;
  currency: string;
};

export function applyMarkup(netPrice: number, currency: string, ctx: MarkupContext = {}): MarkedUpPrice {
  const markupPct = markupPctFor(ctx);
  const commission = Math.round(netPrice * markupPct * 100) / 100;
  const customerTotal = Math.round((netPrice + commission) * 100) / 100;
  return { net: netPrice, markupPct, commission, customerTotal, currency };
}
