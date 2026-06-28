import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plane, Eye, EyeOff, ShieldCheck, BadgePercent, Headphones, Sparkles } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign In — TravelHub" }] }),
  component: Login,
});

function Login() {
  const [show, setShow] = useState(false);
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      <div className="relative bg-gradient-hero text-white p-10 lg:p-16 flex flex-col justify-between overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{backgroundImage: "radial-gradient(circle at 30% 30%, white 1px, transparent 1px)", backgroundSize: "40px 40px"}} />
        <Link to="/" className="relative flex items-center gap-2 w-fit">
          <div className="w-9 h-9 rounded-lg bg-white/15 grid place-items-center"><Plane className="w-5 h-5" /></div>
          <span className="font-display text-xl font-bold">TravelHub</span>
        </Link>
        <div className="relative">
          <h2 className="font-display text-4xl font-bold mb-6">Welcome back, explorer.</h2>
          <p className="text-white/85 mb-10 max-w-md">Pick up where you left off — your saved trips, loyalty rewards, and instant rebooking are all waiting.</p>
          <ul className="space-y-4">
            {[
              { icon: BadgePercent, t: "Member-only fares", d: "Save up to 20% on hotels worldwide" },
              { icon: ShieldCheck, t: "Free cancellation", d: "Most bookings cancel free up to 48 hours" },
              { icon: Headphones, t: "Priority 24/7 support", d: "Real travel concierges, always on" },
              { icon: Sparkles, t: "AI trip planning", d: "Custom itineraries in seconds" },
            ].map((b) => (
              <li key={b.t} className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/15 grid place-items-center shrink-0"><b.icon className="w-4 h-4" /></div>
                <div><div className="font-semibold">{b.t}</div><div className="text-sm text-white/75">{b.d}</div></div>
              </li>
            ))}
          </ul>
        </div>
        <div className="relative text-xs text-white/60">© 2026 TravelHub</div>
      </div>

      <div className="flex items-center justify-center p-8 lg:p-16 bg-background">
        <form className="w-full max-w-md space-y-5">
          <div>
            <h1 className="font-display text-3xl font-bold">Sign in</h1>
            <p className="text-sm text-muted-foreground mt-1">New here? <Link to="/signup" className="text-primary font-medium hover:underline">Create an account</Link></p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" className="h-11" />
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between"><Label htmlFor="pwd">Password</Label><a href="#" className="text-xs text-primary hover:underline">Forgot?</a></div>
            <div className="relative">
              <Input id="pwd" type={show ? "text" : "password"} className="h-11 pr-10" />
              <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <Button className="w-full h-11 bg-gradient-cta text-white border-0 font-semibold shadow-glow">Sign In</Button>
          <div className="text-center text-xs text-muted-foreground">By continuing you agree to our Terms and Privacy Policy.</div>
        </form>
      </div>
    </div>
  );
}
