import { Link } from "@tanstack/react-router";
import { Plane, Facebook, Twitter, Instagram } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[oklch(0.14_0.03_255)] text-white/70 mt-24">
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-2 md:grid-cols-5 gap-10">
        <div className="col-span-2">
          <Link to="/" className="flex items-center gap-2 text-white mb-4">
            <div className="w-9 h-9 rounded-lg bg-gradient-cta flex items-center justify-center">
              <Plane className="w-5 h-5" />
            </div>
            <span className="font-display text-xl font-bold">TravelHub</span>
          </Link>
          <p className="text-sm max-w-sm">
            Curated luxury travel across the Middle East, Mediterranean and beyond.
            Book hotels, flights and bespoke itineraries with confidence.
          </p>
          <div className="flex gap-3 mt-5">
            {[Facebook, Twitter, Instagram].map((Icon, i) => (
              <a key={i} href="#" className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>
        {[
          { title: "Explore", items: ["Hotels", "Flights", "AI Planner", "Destinations"] },
          { title: "Company", items: ["About", "Careers", "Press", "Partners"] },
          { title: "Support", items: ["Help Center", "Contact", "Terms", "Privacy"] },
        ].map((col) => (
          <div key={col.title}>
            <h4 className="text-white font-semibold mb-4 text-sm">{col.title}</h4>
            <ul className="space-y-2 text-sm">
              {col.items.map((i) => (
                <li key={i}><a href="#" className="hover:text-white transition-colors">{i}</a></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-6 text-xs text-white/50 flex flex-wrap justify-between gap-2">
          <span>© 2026 TravelHub. All rights reserved.</span>
          <span>Crafted for travelers, by travelers.</span>
        </div>
      </div>
    </footer>
  );
}
