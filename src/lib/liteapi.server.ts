/**
 * Server-only LiteAPI client. Never import from client code — the ".server.ts"
 * suffix keeps this file out of the browser bundle.
 *
 * Docs: https://docs.liteapi.travel
 * Sandbox base: https://api.sandbox.liteapi.travel/v3.0
 * Prod base:    https://api.liteapi.travel/v3.0
 *
 * Auth header: X-API-Key (public key for search, private key for prebook + book).
 *
 * PAYMENTS: LiteAPI acts as the merchant of record. Cards are tokenized in the
 * browser via the LiteAPI Pay JS SDK (https://pay.liteapi.travel/sdk/liteapi-pay.js)
 * — the SDK returns a transactionId which is then passed to /rates/book with
 * method: "TRANSACTION_ID". LiteAPI captures the funds and pays out our
 * commission on the configured weekly/monthly cycle.
 */

function base(): string {
  // LiteAPI hosts sandbox and production on separate subdomains.
  // Sandbox keys (prefix "sand_") ONLY work against api.sandbox.liteapi.travel;
  // production keys ONLY work against api.liteapi.travel.
  const env = (process.env.LITEAPI_ENV || "sandbox").toLowerCase();
  return env === "prod" || env === "production"
    ? "https://api.liteapi.travel/v3.0"
    : "https://api.sandbox.liteapi.travel/v3.0";
}

function apiKey(): string {
  const k = process.env.LITEAPI_PRIVATE_KEY;
  if (!k) throw new Error("LITEAPI_PRIVATE_KEY is not configured");
  return k;
}

export function hasLiteApiKeys(): boolean {
  return Boolean(process.env.LITEAPI_PRIVATE_KEY);
}

export function liteApiEnv(): "sandbox" | "prod" {
  return (process.env.LITEAPI_ENV || "sandbox").toLowerCase() === "prod" ? "prod" : "sandbox";
}

async function call<T>(path: string, opts: { method?: "GET" | "POST"; body?: unknown; query?: Record<string, string | number | undefined> }): Promise<T> {
  const url = new URL(base() + path);
  if (opts.query) {
    for (const [k, v] of Object.entries(opts.query)) {
      if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
    }
  }
  const res = await fetch(url.toString(), {
    method: opts.method || "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-API-Key": apiKey(),
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`LiteAPI ${res.status}: ${text.slice(0, 300)}`);
  }
  return res.json() as Promise<T>;
}

// ---- Endpoints ----

export type LiteHotel = {
  id: string;
  name: string;
  country?: string;
  countryCode?: string;
  city?: string;
  stars?: number;
  starRating?: number;
  rating?: number;
  reviewCount?: number;
  address?: string;
  thumbnail?: string;
  main_photo?: string;
  images?: string[];
  hotelImages?: Array<{ url?: string; urlHd?: string; caption?: string; order?: number; defaultImage?: boolean }>;
  hotelDescription?: string;
  description?: string;
  rooms?: Array<{
    id?: number;
    roomName?: string;
    description?: string;
    maxOccupancy?: number;
    maxAdults?: number;
    photos?: Array<{ url?: string; failoverPhoto?: string; mainPhoto?: boolean }>;
  }>;
};

/** Maps common destination names to ISO-2 country codes for LiteAPI. */
function destinationToCountryCode(destination: string): string | undefined {
  const s = destination.toLowerCase();
  if (s.includes("uae") || s.includes("dubai") || s.includes("abu dhabi")) return "AE";
  if (s.includes("lebanon") || s.includes("beirut")) return "LB";
  if (s.includes("france") || s.includes("paris")) return "FR";
  if (s.includes("spain") || s.includes("barcelona")) return "ES";
  if (s.includes("uk") || s.includes("london")) return "GB";
  if (s.includes("italy") || s.includes("rome")) return "IT";
  if (s.includes("usa") || s.includes("new york")) return "US";
  if (s.includes("bali") || s.includes("indonesia")) return "ID";
  if (s.includes("maldives")) return "MV";
  if (s.includes("turkey") || s.includes("istanbul")) return "TR";
  if (s.includes("greece") || s.includes("athens") || s.includes("santorini")) return "GR";
  if (s.includes("thailand") || s.includes("bangkok") || s.includes("phuket")) return "TH";
  if (s.includes("egypt") || s.includes("cairo") || s.includes("sharm")) return "EG";
  if (s.includes("morocco") || s.includes("marrakech")) return "MA";
  if (s.includes("japan") || s.includes("tokyo")) return "JP";
  if (s.includes("portugal") || s.includes("lisbon")) return "PT";
  if (s.includes("netherlands") || s.includes("amsterdam")) return "NL";
  if (s.includes("germany") || s.includes("berlin")) return "DE";
  if (s.includes("switzerland") || s.includes("zurich")) return "CH";
  if (s.includes("australia") || s.includes("sydney")) return "AU";
  if (s.includes("canada") || s.includes("toronto")) return "CA";
  return undefined;
}

