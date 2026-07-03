import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Calendar, Users, ShieldCheck, Headphones, Sparkles, BadgePercent, Star } from "lucide-react";
import { destinations, hotels } from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dream Destinations — Book Luxury Hotels Worldwide" },
      { name: "description", content: "Discover curated luxury hotels across Dubai, Paris, Bali, Maldives and beyond — best-price guarantee, free cancellation." },
      { property: "og:title", content: "Dream Destinations — Your Stay, Reimagined" },
      { property: "og:description", content: "Curated luxury hotels worldwide with best-price guarantee." },
      { property: "og:image", content: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1600&q=80" },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <FeaturedDestinations />
      <PopularHotels />
      <WhyUs />
      <Footer />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative min-h-[760px] flex items-center pt-20">
      <div className="absolute inset-0">
        <img src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=2000&q=80" alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-[oklch(0.16_0.03_255/0.5)] via-[oklch(0.16_0.03_255/0.3)] to-[oklch(0.16_0.03_255/0.85)]" />
      </div>
      <div className="relative max-w-7xl mx-auto px-6 w-full py-20">
        <div className="max-w-3xl text-white">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur border border-white/20 text-xs font-medium mb-6">
            <Sparkles className="w-3.5 h-3.5" /> Handpicked luxury stays worldwide
          </span>
          <h1 className="font-display text-5xl md:text-7xl font-bold leading-[1.05] mb-5">
            Your Dream Stay<br/>Starts Here
          </h1>
          <p className="text-lg md:text-xl text-white/85 max-w-2xl">
            Curated hotels and resorts from the dunes of Dubai to the canals of Venice — best price guaranteed.
          </p>
        </div>

        <div className="mt-12 max-w-5xl">
          <HotelSearch />
        </div>
      </div>
    </section>
  );
}

function HotelSearch() {
  const navigate = useNavigate();
  const [destination, setDestination] = useState("Dubai");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);

  const searchHotels = () => {
    navigate({ to: "/hotels", search: { destination, checkIn, checkOut, guests } });
  };

  return (
    <div className="bg-white rounded-2xl shadow-elevated p-4 md:p-5">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        <Field label="Destination" icon={<MapPin className="w-4 h-4" />} className="md:col-span-4">
          <Input placeholder="Where are you going?" className="border-0 px-0 shadow-none focus-visible:ring-0" value={destination} onChange={(e) => setDestination(e.target.value)} />
        </Field>
        <Field label="Check-in" icon={<Calendar className="w-4 h-4" />} className="md:col-span-3">
          <Input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="border-0 px-0 shadow-none focus-visible:ring-0" />
        </Field>
        <Field label="Check-out" icon={<Calendar className="w-4 h-4" />} className="md:col-span-3">
          <Input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="border-0 px-0 shadow-none focus-visible:ring-0" />
        </Field>
        <Field label="Guests" icon={<Users className="w-4 h-4" />} className="md:col-span-2">
          <Input type="number" min={1} value={guests} onChange={(e) => setGuests(Math.max(1, parseInt(e.target.value) || 1))} className="border-0 px-0 shadow-none focus-visible:ring-0" />
        </Field>
      </div>
      <Button onClick={searchHotels} className="w-full mt-4 h-12 bg-gradient-cta text-white border-0 text-base font-semibold shadow-glow hover:opacity-90">
        <Search className="w-4 h-4 mr-2" /> Search Hotels
      </Button>
    </div>
  );
}

function Field({ label, icon, children, className }: { label: string; icon?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-secondary/40 rounded-xl px-4 py-2.5 ${className || ""}`}>
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-0.5">
        {icon} {label}
      </div>
      {children}
    </div>
  );
}

function FeaturedDestinations() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-20">
      <div className="flex items-end justify-between mb-10">
        <div>
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">Trending</span>
          <h2 className="font-display text-4xl md:text-5xl font-bold mt-2">Featured Destinations</h2>
        </div>
        <Link to="/hotels" className="text-sm font-medium text-primary hover:underline hidden md:block">Explore all →</Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {destinations.map((d) => (
          <Link key={d.city} to="/hotels" search={{ destination: d.city, checkIn: "", checkOut: "", guests: 2 }} className="group relative rounded-2xl overflow-hidden aspect-[3/4] hover-zoom shadow-card">
            <img src={d.img} alt={d.city} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
            <div className="absolute bottom-0 inset-x-0 p-5 text-white">
              <div className="text-xs uppercase tracking-wider opacity-80">{d.country}</div>
              <div className="font-display text-2xl font-bold">{d.city}</div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function PopularHotels() {
  return (
    <section className="bg-secondary/30 py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-10">
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">Stay in style</span>
          <h2 className="font-display text-4xl md:text-5xl font-bold mt-2">Popular Hotels</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hotels.map((h) => (
            <Link key={h.id} to="/hotels/$id" params={{ id: h.id }} className="group bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-elevated transition-all hover-zoom">
              <div className="relative aspect-[4/3] overflow-hidden">
                <img src={h.img} alt={h.name} className="w-full h-full object-cover" />
                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur px-2.5 py-1 rounded-lg flex items-center gap-1 text-xs font-semibold">
                  <span className="px-1.5 py-0.5 rounded bg-gradient-cta text-white">{h.rating}</span>
                  <span>{h.ratingLabel}</span>
                </div>
              </div>
              <div className="p-5">
                <div className="flex gap-0.5 mb-1.5">
                  {Array.from({ length: h.stars }).map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-[oklch(0.82_0.16_85)] text-[oklch(0.82_0.16_85)]" />)}
                </div>
                <h3 className="font-display text-xl font-bold">{h.name}</h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1"><MapPin className="w-3.5 h-3.5" />{h.location}</p>
                <div className="flex items-end justify-between mt-4 pt-4 border-t border-border">
                  <div>
                    <div className="text-xs text-muted-foreground">From</div>
                    <div className="font-bold text-lg">${h.price}<span className="text-xs font-normal text-muted-foreground">/night</span></div>
                  </div>
                  <span className="text-sm font-medium text-primary group-hover:underline">View Hotel →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhyUs() {
  const features = [
    { icon: BadgePercent, title: "Best Price Guarantee", desc: "Find it cheaper? We'll match it and refund the difference." },
    { icon: ShieldCheck, title: "Free Cancellation", desc: "Plans change. Most bookings cancel free up to 48 hours prior." },
    { icon: Headphones, title: "24/7 Support", desc: "Real humans on call across every timezone, every day." },
    { icon: Sparkles, title: "AI Trip Planner", desc: "Tell us your vibe — we craft a personalized day-by-day itinerary." },
  ];
  return (
    <section className="max-w-7xl mx-auto px-6 py-20">
      <div className="text-center mb-14">
        <span className="text-sm font-semibold text-primary uppercase tracking-wider">Why Travelers Choose Us</span>
        <h2 className="font-display text-4xl md:text-5xl font-bold mt-2">Why Dream Destinations</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {features.map((f) => (
          <div key={f.title} className="p-7 rounded-2xl bg-card shadow-card hover:shadow-elevated transition-all border border-border/60">
            <div className="w-12 h-12 rounded-xl bg-gradient-cta flex items-center justify-center text-white mb-5 shadow-glow">
              <f.icon className="w-6 h-6" />
            </div>
            <h3 className="font-display text-xl font-bold mb-2">{f.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
