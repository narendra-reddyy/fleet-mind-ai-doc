import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const tiers = [
  {
    name: "Starter",
    price: "$149",
    blurb: "For owner-operators and small fleets up to 10 trucks.",
    cta: "Start free trial",
    variant: "glass" as const,
    features: [
      "Up to 10 vehicles",
      "Unlimited document uploads",
      "AI copilot · 500 questions/mo",
      "Expiration alerts & email digest",
      "Mobile capture for drivers",
    ],
  },
  {
    name: "Operator",
    price: "$499",
    blurb: "For growing fleets that need real automation.",
    cta: "Start 14-day trial",
    variant: "hero" as const,
    highlight: true,
    features: [
      "Up to 50 vehicles",
      "Everything in Starter",
      "Unlimited AI questions",
      "IFTA & fuel reports",
      "Role-based access (5 seats)",
      "Email-to-fleet inbox",
      "Priority support",
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    blurb: "For multi-yard carriers and brokerage operations.",
    cta: "Talk to sales",
    variant: "glass" as const,
    features: [
      "Unlimited vehicles & seats",
      "SSO / SAML & SCIM",
      "Custom data residency",
      "Dedicated success manager",
      "API & webhooks",
      "99.9% SLA",
    ],
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="relative py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs uppercase tracking-[0.2em] text-primary-glow">Pricing</span>
          <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight md:text-5xl">
            Simple pricing. Priced like software, not per page.
          </h2>
          <p className="mt-4 text-muted-foreground">
            One flat monthly rate per fleet. No per-document fees, no per-driver surcharges, no surprise overages.
          </p>
        </div>

        <div className="mt-16 grid gap-5 md:grid-cols-3">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={`relative rounded-2xl border p-8 transition-all hover:-translate-y-1 ${
                t.highlight
                  ? "border-primary/40 bg-surface shadow-elegant"
                  : "border-border bg-surface/40"
              }`}
            >
              {t.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-primary px-3 py-1 text-xs font-medium text-primary-foreground shadow-glow">
                  Most popular
                </span>
              )}
              <h3 className="font-display text-xl font-semibold">{t.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t.blurb}</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="font-display text-5xl font-semibold tracking-tight">{t.price}</span>
                {t.price !== "Custom" && <span className="text-sm text-muted-foreground">/mo</span>}
              </div>
              <Button variant={t.variant} className="mt-6 w-full" size="lg">
                {t.cta}
              </Button>
              <div className="mt-7 space-y-3">
                {t.features.map((f) => (
                  <div key={f} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary-glow" />
                    <span className="text-muted-foreground">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
