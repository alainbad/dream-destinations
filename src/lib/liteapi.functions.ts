/**
 * Client-safe server-function wrappers around the LiteAPI adapter.
 * The .handler() bodies are stripped from the client bundle.
 *
 * Until LITEAPI_* keys are set (or LiteAPI sandbox is reachable), search falls
 * back to mock hotels so the UI keeps working during development.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { hotels as mockHotels, rooms as mockRooms } from "@/lib/mock-data";
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
  amenities: string[];
  price: MarkedUpPrice;
};

const SearchInput = z.object({
  destination: z.string().default(""),
  checkIn: z.string().default(""),
  checkOut: z.string().default(""),
  guests: z.number().int().min(1).default(2),
  promo: z.boolean().optional(),
});

/** Defaults used to price a search when the user hasn't picked dates yet. */
function defaultDateRange(): { checkin: string; checkout: string } {
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  const checkin = new Date();
  checkin.setDate(checkin.getDate() + 7);
  const checkout = new Date(checkin);
  checkout.setDate(checkout.getDate() + 3);
  return { checkin: fmt(checkin), checkout: fmt(checkout) };
}

export const searchHotels = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => SearchInput.parse(input))
  .handler(async ({ data }): Promise<{ results: HotelSearchResult[]; source: "live" | "mock" }> => {
    const { hasLiteApiKeys, searchHotels: liteSearch, getRates, cheapestOfferByHotel } = await import("@/lib/liteapi.server");

    if (!hasLiteApiKeys()) {
      console.warn("liteapi.searchHotels: LITEAPI_PRIVATE_KEY not set in this runtime — using mock results");
      return mockResults(data.destination, data.promo);
    }

    const fallbackDates = defaultDateRange();
    const checkin = data.checkIn || fallbackDates.checkin;
    const checkout = data.checkOut || fallbackDates.checkout;

    try {
      const res = await liteSearch({
        destination: data.destination,
        checkin,
        checkout,
        adults: data.guests,
        currency: "USD",
      });
      const hotelList = res.data ?? [];

      let offers = new Map<string, { offerId: string; amount: number; currency: string }>();
      if (hotelList.length) {
        try {
          const ratesRes = await getRates({
            hotelIds: hotelList.map((h) => h.id),
            checkin,
            checkout,
            adults: data.guests,
            currency: "USD",
          });
          offers = cheapestOfferByHotel(ratesRes.data ?? []);
        } catch (rateErr) {
          console.error("liteapi.getRates failed, showing hotels without pricing", rateErr);
        }
      }

      return {
        source: "live",
        results: hotelList.map((h) => {
          const offer = offers.get(h.id);
          return {
            id: h.id,
            name: h.name,
            location: [h.city, h.country].filter(Boolean).join(", "),
            country: h.country,
            stars: h.stars ?? 0,
            rating: h.rating ?? 0,
            ratingLabel: "",
            reviews: h.reviewCount ?? 0,
            img: h.thumbnail || h.images?.[0] || "",
            amenities: [],
            price: applyMarkup(offer?.amount ?? 0, offer?.currency ?? "USD", { country: h.country, promo: data.promo }),
          };
        }),
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
      amenities: h.amenities,
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

// ---------- Detail ----------

export type HotelDetailRoom = {
  name: string;
  guests: number;
  offerId?: string;
  img?: string;
  bed?: string;
  size?: string;
  price: MarkedUpPrice;
};

export type HotelDetailResult = {
  id: string;
  name: string;
  location: string;
  country?: string;
  stars: number;
  rating: number;
  ratingLabel: string;
  reviews: number;
  img: string;
  gallery: string[];
  amenities: string[];
  description: string;
  rooms: HotelDetailRoom[];
};

const DetailInput = z.object({
  hotelId: z.string().min(1),
  checkIn: z.string().default(""),
  checkOut: z.string().default(""),
  guests: z.number().int().min(1).default(2),
});

function nightsBetween(a: string, b: string): number {
  const d1 = new Date(a).getTime();
  const d2 = new Date(b).getTime();
  if (isNaN(d1) || isNaN(d2) || d2 <= d1) return 3;
  return Math.max(1, Math.round((d2 - d1) / 86400000));
}

export const getHotelDetails = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => DetailInput.parse(input))
  .handler(async ({ data }): Promise<{ hotel: HotelDetailResult | null; source: "live" | "mock" }> => {
    const { hasLiteApiKeys, getHotel, getRates } = await import("@/lib/liteapi.server");

    if (!hasLiteApiKeys()) return { hotel: mockDetail(data.hotelId), source: "mock" };

    const fallbackDates = defaultDateRange();
    const checkin = data.checkIn || fallbackDates.checkin;
    const checkout = data.checkOut || fallbackDates.checkout;
    const nights = nightsBetween(checkin, checkout);

    try {
      const res = await getHotel(data.hotelId);
      const h = res.data;
      if (!h) return { hotel: mockDetail(data.hotelId), source: "mock" };

      let rooms: HotelDetailRoom[] = [];
      try {
        const ratesRes = await getRates({
          hotelIds: [data.hotelId],
          checkin,
          checkout,
          adults: data.guests,
          currency: "USD",
        });
        const rateHotel = (ratesRes.data ?? []).find((r) => r.hotelId === data.hotelId);
        const roomById = new Map((h.rooms ?? []).map((r) => [r.id, r]));
        rooms = (rateHotel?.roomTypes ?? []).map((rt) => {
          const rate = rt.rates?.[0];
          const total = rate?.retailRate?.total?.[0];
          const perNight = total ? total.amount / nights : 0;
          const mappedRoom = rate?.mappedRoomId ? roomById.get(rate.mappedRoomId) : undefined;
          const roomPhoto = mappedRoom?.photos?.[0]?.url || h.main_photo || h.thumbnail || "";
          return {
            name: mappedRoom?.roomName || rate?.name || "Room",
            guests: rate?.maxOccupancy || mappedRoom?.maxOccupancy || data.guests,
            offerId: rt.offerId,
            img: roomPhoto,
            bed: mappedRoom?.description ? undefined : undefined,
            size: mappedRoom?.description ? undefined : undefined,
            price: applyMarkup(perNight, total?.currency || "USD", { country: h.country }),
          };
        });
      } catch (rateErr) {
        console.error("liteapi.getHotelDetails rates failed", rateErr);
      }

      const gallery =
        h.hotelImages?.map((img) => img.url).filter((x): x is string => Boolean(x)) ||
        [h.main_photo || h.thumbnail].filter((x): x is string => Boolean(x));

      return {
        source: "live",
        hotel: {
          id: h.id,
          name: h.name,
          location: [h.city, h.country].filter(Boolean).join(", "),
          country: h.country,
          stars: h.starRating ?? h.stars ?? 0,
          rating: h.rating ?? 0,
          ratingLabel: "",
          reviews: h.reviewCount ?? 0,
          img: h.main_photo || h.thumbnail || "",
          gallery,
          amenities: [],
          description: h.hotelDescription || "",
          rooms,
        },
      };
    } catch (err) {
      console.error("liteapi.getHotelDetails failed, falling back to mock", err);
      return { hotel: mockDetail(data.hotelId), source: "mock" };
    }
  });

function mockDetail(hotelId: string): HotelDetailResult | null {
  const h = mockHotels.find((x) => x.id === hotelId);
  if (!h) return null;
  const country = guessCountry(h.location);
  return {
    id: h.id,
    name: h.name,
    location: h.location,
    country,
    stars: h.stars,
    rating: h.rating,
    ratingLabel: h.ratingLabel,
    reviews: h.reviews,
    img: h.img,
    gallery: h.gallery,
    amenities: h.amenities,
    description: h.description,
    rooms: mockRooms.map((r) => ({
      name: r.name,
      guests: r.guests,
      img: r.img,
      bed: r.bed,
      size: r.size,
      price: applyMarkup(r.price, "USD", { country }),
    })),
  };
}

// ---------- Prebook ----------

const PrebookInput = z.object({ offerId: z.string().min(1) });

export const prebook = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => PrebookInput.parse(input))
  .handler(async ({ data }) => {
    const { prebookRate } = await import("@/lib/liteapi.server");
    const res = await prebookRate(data.offerId);
    const { prebookId, offerId, price, currency } = res.data;
    return { prebookId, offerId, price, currency };
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
