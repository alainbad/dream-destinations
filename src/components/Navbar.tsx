import { Link } from "@tanstack/react-router";
import { BedDouble, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const links = [
  { to: "/", label: "Home" },
  { to: "/hotels", label: "Hotels" },
  { to: "/ai-trip-planner", label: "AI Planner" },
  { to: "/dashboard", label: "Dashboard" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-[oklch(0.16_0.03_255/0.85)] backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-white">
          <div className="w-9 h-9 rounded-lg bg-gradient-cta flex items-center justify-center shadow-glow">
            <BedDouble className="w-5 h-5 text-white" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight">Dream Destinations</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-sm text-white/80 hover:text-white transition-colors"
              activeProps={{ className: "text-white font-medium" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <Button asChild variant="ghost" className="text-white hover:bg-white/10 hover:text-white">
            <Link to="/login">Sign In</Link>
          </Button>
          <Button asChild className="bg-gradient-cta text-white border-0 shadow-glow hover:opacity-90">
            <Link to="/signup">Sign Up</Link>
          </Button>
        </div>

        <button className="md:hidden text-white" onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <div className="md:hidden bg-[oklch(0.16_0.03_255)] border-t border-white/10 px-6 py-4 space-y-3">
          {links.map((l) => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="block text-white/80">
              {l.label}
            </Link>
          ))}
          <div className="flex gap-2 pt-2">
            <Button asChild variant="outline" className="flex-1"><Link to="/login">Sign In</Link></Button>
            <Button asChild className="flex-1 bg-gradient-cta text-white"><Link to="/signup">Sign Up</Link></Button>
          </div>
        </div>
      )}
    </header>
  );
}
