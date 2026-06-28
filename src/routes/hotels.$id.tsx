import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Star, MapPin, Wifi, Waves, Sparkles, Dumbbell, UtensilsCrossed, Users, BedDouble, Maximize2 } from "lucide-react";
import { hotels, rooms } from "@/lib/mock-data";

const searchSchema = z.object({
  checkIn: fallback(z.string(), "").default(""),
  checkOut: fallback(z.string(), "").default(""),
  guests: fallback(z.number().int().min(1), 2).default(2),
});

export const Route = createFileRoute("/hotels/$id")({
  validateSearch: zodValidator(searchSchema),
  component: HotelDetail,
  notFoundComponent: () => <div className="p-20 text-center">Hotel not found.</div>,
});

const amenityIcons: Record<string, any> = {
  WiFi: Wifi, Pool: Waves, Spa: Sparkles, Gym: Dumbbell, Restaurant: UtensilsCrossed,
};

function nightsBetween(a: string, b: string): number {
  if (!a || !b) return 3;
  const d1 = new Date(a).getTime();
  const d2 = new Date(b).getTime();
  if (isNaN(d1) || isNaN(d2) || d2 <= d1) return 3;
  return Math.max(1, Math.round((d2 - d1) / 86400000));
}

function HotelDetail() {
  const { id } = Route.useParams();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/hotels/$id" });
  const hotel = hotels.find((h) => h.id === id);
  const [mainImg, setMainImg] = useState(hotel?.gallery[0] || "");
  const [checkIn, setCheckIn] = useState(search.checkIn);
  const [checkOut, setCheckOut] = useState(search.checkOut);
  const [guests, setGuests] = useState(search.guests);

  if (!hotel) throw notFound();

  const nights = useMemo(() => nightsBetween(checkIn, checkOut), [checkIn, checkOut]);
  const subtotal = hotel.price * nights;
  const taxes = Math.round(subtotal * 0.12);

  const goCheckout = (roomName?: string) => {
    navigate({ to: "/checkout", search: { type: "hotel", hotelId: hotel.id, checkIn, checkOut, guests, room: roomName } as any });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex gap-0.5 mb-2">
            {Array.from({ length: hotel.stars }).map((_, i) => <Star key={i} className="w-4 h-4 fill-[oklch(0.82_0.16_85)] text-[oklch(0.82_0.16_85)]" />)}
          </div>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-4xl md:text-5xl font-bold">{hotel.name}</h1>
              <p className="text-muted-foreground mt-1 flex items-center gap-1.5"><MapPin className="w-4 h-4" />{hotel.location}</p>
            </div>
            <div className="flex items-center gap-3 bg-card rounded-xl px-4 py-2.5 shadow-card border border-border/60">
              <span className="bg-gradient-cta text-white px-3 py-1.5 rounded-lg font-bold">{hotel.rating}</span>
              <div>
                <div className="font-semibold">{hotel.ratingLabel}</div>
                <div className="text-xs text-muted-foreground">{hotel.reviews.toLocaleString()} reviews</div>
              </div>
            </div>
          </div>
        </div>

        {/* Gallery */}
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-4 aspect-[16/7] rounded-2xl overflow-hidden">
              <img src={mainImg} alt={hotel.name} className="w-full h-full object-cover" />
            </div>
            {hotel.gallery.map((g, i) => (
              <button key={i} onClick={() => setMainImg(g)} className={`aspect-[4/3] rounded-xl overflow-hidden ring-2 transition-all ${mainImg === g ? "ring-primary" : "ring-transparent hover:ring-border"}`}>
                <img src={g} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10">
          <div>
            <section>
              <h2 className="font-display text-3xl font-bold mb-3">About this property</h2>
              <p className="text-muted-foreground leading-relaxed">{hotel.description}</p>
            </section>

            <section className="mt-10">
              <h2 className="font-display text-2xl font-bold mb-5">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {hotel.amenities.map((a) => {
                  const Icon = amenityIcons[a] || Sparkles;
                  return (
                    <div key={a} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card border border-border/60 shadow-card">
                      <div className="w-10 h-10 rounded-lg bg-gradient-cta flex items-center justify-center text-white"><Icon className="w-5 h-5" /></div>
                      <span className="text-sm font-medium">{a}</span>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="mt-10">
              <h2 className="font-display text-2xl font-bold mb-5">Available Rooms</h2>
              <div className="space-y-4">
                {rooms.map((r) => (
                  <div key={r.name} className="bg-card rounded-2xl border border-border/60 shadow-card grid grid-cols-1 md:grid-cols-[200px_1fr_auto] overflow-hidden">
                    <div className="aspect-[4/3] md:aspect-auto"><img src={r.img} alt={r.name} className="w-full h-full object-cover" /></div>
                    <div className="p-5">
                      <h3 className="font-display text-xl font-bold">{r.name}</h3>
                      <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5"><BedDouble className="w-4 h-4" />{r.bed}</span>
                        <span className="flex items-center gap-1.5"><Users className="w-4 h-4" />Up to {r.guests}</span>
                        <span className="flex items-center gap-1.5"><Maximize2 className="w-4 h-4" />{r.size}</span>
                      </div>
                    </div>
                    <div className="p-5 md:text-right flex flex-col justify-between gap-3 md:border-l border-border/60">
                      <div>
                        <div className="text-xs text-muted-foreground">From</div>
                        <div className="font-bold text-2xl text-primary">${r.price}</div>
                        <div className="text-xs text-muted-foreground">per night</div>
                      </div>
                      <Button onClick={() => goCheckout(r.name)} className="bg-gradient-cta text-white border-0">Book Now</Button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-10">
              <h2 className="font-display text-2xl font-bold mb-5">Guest Reviews</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { name: "Layla A.", country: "UAE", text: "Truly exceptional — the staff anticipated every need. The suite views at sunset were unforgettable.", rating: 9.8 },
                  { name: "Marco R.", country: "Italy", text: "Worth every dirham. Spa, dining, and service all world-class. Will return next winter.", rating: 9.5 },
                  { name: "Sophie L.", country: "France", text: "A flawless stay from arrival to departure. Concierge arranged everything seamlessly.", rating: 9.7 },
                  { name: "James W.", country: "UK", text: "Stunning property. The breakfast spread alone is reason to stay here again.", rating: 9.4 },
                ].map((r) => (
                  <div key={r.name} className="p-5 rounded-2xl bg-card border border-border/60 shadow-card">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="font-semibold">{r.name}</div>
                        <div className="text-xs text-muted-foreground">{r.country}</div>
                      </div>
                      <span className="bg-gradient-cta text-white px-2.5 py-1 rounded-lg text-sm font-bold">{r.rating}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">"{r.text}"</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sticky booking */}
          <aside className="lg:sticky lg:top-24 h-fit bg-card rounded-2xl p-6 shadow-elevated border border-border/60">
            <div className="flex items-baseline gap-2 mb-5">
              <span className="text-3xl font-bold text-primary">${hotel.price}</span>
              <span className="text-sm text-muted-foreground">/ night</span>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <Field label="Check-in"><Input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="border-0 p-0 h-auto shadow-none focus-visible:ring-0" /></Field>
              <Field label="Check-out"><Input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="border-0 p-0 h-auto shadow-none focus-visible:ring-0" /></Field>
            </div>
            <Field label="Guests"><Input type="number" value={guests} onChange={(e) => setGuests(Math.max(1, parseInt(e.target.value) || 1))} min={1} className="border-0 p-0 h-auto shadow-none focus-visible:ring-0" /></Field>
            <div className="mt-5 space-y-2 pb-4 border-b border-border">
              <Row label={`$${hotel.price} × ${nights} night${nights > 1 ? "s" : ""}`} value={`$${subtotal.toLocaleString()}`} />
              <Row label="Taxes & fees" value={`$${taxes.toLocaleString()}`} />
            </div>
            <div className="flex justify-between font-bold text-lg mt-4">
              <span>Total</span>
              <span>${(subtotal + taxes).toLocaleString()}</span>
            </div>
            <Button onClick={() => goCheckout()} className="w-full mt-5 h-12 bg-gradient-cta text-white border-0 text-base font-semibold shadow-glow">
              Reserve
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-3">Free cancellation until 48h before check-in</p>
          </aside>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="bg-secondary/50 rounded-lg px-3 py-2 mb-2">
      <div className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wider">{label}</div>
      {children}
    </div>
  );
}
function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between text-sm"><span className="text-muted-foreground">{label}</span><span>{value}</span></div>;
}
