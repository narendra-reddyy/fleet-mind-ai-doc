import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  Fuel,
  LayoutDashboard,
  MessageSquare,
  Search,
  Settings,
  Shield,
  Truck,
  TrendingUp,
  Users,
  Wrench,
} from "lucide-react";

export function DashboardPreview() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-background">
      {/* window chrome */}
      <div className="flex items-center gap-2 border-b border-border bg-surface/80 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-warning/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
        <div className="mx-auto flex items-center gap-2 rounded-md bg-background/70 px-3 py-1 text-xs text-muted-foreground">
          <Search className="h-3 w-3" /> app.fleetmind.ai/dashboard
        </div>
      </div>

      <div className="grid grid-cols-[200px_1fr] min-h-[460px]">
        {/* sidebar */}
        <aside className="border-r border-border bg-surface/40 p-3 hidden md:block">
          <div className="mb-4 flex items-center gap-2 px-2 py-1.5">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-gradient-primary">
              <Truck className="h-3 w-3 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold">Acme Trucking</span>
          </div>
          <nav className="space-y-0.5 text-sm">
            {[
              [LayoutDashboard, "Dashboard", true],
              [MessageSquare, "Ask FleetMind", false],
              [FileText, "Documents", false],
              [Truck, "Vehicles", false],
              [Users, "Drivers", false],
              [Shield, "Compliance", false],
              [Wrench, "Maintenance", false],
              [Fuel, "Fuel & IFTA", false],
              [Settings, "Settings", false],
            ].map(([Icon, label, active]) => {
              const I = Icon as typeof LayoutDashboard;
              return (
                <div
                  key={label as string}
                  className={`flex items-center gap-2 rounded-md px-2 py-1.5 ${
                    active ? "bg-primary/15 text-foreground" : "text-muted-foreground"
                  }`}
                >
                  <I className="h-3.5 w-3.5" />
                  <span className="text-xs">{label as string}</span>
                </div>
              );
            })}
          </nav>
        </aside>

        {/* main */}
        <main className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-base font-semibold">Fleet overview</h3>
              <p className="text-xs text-muted-foreground">Tuesday · June 18, 2026</p>
            </div>
            <div className="flex items-center gap-2 rounded-md glass px-2.5 py-1.5 text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
              Live
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
            {[
              { label: "Active trucks", value: "84", delta: "+3", icon: Truck },
              { label: "Docs processed", value: "12.4k", delta: "+412", icon: FileText },
              { label: "Expiring 30d", value: "7", delta: "-2", icon: AlertTriangle, warn: true },
              { label: "Compliance", value: "98%", delta: "+1.2%", icon: CheckCircle2, good: true },
            ].map((k) => (
              <div key={k.label} className="rounded-lg border border-border bg-surface/60 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{k.label}</span>
                  <k.icon className={`h-3.5 w-3.5 ${k.warn ? "text-warning" : k.good ? "text-success" : "text-primary-glow"}`} />
                </div>
                <div className="mt-1.5 flex items-baseline gap-1.5">
                  <span className="font-display text-xl font-semibold">{k.value}</span>
                  <span className={`text-[10px] ${k.warn ? "text-warning" : "text-success"}`}>{k.delta}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-2.5">
            {/* chat */}
            <div className="lg:col-span-2 rounded-lg border border-border bg-surface/60 p-3">
              <div className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                <MessageSquare className="h-3 w-3" /> Ask FleetMind
              </div>
              <div className="space-y-2 text-xs">
                <div className="rounded-md bg-background/60 px-2.5 py-1.5">
                  Which trucks have insurance expiring in the next 30 days?
                </div>
                <div className="rounded-md bg-primary/10 border border-primary/20 px-2.5 py-2 space-y-1">
                  <p>3 vehicles have insurance expiring before Jul 18:</p>
                  <ul className="ml-3 list-disc text-muted-foreground">
                    <li>Truck 14 — Progressive · expires Jul 02</li>
                    <li>Truck 27 — Progressive · expires Jul 09</li>
                    <li>Truck 41 — GreatWest · expires Jul 16</li>
                  </ul>
                  <div className="flex gap-1.5 pt-1">
                    <span className="rounded bg-primary/20 px-1.5 py-0.5 text-[10px] text-primary-glow">policy_T14.pdf</span>
                    <span className="rounded bg-primary/20 px-1.5 py-0.5 text-[10px] text-primary-glow">policy_T27.pdf</span>
                    <span className="rounded bg-primary/20 px-1.5 py-0.5 text-[10px] text-primary-glow">policy_T41.pdf</span>
                  </div>
                </div>
              </div>
            </div>

            {/* alerts */}
            <div className="rounded-lg border border-border bg-surface/60 p-3">
              <div className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                <AlertTriangle className="h-3 w-3" /> Expiring soon
              </div>
              <div className="space-y-2">
                {[
                  { c: "destructive", t: "Insurance · Truck 14", d: "14 days" },
                  { c: "warning", t: "Medical card · M. Gonzalez", d: "31 days" },
                  { c: "warning", t: "DOT inspection · T-08", d: "44 days" },
                  { c: "primary", t: "IFTA · Q2 filing", d: "62 days" },
                ].map((a) => (
                  <div key={a.t} className="flex items-center gap-2 text-[11px]">
                    <span className={`h-1.5 w-1.5 rounded-full ${
                      a.c === "destructive" ? "bg-destructive" : a.c === "warning" ? "bg-warning" : "bg-primary"
                    }`} />
                    <span className="flex-1 truncate">{a.t}</span>
                    <span className="text-muted-foreground">{a.d}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* mini chart row */}
          <div className="rounded-lg border border-border bg-surface/60 p-3">
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <TrendingUp className="h-3 w-3" /> Fuel spend · last 12 weeks
              </span>
              <span className="font-semibold">$184,210</span>
            </div>
            <div className="flex h-16 items-end gap-1">
              {[40, 55, 48, 62, 58, 70, 65, 78, 72, 85, 80, 92].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-sm bg-gradient-to-t from-primary/40 to-primary-glow/80"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
