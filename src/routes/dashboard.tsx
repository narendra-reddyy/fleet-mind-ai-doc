import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  FileText,
  LayoutDashboard,
  MessageSquare,
  Search,
  Send,
  Settings,
  Shield,
  Sparkles,
  Truck,
  Users,
  Wrench,
  Upload,
  Bell,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — FleetMind AI" },
      { name: "description", content: "FleetMind AI fleet operations dashboard." },
    ],
  }),
  errorComponent: DashboardFallback,
  notFoundComponent: DashboardFallback,
  component: DashboardPage,
});

function DashboardFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
      <div className="max-w-md text-center">
        <h1 className="font-display text-2xl font-semibold">Dashboard unavailable</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The demo dashboard could not load. Return to the website and try again.
        </p>
        <Button asChild variant="hero" className="mt-6">
          <Link to="/">Back to website</Link>
        </Button>
      </div>
    </div>
  );
}

type Section =
  | "dashboard"
  | "documents"
  | "vehicles"
  | "drivers"
  | "compliance"
  | "assistant"
  | "settings";

const navItems: { id: Section; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "vehicles", label: "Vehicles", icon: Truck },
  { id: "drivers", label: "Drivers", icon: Users },
  { id: "compliance", label: "Compliance", icon: Shield },
  { id: "assistant", label: "AI Assistant", icon: MessageSquare },
  { id: "settings", label: "Settings", icon: Settings },
];

function DashboardPage() {
  const [section, setSection] = useState<Section>("dashboard");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="grid min-h-screen grid-cols-[240px_1fr]">
        {/* Sidebar */}
        <aside className="border-r border-border bg-surface/40 p-4 flex flex-col">
          <Link to="/" className="mb-6 flex items-center gap-2 px-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
              <Truck className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display text-base font-semibold">FleetMind AI</span>
          </Link>

          <nav className="space-y-1 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = section === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setSection(item.id)}
                  className={`flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors ${
                    active
                      ? "bg-primary/15 text-foreground border border-primary/30"
                      : "text-muted-foreground hover:bg-surface/80 hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <Link
            to="/"
            className="flex items-center gap-2 rounded-md px-2.5 py-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to website
          </Link>
        </aside>

        {/* Main */}
        <div className="flex flex-col">
          {/* Topbar */}
          <header className="flex items-center justify-between border-b border-border bg-background/60 backdrop-blur px-6 py-3">
            <div className="flex items-center gap-3">
              <h1 className="font-display text-lg font-semibold capitalize">
                {section === "assistant" ? "AI Assistant" : section}
              </h1>
              <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-medium text-success">
                Live demo
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-2 rounded-md bg-surface/60 border border-border px-2.5 py-1.5 text-xs text-muted-foreground w-64">
                <Search className="h-3.5 w-3.5" />
                <span>Search documents, vehicles, drivers…</span>
              </div>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-destructive" />
              </Button>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-primary text-xs font-semibold text-primary-foreground">
                AT
              </div>
            </div>
          </header>

          <main className="flex-1 p-6 overflow-auto">
            {section === "dashboard" && <DashboardView />}
            {section === "documents" && <DocumentsView />}
            {section === "vehicles" && <VehiclesView />}
            {section === "drivers" && <DriversView />}
            {section === "compliance" && <ComplianceView />}
            {section === "assistant" && <AssistantView />}
            {section === "settings" && <SettingsView />}
          </main>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Dashboard ---------------- */

const metrics = [
  { label: "Total Vehicles", value: "247", delta: "+12 this quarter", icon: Truck, tone: "primary" },
  { label: "Active Drivers", value: "193", delta: "+5 this month", icon: Users, tone: "primary" },
  { label: "Expiring Documents", value: "14", delta: "Next 30 days", icon: AlertTriangle, tone: "warning" },
  { label: "Compliance Score", value: "96%", delta: "+1.2% vs last mo.", icon: CheckCircle2, tone: "success" },
  { label: "Open Maintenance", value: "8", delta: "3 high priority", icon: Wrench, tone: "warning" },
];

function DashboardView() {
  return (
    <div className="space-y-6">
      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {metrics.map((m) => {
          const Icon = m.icon;
          const toneClass =
            m.tone === "warning"
              ? "text-warning"
              : m.tone === "success"
              ? "text-success"
              : "text-primary-glow";
          return (
            <div key={m.label} className="rounded-xl border border-border bg-surface/50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  {m.label}
                </span>
                <Icon className={`h-4 w-4 ${toneClass}`} />
              </div>
              <div className="mt-2 font-display text-3xl font-semibold">{m.value}</div>
              <div className="mt-1 text-xs text-muted-foreground">{m.delta}</div>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Recent documents */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-surface/50 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-base font-semibold">Recent documents</h2>
            <Button variant="ghost" size="sm">View all</Button>
          </div>
          <DocumentsTable compact />
        </div>

        {/* Compliance alerts */}
        <div className="rounded-xl border border-border bg-surface/50 p-5">
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <h2 className="font-display text-base font-semibold">Compliance alerts</h2>
          </div>
          <ComplianceAlerts />
        </div>
      </div>

      {/* Fuel chart */}
      <div className="rounded-xl border border-border bg-surface/50 p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-base font-semibold">Fleet activity · last 12 weeks</h2>
          <span className="text-xs text-muted-foreground">Miles driven · 1.42M</span>
        </div>
        <div className="flex h-32 items-end gap-2">
          {[42, 58, 50, 65, 60, 72, 68, 80, 74, 88, 82, 94].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-md bg-gradient-to-t from-primary/40 to-primary-glow/80"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Documents ---------------- */

const documents = [
  {
    name: "Vehicle Registration TX-1024",
    type: "Registration",
    vehicle: "Truck #1024",
    status: "Active",
    uploaded: "2026-01-12",
    expires: "2026-12-31",
  },
  {
    name: "Insurance Certificate — Progressive Commercial",
    type: "Insurance",
    vehicle: "Fleet-wide",
    status: "Expiring Soon",
    uploaded: "2025-07-02",
    expires: "2026-07-02",
  },
  {
    name: "Driver CDL — Marcus Johnson",
    type: "Driver License",
    vehicle: "Driver",
    status: "Active",
    uploaded: "2025-09-21",
    expires: "2028-09-21",
  },
  {
    name: "DOT Inspection Report — Truck #0871",
    type: "DOT Inspection",
    vehicle: "Truck #0871",
    status: "Action Required",
    uploaded: "2026-05-18",
    expires: "2027-05-18",
  },
  {
    name: "Maintenance Invoice — Peterbilt #1132",
    type: "Maintenance",
    vehicle: "Truck #1132",
    status: "Active",
    uploaded: "2026-06-10",
    expires: "—",
  },
];

function statusPill(status: string) {
  const map: Record<string, string> = {
    Active: "bg-success/15 text-success border-success/30",
    "Expiring Soon": "bg-warning/15 text-warning border-warning/30",
    "Action Required": "bg-destructive/15 text-destructive border-destructive/30",
  };
  return (
    <span
      className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium ${
        map[status] || "bg-surface text-muted-foreground border-border"
      }`}
    >
      {status}
    </span>
  );
}

