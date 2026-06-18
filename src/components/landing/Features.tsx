import {
  Bell,
  Brain,
  FileSearch,
  Lock,
  Receipt,
  Smartphone,
  Workflow,
  Zap,
} from "lucide-react";

export function Features() {
  return (
    <section id="features" className="relative py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs uppercase tracking-[0.2em] text-primary-glow">Platform</span>
          <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight md:text-5xl">
            Built for the operators running the road.
          </h2>
          <p className="mt-4 text-muted-foreground">
            A complete document intelligence layer, a conversational copilot, and the compliance brain your back office has been missing.
          </p>
        </div>

        {/* Bento */}
        <div className="mt-16 grid auto-rows-[180px] grid-cols-1 gap-4 md:grid-cols-6">
          {/* Big: AI copilot */}
          <Cell className="md:col-span-4 md:row-span-2" icon={Brain} title="The fleet copilot that actually knows your business">
            <p className="text-sm text-muted-foreground">
              FleetMind answers grounded only in your documents. Every reply cites the exact PDF, page and paragraph it pulled from — no hallucinations, full audit trail.
            </p>
            <div className="mt-6 space-y-2 text-xs">
              <div className="rounded-md bg-background/70 px-3 py-2 text-muted-foreground">
                "Total maintenance spend per truck in Q1, sorted high to low."
              </div>
              <div className="rounded-md border border-primary/20 bg-primary/10 px-3 py-2">
                <div className="grid grid-cols-3 gap-2 font-mono text-[11px]">
                  <div>T-22 · $14,802</div><div>T-07 · $11,540</div><div>T-14 · $9,220</div>
                  <div>T-31 · $7,815</div><div>T-08 · $6,902</div><div>T-19 · $5,440</div>
                </div>
              </div>
            </div>
          </Cell>

          <Cell className="md:col-span-2" icon={Bell} title="Smart expiration alerts">
            <p className="text-sm text-muted-foreground">Traffic-light dashboard surfaces every cert 60/30/14/3 days out.</p>
          </Cell>

          <Cell className="md:col-span-2" icon={Receipt} title="IFTA & fuel ledger">
            <p className="text-sm text-muted-foreground">Quarterly filings draft themselves from your fuel receipts.</p>
          </Cell>

          <Cell className="md:col-span-2" icon={FileSearch} title="Semantic search">
            <p className="text-sm text-muted-foreground">Find any document by what it says — not what it was named.</p>
          </Cell>

          <Cell className="md:col-span-2" icon={Smartphone} title="Mobile capture for drivers">
            <p className="text-sm text-muted-foreground">Snap a fuel receipt — it files itself to the right truck and trip.</p>
          </Cell>

          <Cell className="md:col-span-2" icon={Workflow} title="Email-to-fleet inbox">
            <p className="text-sm text-muted-foreground">Forward broker, vendor and DOT emails. We sort the attachments.</p>
          </Cell>

          <Cell className="md:col-span-3" icon={Lock} title="Enterprise-grade security">
            <p className="text-sm text-muted-foreground">
              SOC 2 ready, row-level tenant isolation, signed-URL storage, role-based access for owners, dispatchers, drivers and accountants. Every document fetch is audit-logged.
            </p>
          </Cell>

          <Cell className="md:col-span-3" icon={Zap} title="Sub-5-second answers">
            <p className="text-sm text-muted-foreground">
              Vector search over your entire archive returns cited answers in under five seconds — even across 100,000+ documents.
            </p>
          </Cell>
        </div>
      </div>
    </section>
  );
}

function Cell({
  className = "",
  icon: Icon,
  title,
  children,
}: {
  className?: string;
  icon: typeof Brain;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-border bg-surface/60 p-6 transition-all hover:border-primary/40 hover:shadow-elegant ${className}`}
    >
      <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary/10 opacity-0 blur-2xl transition-opacity group-hover:opacity-100" />
      <div className="relative flex h-full flex-col">
        <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
          <Icon className="h-4 w-4 text-primary-foreground" />
        </div>
        <h3 className="font-display text-lg font-semibold tracking-tight">{title}</h3>
        <div className="mt-2 flex-1">{children}</div>
      </div>
    </div>
  );
}
