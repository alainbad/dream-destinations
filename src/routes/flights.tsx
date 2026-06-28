import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeftRight, Plane, Calendar, Users } from "lucide-react";
import { flights } from "@/lib/mock-data";

export const Route = createFileRoute("/flights")({
  head: () => ({ meta: [{ title: "Flights — TravelHub" }, { name: "description", content: "Search and book flights worldwide." }] }),
  component: FlightsPage,
});

function FlightsPage() {
  const [trip, setTrip] = useState<"round" | "one">("round");
  const [sort, setSort] = useState("best");

  const sorted = [...flights].sort((a, b) => {
    if (sort === "cheap") return a.price - b.price;
    if (sort === "fast") return parseFloat(a.duration) - parseFloat(b.duration);
    return 0;
  });

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
              <Input defaultValue="Dubai (DXB)" className="border-0 p-0 h-auto shadow-none focus-visible:ring-0" />
            </Field>
            <div className="md:col-span-1 flex justify-center pb-1">
              <button className="w-9 h-9 rounded-full bg-secondary hover:bg-primary hover:text-white grid place-items-center transition"><ArrowLeftRight className="w-4 h-4" /></button>
            </div>
            <Field label="To" icon={<Plane className="w-3.5 h-3.5 rotate-45" />} className="md:col-span-3">
              <Input defaultValue="Paris (CDG)" className="border-0 p-0 h-auto shadow-none focus-visible:ring-0" />
            </Field>
            <Field label="Departure" icon={<Calendar className="w-3.5 h-3.5" />} className="md:col-span-2">
              <Input type="date" className="border-0 p-0 h-auto shadow-none focus-visible:ring-0" />
            </Field>
            {trip === "round" && (
              <Field label="Return" icon={<Calendar className="w-3.5 h-3.5" />} className="md:col-span-2">
                <Input type="date" className="border-0 p-0 h-auto shadow-none focus-visible:ring-0" />
              </Field>
            )}
            <Field label="Travelers" icon={<Users className="w-3.5 h-3.5" />} className="md:col-span-1">
              <Input type="number" defaultValue={1} min={1} className="border-0 p-0 h-auto shadow-none focus-visible:ring-0" />
            </Field>
          </div>
          <Button className="w-full mt-4 h-12 bg-gradient-cta text-white border-0 text-base font-semibold shadow-glow">Search Flights</Button>
        </div>

        <div className="flex items-center justify-between mt-10 mb-5">
          <p className="text-sm text-muted-foreground">{sorted.length} flights found</p>
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
                <Button className="mt-2 bg-gradient-cta text-white border-0">Select</Button>
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
