import { FileText, MessageSquare, ScanLine, Sparkles } from "lucide-react";

const steps = [
  {
    icon: ScanLine,
    title: "1. Drop in any document",
    body: "Upload PDFs, photos, scans, or forward your inbox. FleetMind OCRs, classifies and extracts every field automatically.",
  },
  {
    icon: Sparkles,
    title: "2. AI files it to the right truck",
    body: "VINs, unit numbers and driver names are matched to your fleet. Expirations populate alerts before anything lapses.",
  },
  {
    icon: MessageSquare,
    title: "3. Ask anything, get sourced answers",
    body: "“What did we spend on tires for Truck 14 in Q2?” comes back with totals and the receipts attached — in under five seconds.",
  },
];

export function ProductDemo() {
  return (
    <section id="demo" className="relative py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs uppercase tracking-[0.2em] text-primary-glow">How it works</span>
          <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight md:text-5xl">
            From shoebox to source of truth in minutes.
          </h2>
          <p className="mt-4 text-muted-foreground">
            One pipeline replaces the filing cabinet, the shared drive and the spreadsheet you've been living in.
          </p>
        </div>

        <div className="mt-16 grid gap-4 md:grid-cols-3">
          {steps.map((s, i) => (
            <div
              key={s.title}
              className="group relative rounded-2xl border border-border bg-surface/60 p-7 transition-all hover:-translate-y-1 hover:shadow-elegant"
            >
              <div className="absolute right-6 top-6 font-display text-6xl font-bold text-foreground/5">
                0{i + 1}
              </div>
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
                <s.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <h3 className="font-display text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>

        {/* split demo */}
        <div className="mt-16 grid items-center gap-8 rounded-2xl border border-border bg-surface/40 p-6 md:grid-cols-2 md:p-10">
          <div>
            <span className="rounded-full glass px-2.5 py-1 text-xs text-primary-glow">Document AI</span>
            <h3 className="mt-4 font-display text-3xl font-semibold tracking-tight">
              Every field, captured automatically.
            </h3>
            <p className="mt-3 text-muted-foreground">
              FleetMind reads insurance certificates, fuel receipts, BOLs, CDLs, medical cards, registrations and IFTA filings —
              and turns them into clean structured data with citations back to the original.
            </p>
            <ul className="mt-5 space-y-2 text-sm">
              {[
                "12 document types out of the box",
                "OCR for scans, photos and phone uploads",
                "Confidence scores + review queue",
                "Auto-link to vehicle, driver and vendor",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2 text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary-glow" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-border bg-background p-4 shadow-soft">
            <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
              <FileText className="h-3.5 w-3.5" /> policy_T14_progressive_2026.pdf
            </div>
            <div className="grid gap-2 text-xs">
              {[
                ["Document type", "Insurance certificate", "98%"],
                ["Carrier", "Progressive Commercial", "97%"],
                ["Policy number", "CA-99812345", "99%"],
                ["Insured", "Acme Trucking LLC", "96%"],
                ["Effective", "Dec 01, 2025", "99%"],
                ["Expires", "Dec 01, 2026", "99%"],
                ["Coverage", "$1,000,000", "94%"],
                ["Linked to", "Truck 14 · VIN ...P1234", "100%"],
              ].map(([k, v, c]) => (
                <div key={k} className="flex items-center justify-between rounded-md bg-surface/60 px-3 py-2">
                  <span className="text-muted-foreground">{k}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{v}</span>
                    <span className="rounded bg-success/15 px-1.5 py-0.5 text-[10px] text-success">{c}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
