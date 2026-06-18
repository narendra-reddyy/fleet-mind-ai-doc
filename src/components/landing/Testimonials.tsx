const quotes = [
  {
    quote:
      "Carrier (84 Trucks)\n\"FleetMind identified an insurance certificate that was about to expire before it became a compliance issue.\"",
    name: "Marcus Halloway",
    role: "Director of Ops · Northbound Logistics",
    stat: "84 trucks",
  },
  {
    quote:
      "(212 Trucks)\n\"We asked FleetMind for Q1 maintenance spend per truck and received a sourced answer in seconds.\"",
    name: "Priya Ramachandran",
    role: "CFO · Summit Transit",
    stat: "212 trucks",
  },
  {
    quote:
      "Our drivers actually use it. They snap a photo of the fuel receipt and it shows up against the right load. Bookkeeping went from days to minutes.",
    name: "Travis Booker",
    role: "Owner · Ironhaul Freight",
    stat: "37 trucks",
  },
  {
    quote:
      "DOT audit prep used to be two weeks of panic. Last quarter we exported the audit packet in eleven minutes.",
    name: "Elena Vasquez",
    role: "Compliance Lead · Atlas Carriers",
    stat: "156 trucks",
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="relative py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs uppercase tracking-[0.2em] text-primary-glow">FLEET SCENARIOS</span>
          <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight md:text-5xl">
            Operators don't have time for software that gets in the way.
          </h2>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-2">
          {quotes.map((q) => (
            <figure
              key={q.name}
              className="rounded-2xl border border-border bg-surface/60 p-8 transition-all hover:border-primary/40 hover:shadow-elegant"
            >
              <blockquote className="whitespace-pre-line font-display text-xl leading-snug tracking-tight md:text-2xl">
                {q.quote.includes('\n') ? q.quote : `"${q.quote}"`}
              </blockquote>
              <figcaption className="mt-6 flex items-center justify-between border-t border-border pt-5">
                <div>
                  <div className="text-sm font-semibold">{q.name}</div>
                  <div className="text-xs text-muted-foreground">{q.role}</div>
                </div>
                <span className="rounded-full glass px-2.5 py-1 text-xs text-primary-glow">{q.stat}</span>
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            ["10x", "faster document lookup"],
            ["98%", "auto-classification accuracy"],
            ["$2,400", "avg. monthly time savings"],
            ["0", "missed compliance deadlines"],
          ].map(([n, l]) => (
            <div key={l} className="rounded-2xl border border-border bg-surface/40 p-6 text-center">
              <div className="font-display text-4xl font-semibold text-gradient">{n}</div>
              <div className="mt-1 text-xs text-muted-foreground">{l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
