import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Calendar, Heart, Star } from "lucide-react";
import { hotels } from "@/lib/mock-data";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Dream Destinations" }] }),
  component: Dashboard,
});

const bookings = [
  { id: "1", hotel: hotels[0], checkIn: "2026-08-12", checkOut: "2026-08-16", status: "Confirmed" },
  { id: "2", hotel: hotels[2], checkIn: "2026-09-04", checkOut: "2026-09-10", status: "Pending" },
  { id: "3", hotel: hotels[3], checkIn: "2025-12-20", checkOut: "2025-12-27", status: "Completed" },
  { id: "4", hotel: hotels[5], checkIn: "2025-06-01", checkOut: "2025-06-08", status: "Cancelled" },
];

const statusColors: Record<string, string> = {
  Confirmed: "bg-[oklch(0.62_0.16_150/0.15)] text-[oklch(0.45_0.16_150)] border-[oklch(0.62_0.16_150/0.3)]",
  Pending: "bg-[oklch(0.82_0.16_85/0.2)] text-[oklch(0.5_0.15_70)] border-[oklch(0.82_0.16_85/0.4)]",
  Completed: "bg-[oklch(0.55_0.22_260/0.15)] text-[oklch(0.45_0.22_260)] border-[oklch(0.55_0.22_260/0.3)]",
  Cancelled: "bg-[oklch(0.6_0.22_25/0.15)] text-[oklch(0.5_0.22_25)] border-[oklch(0.6_0.22_25/0.3)]",
};

function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20">
        <div className="bg-gradient-hero text-white">
          <div className="max-w-7xl mx-auto px-6 py-12 flex flex-wrap items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-white/15 backdrop-blur grid place-items-center font-display text-3xl font-bold border-2 border-white/30">A</div>
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold">Welcome back, Amira</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2.5 py-0.5 rounded-full bg-white/15 text-xs font-medium">Traveler</span>
                <span className="text-sm text-white/75">Member since 2023</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 -mt-8 relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard label="Total Bookings" value="12" />
          <StatCard label="Upcoming" value="2" tone="primary" />
          <StatCard label="Completed" value="9" />
        </div>

        <div className="max-w-7xl mx-auto px-6 py-10">
          <Tabs defaultValue="bookings">
            <TabsList className="bg-secondary p-1">
              <TabsTrigger value="bookings" className="data-[state=active]:bg-card data-[state=active]:shadow-card">My Bookings</TabsTrigger>
              <TabsTrigger value="saved" className="data-[state=active]:bg-card data-[state=active]:shadow-card">Saved Hotels</TabsTrigger>
              <TabsTrigger value="profile" className="data-[state=active]:bg-card data-[state=active]:shadow-card">Profile Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="bookings" className="mt-6 space-y-4">
              {bookings.map((b) => (
                <div key={b.id} className="bg-card rounded-2xl shadow-card border border-border/60 grid grid-cols-1 md:grid-cols-[200px_1fr_auto] overflow-hidden">
                  <div className="aspect-[4/3] md:aspect-auto"><img src={b.hotel.img} alt={b.hotel.name} className="w-full h-full object-cover" /></div>
                  <div className="p-5">
                    <div className="flex gap-0.5 mb-1">
                      {Array.from({length:b.hotel.stars}).map((_,i)=><Star key={i} className="w-3 h-3 fill-[oklch(0.82_0.16_85)] text-[oklch(0.82_0.16_85)]" />)}
                    </div>
                    <h3 className="font-display text-xl font-bold">{b.hotel.name}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1"><MapPin className="w-3.5 h-3.5" />{b.hotel.location}</p>
                    <div className="flex items-center gap-4 mt-3 text-sm">
                      <span className="flex items-center gap-1.5 text-muted-foreground"><Calendar className="w-3.5 h-3.5" />{b.checkIn} → {b.checkOut}</span>
                    </div>
                  </div>
                  <div className="p-5 flex flex-col items-end justify-between gap-3 md:border-l border-border/60">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[b.status]}`}>{b.status}</span>
                    <Button variant="outline" size="sm">View Details</Button>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="saved" className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
              {hotels.slice(0,3).map((h) => (
                <div key={h.id} className="bg-card rounded-2xl overflow-hidden shadow-card border border-border/60 hover-zoom">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img src={h.img} alt={h.name} className="w-full h-full object-cover" />
                    <button className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white grid place-items-center shadow-card"><Heart className="w-4 h-4 fill-[oklch(0.6_0.22_25)] text-[oklch(0.6_0.22_25)]" /></button>
                  </div>
                  <div className="p-4">
                    <div className="font-display font-bold">{h.name}</div>
                    <div className="text-xs text-muted-foreground">{h.location}</div>
                    <div className="mt-2 font-bold text-primary">${h.price}<span className="text-xs font-normal text-muted-foreground">/night</span></div>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="profile" className="mt-6">
              <div className="bg-card rounded-2xl p-6 md:p-8 shadow-card border border-border/60 max-w-2xl space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5"><Label>First name</Label><Input defaultValue="Amira" /></div>
                  <div className="space-y-1.5"><Label>Last name</Label><Input defaultValue="Al-Sayed" /></div>
                </div>
                <div className="space-y-1.5"><Label>Email</Label><Input type="email" defaultValue="amira@example.com" /></div>
                <div className="space-y-1.5"><Label>Phone</Label><Input defaultValue="+971 50 123 4567" /></div>
                <Button className="bg-gradient-cta text-white border-0 shadow-glow">Save Changes</Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function StatCard({ label, value, tone }: { label: string; value: string; tone?: "primary" }) {
  return (
    <div className={`bg-card rounded-2xl p-6 shadow-card border border-border/60 ${tone === "primary" ? "ring-2 ring-primary/30" : ""}`}>
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="font-display text-4xl font-bold mt-1">{value}</div>
    </div>
  );
}