function DocumentsTable({ compact = false }: { compact?: boolean }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="bg-surface/80 text-xs text-muted-foreground">
          <tr>
            <th className="px-4 py-2.5 text-left font-medium">Document</th>
            {!compact && <th className="px-4 py-2.5 text-left font-medium">Type</th>}
            <th className="px-4 py-2.5 text-left font-medium">Status</th>
            <th className="px-4 py-2.5 text-left font-medium">Uploaded</th>
            <th className="px-4 py-2.5 text-left font-medium">Expires</th>
          </tr>
        </thead>
        <tbody>
          {documents.map((d) => (
            <tr key={d.name} className="border-t border-border hover:bg-surface/40">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary-glow shrink-0" />
                  <div>
                    <div className="font-medium">{d.name}</div>
                    {!compact && (
                      <div className="text-xs text-muted-foreground">{d.vehicle}</div>
                    )}
                  </div>
                </div>
              </td>
              {!compact && <td className="px-4 py-3 text-muted-foreground">{d.type}</td>}
              <td className="px-4 py-3">{statusPill(d.status)}</td>
              <td className="px-4 py-3 text-muted-foreground">{d.uploaded}</td>
              <td className="px-4 py-3 text-muted-foreground">{d.expires}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DocumentsView() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold">All documents</h2>
          <p className="text-sm text-muted-foreground">
            12,418 documents indexed · AI-searchable
          </p>
        </div>
        <Button variant="hero" size="sm">
          <Upload className="h-4 w-4" /> Upload documents
        </Button>
      </div>
      <DocumentsTable />
    </div>
  );
}

/* ---------------- Compliance ---------------- */

const alerts = [
  {
    severity: "high",
    title: "Insurance policy expiring",
    detail: "Progressive Commercial — fleet-wide certificate expires in 14 days.",
    due: "Jul 02, 2026",
  },
  {
    severity: "high",
    title: "Registration expiring",
    detail: "Truck #1402 (TX) registration expires in 21 days.",
    due: "Jul 09, 2026",
  },
  {
    severity: "medium",
    title: "Driver CDL renewal",
    detail: "Maria Gonzalez · CDL Class A expires in 31 days.",
    due: "Jul 19, 2026",
  },
  {
    severity: "medium",
    title: "DOT inspection due",
    detail: "Truck #0871 annual inspection due in 44 days.",
    due: "Aug 01, 2026",
  },
  {
    severity: "low",
    title: "Medical card renewal",
    detail: "3 drivers · DOT medical cards expire within 60 days.",
    due: "Aug 17, 2026",
  },
];

function ComplianceAlerts() {
  return (
    <div className="space-y-2.5">
      {alerts.slice(0, 4).map((a) => (
        <div
          key={a.title}
          className="rounded-lg border border-border bg-background/50 p-3"
        >
          <div className="flex items-start gap-2">
            <span
              className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                a.severity === "high"
                  ? "bg-destructive"
                  : a.severity === "medium"
                  ? "bg-warning"
                  : "bg-primary"
              }`}
            />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium">{a.title}</div>
              <div className="text-xs text-muted-foreground">{a.detail}</div>
              <div className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                Due {a.due}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ComplianceView() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-xl font-semibold">Compliance center</h2>
        <p className="text-sm text-muted-foreground">
          Current compliance score: <span className="text-success font-semibold">96%</span> · 14 items
          need attention
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {[
          { label: "Registrations expiring", value: 4, tone: "destructive" },
          { label: "Insurance policies expiring", value: 2, tone: "destructive" },
          { label: "Driver certifications", value: 8, tone: "warning" },
        ].map((c) => (
          <div key={c.label} className="rounded-xl border border-border bg-surface/50 p-5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              {c.label}
            </div>
            <div
              className={`mt-2 font-display text-4xl font-semibold ${
                c.tone === "destructive" ? "text-destructive" : "text-warning"
              }`}
            >
              {c.value}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">Action required within 30 days</div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-surface/50 p-5">
        <h3 className="font-display text-base font-semibold mb-3">All compliance alerts</h3>
        <div className="space-y-2.5">
          {alerts.map((a) => (
            <div
              key={a.title}
              className="flex items-center gap-3 rounded-lg border border-border bg-background/50 p-3"
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  a.severity === "high"
                    ? "bg-destructive"
                    : a.severity === "medium"
                    ? "bg-warning"
                    : "bg-primary"
                }`}
              />
              <div className="flex-1">
                <div className="text-sm font-medium">{a.title}</div>
                <div className="text-xs text-muted-foreground">{a.detail}</div>
              </div>
              <div className="text-xs text-muted-foreground">{a.due}</div>
              <Button variant="glass" size="sm">Resolve</Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Vehicles / Drivers ---------------- */

const vehicles = [
  { id: "TRK-1024", make: "Peterbilt 579", year: 2023, status: "Active", mileage: "184,210", driver: "Marcus Johnson" },
  { id: "TRK-1132", make: "Kenworth T680", year: 2022, status: "Active", mileage: "212,540", driver: "Elena Vasquez" },
  { id: "TRK-1402", make: "Freightliner Cascadia", year: 2024, status: "Maintenance", mileage: "92,118", driver: "—" },
  { id: "TRK-0871", make: "Volvo VNL 760", year: 2021, status: "Active", mileage: "298,402", driver: "David Park" },
  { id: "TRK-1488", make: "Peterbilt 389", year: 2024, status: "Active", mileage: "54,019", driver: "Maria Gonzalez" },
];

function VehiclesView() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold">Fleet vehicles</h2>
          <p className="text-sm text-muted-foreground">247 vehicles · 239 active · 8 in maintenance</p>
        </div>
        <Button variant="hero" size="sm"><Plus className="h-4 w-4" /> Add vehicle</Button>
      </div>
      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-surface/80 text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-2.5 text-left font-medium">Vehicle ID</th>
              <th className="px-4 py-2.5 text-left font-medium">Make/Model</th>
              <th className="px-4 py-2.5 text-left font-medium">Year</th>
              <th className="px-4 py-2.5 text-left font-medium">Status</th>
              <th className="px-4 py-2.5 text-left font-medium">Mileage</th>
              <th className="px-4 py-2.5 text-left font-medium">Assigned driver</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v) => (
              <tr key={v.id} className="border-t border-border hover:bg-surface/40">
                <td className="px-4 py-3 font-medium">{v.id}</td>
                <td className="px-4 py-3 text-muted-foreground">{v.make}</td>
                <td className="px-4 py-3 text-muted-foreground">{v.year}</td>
                <td className="px-4 py-3">{statusPill(v.status === "Maintenance" ? "Action Required" : "Active")}</td>
                <td className="px-4 py-3 text-muted-foreground">{v.mileage} mi</td>
                <td className="px-4 py-3 text-muted-foreground">{v.driver}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const drivers = [
  { name: "Marcus Johnson", cdl: "Class A", state: "TX", status: "Active", expires: "2028-09-21" },
  { name: "Elena Vasquez", cdl: "Class A", state: "AZ", status: "Active", expires: "2027-03-14" },
  { name: "Maria Gonzalez", cdl: "Class A", state: "TX", status: "Renewal Due", expires: "2026-07-19" },
  { name: "David Park", cdl: "Class B", state: "CA", status: "Active", expires: "2029-01-08" },
  { name: "Priya Ramachandran", cdl: "Class A", state: "TX", status: "Active", expires: "2028-11-02" },
];

function DriversView() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold">Drivers</h2>
          <p className="text-sm text-muted-foreground">193 active drivers</p>
        </div>
        <Button variant="hero" size="sm"><Plus className="h-4 w-4" /> Add driver</Button>
      </div>
      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-surface/80 text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-2.5 text-left font-medium">Driver</th>
              <th className="px-4 py-2.5 text-left font-medium">CDL Class</th>
              <th className="px-4 py-2.5 text-left font-medium">State</th>
              <th className="px-4 py-2.5 text-left font-medium">Status</th>
              <th className="px-4 py-2.5 text-left font-medium">CDL Expires</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map((d) => (
              <tr key={d.name} className="border-t border-border hover:bg-surface/40">
                <td className="px-4 py-3 font-medium">{d.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{d.cdl}</td>
                <td className="px-4 py-3 text-muted-foreground">{d.state}</td>
                <td className="px-4 py-3">{statusPill(d.status === "Renewal Due" ? "Expiring Soon" : "Active")}</td>
                <td className="px-4 py-3 text-muted-foreground">{d.expires}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------------- AI Assistant ---------------- */

const sampleQuestions = [
  "Which registrations expire this month?",
  "Show insurance policies expiring within 30 days.",
  "Which drivers need CDL renewal?",
  "Summarize compliance risks.",
  "What maintenance items are overdue?",
];

const sampleAnswers: Record<string, { text: string; sources: string[] }> = {
  "Which registrations expire this month?": {
    text:
      "4 vehicle registrations expire within the next 30 days:\n\n• Truck #1402 (Freightliner Cascadia · TX) — expires Jul 09, 2026\n• Truck #1024 (Peterbilt 579 · TX) — expires Jul 18, 2026\n• Truck #0922 (Kenworth T680 · OK) — expires Jul 24, 2026\n• Truck #1655 (Volvo VNL · TX) — expires Jul 29, 2026\n\nRecommend filing renewals this week to avoid 14-day suspension windows.",
    sources: ["Vehicle Registration TX-1402", "Vehicle Registration TX-1024", "Vehicle Registration OK-0922", "Vehicle Registration TX-1655"],
  },
  "Show insurance policies expiring within 30 days.": {
    text:
      "2 insurance policies expire within the next 30 days:\n\n• Progressive Commercial — fleet auto liability — expires Jul 02, 2026 ($1.2M coverage)\n• GreatWest Casualty — cargo policy — expires Jul 16, 2026 ($250k coverage)\n\nBoth brokers have been notified. Renewal quotes attached.",
    sources: ["Policy — Progressive Commercial", "Policy — GreatWest Casualty"],
  },
  "Which drivers need CDL renewal?": {
    text:
      "3 drivers have CDLs expiring within 60 days:\n\n• James O'Connor — CDL Class A (TX) expires Jul 12, 2026\n• Maria Alvarez — CDL Class A (TX) expires Jul 28, 2026\n• Robert Khan — CDL Class A (OK) expires Aug 09, 2026\n\nSend renewal reminders and block dispatch 7 days before expiration.",
    sources: ["Driver File — J. O'Connor", "Driver File — M. Alvarez", "Driver File — R. Khan"],
  },
  "Summarize compliance risks.": {
    text:
      "Top 3 compliance risks right now:\n\n1. Insurance — Progressive Commercial fleet certificate expires in 14 days. Lapse would ground all 247 vehicles.\n2. Registrations — 4 TX vehicles expiring in July; renewal lead time is 7–10 business days.\n3. Driver medical cards — 3 drivers expiring within 60 days, including 1 already past due.\n\nOverall compliance score: 96% (up 1.2% MoM).",
    sources: ["Compliance Summary Q2 2026", "Policy — Progressive Commercial"],
  },
  "What maintenance items are overdue?": {
    text:
      "8 vehicles have overdue maintenance items:\n\n• Truck #0871 — DOT inspection 12 days overdue (HIGH)\n• Truck #1132 — brake service 8 days overdue (HIGH)\n• Truck #1488 — oil change 4 days overdue\n• 5 additional units overdue on tire rotation\n\nTotal estimated cost based on prior invoices: $4,820.",
    sources: ["Maintenance Log — Truck #0871", "Maintenance Log — Truck #1132", "Invoice History Q1 2026"],
  },
};

const quickActions: { label: string; question: string }[] = [
  { label: "Compliance Summary", question: "Summarize compliance risks." },
  { label: "Expiring Documents", question: "Which registrations expire this month?" },
  { label: "Driver Certifications", question: "Which drivers need CDL renewal?" },
  { label: "Insurance Review", question: "Show insurance policies expiring within 30 days." },
  { label: "Maintenance Review", question: "What maintenance items are overdue?" },
];

type ChatMessage = { role: "user" | "assistant"; text: string; sources?: string[] };

function AssistantView() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      text:
        "Hi, I'm FleetMind. I've indexed 12,418 documents across your 247 vehicles and 193 drivers. Ask me anything — try one of the suggestions below.",
    },
  ]);
  const [input, setInput] = useState("");

  function send(q: string) {
    const question = q.trim();
    if (!question) return;
    const answer = sampleAnswers[question] ?? {
      text:
        "I searched your fleet records and didn't find a sourced answer for that exact question. Try one of the suggested prompts, or rephrase — for example, 'Which trucks have insurance expiring this quarter?'",
      sources: [],
    };
    setMessages((m) => [
      ...m,
      { role: "user", text: question },
      { role: "assistant", text: answer.text, sources: answer.sources },
    ]);
    setInput("");
  }

  return (
    <div className="grid lg:grid-cols-[1fr_280px] gap-4 h-[calc(100vh-9rem)]">
      <div className="flex flex-col rounded-xl border border-border bg-surface/50">
        <div className="flex items-center gap-2 border-b border-border px-5 py-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-primary">
            <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
          </div>
          <div>
            <div className="text-sm font-semibold">FleetMind Assistant</div>
            <div className="text-[10px] text-muted-foreground">Sourced answers from your fleet data</div>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-5 space-y-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-lg px-4 py-3 text-sm whitespace-pre-line ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-background/70 border border-border"
                }`}
              >
                {m.text}
                {m.sources && m.sources.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {m.sources.map((s) => (
                      <span
                        key={s}
                        className="rounded bg-primary/15 border border-primary/30 px-1.5 py-0.5 text-[10px] text-primary-glow"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-border px-3 pt-3 pb-2 flex flex-wrap gap-1.5">
          {quickActions.map((a) => (
            <button
              key={a.label}
              onClick={() => send(a.question)}
              className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[11px] text-primary-glow hover:bg-primary/20 transition-colors"
            >
              {a.label}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="border-t border-border p-3 flex items-center gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask FleetMind anything about your fleet…"
            className="flex-1 rounded-md border border-border bg-background/70 px-3 py-2 text-sm outline-none focus:border-primary/50"
          />
          <Button type="submit" variant="hero" size="sm">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>

      <div className="rounded-xl border border-border bg-surface/50 p-4">
        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
          Suggested questions
        </div>
        <div className="space-y-2">
          {sampleQuestions.map((q) => (
            <button
              key={q}
              onClick={() => send(q)}
              className="w-full text-left rounded-md border border-border bg-background/50 px-3 py-2 text-xs hover:border-primary/40 hover:bg-primary/5 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Settings ---------------- */

function SettingsView() {
  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <h2 className="font-display text-xl font-semibold">Workspace settings</h2>
        <p className="text-sm text-muted-foreground">Acme Trucking · Owner plan</p>
      </div>
      <div className="rounded-xl border border-border bg-surface/50 p-5 space-y-4">
        {[
          ["Company name", "Acme Trucking LLC"],
          ["DOT number", "USDOT 1284910"],
          ["Primary contact", "ops@acmetrucking.com"],
          ["Time zone", "America/Chicago"],
        ].map(([label, val]) => (
          <div key={label} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
            <div className="text-sm text-muted-foreground">{label}</div>
            <div className="text-sm font-medium">{val}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
