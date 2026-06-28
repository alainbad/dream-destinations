import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, CreditCard, ShieldCheck } from "lucide-react";
import { hotels } from "@/lib/mock-data";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — TravelHub" }] }),
  component: Checkout,
});

function Checkout() {
  const hotel = hotels[0];
  const nights = 3;
  const subtotal = hotel.price * nights;
  const taxes = Math.round(subtotal * 0.12);
  const total = subtotal + taxes;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="font-display text-4xl font-bold mb-2">Complete your booking</h1>
          <p className="text-muted-foreground mb-10">You're moments away from your next adventure.</p>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-10">
            <div className="space-y-8">
              <section className="bg-card rounded-2xl p-6 md:p-8 shadow-card border border-border/60">
                <h2 className="font-display text-xl font-bold mb-5">Guest Details</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5"><Label>First name</Label><Input className="h-11" /></div>
                  <div className="space-y-1.5"><Label>Last name</Label><Input className="h-11" /></div>
                  <div className="space-y-1.5 col-span-2"><Label>Email</Label><Input type="email" className="h-11" /></div>
                  <div className="space-y-1.5 col-span-2"><Label>Phone</Label><Input className="h-11" /></div>
                  <div className="space-y-1.5 col-span-2"><Label>Special requests (optional)</Label><Input className="h-11" placeholder="e.g. high floor, late check-in" /></div>
                </div>
              </section>

              <section className="bg-card rounded-2xl p-6 md:p-8 shadow-card border border-border/60">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-display text-xl font-bold flex items-center gap-2"><CreditCard className="w-5 h-5" /> Payment</h2>
                  <span className="text-xs text-muted-foreground flex items-center gap-1"><Lock className="w-3 h-3" /> Secured by Stripe</span>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1.5"><Label>Card number</Label><Input placeholder="4242 4242 4242 4242" className="h-11" /></div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1.5"><Label>Expiry</Label><Input placeholder="MM / YY" className="h-11" /></div>
                    <div className="space-y-1.5"><Label>CVC</Label><Input placeholder="123" className="h-11" /></div>
                    <div className="space-y-1.5"><Label>ZIP</Label><Input className="h-11" /></div>
                  </div>
                </div>
                <div className="mt-5 p-3 rounded-lg bg-secondary/60 text-xs text-muted-foreground flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-success" /> Your card is not charged until check-in.
                </div>
              </section>

              <Button className="w-full h-12 bg-gradient-cta text-white border-0 font-semibold text-base shadow-glow">
                Confirm & Pay ${total.toLocaleString()}
              </Button>
            </div>

            <aside className="lg:sticky lg:top-24 h-fit">
              <div className="bg-card rounded-2xl shadow-elevated border border-border/60 overflow-hidden">
                <img src={hotel.img} alt={hotel.name} className="w-full aspect-[16/9] object-cover" />
                <div className="p-6">
                  <h3 className="font-display text-xl font-bold">{hotel.name}</h3>
                  <p className="text-sm text-muted-foreground">{hotel.location}</p>
                  <div className="mt-4 pt-4 border-t border-border space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Check-in</span><span>Aug 12, 2026</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Check-out</span><span>Aug 15, 2026</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Guests</span><span>2 adults</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Room</span><span>Deluxe King</span></div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">${hotel.price} × {nights} nights</span><span>${subtotal.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Taxes & fees</span><span>${taxes.toLocaleString()}</span></div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border flex justify-between font-bold text-lg">
                    <span>Total</span><span>${total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
