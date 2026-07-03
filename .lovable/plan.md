
## Goal

Pivot Dream Destinations to a hotel-only booking platform powered by LiteAPI (with a configurable commission markup), then package the same web app as a native iOS app using Capacitor — the same approach used for Trackora.

---

## Phase 1 — Remove Flights

Strip the flights feature entirely so the app is focused only on hotels.

- Delete `src/routes/flights.tsx` (route auto-unregisters from `routeTree.gen.ts`).
- Remove Flights links/CTAs from `Navbar.tsx`, `Footer.tsx`, `__root.tsx` nav, and the home page (`index.tsx`).
- Remove flight cards/steps from `checkout.tsx` and `ai-trip-planner.tsx` (keep hotel logic; if AI planner is flight-centric, repurpose it to suggest destinations + hotels or hide it for now).
- Clean `src/lib/mock-data.ts` — remove flight mock arrays.

## Phase 2 — LiteAPI Integration (Sandbox first)

Add real hotel search + booking through LiteAPI. All calls happen server-side (TanStack `createServerFn`) so the API key never touches the browser.

**Secrets required**
- `LITEAPI_PUBLIC_KEY` (used for search)
- `LITEAPI_PRIVATE_KEY` (used for prebook/book)
- `LITEAPI_ENV` = `sandbox` initially, flip to `prod` later.

I will trigger the secure form to enter these after Phase 1 is in place.

**Server functions** (`src/lib/liteapi.functions.ts` + `src/lib/liteapi.server.ts`):
- `searchHotels({ destination, checkin, checkout, guests })` → `GET /hotels` + `/hotels/rates`
- `getHotelDetails({ hotelId })` → `GET /hotels/{id}`
- `prebook({ rateId })` → validates & locks the rate
- `book({ prebookId, guest, paymentToken })` → confirms booking
- All responses run through `applyMarkup()` before reaching the client.

**Commission engine** (`src/lib/pricing.ts`)
- Default markup: **10%** (per your notes).
- Country-tiered overrides: UAE 9%, Lebanon 12%, Europe 10%, Promo 5%.
- Single `applyMarkup(netPrice, { country, promo })` used everywhere prices are surfaced. Customer always sees the marked-up "total"; net + commission stored only server-side.

**UI wiring**
- `hotels.index.tsx` → real search form + results from `searchHotels`.
- `hotels.$id.tsx` → real detail + room list, "Book" button starts prebook.
- `checkout.tsx` → guest form + payment → calls `book`. For now use a Stripe-style stub (real payments come in a later phase; LiteAPI supports their own payment collection too, we can revisit).
- Loading, empty, and error states everywhere.

## Phase 3 — Persistence (Lovable Cloud)

Enable Lovable Cloud so users can sign in and see their bookings.

- `bookings` table: `id, user_id, liteapi_booking_id, hotel_name, checkin, checkout, guest_json, net_price, markup_pct, customer_total, currency, status, created_at`.
- RLS: users read/write only their own rows; service role full access.
- Save a row on successful `book()`; render on `dashboard.tsx`.

## Phase 4 — Native iOS via Capacitor (Trackora-style)

Same pattern as Trackora: keep one React codebase, wrap with Capacitor for iOS.

- Add `@capacitor/core`, `@capacitor/cli`, `@capacitor/ios`.
- `capacitor.config.ts` with `appId: com.dreamdestinations.app`, `appName: "Dream Destinations"`, `webDir: dist`, and a `server.url` pointing to the published Lovable URL during dev (so iOS mirrors live web changes).
- Add safe-area CSS (`env(safe-area-inset-*)`) so the header/footer don't collide with the notch.
- Document the local build steps in `README.md` (user runs `bun run build && npx cap add ios && npx cap sync && npx cap open ios` on a Mac with Xcode — Lovable's sandbox can't build the iOS binary).
- Publish via TestFlight → App Store from Xcode.

## Technical notes

- LiteAPI base URLs: `https://api.liteapi.travel/v3.0/...` (prod) and `https://api.sandbox.liteapi.travel/v3.0/...` (sandbox). Auth header `X-API-Key`.
- Never call LiteAPI from the browser; every call goes through a server fn to protect the key and to apply markup consistently.
- Markup is applied to `price` and `total` fields only; taxes/fees passed through unchanged.
- Keep flight-related components deleted (not commented) so the code stays clean.

## What I'll do right now if you approve

1. Execute Phase 1 (remove flights) end-to-end.
2. Scaffold Phase 2 server functions + pricing engine with a mock adapter so the UI works immediately.
3. Request the `LITEAPI_*` secrets via the secure form so we can flip the adapter to live sandbox calls.
4. Then move on to Phase 3 (Cloud + bookings table) and Phase 4 (Capacitor iOS) in follow-up turns.

Reply "go" to start, or tell me which phase to reorder/skip.
