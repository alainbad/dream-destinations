/**
 * Client-safe server-function wrappers around the LiteAPI adapter.
 * The .handler() bodies are stripped from the client bundle.
 *
 * Until LITEAPI_* keys are set (or LiteAPI sandbox is reachable), search falls
 * back to mock hotels so the UI keeps working during development.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { hotels as mockHotels } from "@/lib/mock-data";
import { applyMarkup, markupPctFor, type MarkedUpPrice } from "@/lib/pricing";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// ---------- Search ----------

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
  price: MarkedUpPrice;
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

    if (!hasLiteApiKeys()) return mockResults(data.destination, data.promo);

    try {
      const res = await liteSearch({
        destination: data.destination,
        checkin: data.checkIn,
        checkout: data.checkOut,
        adults: data.guests,
        currency: "USD",
      });
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
      console.error("liteapi.searchHotels failed, falling back to mock", err);
      return mockResults(data.destination, data.promo);
    }
  });

function mockResults(destination: string, promo?: boolean): { results: HotelSearchResult[]; source: "mock" } {
  const filtered = mockHotels.filter((h) => h.location.toLowerCase().includes(destination.toLowerCase()));
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
      price: applyMarkup(h.price, "USD", { country: guessCountry(h.location), promo }),
    })),
  };
}

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

// ---------- Prebook ----------

const PrebookInput = z.object({ offerId: z.string().min(1) });

export const prebook = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => PrebookInput.parse(input))
  .handler(async ({ data }) => {
    const { prebookRate } = await import("@/lib/liteapi.server");
    const res = await prebookRate(data.offerId);
    return res.data;
  });

// ---------- Book (requires auth) ----------

const BookInput = z.object({
  prebookId: z.string().min(1),
  hotelId: z.string().min(1),
  hotelName: z.string().min(1),
  hotelLocation: z.string().optional(),
  hotelImage: z.string().optional(),
  checkIn: z.string().min(1),
  checkOut: z.string().min(1),
  guests: z.number().int().min(1),
  roomName: z.string().optional(),
  holder: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    phone: z.string().optional(),
  }),
  specialRequests: z.string().optional(),
  transactionId: z.string().min(1),
  netPrice: z.number().min(0),
  currency: z.string().default("USD"),
});

export const bookHotel = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => BookInput.parse(input))
  .handler(async ({ data, context }) => {
    const { bookRate } = await import("@/lib/liteapi.server");

    const markupPct = markupPctFor({ country: guessCountry(data.hotelLocation ?? "") });
    const commission = Math.round(data.netPrice * markupPct * 100) / 100;
    const customerTotal = Math.round((data.netPrice + commission) * 100) / 100;

    const liteRes = await bookRate({
      prebookId: data.prebookId,
      holder: data.holder,
      guests: [{ firstName: data.holder.firstName, lastName: data.holder.lastName, email: data.holder.email }],
      transactionId: data.transactionId,
      specialRequests: data.specialRequests,
    });

    const { data: row, error } = await context.supabase
      .from("bookings")
      .insert({
        user_id: context.userId,
        liteapi_booking_id: liteRes.data.bookingId,
        liteapi_prebook_id: data.prebookId,
        hotel_id: data.hotelId,
        hotel_name: data.hotelName,
        hotel_location: data.hotelLocation,
        hotel_image: data.hotelImage,
        check_in: data.checkIn,
        check_out: data.checkOut,
        guests: data.guests,
        room_name: data.roomName,
        guest_first_name: data.holder.firstName,
        guest_last_name: data.holder.lastName,
        guest_email: data.holder.email,
        guest_phone: data.holder.phone,
        special_requests: data.specialRequests,
        currency: data.currency,
        net_price: data.netPrice,
        markup_pct: markupPct,
        commission,
        customer_total: customerTotal,
        status: liteRes.data.status || "confirmed",
      })
      .select()
      .single();

    if (error) throw new Error(`Booking save failed: ${error.message}`);

    return { booking: row, liteapi: liteRes.data };
  });

// ---------- List (auth) ----------

export const listMyBookings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });
