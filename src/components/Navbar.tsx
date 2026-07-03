import { Link, useNavigate } from "@tanstack/react-router";
import { BedDouble, Menu, X, LogOut, LayoutDashboard } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const links = [
  { to: "/", label: "Home" },
  { to: "/hotels", label: "Hotels" },
  { to: "/ai-trip-planner", label: "AI Planner" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const navigate = useNavigate();
  const qc = useQueryClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setEmail(session?.user?.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/login", replace: true });
  };

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-[oklch(0.16_0.03_255/0.85)] backdrop-blur-md border-b border-white/10 pt-[env(safe-area-inset-top)]">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-white">
          <div className="w-9 h-9 rounded-lg bg-gradient-cta flex items-center justify-center shadow-glow">
            <BedDouble className="w-5 h-5 text-white" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight">Dream Destinations</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="text-sm text-white/80 hover:text-white transition-colors" activeProps={{ className: "text-white font-medium" }}>
              {l.label}
            </Link>
          ))}
          {email && (
            <Link to="/dashboard" className="text-sm text-white/80 hover:text-white transition-colors" activeProps={{ className: "text-white font-medium" }}>
              Dashboard
            </Link>
          )}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          {email ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-9 h-9 rounded-full bg-white/15 text-white grid place-items-center font-semibold hover:bg-white/25 transition">
                  {email[0].toUpperCase()}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-xs text-muted-foreground truncate">{email}</div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate({ to: "/dashboard" })}>
                  <LayoutDashboard className="w-4 h-4 mr-2" /> Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="w-4 h-4 mr-2" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button asChild variant="ghost" className="text-white hover:bg-white/10 hover:text-white"><Link to="/login">Sign In</Link></Button>
              <Button asChild className="bg-gradient-cta text-white border-0 shadow-glow hover:opacity-90"><Link to="/signup">Sign Up</Link></Button>
            </>
          )}
        </div>

        <button className="md:hidden text-white" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
      </div>
      {open && (
        <div className="md:hidden bg-[oklch(0.16_0.03_255)] border-t border-white/10 px-6 py-4 space-y-3">
          {links.map((l) => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="block text-white/80">{l.label}</Link>
          ))}
          {email && <Link to="/dashboard" onClick={() => setOpen(false)} className="block text-white/80">Dashboard</Link>}
          <div className="flex gap-2 pt-2">
            {email ? (
              <Button onClick={signOut} variant="outline" className="flex-1">Sign Out</Button>
            ) : (
              <>
                <Button asChild variant="outline" className="flex-1"><Link to="/login">Sign In</Link></Button>
                <Button asChild className="flex-1 bg-gradient-cta text-white"><Link to="/signup">Sign Up</Link></Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
