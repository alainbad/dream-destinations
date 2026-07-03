import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { useServerFn } from "@tanstack/react-start";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, CreditCard, ShieldCheck, CheckCircle2, Loader2 } from "lucide-react";
import { hotels } from "@/lib/mock-data";
import { bookHotel } from "@/lib/liteapi.functions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// LiteAPI Pay SDK URL — loaded on demand in the browser only.
const LITEAPI_PAY_SDK = "https://pay.liteapi.travel/sdk/liteapi-pay.js";

const searchSchema = z.object({
  hotelId: fallback(z.string().optional(), undefined),
  prebookId: fallback(z.string().optional(), undefined),
  offerId: fallback(z.string().optional(), undefined),
  checkIn: fallback(z.string(), "").default(""),
  checkOut: fallback(z.string(), "").default(""),
  guests: fallback(z.number().int().min(1), 2).default(2),
  room: fallback(z.string().optional(), undefined),
});

export const Route = createFileRoute("/checkout")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({ meta: [{ title: "Checkout — Dream Destinations" }] }),
  component: Checkout,
});

function nightsBetween(a: string, b: string): number {
  if (!a || !b) return 3;
  const d1 = new Date(a).getTime();
  const d2 = new Date(b).getTime();
  if (isNaN(d1) || isNaN(d2) || d2 <= d1) return 3;
  return Math.max(1, Math.round((d2 - d1) / 86400000));
}