export async function searchHotels(params: {
  destination: string;
  checkin: string;
  checkout: string;
  adults: number;
  currency?: string;
}) {
  return call<{ data: LiteHotel[]; hotelIds?: string[]; total?: number }>("/data/hotels", {
    query: {
      cityName: params.destination,
      countryCode: destinationToCountryCode(params.destination),
      limit: 24,
    },
  });
}

export async function getHotel(hotelId: string) {
  return call<{ data: LiteHotel }>("/data/hotel", {
    query: { hotelId },
  });
}

export type LiteRateHotel = {
  hotelId: string;
  roomTypes?: Array<{
    offerId: string;
    rates?: Array<{
      name?: string;
      maxOccupancy?: number;
      boardName?: string;
      retailRate?: { total?: Array<{ amount: number; currency: string }> };
    }>;
  }>;
};

/**
 * Fetches live rates for a set of hotels for the given dates. Pass the
 * hotelIds returned by searchHotels(). Each hotel's cheapest offerId/amount
 * is what prebookRate() ultimately needs.
 */
export async function getRates(params: {
  hotelIds: string[];
  checkin: string;
  checkout: string;
  adults: number;
  currency?: string;
  guestNationality?: string;
}) {
  return call<{ data: LiteRateHotel[] }>("/hotels/rates", {
    method: "POST",
    body: {
      hotelIds: params.hotelIds,
      checkin: params.checkin,
      checkout: params.checkout,
      currency: params.currency || "USD",
      guestNationality: params.guestNationality || "US",
      occupancies: [{ adults: params.adults }],
      roomMapping: true,
      maxRatesPerHotel: 10,
    },
  });
}

/** Picks the cheapest offer per hotel from a getRates() response. */
export function cheapestOfferByHotel(
  rateHotels: LiteRateHotel[],
): Map<string, { offerId: string; amount: number; currency: string }> {
  const out = new Map<string, { offerId: string; amount: number; currency: string }>();
  for (const h of rateHotels) {
    let best: { offerId: string; amount: number; currency: string } | undefined;
    for (const rt of h.roomTypes ?? []) {
      for (const rate of rt.rates ?? []) {
        const total = rate.retailRate?.total?.[0];
        if (!total || typeof total.amount !== "number") continue;
        if (!best || total.amount < best.amount) {
          best = { offerId: rt.offerId, amount: total.amount, currency: total.currency };
        }
      }
    }
    if (best) out.set(h.hotelId, best);
  }
  return out;
}

/**
 * Locks a rate for a short window (usually ~15min). Returns prebookId used at
 * the book step. Pass the offerId returned by /hotels/rates.
 */
export async function prebookRate(offerId: string) {
  return call<{
    data: {
      prebookId: string;
      offerId: string;
      price: number;
      currency: string;
      cancellationPolicies?: unknown;
    };
  }>("/rates/prebook", {
    method: "POST",
    body: { offerId },
  });
}

/**
 * Confirms the booking. `transactionId` comes from the LiteAPI Pay SDK in the
 * browser after the guest enters their card details.
 */
export async function bookRate(input: {
  prebookId: string;
  holder: { firstName: string; lastName: string; email: string; phone?: string };
  guests: Array<{ firstName: string; lastName: string; email?: string }>;
  transactionId: string;
  specialRequests?: string;
}) {
  return call<{
    data: {
      bookingId: string;
      status: string;
      supplierBookingId?: string;
      supplierBookingName?: string;
    };
  }>("/rates/book", {
    method: "POST",
    body: {
      prebookId: input.prebookId,
      holder: input.holder,
      guests: input.guests,
      payment: { method: "TRANSACTION_ID", transactionId: input.transactionId },
      specialRequests: input.specialRequests,
    },
  });
}
