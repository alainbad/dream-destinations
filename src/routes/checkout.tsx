import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, CreditCard, ShieldCheck, CheckCircle2, Plane } from "lucide-react";
import { hotels, flights } from "@/lib/mock-data";

const searchSchema = z.object({
  type: fallback(z.enum(["hotel", "flight"]), "hotel").default("hotel"),
  hotelId: fallback(z.string().optional(), undefined),
  flightId: fallback(z.string().optional(), undefined),
  checkIn: fallback(z.string(), "").default(""),
  checkOut: fallback(z.string(), "").default(""),
  guests: fallback(z.number().int().min(1), 2).default(2),
  travelers: fallback(z.number().int().min(1), 1).default(1),
  room: fallback(z.string().optional(), undefined),
  cabin: fallback(z.string().optional(), undefined),
});

export const Route = createFileRoute("/checkout")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({ meta: [{ title: "Checkout — TravelHub" }] }),
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
  const [submitted, setSubmitted] = useState(false);

  const isFlight = search.type === "flight";
  const hotel = hotels.find((h) => h.id === search.hotelId) ?? hotels[0];
  const flight = flights.find((f) => f.id === search.flightId) ?? flights[0];

  const nights = nightsBetween(search.checkIn, search.checkOut);
  const subtotal = isFlight ? flight.price * search.travelers : hotel.price * nights;
  const taxes = Math.round(subtotal * 0.12);
  const total = subtotal + taxes;

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 pb-20 max-w-2xl mx-auto px-6 text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-success/15 grid place-items-center mb-6">
            <CheckCircle2 className="w-10 h-10 text-success" />
          </div>
          <h1 className="font-display text-4xl font-bold mb-3">Booking Confirmed</h1>
          <p className="text-muted-foreground mb-2">
            Your {isFlight ? "flight" : "stay"} is locked in. A confirmation email is on its way.
          </p>
          <p className="text-sm text-muted-foreground mb-8">Confirmation #TH-{Math.floor(Math.random() * 900000 + 100000)}</p>
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
          <p className="text-muted-foreground mb-10">You're moments away from your next adventure.</p>

          <form
            className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-10"
            onSubmit={(e) => { e.preventDefault(); setSubmitted(true); window.scrollTo(0, 0); }}
          >
            <div className="space-y-8">
              <section className="bg-card rounded-2xl p-6 md:p-8 shadow-card border border-border/60">
                <h2 className="font-display text-xl font-bold mb-5">{isFlight ? "Passenger Details" : "Guest Details"}</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5"><Label>First name</Label><Input required className="h-11" /></div>
                  <div className="space-y-1.5"><Label>Last name</Label><Input required className="h-11" /></div>
                  <div className="space-y-1.5 col-span-2"><Label>Email</Label><Input required type="email" className="h-11" /></div>
                  <div className="space-y-1.5 col-span-2"><Label>Phone</Label><Input required className="h-11" /></div>
                  <div className="space-y-1.5 col-span-2"><Label>Special requests (optional)</Label><Input className="h-11" placeholder="e.g. high floor, late check-in" /></div>
                </div>
              </section>

              <section className="bg-card rounded-2xl p-6 md:p-8 shadow-card border border-border/60">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-display text-xl font-bold flex items-center gap-2"><CreditCard className="w-5 h-5" /> Payment</h2>
                  <span className="text-xs text-muted-foreground flex items-center gap-1"><Lock className="w-3 h-3" /> Secured by Stripe</span>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1.5"><Label>Card number</Label><Input required placeholder="4242 4242 4242 4242" className="h-11" /></div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1.5"><Label>Expiry</Label><Input required placeholder="MM / YY" className="h-11" /></div>
                    <div className="space-y-1.5"><Label>CVC</Label><Input required placeholder="123" className="h-11" /></div>
                    <div className="space-y-1.5"><Label>ZIP</Label><Input required className="h-11" /></div>
                  </div>
                </div>
                <div className="mt-5 p-3 rounded-lg bg-secondary/60 text-xs text-muted-foreground flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-success" /> Your card is not charged until {isFlight ? "ticketing" : "check-in"}.
                </div>
              </section>

              <Button type="submit" className="w-full h-12 bg-gradient-cta text-white border-0 font-semibold text-base shadow-glow">
                Confirm & Pay ${total.toLocaleString()}
              </Button>
            </div>

            <aside className="lg:sticky lg:top-24 h-fit">
              <div className="bg-card rounded-2xl shadow-elevated border border-border/60 overflow-hidden">
                {isFlight ? (
                  <div className="bg-gradient-hero text-white p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-white/10 grid place-items-center"><Plane className="w-6 h-6" /></div>
                      <div>
                        <div className="font-semibold">{flight.airline}</div>
                        <div className="text-xs text-white/70">{flight.code}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div><div className="font-display text-2xl font-bold">{flight.dep}</div><div className="text-xs text-white/70">{flight.from}</div></div>
                      <div className="text-xs text-white/70">{flight.duration} · {flight.stops}</div>
                      <div className="text-right"><div className="font-display text-2xl font-bold">{flight.arr}</div><div className="text-xs text-white/70">{flight.to}</div></div>
                    </div>
                  </div>
                ) : (
                  <>
                    <img src={hotel.img} alt={hotel.name} className="w-full aspect-[16/9] object-cover" />
                    <div className="px-6 pt-6">
                      <h3 className="font-display text-xl font-bold">{hotel.name}</h3>
                      <p className="text-sm text-muted-foreground">{hotel.location}</p>
                    </div>
                  </>
                )}
                <div className="p-6 pt-4">
                  <div className="mt-2 pt-4 border-t border-border space-y-2 text-sm">
                    {isFlight ? (
                      <>
                        <div className="flex justify-between"><span className="text-muted-foreground">Travelers</span><span>{search.travelers} {search.travelers === 1 ? "adult" : "adults"}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Cabin</span><span className="capitalize">{search.cabin || "economy"}</span></div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between"><span className="text-muted-foreground">Check-in</span><span>{fmtDate(search.checkIn, "Aug 12, 2026")}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Check-out</span><span>{fmtDate(search.checkOut, "Aug 15, 2026")}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Guests</span><span>{search.guests} {search.guests === 1 ? "adult" : "adults"}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Room</span><span>{search.room || "Deluxe King"}</span></div>
                      </>
                    )}
                  </div>
                  <div className="mt-4 pt-4 border-t border-border space-y-2 text-sm">
                    {isFlight ? (
                      <div className="flex justify-between"><span className="text-muted-foreground">${flight.price} × {search.travelers} traveler{search.travelers > 1 ? "s" : ""}</span><span>${subtotal.toLocaleString()}</span></div>
                    ) : (
                      <div className="flex justify-between"><span className="text-muted-foreground">${hotel.price} × {nights} night{nights > 1 ? "s" : ""}</span><span>${subtotal.toLocaleString()}</span></div>
                    )}
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
