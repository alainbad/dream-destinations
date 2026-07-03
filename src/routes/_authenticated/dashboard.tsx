import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar } from "lucide-react";
import { listMyBookings } from "@/lib/liteapi.functions";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Dream Destinations" }] }),
  component: Dashboard,
});

const statusColors: Record<string, string> = {
  confirmed: "bg-[oklch(0.62_0.16_150/0.15)] text-[oklch(0.45_0.16_150)] border-[oklch(0.62_0.16_150/0.3)]",
  pending: "bg-[oklch(0.82_0.16_85/0.2)] text-[oklch(0.5_0.15_70)] border-[oklch(0.82_0.16_85/0.4)]",
  completed: "bg-[oklch(0.55_0.22_260/0.15)] text-[oklch(0.45_0.22_260)] border-[oklch(0.55_0.22_260/0.3)]",
  cancelled: "bg-[oklch(0.6_0.22_25/0.15)] text-[oklch(0.5_0.22_25)] border-[oklch(0.6_0.22_25/0.3)]",
};

function Dashboard() {
  const fetchBookings = useServerFn(listMyBookings);
  const { data: bookings = [], isLoading, error } = useQuery({
    queryKey: ["my-bookings"],
    queryFn: () => fetchBookings(),
  });

  const [email, setEmail] = useState<string>("");
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ""));
  }, []);

  const upcoming = bookings.filter((b) => new Date(b.check_in) >= new Date()).length;
  const completed = bookings.filter((b) => b.status === "completed").length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20">
        <div className="bg-gradient-hero text-white">
          <div className="max-w-7xl mx-auto px-6 py-12 flex flex-wrap items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-white/15 backdrop-blur grid place-items-center font-display text-3xl font-bold border-2 border-white/30">
              {email ? email[0].toUpperCase() : "•"}
            </div>
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold">Welcome back</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2.5 py-0.5 rounded-full bg-white/15 text-xs font-medium">Traveler</span>
                <span className="text-sm text-white/75">{email}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 -mt-8 relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard label="Total Bookings" value={String(bookings.length)} />
          <StatCard label="Upcoming" value={String(upcoming)} tone="primary" />
          <StatCard label="Completed" value={String(completed)} />
        </div>

        <div className="max-w-7xl mx-auto px-6 py-10">
          <Tabs defaultValue="bookings">
            <TabsList className="bg-secondary p-1">
              <TabsTrigger value="bookings" className="data-[state=active]:bg-card data-[state=active]:shadow-card">My Bookings</TabsTrigger>
            </TabsList>

            <TabsContent value="bookings" className="mt-6 space-y-4">
              {isLoading && <div className="p-10 text-center text-muted-foreground">Loading your bookings…</div>}
              {error && <div className="p-10 text-center text-destructive">Couldn't load bookings.</div>}
              {!isLoading && !error && bookings.length === 0 && (
                <div className="bg-card rounded-2xl border border-border/60 p-10 text-center">
                  <p className="text-muted-foreground">No bookings yet. Start exploring luxury stays.</p>
                  <Button asChild className="mt-4 bg-gradient-cta text-white border-0">
                    <a href="/hotels">Browse Hotels</a>
                  </Button>
                </div>
              )}
              {bookings.map((b) => {
                const status = (b.status || "pending").toLowerCase();
                return (
                  <div key={b.id} className="bg-card rounded-2xl shadow-card border border-border/60 grid grid-cols-1 md:grid-cols-[200px_1fr_auto] overflow-hidden">
                    <div className="aspect-[4/3] md:aspect-auto bg-secondary">
                      {b.hotel_image && <img src={b.hotel_image} alt={b.hotel_name} className="w-full h-full object-cover" />}
                    </div>
                    <div className="p-5">
                      <h3 className="font-display text-xl font-bold">{b.hotel_name}</h3>
                      {b.hotel_location && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <MapPin className="w-3.5 h-3.5" />{b.hotel_location}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-3 text-sm">
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <Calendar className="w-3.5 h-3.5" />{b.check_in} → {b.check_out}
                        </span>
                        <span className="text-muted-foreground">{b.guests} guest{b.guests > 1 ? "s" : ""}</span>
                      </div>
                      {b.room_name && <div className="text-xs text-muted-foreground mt-2">{b.room_name}</div>}
                    </div>
                    <div className="p-5 flex flex-col items-end justify-between gap-3 md:border-l border-border/60">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border capitalize ${statusColors[status] ?? statusColors.pending}`}>
                        {status}
                      </span>
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">Total</div>
                        <div className="font-bold text-lg">{b.currency} {Number(b.customer_total).toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
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
