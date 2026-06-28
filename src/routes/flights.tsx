import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeftRight, Plane, Calendar, Users } from "lucide-react";
import { flights } from "@/lib/mock-data";

const searchSchema = z.object({
  from: fallback(z.string(), "").default(""),
  to: fallback(z.string(), "").default(""),
  departure: fallback(z.string(), "").default(""),
  returnDate: fallback(z.string(), "").default(""),
  travelers: fallback(z.number().int().min(1), 1).default(1),
  cabin: fallback(z.enum(["economy", "premium", "business", "first"]), "economy").default("economy"),
  trip: fallback(z.enum(["round", "one"]), "round").default("round"),
});

export const Route = createFileRoute("/flights")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({ meta: [{ title: "Flights — TravelHub" }, { name: "description", content: "Search and book flights worldwide." }] }),
  component: FlightsPage,
});

function matchesLoc(input: string, code: string) {
  if (!input.trim()) return true;
  const q = input.toLowerCase();
  return q.includes(code.toLowerCase()) || code.toLowerCase().includes(q);
}

function FlightsPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/flights" });

  const [from, setFrom] = useState(search.from);
  const [to, setTo] = useState(search.to);
  const [departure, setDeparture] = useState(search.departure);
  const [returnDate, setReturnDate] = useState(search.returnDate);
  const [travelers, setTravelers] = useState(search.travelers);
  const [cabin, setCabin] = useState(search.cabin);
  const [trip, setTrip] = useState(search.trip);
  const [sort, setSort] = useState("best");

  const filtered = flights.filter((f) => matchesLoc(search.from, f.from) && matchesLoc(search.to, f.to));
  const sorted = [...filtered].sort((a, b) => {
    if (sort === "cheap") return a.price - b.price;
    if (sort === "fast") return parseFloat(a.duration) - parseFloat(b.duration);
    return 0;
  });

  const runSearch = () => {
    navigate({ search: { from, to, departure, returnDate, travelers, cabin, trip } });
  };

  const swap = () => { setFrom(to); setTo(from); };

  const handleSelect = (id: string) => {
    navigate({ to: "/checkout", search: { type: "flight", flightId: id, travelers, cabin } as any });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 bg-gradient-hero text-white">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <h1 className="font-display text-4xl md:text-5xl font-bold">Find Your Flight</h1>
          <p className="mt-2 text-white/80">Smart fares across 500+ airlines</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-8 relative z-10">
        <div className="bg-card rounded-2xl shadow-elevated p-6 border border-border/60">
          <div className="flex gap-2 mb-5">
            <button onClick={() => setTrip("round")} className={`px-4 py-1.5 rounded-full text-sm font-medium ${trip === "round" ? "bg-gradient-cta text-white" : "bg-secondary"}`}>Round-trip</button>
            <button onClick={() => setTrip("one")} className={`px-4 py-1.5 rounded-full text-sm font-medium ${trip === "one" ? "bg-gradient-cta text-white" : "bg-secondary"}`}>One-way</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
            <Field label="From" icon={<Plane className="w-3.5 h-3.5 -rotate-45" />} className="md:col-span-3">
              <Input value={from} onChange={(e) => setFrom(e.target.value)} placeholder="Origin (e.g. DXB)" className="border-0 p-0 h-auto shadow-none focus-visible:ring-0" />
            </Field>
            <div className="md:col-span-1 flex justify-center pb-1">
              <button onClick={swap} className="w-9 h-9 rounded-full bg-secondary hover:bg-primary hover:text-white grid place-items-center transition"><ArrowLeftRight className="w-4 h-4" /></button>
            </div>
            <Field label="To" icon={<Plane className="w-3.5 h-3.5 rotate-45" />} className="md:col-span-3">
              <Input value={to} onChange={(e) => setTo(e.target.value)} placeholder="Destination (e.g. CDG)" className="border-0 p-0 h-auto shadow-none focus-visible:ring-0" />
            </Field>
            <Field label="Departure" icon={<Calendar className="w-3.5 h-3.5" />} className="md:col-span-2">
              <Input type="date" value={departure} onChange={(e) => setDeparture(e.target.value)} className="border-0 p-0 h-auto shadow-none focus-visible:ring-0" />
            </Field>
            {trip === "round" && (
              <Field label="Return" icon={<Calendar className="w-3.5 h-3.5" />} className="md:col-span-2">
                <Input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} className="border-0 p-0 h-auto shadow-none focus-visible:ring-0" />
              </Field>
            )}
            <Field label="Travelers" icon={<Users className="w-3.5 h-3.5" />} className="md:col-span-1">
              <Input type="number" value={travelers} onChange={(e) => setTravelers(Math.max(1, parseInt(e.target.value) || 1))} min={1} className="border-0 p-0 h-auto shadow-none focus-visible:ring-0" />
            </Field>
          </div>
          <Button onClick={runSearch} className="w-full mt-4 h-12 bg-gradient-cta text-white border-0 text-base font-semibold shadow-glow">Search Flights</Button>
        </div>

        <div className="flex items-center justify-between mt-10 mb-5">
          <p className="text-sm text-muted-foreground">{sorted.length} flights found{(search.from || search.to) && ` for ${search.from || "anywhere"} → ${search.to || "anywhere"}`}</p>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="best">Best</SelectItem>
              <SelectItem value="cheap">Cheapest</SelectItem>
              <SelectItem value="fast">Fastest</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4 pb-20">
          {sorted.length === 0 && (
            <div className="bg-card rounded-2xl border border-border/60 p-10 text-center text-muted-foreground">
              No flights match your search. Try clearing the From/To fields or searching different airports.
            </div>
          )}
          {sorted.map((f) => (
            <div key={f.id} className="bg-card rounded-2xl shadow-card hover:shadow-elevated border border-border/60 p-5 grid grid-cols-1 md:grid-cols-[160px_1fr_auto] gap-5 items-center transition-all">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-cta grid place-items-center text-white shadow-glow">
                  <Plane className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold">{f.airline}</div>
                  <div className="text-xs text-muted-foreground">{f.code}</div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="font-display text-2xl font-bold">{f.dep}</div>
                  <div className="text-xs text-muted-foreground">{f.from}</div>
                </div>
                <div className="flex-1 flex flex-col items-center">
                  <div className="text-xs text-muted-foreground">{f.duration}</div>
                  <div className="w-full h-px bg-border my-1.5 relative"><Plane className="w-3 h-3 absolute -top-1.5 right-0 text-primary rotate-90" /></div>
                  <div className="text-xs text-success font-medium">{f.stops}</div>
                </div>
                <div className="text-center">
                  <div className="font-display text-2xl font-bold">{f.arr}</div>
                  <div className="text-xs text-muted-foreground">{f.to}</div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs text-muted-foreground">from</div>
                <div className="font-bold text-2xl text-primary">${f.price}</div>
                <Button onClick={() => handleSelect(f.id)} className="mt-2 bg-gradient-cta text-white border-0">Select</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}

function Field({ label, icon, children, className }: { label: string; icon?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-secondary/50 rounded-xl px-3 py-2 ${className || ""}`}>
      <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{icon}{label}</div>
      {children}
    </div>
  );
}
