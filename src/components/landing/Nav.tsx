import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Truck } from "lucide-react";

export function Nav() {
  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="absolute inset-0 backdrop-blur-md bg-background/60 border-b border-border" />
      <nav className="relative mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
            <Truck className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-semibold tracking-tight">FleetMind AI</span>
        </Link>
        <div className="hidden items-center gap-8 md:flex">
          {[
            ["Product", "#demo"],
            ["Features", "#features"],
            ["Pricing", "#pricing"],
            ["Customers", "#testimonials"],
            ["Contact", "#contact"],
          ].map(([label, href]) => (
            <a
              key={label}
              href={href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {label}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
            Sign in
          </Button>
          <Button variant="hero" size="sm">
            Get a demo
          </Button>
        </div>
      </nav>
    </header>
  );
}
