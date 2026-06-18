import { Truck } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-5">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
                <Truck className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-display text-lg font-semibold">FleetMind AI</span>
            </div>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              The AI operations layer for trucking. Built by operators, for operators.
            </p>
          </div>

          {[
            ["Product", ["Features", "Pricing", "Security", "Changelog", "Roadmap"]],
            ["Company", ["About", "Customers", "Careers", "Press"]],
            ["Resources", ["Docs", "API", "Blog", "Support"]],
          ].map(([title, items]) => (
            <div key={title as string}>
              <div className="font-display text-sm font-semibold">{title as string}</div>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {(items as string[]).map((i) => (
                  <li key={i} className="cursor-pointer transition-colors hover:text-foreground">{i}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground md:flex-row md:items-center">
          <span>© 2026 FleetMind AI, Inc. All rights reserved.</span>
          <div className="flex gap-5">
            <span>Privacy</span><span>Terms</span><span>SOC 2</span><span>DPA</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
