import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, MapPin, Phone, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export function Contact() {
  const [loading, setLoading] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      (e.target as HTMLFormElement).reset();
      toast.success("Thanks — we'll be in touch within one business day.");
    }, 700);
  }

  return (
    <section id="contact" className="relative py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-surface/60 p-8 md:p-14">
          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute -left-24 -bottom-24 h-80 w-80 rounded-full bg-primary-glow/15 blur-3xl" />

          <div className="relative grid gap-12 md:grid-cols-2">
            <div>
              <span className="text-xs uppercase tracking-[0.2em] text-primary-glow">Contact</span>
              <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight md:text-5xl">
                Let's get your fleet on FleetMind.
              </h2>
              <p className="mt-4 max-w-md text-muted-foreground">
                Book a 20-minute demo with an operator who's run a fleet. We'll show you how FleetMind handles your actual document mess — bring a sample.
              </p>

              <div className="mt-8 space-y-3 text-sm">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Mail className="h-4 w-4 text-primary-glow" /> hello@fleetmind.ai
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Phone className="h-4 w-4 text-primary-glow" /> +1 (415) 555-0142
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <MapPin className="h-4 w-4 text-primary-glow" /> 548 Market St · San Francisco, CA
                </div>
              </div>
            </div>

            <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-border bg-background/60 p-6 md:p-8">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" required placeholder="Jane Operator" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="company">Company</Label>
                  <Input id="company" required placeholder="Acme Trucking" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="email">Work email</Label>
                  <Input id="email" type="email" required placeholder="john@northboundlogistics.com" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="fleet">Fleet size</Label>
                  <Input id="fleet" type="number" min={1} required placeholder="50" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="message">What are you trying to solve?</Label>
                <Textarea id="message" rows={4} placeholder="Need help managing compliance documents and vehicle records," />
              </div>
              <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
                {loading ? "Sending..." : "Book a demo"} <ArrowRight className="h-4 w-4" />
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                We reply within one business day · No sales spam, ever.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
