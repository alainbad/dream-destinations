/**
 * Server-only LiteAPI client. Never import from client code — the ".server.ts"
 * suffix keeps this file out of the browser bundle.
 *
 * Docs: https://docs.liteapi.travel
 * Sandbox base: https://api.sandbox.liteapi.travel/v3.0
 * Prod base:    https://api.liteapi.travel/v3.0
 *
 * Auth header: X-API-Key (use the public key for search endpoints and the
 * private/secret key for prebook + book).
 */

function base(): string {
  const env = (process.env.LITEAPI_ENV || "sandbox").toLowerCase();
  return env === "prod" || env === "production"
    ? "https://api.liteapi.travel/v3.0"
    : "https://api.sandbox.liteapi.travel/v3.0";
}

function publicKey(): string {
  const k = process.env.LITEAPI_PUBLIC_KEY;
  if (!k) throw new Error("LITEAPI_PUBLIC_KEY is not configured");
  return k;
}

function privateKey(): string {
  const k = process.env.LITEAPI_PRIVATE_KEY;
  if (!k) throw new Error("LITEAPI_PRIVATE_KEY is not configured");
  return k;
}

export function hasLiteApiKeys(): boolean {
  return Boolean(process.env.LITEAPI_PUBLIC_KEY && process.env.LITEAPI_PRIVATE_KEY);
}

async function call<T>(path: string, opts: { key: "public" | "private"; method?: "GET" | "POST"; body?: unknown; query?: Record<string, string | number | undefined> }): Promise<T> {
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
      "X-API-Key": opts.key === "public" ? publicKey() : privateKey(),
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`LiteAPI ${res.status}: ${text.slice(0, 300)}`);
  }
  return res.json() as Promise<T>;
}

// ---- Endpoints (typed loosely; refine as we integrate) ----

export type LiteHotel = {
  id: string;
  name: string;
  country?: string;
  city?: string;
  stars?: number;
  rating?: number;
  reviewCount?: number;
  address?: string;
  thumbnail?: string;
  images?: string[];
};

export async function searchHotels(params: {
  destination: string;
  checkin: string;
  checkout: string;
  adults: number;
  currency?: string;
}) {
  // GET /hotels — free-text destination search, then /hotels/rates for availability.
  return call<{ data: LiteHotel[] }>("/hotels", {
    key: "public",
    query: {
      countryCode: undefined,
      cityName: params.destination,
      limit: 24,
    },
  });
}

export async function getHotel(hotelId: string) {
  return call<{ data: LiteHotel }>(`/hotels/${encodeURIComponent(hotelId)}`, { key: "public" });
}

export async function prebook(rateId: string) {
  return call<{ data: { prebookId: string; price: number; currency: string } }>(
    "/rates/prebook",
    { key: "private", method: "POST", body: { offerId: rateId } },
  );
}

export async function book(input: {
  prebookId: string;
  holder: { firstName: string; lastName: string; email: string };
  payment: { method: "STRIPE_TOKEN"; token: string };
}) {
  return call<{ data: { bookingId: string; status: string } }>(
    "/rates/book",
    { key: "private", method: "POST", body: input },
  );
}
