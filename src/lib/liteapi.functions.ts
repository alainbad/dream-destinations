/**
 * Client-safe server-function wrappers around the LiteAPI adapter.
 * The .handler() bodies are stripped from the client bundle.
 *
 * Until LITEAPI_* secrets are set, these functions fall back to mock data so
 * the UI keeps working during development.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { hotels as mockHotels } from "@/lib/mock-data";
import { applyMarkup, type MarkedUpPrice } from "@/lib/pricing";

export type HotelSearchResult = {
  id: string;
  name: string;
  location: string;
  country?: string;
  stars: number;
  rating: number;
  ratingLabel: string;
  reviews: number;
  img: string;
  price: MarkedUpPrice; // marked-up customer-facing price per night
};

const SearchInput = z.object({
  destination: z.string().min(1),
  checkIn: z.string().default(""),
  checkOut: z.string().default(""),
  guests: z.number().int().min(1).default(2),
  promo: z.boolean().optional(),
});

export const searchHotels = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => SearchInput.parse(input))
  .handler(async ({ data }): Promise<{ results: HotelSearchResult[]; source: "live" | "mock" }> => {
    const { hasLiteApiKeys, searchHotels: liteSearch } = await import("@/lib/liteapi.server");

    if (!hasLiteApiKeys()) {
      // Mock fallback so the UI works before keys are configured.
      const filtered = mockHotels.filter((h) =>
        h.location.toLowerCase().includes(data.destination.toLowerCase()),
      );
      const list = filtered.length ? filtered : mockHotels;
      return {
        source: "mock",
        results: list.map((h) => ({
          id: h.id,
          name: h.name,
          location: h.location,
          country: guessCountry(h.location),
          stars: h.stars,
          rating: h.rating,
          ratingLabel: h.ratingLabel,
          reviews: h.reviews,
          img: h.img,
          price: applyMarkup(h.price, "USD", { country: guessCountry(h.location), promo: data.promo }),
        })),
      };
    }

    try {
      const res = await liteSearch({
        destination: data.destination,
        checkin: data.checkIn,
        checkout: data.checkOut,
        adults: data.guests,
        currency: "USD",
      });
      // NOTE: LiteAPI /hotels returns metadata only; rates come from /hotels/rates.
      // We're returning a placeholder net price of 0 until the rates call is wired.
      return {
        source: "live",
        results: (res.data ?? []).map((h) => ({
          id: h.id,
          name: h.name,
          location: [h.city, h.country].filter(Boolean).join(", "),
          country: h.country,
          stars: h.stars ?? 0,
          rating: h.rating ?? 0,
          ratingLabel: "",
          reviews: h.reviewCount ?? 0,
          img: h.thumbnail || h.images?.[0] || "",
          price: applyMarkup(0, "USD", { country: h.country, promo: data.promo }),
        })),
      };
    } catch (err) {
      console.error("liteapi.searchHotels failed", err);
      return { source: "mock", results: [] };
    }
  });

function guessCountry(location: string): string | undefined {
  const s = location.toLowerCase();
  if (s.includes("uae") || s.includes("dubai") || s.includes("abu dhabi")) return "AE";
  if (s.includes("lebanon") || s.includes("beirut")) return "LB";
  if (s.includes("france") || s.includes("paris")) return "FR";
  if (s.includes("spain") || s.includes("barcelona")) return "ES";
  if (s.includes("uk") || s.includes("london")) return "GB";
  if (s.includes("italy") || s.includes("rome")) return "IT";
  if (s.includes("usa") || s.includes("new york")) return "US";
  if (s.includes("bali") || s.includes("indonesia")) return "ID";
  if (s.includes("maldives")) return "MV";
  return undefined;
}
