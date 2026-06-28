import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, MapPin } from "lucide-react";
import { hotels } from "@/lib/mock-data";

const searchSchema = z.object({
  destination: fallback(z.string(), "").default(""),
  checkIn: fallback(z.string(), "").default(""),
  checkOut: fallback(z.string(), "").default(""),
  guests: fallback(z.number().int().min(1), 2).default(2),
});

export const Route = createFileRoute("/hotels/")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({ meta: [{ title: "Hotels — TravelHub" }, { name: "description", content: "Browse luxury hotels worldwide." }] }),
  component: HotelsPage,
});

function HotelsPage() {
  const search = Route.useSearch();
  const [price, setPrice] = useState([100, 3000]);
  const [stars, setStars] = useState<number[]>([5, 4]);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [sort, setSort] = useState("rating");

  const filtered = hotels.filter((h) => {
    if (search.destination && !h.location.toLowerCase().includes(search.destination.toLowerCase().split(",")[0].trim())) return false;
    if (h.price < price[0] || h.price > price[1]) return false;
    if (stars.length && !stars.includes(h.stars)) return false;
    if (amenities.length && !amenities.every((a) => h.amenities.includes(a))) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "price") return a.price - b.price;
    if (sort === "reviews") return b.reviews - a.reviews;
    return b.rating - a.rating;
  });

  const toggle = <T,>(arr: T[], v: T) => arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];

  const bookingSearch = { checkIn: search.checkIn, checkOut: search.checkOut, guests: search.guests };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 bg-gradient-hero text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <h1 className="font-display text-4xl md:text-5xl font-bold">Find Your Perfect Stay</h1>
          <p className="mt-2 text-white/80">
            {search.destination ? `Showing stays in ${search.destination}` : `${hotels.length} handpicked properties across the globe`}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
        <aside className="space-y-6">
          <div className="bg-card rounded-2xl p-6 shadow-card border border-border/60">
            <h3 className="font-semibold mb-4">Price per night</h3>
            <Slider value={price} onValueChange={setPrice} min={100} max={3000} step={50} />
            <div className="flex justify-between text-sm mt-3 text-muted-foreground"><span>${price[0]}</span><span>${price[1]}</span></div>
          </div>

          <div className="bg-card rounded-2xl p-6 shadow-card border border-border/60">
            <h3 className="font-semibold mb-4">Star Rating</h3>
            <div className="space-y-3">
              {[5,4,3,2,1].map((n) => (
                <label key={n} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox checked={stars.includes(n)} onCheckedChange={() => setStars(toggle(stars, n))} />
                  <span className="flex gap-0.5">
                    {Array.from({length:n}).map((_,i)=><Star key={i} className="w-3.5 h-3.5 fill-[oklch(0.82_0.16_85)] text-[oklch(0.82_0.16_85)]" />)}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-2xl p-6 shadow-card border border-border/60">
            <h3 className="font-semibold mb-4">Amenities</h3>
            <div className="space-y-3 text-sm">
              {["WiFi","Pool","Spa","Gym","Restaurant"].map((a) => (
                <label key={a} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox checked={amenities.includes(a)} onCheckedChange={() => setAmenities(toggle(amenities, a))} /> <span>{a}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        <main>
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-muted-foreground">{sorted.length} results</p>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-[220px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="price">Price: Low to High</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
                <SelectItem value="reviews">Most Reviewed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-5">
            {sorted.length === 0 && (
              <div className="bg-card rounded-2xl border border-border/60 p-10 text-center text-muted-foreground">
                No hotels match your filters. Try widening the price range or clearing the destination.
              </div>
            )}
            {sorted.map((h) => (
              <div key={h.id} className="bg-card rounded-2xl shadow-card hover:shadow-elevated transition-all overflow-hidden border border-border/60 grid grid-cols-1 md:grid-cols-[320px_1fr]">
                <div className="relative aspect-[4/3] md:aspect-auto overflow-hidden hover-zoom">
                  <img src={h.img} alt={h.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-6 flex flex-col">
                  <div className="flex gap-0.5 mb-1.5">
                    {Array.from({length: h.stars}).map((_,i)=><Star key={i} className="w-3.5 h-3.5 fill-[oklch(0.82_0.16_85)] text-[oklch(0.82_0.16_85)]" />)}
                  </div>
                  <h3 className="font-display text-2xl font-bold">{h.name}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1"><MapPin className="w-3.5 h-3.5" />{h.location}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="bg-gradient-cta text-white px-2 py-0.5 rounded-md text-sm font-bold">{h.rating}</span>
                    <span className="font-semibold text-sm">{h.ratingLabel}</span>
                    <span className="text-xs text-muted-foreground">· {h.reviews.toLocaleString()} reviews</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{h.description}</p>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {h.amenities.slice(0,5).map(a=><span key={a} className="text-xs px-2 py-1 rounded-md bg-secondary">{a}</span>)}
                  </div>
                  <div className="flex items-end justify-between mt-auto pt-5">
                    <div>
                      <div className="text-xs text-muted-foreground">Per night from</div>
                      <div className="font-bold text-2xl text-primary">${h.price}</div>
                    </div>
                    <Button asChild className="bg-gradient-cta text-white border-0 shadow-glow">
                      <Link to="/hotels/$id" params={{id:h.id}} search={bookingSearch}>View Hotel</Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
