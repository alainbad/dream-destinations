# Dream Destinations

Curated luxury hotel bookings powered by **LiteAPI** (merchant of record) with a configurable commission markup. Web app first, wrapped as a native iOS app via Capacitor.

## Architecture

- **Frontend:** TanStack Start + Tailwind + shadcn/ui
- **Backend:** Lovable Cloud (Postgres + Auth + RLS)
- **Hotel inventory & bookings:** LiteAPI (`sandbox` by default)
- **Payments:** LiteAPI Pay SDK — LiteAPI collects the full amount from the guest as merchant of record and pays out our commission on the configured weekly/monthly cycle.
- **Native iOS:** Capacitor wrapping the deployed web app.

## Commission model

Server-side markup is applied to every rate before it reaches the browser. Defaults (edit in `src/lib/pricing.ts`):

| Country | Markup |
| --- | --- |
| Default | 10% |
| UAE (AE) | 9% |
| Lebanon (LB) | 12% |
| Europe | 10% |
| Promo flag | 5% |

Every confirmed booking stores `net_price`, `markup_pct`, `commission`, and `customer_total` in the `bookings` table so payouts from LiteAPI can be reconciled.

## Environment

- `LITEAPI_PUBLIC_KEY` — used for search endpoints.
- `LITEAPI_PRIVATE_KEY` — used for prebook + book.
- `LITEAPI_ENV` — `sandbox` (default) or `prod`.

All three are configured via Lovable secrets and only read inside server-only files (`*.server.ts`, `.handler()` bodies).

## Native iOS build (run locally on a Mac with Xcode)

```bash
bun install
bun run build
npx cap add ios          # only the first time
npx cap sync ios
npx cap open ios         # opens Xcode
```

Then Product → Archive → Distribute App → App Store Connect to ship to TestFlight / the App Store. The iOS shell points at the published Lovable URL, so any change you deploy from Lovable is live in the app immediately — no re-submission needed for content updates.
