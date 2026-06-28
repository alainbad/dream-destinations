import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Sun, Coffee, MapPin, Wallet, Calendar } from "lucide-react";

export const Route = createFileRoute("/ai-trip-planner")({
  head: () => ({ meta: [{ title: "AI Trip Planner — TravelHub" }, { name: "description", content: "Get a personalized day-by-day itinerary in seconds." }] }),
  component: AiPlanner,
});

const samplePrompts = ["3 days in Dubai", "Romantic Paris weekend", "Bali family vacation", "Tokyo cultural tour"];

const sampleItinerary = [
  {
    day: 1, title: "Arrival & The Skyline",
    activities: [
      { time: "10:00", title: "Check into Burj Al Arab", desc: "Settle into your suite with welcome dates and rosewater." },
      { time: "13:00", title: "Lunch at Al Mahara", desc: "Underwater seafood restaurant — try the Omani lobster." },
      { time: "16:00", title: "Burj Khalifa At The Top", desc: "Sunset views from level 148." },
      { time: "20:00", title: "Dinner at Pierchic", desc: "Overwater dining on the Madinat Jumeirah pier." },
    ],
    tip: "Book Burj Khalifa tickets in advance — sunset slots sell out 2 weeks ahead.",
  },
  {
    day: 2, title: "Old Dubai & Souks",
    activities: [
      { time: "09:00", title: "Al Fahidi Historical District", desc: "Wind-tower architecture and the Coffee Museum." },
      { time: "12:00", title: "Abra ride across the Creek", desc: "Traditional water taxi — 1 AED." },
      { time: "13:00", title: "Gold & Spice Souks", desc: "Haggle for saffron, frankincense, and 22k gold." },
      { time: "19:00", title: "Desert safari & BBQ", desc: "Dune bashing, falconry, and a Bedouin-style dinner." },
    ],
    tip: "Wear closed shoes for the desert and bring a light scarf for sand.",
  },
  {
    day: 3, title: "Beach & Departure",
    activities: [
      { time: "09:00", title: "Brunch at Bu Qtair", desc: "Locally famous spicy fish shack on Jumeirah Beach." },
      { time: "11:00", title: "Aquaventure Waterpark", desc: "Slides, sharks, and a lazy river at Atlantis." },
      { time: "16:00", title: "Spa at Talise Ottoman", desc: "Hammam and oud massage before your flight." },
    ],
    tip: "Use Careem for airport transfer — fixed fares and luxury vehicle options.",
  },
];

function AiPlanner() {
  const [prompt, setPrompt] = useState("");
  const [generated, setGenerated] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute inset-0 opacity-30" style={{backgroundImage: "radial-gradient(circle at 20% 20%, white 1px, transparent 1px), radial-gradient(circle at 80% 60%, white 1px, transparent 1px)", backgroundSize: "60px 60px"}} />
        <div className="relative max-w-4xl mx-auto px-6 text-center text-white">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/25 text-xs font-medium mb-5">
            <Sparkles className="w-3.5 h-3.5" /> Powered by AI
          </span>
          <h1 className="font-display text-5xl md:text-6xl font-bold mb-4">Plan Your Perfect Trip</h1>
          <p className="text-lg text-white/85 mb-8 max-w-2xl mx-auto">Describe your dream getaway and let our AI craft a personalized day-by-day itinerary with activities, meals and insider tips.</p>

          <div className="bg-white rounded-2xl p-2 shadow-elevated text-left">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. A 5-day cultural escape to Istanbul with Ottoman history, Bosphorus views, and great food..."
              className="border-0 min-h-[120px] resize-none focus-visible:ring-0 text-foreground"
            />
            <div className="flex items-center justify-between p-2">
              <span className="text-xs text-muted-foreground">Be as specific as you like</span>
              <Button onClick={() => setGenerated(true)} className="bg-gradient-cta text-white border-0 shadow-glow">
                <Sparkles className="w-4 h-4 mr-2" /> Generate Itinerary
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mt-5">
            {samplePrompts.map((p) => (
              <button key={p} onClick={() => { setPrompt(p); setGenerated(true); }} className="px-4 py-1.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/25 text-sm transition">
                {p}
              </button>
            ))}
          </div>
        </div>
      </section>

      {generated && (
        <section className="max-w-5xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            <Stat icon={Wallet} label="Estimated Budget" value="$3,200 – $4,800" />
            <Stat icon={Calendar} label="Best Time to Visit" value="Nov – Mar" />
            <Stat icon={Sun} label="Avg. Weather" value="26°C / Sunny" />
          </div>

          <div className="space-y-6">
            {sampleItinerary.map((d) => (
              <div key={d.day} className="bg-card rounded-2xl shadow-card border border-border/60 overflow-hidden">
                <div className="bg-gradient-hero text-white p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/20 grid place-items-center font-display text-xl font-bold">{d.day}</div>
                  <div>
                    <div className="text-xs uppercase tracking-wider opacity-80">Day {d.day}</div>
                    <h3 className="font-display text-2xl font-bold">{d.title}</h3>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  {d.activities.map((a, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="text-sm font-bold text-primary min-w-[55px] pt-0.5">{a.time}</div>
                      <div className="flex-1 pb-4 border-b border-border last:border-0 last:pb-0">
                        <div className="font-semibold flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-primary" />{a.title}</div>
                        <div className="text-sm text-muted-foreground mt-1">{a.desc}</div>
                      </div>
                    </div>
                  ))}
                  <div className="flex gap-3 p-4 rounded-xl bg-accent/40 border border-primary/20 mt-2">
                    <Coffee className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div><span className="font-semibold text-sm">Insider tip: </span><span className="text-sm text-muted-foreground">{d.tip}</span></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="bg-card rounded-2xl p-5 shadow-card border border-border/60 flex items-center gap-4">
      <div className="w-11 h-11 rounded-xl bg-gradient-cta grid place-items-center text-white shadow-glow"><Icon className="w-5 h-5" /></div>
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="font-bold">{value}</div>
      </div>
    </div>
  );
}