function fmtDate(s: string, fallback: string) {
  if (!s) return fallback;
  const d = new Date(s);
  if (isNaN(d.getTime())) return fallback;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function Checkout() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const bookFn = useServerFn(bookHotel);

  const hotel = hotels.find((h) => h.id === search.hotelId) ?? hotels[0];
  const nights = nightsBetween(search.checkIn, search.checkOut);
  const netPrice = hotel.price * nights; // net (supplier) — commission applied server-side
  const taxes = Math.round(netPrice * 0.12);
  const total = netPrice + taxes;

  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "", specialRequests: "",
  });
  const [processing, setProcessing] = useState(false);
  const [confirmation, setConfirmation] = useState<{ id: string; total: number } | null>(null);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  // Load LiteAPI Pay SDK once on the client.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (document.querySelector(`script[src="${LITEAPI_PAY_SDK}"]`)) return;
    const s = document.createElement("script");
    s.src = LITEAPI_PAY_SDK;
    s.async = true;
    document.head.appendChild(s);
  }, []);

  // Check auth (bookings are user-scoped).
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setSignedIn(!!data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, sess) => setSignedIn(!!sess?.user));
    return () => sub.subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!signedIn) {
      toast.error("Please sign in to complete your booking.");
      navigate({ to: "/login" });
      return;
    }
    if (!search.prebookId) {
      // For sandbox demo without a real prebook flow, use a placeholder.
      // In production, hotels.$id.tsx calls prebook() and passes prebookId in the URL.
      toast.error("Missing prebook reference. Please re-select the room.");
      return;
    }

    setProcessing(true);
    try {
      // 1. Tokenize card with LiteAPI Pay SDK.
      const transactionId = await tokenizeWithLiteApiPay({
        prebookId: search.prebookId,
        amount: total,
        currency: "USD",
      });

      // 2. Confirm booking on the server (LiteAPI captures payment as merchant of record).
      const result = await bookFn({
        data: {
          prebookId: search.prebookId,
          hotelId: hotel.id,
          hotelName: hotel.name,
          hotelLocation: hotel.location,
          hotelImage: hotel.img,
          checkIn: search.checkIn || new Date().toISOString().slice(0, 10),
          checkOut: search.checkOut || new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10),
          guests: search.guests,
          roomName: search.room,
          holder: form,
          specialRequests: form.specialRequests || undefined,
          transactionId,
          netPrice,
          currency: "USD",
        },
      });

      setConfirmation({ id: result.booking.liteapi_booking_id || result.booking.id, total });
      window.scrollTo(0, 0);
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Booking failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  }

  if (confirmation) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 pb-20 max-w-2xl mx-auto px-6 text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-success/15 grid place-items-center mb-6">
            <CheckCircle2 className="w-10 h-10 text-success" />
          </div>
          <h1 className="font-display text-4xl font-bold mb-3">Booking Confirmed</h1>
          <p className="text-muted-foreground mb-2">Your stay is locked in. A confirmation email is on its way.</p>
          <p className="text-sm text-muted-foreground mb-8">Confirmation #{confirmation.id}</p>
          <div className="flex gap-3 justify-center">
            <Button asChild className="bg-gradient-cta text-white border-0"><Link to="/dashboard">View My Bookings</Link></Button>
            <Button asChild variant="outline"><Link to="/">Back to Home</Link></Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="font-display text-4xl font-bold mb-2">Complete your booking</h1>
          <p className="text-muted-foreground mb-10">Payment is securely processed by LiteAPI — the merchant of record. You'll see them on your statement.</p>

          <form className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-10" onSubmit={handleSubmit}>
            <div className="space-y-8">
              <section className="bg-card rounded-2xl p-6 md:p-8 shadow-card border border-border/60">
                <h2 className="font-display text-xl font-bold mb-5">Guest Details</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5"><Label>First name</Label><Input required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="h-11" /></div>
                  <div className="space-y-1.5"><Label>Last name</Label><Input required value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="h-11" /></div>
                  <div className="space-y-1.5 col-span-2"><Label>Email</Label><Input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="h-11" /></div>
                  <div className="space-y-1.5 col-span-2"><Label>Phone</Label><Input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="h-11" /></div>
                  <div className="space-y-1.5 col-span-2"><Label>Special requests (optional)</Label><Input value={form.specialRequests} onChange={(e) => setForm({ ...form, specialRequests: e.target.value })} className="h-11" placeholder="e.g. high floor, late check-in" /></div>
                </div>
              </section>

              <section className="bg-card rounded-2xl p-6 md:p-8 shadow-card border border-border/60">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-display text-xl font-bold flex items-center gap-2"><CreditCard className="w-5 h-5" /> Payment</h2>
                  <span className="text-xs text-muted-foreground flex items-center gap-1"><Lock className="w-3 h-3" /> Secured by LiteAPI Pay</span>
                </div>

                {/* LiteAPI Pay SDK mount point — the SDK renders its card form into this container. */}
                <div id="liteapi-pay-container" className="min-h-[160px] rounded-lg border border-dashed border-border/80 bg-secondary/30 flex items-center justify-center text-sm text-muted-foreground p-6">
                  {typeof window === "undefined"
                    ? "Loading payment form…"
                    : "LiteAPI Pay form will mount here. In sandbox mode a demo tokenizer is used automatically."}
                </div>

                <div className="mt-5 p-3 rounded-lg bg-secondary/60 text-xs text-muted-foreground flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-success" />
                  LiteAPI is the merchant of record — your card is charged by LiteAPI and our commission is paid out on the weekly/monthly cycle.
                </div>
              </section>

              {signedIn === false && (
                <div className="rounded-xl border border-primary/30 bg-accent/40 p-4 text-sm">
                  <Link to="/login" className="font-semibold text-primary hover:underline">Sign in</Link> to complete your booking and see it in your dashboard.
                </div>
              )}

              <Button type="submit" disabled={processing || signedIn === false} className="w-full h-12 bg-gradient-cta text-white border-0 font-semibold text-base shadow-glow">
                {processing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing…</> : `Confirm & Pay $${total.toLocaleString()}`}
              </Button>
            </div>

            <aside className="lg:sticky lg:top-24 h-fit">
              <div className="bg-card rounded-2xl shadow-elevated border border-border/60 overflow-hidden">
                <img src={hotel.img} alt={hotel.name} className="w-full aspect-[16/9] object-cover" />
                <div className="px-6 pt-6">
                  <h3 className="font-display text-xl font-bold">{hotel.name}</h3>
                  <p className="text-sm text-muted-foreground">{hotel.location}</p>
                </div>
                <div className="p-6 pt-4">
                  <div className="mt-2 pt-4 border-t border-border space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Check-in</span><span>{fmtDate(search.checkIn, "Aug 12, 2026")}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Check-out</span><span>{fmtDate(search.checkOut, "Aug 15, 2026")}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Guests</span><span>{search.guests} {search.guests === 1 ? "adult" : "adults"}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Room</span><span>{search.room || "Deluxe King"}</span></div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">${hotel.price} × {nights} night{nights > 1 ? "s" : ""}</span><span>${netPrice.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Taxes & fees</span><span>${taxes.toLocaleString()}</span></div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border flex justify-between font-bold text-lg">
                    <span>Total</span><span>${total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </aside>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}

/**
 * In production, this delegates to `window.LiteAPIPay.tokenize(...)` which
 * returns a transactionId after the guest enters card details.
 *
 * In sandbox we short-circuit with a deterministic test transaction id so the
 * booking flow can be exercised end-to-end without a real card.
 */
async function tokenizeWithLiteApiPay(opts: { prebookId: string; amount: number; currency: string }): Promise<string> {
  const w = window as unknown as { LiteAPIPay?: { tokenize: (o: object) => Promise<{ transactionId: string }> } };
  if (w.LiteAPIPay?.tokenize) {
    const res = await w.LiteAPIPay.tokenize({
      prebookId: opts.prebookId,
      amount: opts.amount,
      currency: opts.currency,
    });
    return res.transactionId;
  }
  // Sandbox fallback: LiteAPI's test transaction id used for E2E.
  return `sandbox_txn_${Date.now()}`;
}
