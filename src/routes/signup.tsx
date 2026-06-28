import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plane, Eye, EyeOff, User, Building2 } from "lucide-react";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Sign Up — TravelHub" }] }),
  component: Signup,
});

function Signup() {
  const [show, setShow] = useState(false);
  const [role, setRole] = useState<"traveler" | "partner">("traveler");
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      <div className="relative bg-gradient-hero text-white p-10 lg:p-16 flex flex-col justify-between overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{backgroundImage: "radial-gradient(circle at 70% 30%, white 1px, transparent 1px)", backgroundSize: "40px 40px"}} />
        <Link to="/" className="relative flex items-center gap-2 w-fit">
          <div className="w-9 h-9 rounded-lg bg-white/15 grid place-items-center"><Plane className="w-5 h-5" /></div>
          <span className="font-display text-xl font-bold">TravelHub</span>
        </Link>
        <div className="relative">
          <h2 className="font-display text-4xl font-bold mb-4">Join 2M+ travelers.</h2>
          <p className="text-white/85 max-w-md">Unlock member-only fares, free cancellations, and AI-crafted itineraries from day one.</p>
          <div className="mt-10 grid grid-cols-3 gap-4 max-w-md">
            <div><div className="font-display text-3xl font-bold">2M+</div><div className="text-xs text-white/70">Travelers</div></div>
            <div><div className="font-display text-3xl font-bold">120k</div><div className="text-xs text-white/70">Hotels</div></div>
            <div><div className="font-display text-3xl font-bold">500+</div><div className="text-xs text-white/70">Airlines</div></div>
          </div>
        </div>
        <div className="relative text-xs text-white/60">© 2026 TravelHub</div>
      </div>

      <div className="flex items-center justify-center p-8 lg:p-16 bg-background">
        <form className="w-full max-w-md space-y-5">
          <div>
            <h1 className="font-display text-3xl font-bold">Create your account</h1>
            <p className="text-sm text-muted-foreground mt-1">Already a member? <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link></p>
          </div>

          <div className="grid grid-cols-2 gap-2 p-1 bg-secondary rounded-xl">
            {([["traveler", "Traveler", User], ["partner", "Hotel Partner", Building2]] as const).map(([k, l, Icon]) => (
              <button key={k} type="button" onClick={() => setRole(k)} className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition ${role === k ? "bg-card shadow-card text-foreground" : "text-muted-foreground"}`}>
                <Icon className="w-4 h-4" />{l}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label htmlFor="first">First name</Label><Input id="first" className="h-11" /></div>
            <div className="space-y-1.5"><Label htmlFor="last">Last name</Label><Input id="last" className="h-11" /></div>
          </div>
          <div className="space-y-1.5"><Label htmlFor="email">Email</Label><Input id="email" type="email" className="h-11" /></div>
          <div className="space-y-1.5">
            <Label htmlFor="pwd">Password</Label>
            <div className="relative">
              <Input id="pwd" type={show ? "text" : "password"} className="h-11 pr-10" />
              <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <Button className="w-full h-11 bg-gradient-cta text-white border-0 font-semibold shadow-glow">Create Account</Button>
          <div className="text-center text-xs text-muted-foreground">By creating an account you agree to our Terms and Privacy Policy.</div>
        </form>
      </div>
    </div>
  );
}
