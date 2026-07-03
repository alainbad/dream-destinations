import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BedDouble, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Sign Up — Dream Destinations" }] }),
  component: Signup,
});

function Signup() {
  const [show, setShow] = useState(false);
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: { first_name: first, last_name: last },
      },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Account created!");
    navigate({ to: "/dashboard" });
  };

  const onGoogle = async () => {
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) return toast.error(result.error.message ?? "Google sign-up failed");
    if (result.redirected) return;
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      <div className="relative bg-gradient-hero text-white p-10 lg:p-16 flex flex-col justify-between overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{backgroundImage: "radial-gradient(circle at 70% 30%, white 1px, transparent 1px)", backgroundSize: "40px 40px"}} />
        <Link to="/" className="relative flex items-center gap-2 w-fit">
          <div className="w-9 h-9 rounded-lg bg-white/15 grid place-items-center"><BedDouble className="w-5 h-5" /></div>
          <span className="font-display text-xl font-bold">Dream Destinations</span>
        </Link>
        <div className="relative">
          <h2 className="font-display text-4xl font-bold mb-4">Join millions of travelers.</h2>
          <p className="text-white/85 max-w-md">Unlock member-only fares, free cancellations, and AI-crafted itineraries from day one.</p>
        </div>
        <div className="relative text-xs text-white/60">© 2026 Dream Destinations</div>
      </div>

      <div className="flex items-center justify-center p-8 lg:p-16 bg-background">
        <form onSubmit={onSubmit} className="w-full max-w-md space-y-5">
          <div>
            <h1 className="font-display text-3xl font-bold">Create your account</h1>
            <p className="text-sm text-muted-foreground mt-1">Already a member? <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link></p>
          </div>

          <Button type="button" variant="outline" onClick={onGoogle} className="w-full h-11">
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/></svg>
            Continue with Google
          </Button>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex-1 border-t border-border" /> OR <div className="flex-1 border-t border-border" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label htmlFor="first">First name</Label><Input id="first" value={first} onChange={(e) => setFirst(e.target.value)} className="h-11" required /></div>
            <div className="space-y-1.5"><Label htmlFor="last">Last name</Label><Input id="last" value={last} onChange={(e) => setLast(e.target.value)} className="h-11" required /></div>
          </div>
          <div className="space-y-1.5"><Label htmlFor="email">Email</Label><Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-11" required /></div>
          <div className="space-y-1.5">
            <Label htmlFor="pwd">Password</Label>
            <div className="relative">
              <Input id="pwd" type={show ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="h-11 pr-10" required minLength={6} />
              <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-full h-11 bg-gradient-cta text-white border-0 font-semibold shadow-glow">
            {loading ? "Creating…" : "Create Account"}
          </Button>
          <div className="text-center text-xs text-muted-foreground">By creating an account you agree to our Terms and Privacy Policy.</div>
        </form>
      </div>
    </div>
  );
}
