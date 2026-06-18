import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { DashboardPreview } from "./DashboardPreview";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 grid-bg [mask-image:radial-gradient(70%_60%_at_50%_0%,black,transparent)]" />
      <div className="absolute inset-x-0 top-0 h-[600px] bg-glow" />

      <div className="relative mx-auto max-w-7xl px-6 pt-20 pb-12 md:pt-28">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary-glow" />
            Introducing FleetMind AI · The fleet operations copilot
          </div>

          <h1 className="mt-6 font-display text-5xl font-semibold tracking-tight md:text-7xl">
            Your entire fleet,{" "}
            <span className="text-gradient">answered in plain English.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
            FleetMind organizes every registration, insurance certificate, fuel receipt
            and maintenance log — then lets you ask anything, get an answer in seconds,
            with the source attached.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Button variant="hero" size="xl">
              Start free trial <ArrowRight className="h-4 w-4" />
            </Button>
            <Button variant="glass" size="xl">
              Watch 2-min demo
            </Button>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            No credit card · SOC 2 ready · Cancel anytime
          </p>
        </div>

        <div className="relative mt-16 md:mt-20">
          <div className="absolute -inset-4 bg-gradient-primary opacity-20 blur-3xl" />
          <div className="relative rounded-2xl border border-border bg-surface/60 p-2 shadow-elegant">
            <DashboardPreview />
          </div>
        </div>

        <div className="mt-16 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Trusted by operators moving {">"} 2M miles every month
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-12 gap-y-4 opacity-60">
            {["NORTHBOUND LOGISTICS", "PRAIRIE FREIGHT", "SUMMIT TRANSIT", "IRONHAUL", "ATLAS CARRIERS", "RIDGELINE CO."].map(
              (n) => (
                <span key={n} className="font-display text-sm font-semibold tracking-[0.15em] text-muted-foreground">
                  {n}
                </span>
              ),
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
