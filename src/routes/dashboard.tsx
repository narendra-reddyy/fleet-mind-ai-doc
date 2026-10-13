import { createFileRoute, Link } from "@tanstack/react-router";
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  FileText,
  LayoutDashboard,
  Loader2,
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
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AddVehicleDialog } from "@/components/dashboard/AddVehicleDialog";
import { VehicleDetail } from "@/components/dashboard/VehicleDetail";
import { formatMileage, seedVehicles, type Vehicle } from "@/lib/fleet-vehicles";
import { assignableDrivers, drivers as seedDrivers, type Driver } from "@/lib/fleet-drivers";
import { AddDriverDialog } from "@/components/dashboard/AddDriverDialog";
import { DriverDetail } from "@/components/dashboard/DriverDetail";


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

/* ---------------- Document data + AI simulation ---------------- */

type DocType =
  | "Registration"
  | "Insurance"
  | "CDL"
  | "DOT Inspection"
  | "Maintenance"
  | "Unknown";

type DocStatus = "Processing" | "Active" | "Expiring Soon" | "Action Required" | "Review Needed";

export type FleetDoc = {
  id: string;
  name: string;
  type: DocType;
  vehicle: string;
  driver?: string;
  status: DocStatus;
  uploaded: string; // YYYY-MM-DD
  expires?: string; // YYYY-MM-DD
  confidence: number; // 0..1
  metadata: Record<string, string>;
  source: "demo" | "upload";
};

const TODAY = new Date("2026-06-18");
const fmt = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (d: Date, n: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};
const daysUntil = (iso?: string) => {
  if (!iso) return Infinity;
  const d = new Date(iso);
  return Math.ceil((d.getTime() - TODAY.getTime()) / (1000 * 60 * 60 * 24));
};
const expiryStatus = (iso?: string): DocStatus => {
  const n = daysUntil(iso);
  if (n === Infinity) return "Active";
  if (n < 0) return "Action Required";
  if (n <= 30) return "Expiring Soon";
  return "Active";
};

const seedDocuments: FleetDoc[] = [
  {
    id: "doc_reg_1024",
    name: "Vehicle Registration TX-1024",
    type: "Registration",
    vehicle: "Truck #1024",
    status: expiryStatus("2026-12-31"),
    uploaded: "2026-01-12",
    expires: "2026-12-31",
    confidence: 0.98,
    metadata: { "Vehicle ID": "TRK-1024", State: "TX", Plate: "TX-7K42L9", "Expiration date": "2026-12-31" },
    source: "demo",
  },
  {
    id: "doc_reg_1402",
    name: "Vehicle Registration TX-1402",
    type: "Registration",
    vehicle: "Truck #1402",
    status: expiryStatus("2026-07-09"),
    uploaded: "2025-07-09",
    expires: "2026-07-09",
    confidence: 0.97,
    metadata: { "Vehicle ID": "TRK-1402", State: "TX", Plate: "TX-9R11C2", "Expiration date": "2026-07-09" },
    source: "demo",
  },
  {
    id: "doc_ins_prog",
    name: "Insurance Certificate — Progressive Commercial",
    type: "Insurance",
    vehicle: "Fleet-wide",
    status: expiryStatus("2026-07-02"),
    uploaded: "2025-07-02",
    expires: "2026-07-02",
    confidence: 0.99,
    metadata: {
      Carrier: "Progressive Commercial",
      "Policy number": "CA-99812345",
      Coverage: "$1,200,000",
      "Expiration date": "2026-07-02",
    },
    source: "demo",
  },
  {
    id: "doc_ins_gwc",
    name: "Insurance Certificate — GreatWest Casualty (Cargo)",
    type: "Insurance",
    vehicle: "Fleet-wide",
    status: expiryStatus("2026-07-16"),
    uploaded: "2025-07-16",
    expires: "2026-07-16",
    confidence: 0.96,
    metadata: {
      Carrier: "GreatWest Casualty",
      "Policy number": "GWC-44120-CG",
      Coverage: "$250,000",
      "Expiration date": "2026-07-16",
    },
    source: "demo",
  },
  {
    id: "doc_cdl_johnson",
    name: "Driver CDL — Marcus Johnson",
    type: "CDL",
    vehicle: "Driver",
    driver: "Marcus Johnson",
    status: expiryStatus("2028-09-21"),
    uploaded: "2025-09-21",
    expires: "2028-09-21",
    confidence: 0.98,
    metadata: {
      "Driver name": "Marcus Johnson",
      "CDL class": "Class A",
      State: "TX",
      "Expiration date": "2028-09-21",
    },
    source: "demo",
  },
  {
    id: "doc_cdl_gonzalez",
    name: "Driver CDL — Maria Gonzalez",
    type: "CDL",
    vehicle: "Driver",
    driver: "Maria Gonzalez",
    status: expiryStatus("2026-07-19"),
    uploaded: "2024-07-19",
    expires: "2026-07-19",
    confidence: 0.97,
    metadata: {
      "Driver name": "Maria Gonzalez",
      "CDL class": "Class A",
      State: "TX",
      "Expiration date": "2026-07-19",
    },
    source: "demo",
  },
  {
    id: "doc_dot_0871",
    name: "DOT Inspection Report — Truck #0871",
    type: "DOT Inspection",
    vehicle: "Truck #0871",
    status: "Action Required",
    uploaded: "2025-05-18",
    expires: "2026-05-18",
    confidence: 0.94,
    metadata: {
      "Vehicle ID": "TRK-0871",
      Result: "Pass with violations",
      Inspector: "TX DPS #4421",
      "Expiration date": "2026-05-18",
    },
    source: "demo",
  },
  {
    id: "doc_mnt_1132",
    name: "Maintenance Invoice — Peterbilt #1132",
    type: "Maintenance",
    vehicle: "Truck #1132",
    status: "Active",
    uploaded: "2026-06-10",
    confidence: 0.93,
    metadata: {
      Vendor: "Rush Truck Centers",
      "Vehicle ID": "TRK-1132",
      Service: "Brake replacement",
      Total: "$2,418.00",
    },
    source: "demo",
  },
];

/* ---------------- Context ---------------- */

type FleetContextValue = {
  documents: FleetDoc[];
  ingest: (files: File[]) => void;
  vehicles: Vehicle[];
  addVehicle: (vehicle: Vehicle) => void;
  drivers: Driver[];
  addDriver: (driver: Driver) => void;
};

const FleetContext = createContext<FleetContextValue | null>(null);
const useFleet = () => {
  const v = useContext(FleetContext);
  if (!v) throw new Error("FleetContext missing");
  return v;
};

function detectType(filename: string): DocType {
  const f = filename.toLowerCase();
  if (/(insur|policy|coi|certificate)/.test(f)) return "Insurance";
  if (/(reg|registration|plate)/.test(f)) return "Registration";
  if (/(cdl|license|driver)/.test(f)) return "CDL";
  if (/(dot|inspect)/.test(f)) return "DOT Inspection";
  if (/(maint|invoice|repair|service|oil|brake|tire)/.test(f)) return "Maintenance";
  return "Unknown";
}

function extractFor(type: DocType, filename: string): {
  metadata: Record<string, string>;
  expires?: string;
  vehicle: string;
  driver?: string;
  confidence: number;
  displayName: string;
} {
  const unitMatch = filename.match(/(\d{3,5})/);
  const unit = unitMatch ? unitMatch[1] : String(1000 + Math.floor(Math.random() * 900));
  const base = filename.replace(/\.[^.]+$/, "");
  const rand = (min: number, max: number) => Math.floor(min + Math.random() * (max - min));
  switch (type) {
    case "Insurance": {
      const exp = fmt(addDays(TODAY, rand(10, 200)));
      return {
        vehicle: "Fleet-wide",
        confidence: 0.96,
        displayName: `Insurance Certificate — ${base}`,
        expires: exp,
        metadata: {
          Carrier: "Progressive Commercial",
          "Policy number": `CA-${rand(10000000, 99999999)}`,
          Coverage: "$1,000,000",
          "Expiration date": exp,
        },
      };
    }
    case "Registration": {
      const exp = fmt(addDays(TODAY, rand(5, 300)));
      return {
        vehicle: `Truck #${unit}`,
        confidence: 0.97,
        displayName: `Vehicle Registration TX-${unit}`,
        expires: exp,
        metadata: {
          "Vehicle ID": `TRK-${unit}`,
          State: "TX",
          Plate: `TX-${rand(1000, 9999)}`,
          "Expiration date": exp,
        },
      };
    }
    case "CDL": {
      const exp = fmt(addDays(TODAY, rand(15, 700)));
      const driver = base.replace(/.*?(cdl|license|driver)[-_ ]?/i, "").replace(/[-_]+/g, " ").trim() || "New Driver";
      return {
        vehicle: "Driver",
        driver,
        confidence: 0.95,
        displayName: `Driver CDL — ${driver}`,
        expires: exp,
        metadata: {
          "Driver name": driver,
          "CDL class": "Class A",
          State: "TX",
          "Expiration date": exp,
        },
      };
    }
    case "DOT Inspection": {
      const exp = fmt(addDays(TODAY, rand(-10, 365)));
      return {
        vehicle: `Truck #${unit}`,
        confidence: 0.92,
        displayName: `DOT Inspection Report — Truck #${unit}`,
        expires: exp,
        metadata: {
          "Vehicle ID": `TRK-${unit}`,
          Result: "Pass",
          Inspector: `TX DPS #${rand(1000, 9999)}`,
          "Expiration date": exp,
        },
      };
    }
    case "Maintenance": {
      return {
        vehicle: `Truck #${unit}`,
        confidence: 0.9,
        displayName: `Maintenance Invoice — Truck #${unit}`,
        metadata: {
          Vendor: "Rush Truck Centers",
          "Vehicle ID": `TRK-${unit}`,
          Service: "Routine service",
          Total: `$${rand(200, 4000)}.00`,
        },
      };
    }
    default:
      return {
        vehicle: "Unassigned",
        confidence: 0.55,
        displayName: base,
        metadata: { Note: "Type could not be confidently detected — review needed." },
      };
  }
}

/* ---------------- Layout ---------------- */

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
  const [documents, setDocuments] = useState<FleetDoc[]>(seedDocuments);
  const [vehicles, setVehicles] = useState<Vehicle[]>(seedVehicles);
  const [drivers, setDrivers] = useState<Driver[]>(seedDrivers);

  // Demo persistence for user-added drivers; swap for a `drivers` table later.
  useEffect(() => {
    try {
      const raw = localStorage.getItem("fleetmind.drivers");
      const stored = raw ? (JSON.parse(raw) as Driver[]) : [];
      if (Array.isArray(stored) && stored.length) {
        const seedIds = new Set(seedDrivers.map((d) => d.id));
        setDrivers([...stored.filter((d) => !seedIds.has(d.id)), ...seedDrivers]);
      }
    } catch {
      /* ignore corrupt demo state */
    }
  }, []);

  function persistVehicles(next: Vehicle[]) {
    try {
      const seedIds = new Set(seedVehicles.map((sv) => sv.id));
      // Store all non-seed vehicles plus any seed vehicles whose assignment changed.
      const changed = next.filter((nv) => {
        if (!seedIds.has(nv.id)) return true;
        const orig = seedVehicles.find((sv) => sv.id === nv.id);
        return orig?.driverId !== nv.driverId;
      });
      localStorage.setItem("fleetmind.vehicles", JSON.stringify(changed));
    } catch {
      /* ignore */
    }
  }

  function addDriver(driver: Driver) {
    setDrivers((d) => {
      const next = [driver, ...d];
      try {
        const seedIds = new Set(seedDrivers.map((sd) => sd.id));
        localStorage.setItem("fleetmind.drivers", JSON.stringify(next.filter((nd) => !seedIds.has(nd.id))));
      } catch {
        /* ignore */
      }
      return next;
    });
    if (driver.vehicleId) {
      setVehicles((vs) => {
        const next = vs.map((v) =>
          v.id === driver.vehicleId ? { ...v, driverId: driver.id, driver: driver.name } : v,
        );
        persistVehicles(next);
        return next;
      });
    }
  }

  // Demo persistence so assignments survive a refresh; swap for a `vehicles`
  // table read when the backend lands.
  useEffect(() => {
    try {
      const raw = localStorage.getItem("fleetmind.vehicles");
      const stored = raw ? (JSON.parse(raw) as Vehicle[]) : [];
      if (Array.isArray(stored) && stored.length) {
        const seedIds = new Set(seedVehicles.map((v) => v.id));
        const overrides = new Map(stored.filter((v) => seedIds.has(v.id)).map((v) => [v.id, v]));
        setVehicles([
          ...stored.filter((v) => !seedIds.has(v.id)),
          ...seedVehicles.map((v) => overrides.get(v.id) ?? v),
        ]);
      }
    } catch {
      /* ignore corrupt demo state */
    }
  }, []);

  // Local-state store today; swap for a `vehicles` table insert when the backend lands.
  function addVehicle(vehicle: Vehicle) {
    setVehicles((v) => {
      const next = [vehicle, ...v];
      persistVehicles(next);
      return next;
    });
  }

  const [query, setQuery] = useState("");

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [] as { key: string; label: string; kind: string; section: Section }[];
    const hits: { key: string; label: string; kind: string; section: Section }[] = [];
    vehicles.forEach((v) => {
      if (
        v.unitId.toLowerCase().includes(q) ||
        v.vin.toLowerCase().includes(q) ||
        `${v.make} ${v.model}`.toLowerCase().includes(q) ||
        (v.driver ?? "").toLowerCase().includes(q)
      )
        hits.push({ key: v.id, label: `${v.unitId} — ${v.make} ${v.model}`, kind: "Vehicle", section: "vehicles" });
    });
    documents.forEach((d) => {
      if (d.name.toLowerCase().includes(q) || d.type.toLowerCase().includes(q))
        hits.push({ key: d.id, label: d.name, kind: "Document", section: "documents" });
    });
    drivers.forEach((d) => {
      if (d.name.toLowerCase().includes(q))
        hits.push({ key: d.name, label: d.name, kind: "Driver", section: "drivers" });
    });
    return hits.slice(0, 6);
  }, [query, vehicles, documents, drivers]);

  function ingest(files: File[]) {
    files.forEach((file) => {
      const id = `doc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const placeholder: FleetDoc = {
        id,
        name: file.name,
        type: "Unknown",
        vehicle: "—",
        status: "Processing",
        uploaded: fmt(TODAY),
        confidence: 0,
        metadata: {},
        source: "upload",
      };
      setDocuments((d) => [placeholder, ...d]);

      setTimeout(() => {
        const type = detectType(file.name);
        const ex = extractFor(type, file.name);
        const status: DocStatus =
          type === "Unknown"
            ? "Review Needed"
            : ex.expires
            ? expiryStatus(ex.expires)
            : "Active";
        setDocuments((d) =>
          d.map((doc) =>
            doc.id === id
              ? {
                  ...doc,
                  type,
                  name: ex.displayName,
                  vehicle: ex.vehicle,
                  driver: ex.driver,
                  expires: ex.expires,
                  confidence: ex.confidence,
                  metadata: ex.metadata,
                  status,
                }
              : doc,
          ),
        );
      }, 1400 + Math.random() * 800);
    });
  }

  return (
    <FleetContext.Provider value={{ documents, ingest, vehicles, addVehicle, drivers, addDriver }}>
      <div className="min-h-screen bg-background text-foreground">
        <div className="grid min-h-screen grid-cols-[240px_1fr]">
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

          <div className="flex flex-col">
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
                <div className="relative hidden md:block w-64">
                  <div className="flex items-center gap-2 rounded-md bg-surface/60 border border-border px-2.5 py-1.5 text-xs text-muted-foreground">
                    <Search className="h-3.5 w-3.5" />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search documents, vehicles, drivers…"
                      className="w-full bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground"
                    />
                  </div>
                  {query.trim().length > 0 && (
                    <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-md border border-border bg-surface/95 backdrop-blur shadow-lg">
                      {searchResults.length === 0 && (
                        <div className="px-3 py-2 text-xs text-muted-foreground">No matches.</div>
                      )}
                      {searchResults.map((r) => (
                        <button
                          key={r.key}
                          onClick={() => {
                            setSection(r.section);
                            setQuery("");
                          }}
                          className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-xs hover:bg-surface"
                        >
                          <span className="truncate">{r.label}</span>
                          <span className="shrink-0 text-[10px] text-muted-foreground">{r.kind}</span>
                        </button>
                      ))}
                    </div>
                  )}
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
              {section === "dashboard" && <DashboardView onJump={setSection} />}
              {section === "documents" && <DocumentsView />}
              {section === "vehicles" && <VehiclesView onGoToDocuments={() => setSection("documents")} />}
              {section === "drivers" && <DriversView onGoToDocuments={() => setSection("documents")} />}
              {section === "compliance" && <ComplianceView />}
              {section === "assistant" && <AssistantView />}
              {section === "settings" && <SettingsView />}
            </main>
          </div>
        </div>
      </div>
    </FleetContext.Provider>
  );
}

/* ---------------- Derived data ---------------- */

type Alert = {
  severity: "high" | "medium" | "low";
  title: string;
  detail: string;
  due: string;
  source: string;
};

function useAlerts(): Alert[] {
  const { documents } = useFleet();
  return useMemo(() => {
    const out: Alert[] = [];
    for (const d of documents) {
      if (d.status === "Processing") continue;
      if (d.type === "Unknown" || d.status === "Review Needed") {
        out.push({
          severity: "medium",
          title: "Document needs review",
          detail: `${d.name} — AI confidence ${(d.confidence * 100).toFixed(0)}%, missing required fields.`,
          due: d.uploaded,
          source: d.name,
        });
        continue;
      }
      if (!d.expires) continue;
      const n = daysUntil(d.expires);
      if (n < 0) {
        out.push({
          severity: "high",
          title: `${d.type} expired`,
          detail: `${d.name} expired ${Math.abs(n)} days ago.`,
          due: d.expires,
          source: d.name,
        });
      } else if (n <= 30) {
        out.push({
          severity: n <= 14 ? "high" : "medium",
          title: `${d.type} expiring`,
          detail: `${d.name} expires in ${n} days.`,
          due: d.expires,
          source: d.name,
        });
      } else if (n <= 60 && d.type === "CDL") {
        out.push({
          severity: "low",
          title: "CDL renewal upcoming",
          detail: `${d.name} expires in ${n} days.`,
          due: d.expires,
          source: d.name,
        });
      }
    }
    return out.sort((a, b) => (a.due < b.due ? -1 : 1));
  }, [documents]);
}

/* ---------------- Dashboard ---------------- */

function DashboardView({ onJump }: { onJump: (s: Section) => void }) {
  const { documents } = useFleet();
  const alerts = useAlerts();
  const expiringCount = documents.filter(
    (d) => d.expires && daysUntil(d.expires) >= 0 && daysUntil(d.expires) <= 30,
  ).length;

  const metrics = [
    { label: "Total Vehicles", value: "247", delta: "+12 this quarter", icon: Truck, tone: "primary" },
    { label: "Active Drivers", value: "193", delta: "+5 this month", icon: Users, tone: "primary" },
    {
      label: "Expiring Documents",
      value: String(expiringCount),
      delta: "Next 30 days",
      icon: AlertTriangle,
      tone: "warning",
    },
    { label: "Compliance Score", value: "96%", delta: "+1.2% vs last mo.", icon: CheckCircle2, tone: "success" },
    { label: "Open Maintenance", value: "8", delta: "3 high priority", icon: Wrench, tone: "warning" },
  ];

  return (
    <div className="space-y-6">
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
        <div className="lg:col-span-2 rounded-xl border border-border bg-surface/50 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-base font-semibold">Recent documents</h2>
            <Button variant="ghost" size="sm" onClick={() => onJump("documents")}>
              View all
            </Button>
          </div>
          <DocumentsTable compact />
        </div>

        <div className="rounded-xl border border-border bg-surface/50 p-5">
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <h2 className="font-display text-base font-semibold">Compliance alerts</h2>
          </div>
          <ComplianceAlerts alerts={alerts.slice(0, 4)} />
        </div>
      </div>

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

function statusPill(status: DocStatus | string) {
  const map: Record<string, string> = {
    Active: "bg-success/15 text-success border-success/30",
    "Expiring Soon": "bg-warning/15 text-warning border-warning/30",
    "Action Required": "bg-destructive/15 text-destructive border-destructive/30",
    Processing: "bg-primary/15 text-primary-glow border-primary/30",
    "Review Needed": "bg-warning/15 text-warning border-warning/30",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${
        map[status] || "bg-surface text-muted-foreground border-border"
      }`}
    >
      {status === "Processing" && <Loader2 className="h-2.5 w-2.5 animate-spin" />}
      {status}
    </span>
  );
}

function DocumentsTable({ compact = false }: { compact?: boolean }) {
  const { documents } = useFleet();
  const rows = compact ? documents.slice(0, 5) : documents;
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
          {rows.map((d) => (
            <tr key={d.id} className="border-t border-border hover:bg-surface/40 align-top">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary-glow shrink-0" />
                  <div>
                    <div className="font-medium">{d.name}</div>
                    {!compact && (
                      <div className="text-xs text-muted-foreground">
                        {d.vehicle}
                        {d.source === "upload" && d.status !== "Processing" && (
                          <span className="ml-2 text-primary-glow">
                            · AI extracted ({(d.confidence * 100).toFixed(0)}%)
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </td>
              {!compact && <td className="px-4 py-3 text-muted-foreground">{d.type}</td>}
              <td className="px-4 py-3">{statusPill(d.status)}</td>
              <td className="px-4 py-3 text-muted-foreground">{d.uploaded}</td>
              <td className="px-4 py-3 text-muted-foreground">{d.expires || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function UploadZone() {
  const { ingest } = useFleet();
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFiles(list: FileList | null) {
    if (!list || list.length === 0) return;
    const allowed = Array.from(list).filter((f) =>
      /\.(pdf|png|jpe?g)$/i.test(f.name),
    );
    if (allowed.length) ingest(allowed);
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        handleFiles(e.dataTransfer.files);
      }}
      className={`rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
        drag
          ? "border-primary/60 bg-primary/5"
          : "border-border bg-surface/40 hover:border-primary/40"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".pdf,.png,.jpg,.jpeg"
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          if (inputRef.current) inputRef.current.value = "";
        }}
      />
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
        <Upload className="h-5 w-5 text-primary-foreground" />
      </div>
      <div className="mt-3 font-display text-base font-semibold">
        Drag &amp; drop documents to upload
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        PDF, PNG, JPG · FleetMind AI will detect type, extract data, and file it automatically.
      </p>
      <Button variant="hero" size="sm" className="mt-4" onClick={() => inputRef.current?.click()}>
        <Upload className="h-4 w-4" /> Browse files
      </Button>
    </div>
  );
}

function DocumentsView() {
  const { documents } = useFleet();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = documents.find((d) => d.id === selectedId);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold">All documents</h2>
          <p className="text-sm text-muted-foreground">
            {documents.length} documents · AI-searchable
          </p>
        </div>
      </div>

      <UploadZone />

      <div className="grid lg:grid-cols-[1fr_320px] gap-4">
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-surface/80 text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5 text-left font-medium">Document</th>
                <th className="px-4 py-2.5 text-left font-medium">Type</th>
                <th className="px-4 py-2.5 text-left font-medium">Status</th>
                <th className="px-4 py-2.5 text-left font-medium">Expires</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((d) => (
                <tr
                  key={d.id}
                  onClick={() => setSelectedId(d.id)}
                  className={`border-t border-border cursor-pointer hover:bg-surface/40 ${
                    selectedId === d.id ? "bg-primary/5" : ""
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary-glow shrink-0" />
                      <div>
                        <div className="font-medium">{d.name}</div>
                        <div className="text-xs text-muted-foreground">{d.vehicle}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{d.type}</td>
                  <td className="px-4 py-3">{statusPill(d.status)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{d.expires || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-xl border border-border bg-surface/50 p-4 h-fit sticky top-0">
          {selected ? (
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">
                Extracted by FleetMind AI
              </div>
              <div className="mt-2 font-display text-base font-semibold">{selected.name}</div>
              <div className="mt-1 text-xs text-muted-foreground">
                {selected.type} · confidence {(selected.confidence * 100).toFixed(0)}%
              </div>
              <div className="mt-4 space-y-2">
                {Object.entries(selected.metadata).map(([k, v]) => (
                  <div
                    key={k}
                    className="flex items-center justify-between rounded-md bg-background/50 px-3 py-2 text-xs"
                  >
                    <span className="text-muted-foreground">{k}</span>
                    <span className="font-medium">{v}</span>
                  </div>
                ))}
                {selected.status === "Processing" && (
                  <div className="flex items-center gap-2 text-xs text-primary-glow">
                    <Loader2 className="h-3 w-3 animate-spin" /> Processing with AI…
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              Select a document to see AI-extracted metadata and source preview.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Compliance ---------------- */

function ComplianceAlerts({ alerts }: { alerts: Alert[] }) {
  if (alerts.length === 0) {
    return <div className="text-xs text-muted-foreground">No active alerts — all clear.</div>;
  }
  return (
    <div className="space-y-2.5">
      {alerts.map((a, i) => (
        <div key={i} className="rounded-lg border border-border bg-background/50 p-3">
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
                Due {a.due} · {a.source}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ComplianceView() {
  const alerts = useAlerts();
  const { documents } = useFleet();
  const counts = {
    reg: documents.filter(
      (d) => d.type === "Registration" && d.expires && daysUntil(d.expires) <= 30,
    ).length,
    ins: documents.filter(
      (d) => d.type === "Insurance" && d.expires && daysUntil(d.expires) <= 30,
    ).length,
    cdl: documents.filter(
      (d) => d.type === "CDL" && d.expires && daysUntil(d.expires) <= 60,
    ).length,
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-xl font-semibold">Compliance center</h2>
        <p className="text-sm text-muted-foreground">
          {alerts.length} items need attention · auto-generated from your documents
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {[
          { label: "Registrations expiring", value: counts.reg, tone: "destructive" },
          { label: "Insurance policies expiring", value: counts.ins, tone: "destructive" },
          { label: "Driver certifications", value: counts.cdl, tone: "warning" },
        ].map((c) => (
          <div key={c.label} className="rounded-xl border border-border bg-surface/50 p-5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{c.label}</div>
            <div
              className={`mt-2 font-display text-4xl font-semibold ${
                c.tone === "destructive" ? "text-destructive" : "text-warning"
              }`}
            >
              {c.value}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">Within 30–60 days</div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-surface/50 p-5">
        <h3 className="font-display text-base font-semibold mb-3">All compliance alerts</h3>
        <div className="space-y-2.5">
          {alerts.map((a, i) => (
            <div
              key={i}
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
              <Button variant="glass" size="sm">
                Resolve
              </Button>
            </div>
          ))}
          {alerts.length === 0 && (
            <div className="text-sm text-muted-foreground">No active alerts.</div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Vehicles / Drivers ---------------- */

function VehiclesView({ onGoToDocuments }: { onGoToDocuments: () => void }) {
  const { vehicles, addVehicle, documents, drivers } = useFleet();
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const selected = vehicles.find((v) => v.id === selectedId) ?? null;
  const docsFor = (v: Vehicle) =>
    documents.filter(
      (d) =>
        d.metadata["Vehicle ID"]?.toLowerCase() === v.unitId.toLowerCase() ||
        d.vehicle.replace(/[^0-9]/g, "") === v.unitId.replace(/[^0-9]/g, ""),
    );

  if (selected) {
    return (
      <VehicleDetail
        vehicle={selected}
        docs={docsFor(selected)}
        onBack={() => setSelectedId(null)}
        statusPill={statusPill}
        onGoToDocuments={onGoToDocuments}
      />
    );
  }

  const active = vehicles.filter((v) => v.status === "Active").length;
  const maint = vehicles.filter((v) => v.status === "In Maintenance").length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold">Fleet vehicles</h2>
          <p className="text-sm text-muted-foreground">
            {242 + vehicles.length} vehicles · {234 + active} active · {maint + 7} in maintenance
          </p>
        </div>
        <Button variant="hero" size="sm" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> Add vehicle
        </Button>
      </div>

      {toast && (
        <div className="flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 px-4 py-2.5 text-sm text-success">
          <CheckCircle2 className="h-4 w-4" />
          {toast}
        </div>
      )}

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
              <tr
                key={v.id}
                onClick={() => setSelectedId(v.id)}
                className="cursor-pointer border-t border-border hover:bg-surface/40"
              >
                <td className="px-4 py-3 font-medium">{v.unitId}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {v.make} {v.model}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{v.year}</td>
                <td className="px-4 py-3">
                  {statusPill(v.status === "Active" ? "Active" : "Action Required")}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{formatMileage(v.mileage)}</td>
                <td className="px-4 py-3 text-muted-foreground">{v.driver ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AddVehicleDialog
        open={open}
        onOpenChange={setOpen}
        vehicles={vehicles}
        drivers={assignableDrivers(drivers)}
        onSave={(vehicle) => {
          addVehicle(vehicle);
          setToast(`Vehicle ${vehicle.unitId} added successfully.`);
          setSelectedId(vehicle.id);
        }}
      />
    </div>
  );
}


function DriversView({ onGoToDocuments }: { onGoToDocuments: () => void }) {
  const { vehicles, drivers, addDriver, documents } = useFleet();
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const vehiclesByDriver = useMemo(() => {
    const map = new Map<string, Vehicle[]>();
    vehicles.forEach((v) => {
      if (!v.driverId) return;
      map.set(v.driverId, [...(map.get(v.driverId) ?? []), v]);
    });
    return map;
  }, [vehicles]);

  const selected = drivers.find((d) => d.id === selectedId) ?? null;
  if (selected) {
    const name = selected.name.toLowerCase();
    const docs = documents.filter(
      (d) =>
        (d.driver ?? "").toLowerCase() === name ||
        (d.metadata["Driver name"] ?? "").toLowerCase() === name,
    );
    return (
      <DriverDetail
        driver={selected}
        vehicles={vehiclesByDriver.get(selected.id) ?? []}
        docs={docs}
        today={TODAY}
        onBack={() => setSelectedId(null)}
        statusPill={statusPill}
        onGoToDocuments={onGoToDocuments}
      />
    );
  }

  const pill = (s: Driver["status"]) =>
    s === "Renewal Due"
      ? statusPill("Expiring Soon")
      : s === "Active"
      ? statusPill("Active")
      : (
          <span className="inline-flex items-center rounded-full border border-border bg-surface px-2 py-0.5 text-[11px] text-muted-foreground">
            {s}
          </span>
        );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold">Drivers</h2>
          <p className="text-sm text-muted-foreground">
            {188 + drivers.filter((d) => d.status !== "Inactive").length} active drivers
          </p>
        </div>
        <Button variant="hero" size="sm" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> Add driver
        </Button>
      </div>

      {toast && (
        <div className="flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 px-4 py-2.5 text-sm text-success">
          <CheckCircle2 className="h-4 w-4" />
          {toast}
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-surface/80 text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-2.5 text-left font-medium">Driver</th>
              <th className="px-4 py-2.5 text-left font-medium">CDL Class</th>
              <th className="px-4 py-2.5 text-left font-medium">State</th>
              <th className="px-4 py-2.5 text-left font-medium">Status</th>
              <th className="px-4 py-2.5 text-left font-medium">CDL Expires</th>
              <th className="px-4 py-2.5 text-left font-medium">Assigned vehicles</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map((d) => (
              <tr
                key={d.id}
                onClick={() => setSelectedId(d.id)}
                className="cursor-pointer border-t border-border hover:bg-surface/40"
              >
                <td className="px-4 py-3 font-medium">{d.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{d.cdl}</td>
                <td className="px-4 py-3 text-muted-foreground">{d.state}</td>
                <td className="px-4 py-3">{pill(d.status)}</td>
                <td className="px-4 py-3 text-muted-foreground">{d.expires}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {vehiclesByDriver.get(d.id)?.map((v) => v.unitId).join(", ") ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AddDriverDialog
        open={open}
        onOpenChange={setOpen}
        drivers={drivers}
        vehicles={vehicles}
        onSave={(driver) => {
          addDriver(driver);
          setToast(`Driver ${driver.name} added successfully.`);
        }}
      />
    </div>
  );
}

/* ---------------- AI Assistant ---------------- */

const sampleQuestions = [
  "Which documents expire this month?",
  "Which insurance policies need renewal?",
  "Which drivers have expiring CDL licenses?",
  "Show overdue maintenance records.",
  "Summarize compliance risks.",
];

const quickActions: { label: string; question: string }[] = [
  { label: "Compliance Summary", question: "Summarize compliance risks." },
  { label: "Expiring Documents", question: "Which documents expire this month?" },
  { label: "Driver Certifications", question: "Which drivers have expiring CDL licenses?" },
  { label: "Insurance Review", question: "Which insurance policies need renewal?" },
  { label: "Maintenance Review", question: "Show overdue maintenance records." },
];

type ChatMessage = { role: "user" | "assistant"; text: string; sources?: string[] };

function answerQuestion(
  question: string,
  documents: FleetDoc[],
  vehicles: Vehicle[],
): { text: string; sources: string[] } {
  const q = question.toLowerCase();

  const matchedVehicle = vehicles.find(
    (v) =>
      q.includes(v.unitId.toLowerCase()) ||
      q.includes(v.vin.toLowerCase()) ||
      (v.unitId.replace(/[^0-9]/g, "").length >= 3 &&
        q.includes(v.unitId.replace(/[^0-9]/g, ""))),
  );
  if (matchedVehicle) {
    const linked = documents.filter(
      (d) => d.metadata["Vehicle ID"]?.toLowerCase() === matchedVehicle.unitId.toLowerCase(),
    );
    return {
      text:
        `${matchedVehicle.unitId} — ${matchedVehicle.year} ${matchedVehicle.make} ${matchedVehicle.model} (${matchedVehicle.type})\n` +
        `• VIN ${matchedVehicle.vin}\n` +
        `• Status: ${matchedVehicle.status}\n` +
        `• Mileage: ${formatMileage(matchedVehicle.mileage)}\n` +
        `• Plate: ${matchedVehicle.plate ?? "—"}${matchedVehicle.plateState ? ` (${matchedVehicle.plateState})` : ""}\n` +
        `• Assigned driver: ${matchedVehicle.driver ?? "Unassigned"}\n` +
        `• Documents on file: ${linked.length || "none — upload registration, insurance or inspection documents"}`,
      sources: linked.map((d) => d.name),
    };
  }

  if (/(how many|list|show).*(vehicle|truck|fleet)|fleet roster/.test(q)) {
    return {
      text:
        `${vehicles.length} vehicles in the active demo roster:\n\n` +
        vehicles
          .map(
            (v) =>
              `• ${v.unitId} — ${v.year} ${v.make} ${v.model}, ${v.status}, ${formatMileage(v.mileage)}, driver ${v.driver ?? "unassigned"}`,
          )
          .join("\n"),
      sources: [],
    };
  }
  const withinDays = (type: DocType | DocType[], days: number) => {
    const types = Array.isArray(type) ? type : [type];
    return documents.filter(
      (d) =>
        types.includes(d.type) &&
        d.expires &&
        daysUntil(d.expires) >= 0 &&
        daysUntil(d.expires) <= days,
    );
  };

  if (/insurance/.test(q)) {
    const list = withinDays("Insurance", 60);
    if (!list.length)
      return { text: "No insurance policies expire within the next 60 days.", sources: [] };
    return {
      text:
        `${list.length} insurance polic${list.length === 1 ? "y" : "ies"} expiring within 60 days:\n\n` +
        list
          .map(
            (d) =>
              `• ${d.metadata["Carrier"] || d.name} — policy ${d.metadata["Policy number"] || "—"}, expires ${d.expires} (${daysUntil(d.expires)} days)`,
          )
          .join("\n"),
      sources: list.map((d) => d.name),
    };
  }

  if (/cdl|driver|license/.test(q)) {
    const list = withinDays("CDL", 60);
    if (!list.length)
      return { text: "No drivers have CDLs expiring within 60 days.", sources: [] };
    return {
      text:
        `${list.length} driver${list.length === 1 ? "" : "s"} with CDL expiring within 60 days:\n\n` +
        list
          .map(
            (d) =>
              `• ${d.metadata["Driver name"] || d.driver} — ${d.metadata["CDL class"] || "CDL"}, expires ${d.expires} (${daysUntil(d.expires)} days)`,
          )
          .join("\n"),
      sources: list.map((d) => d.name),
    };
  }

  if (/maintenance|overdue/.test(q)) {
    const overdueInspections = documents.filter(
      (d) => d.type === "DOT Inspection" && d.expires && daysUntil(d.expires) < 0,
    );
    const recent = documents.filter((d) => d.type === "Maintenance");
    const parts: string[] = [];
    if (overdueInspections.length) {
      parts.push(
        `Overdue DOT inspections:\n` +
          overdueInspections
            .map(
              (d) =>
                `• ${d.vehicle} — inspection ${Math.abs(daysUntil(d.expires))} days overdue (expired ${d.expires})`,
            )
            .join("\n"),
      );
    }
    if (recent.length) {
      parts.push(
        `Recent maintenance records:\n` +
          recent
            .map(
              (d) =>
                `• ${d.vehicle} — ${d.metadata["Service"] || "service"} · ${d.metadata["Total"] || ""}`,
            )
            .join("\n"),
      );
    }
    return {
      text: parts.join("\n\n") || "No maintenance records on file.",
      sources: [...overdueInspections, ...recent].map((d) => d.name),
    };
  }

  if (/expire|registration|month|30/.test(q)) {
    const list = documents.filter(
      (d) => d.expires && daysUntil(d.expires) >= 0 && daysUntil(d.expires) <= 30,
    );
    if (!list.length)
      return { text: "No documents expire within the next 30 days.", sources: [] };
    return {
      text:
        `${list.length} document${list.length === 1 ? "" : "s"} expiring within 30 days:\n\n` +
        list
          .map((d) => `• ${d.name} (${d.type}) — expires ${d.expires} (${daysUntil(d.expires)} days)`)
          .join("\n"),
      sources: list.map((d) => d.name),
    };
  }

  if (/compliance|risk|summar/.test(q)) {
    const expiring30 = documents.filter(
      (d) => d.expires && daysUntil(d.expires) >= 0 && daysUntil(d.expires) <= 30,
    );
    const expired = documents.filter((d) => d.expires && daysUntil(d.expires) < 0);
    const review = documents.filter((d) => d.status === "Review Needed");
    return {
      text:
        `Compliance snapshot:\n\n` +
        `• ${expired.length} expired document${expired.length === 1 ? "" : "s"}\n` +
        `• ${expiring30.length} expiring within 30 days\n` +
        `• ${review.length} needing review (low AI confidence or missing fields)\n\n` +
        `Top risks: ${
          [...expired, ...expiring30]
            .slice(0, 3)
            .map((d) => d.name)
            .join("; ") || "none"
        }.`,
      sources: [...expired, ...expiring30, ...review].slice(0, 5).map((d) => d.name),
    };
  }

  return {
    text:
      "I searched your fleet records but couldn't match that question. Try one of the suggested prompts on the right, or ask about insurance, registrations, CDLs, maintenance, or compliance.",
    sources: [],
  };
}

function AssistantView() {
  const { documents, vehicles } = useFleet();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      text:
        "Hi, I'm FleetMind. I've indexed your uploaded documents and demo records. Ask me anything — try a quick action below.",
    },
  ]);
  const [input, setInput] = useState("");

  function send(q: string) {
    const question = q.trim();
    if (!question) return;
    const answer = answerQuestion(question, documents, vehicles);
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
            <div className="text-[10px] text-muted-foreground">
              Sourced answers from {documents.length} indexed documents
            </div>
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
  // Compliance & Alerts
  const [alertThresholds, setAlertThresholds] = useState({ critical: 7, warning: 30, notice: 60 });
  const [alertToggles, setAlertToggles] = useState({
    registration: true,
    insurance: true,
    cdl: true,
    dotInspection: true,
  });

  // Notifications
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [notificationEmail, setNotificationEmail] = useState("ops@acmetrucking.com");

  // AI & Document Processing
  const [aiFeatures] = useState({
    autoClassification: true,
    metadataExtraction: true,
    expirationDetection: true,
    aiAssistantIndexing: true,
  });

  // Demo Data
  const [resetTick, setResetTick] = useState(0);
  const [resetLabel, setResetLabel] = useState("Reset demo data");

  function handleResetDemo() {
    setResetLabel("Resetting demo data...");
    setTimeout(() => {
      setResetTick((t) => t + 1);
      setResetLabel("Demo data reset");
      setTimeout(() => setResetLabel("Reset demo data"), 2000);
    }, 800);
  }

  return (
    <div className="max-w-3xl space-y-6">
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

      <section className="rounded-xl border border-border bg-surface/50 p-5">
        <div className="mb-4">
          <h3 className="font-display text-base font-semibold flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            Compliance & Alerts
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">Configure which documents trigger alerts and when.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
          {[
            { key: "critical", label: "Critical", sub: "Days before expiry" },
            { key: "warning", label: "Warning", sub: "Days before expiry" },
            { key: "notice", label: "Notice", sub: "Days before expiry" },
          ].map(({ key, label, sub }) => (
            <div key={key} className="space-y-1.5">
              <Label htmlFor={`threshold-${key}`} className="text-xs">
                {label}
              </Label>
              <Input
                id={`threshold-${key}`}
                type="number"
                min={0}
                max={365}
                value={alertThresholds[key as keyof typeof alertThresholds]}
                onChange={(e) =>
                  setAlertThresholds((t) => ({
                    ...t,
                    [key]: Math.max(0, Math.min(365, Number(e.target.value))),
                  }))
                }
                className="h-8 text-sm bg-transparent"
              />
              <p className="text-[10px] text-muted-foreground">{sub}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { key: "registration", label: "Registration" },
            { key: "insurance", label: "Insurance" },
            { key: "cdl", label: "CDL" },
            { key: "dotInspection", label: "DOT Inspection" },
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between rounded-lg border border-border bg-background/40 px-3 py-2.5">
              <span className="text-sm">{label}</span>
              <Switch
                id={`alert-${key}`}
                checked={alertToggles[key as keyof typeof alertToggles]}
                onCheckedChange={(checked) =>
                  setAlertToggles((t) => ({ ...t, [key]: checked }))
                }
              />
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-border bg-surface/50 p-5">
        <div className="mb-4">
          <h3 className="font-display text-base font-semibold flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            Notifications
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">Where compliance alerts should be sent.</p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-border bg-background/40 px-3 py-2.5">
            <div className="space-y-0.5">
              <span className="text-sm font-medium">Email alerts</span>
              <p className="text-xs text-muted-foreground">Receive compliance alerts by email.</p>
            </div>
            <Switch id="email-alerts" checked={emailAlerts} onCheckedChange={setEmailAlerts} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notification-email" className="text-xs">
              Notification email
            </Label>
            <Input
              id="notification-email"
              type="email"
              value={notificationEmail}
              onChange={(e) => setNotificationEmail(e.target.value)}
              disabled={!emailAlerts}
              className="h-8 text-sm bg-transparent disabled:opacity-50"
            />
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-surface/50 p-5">
        <div className="mb-4">
          <h3 className="font-display text-base font-semibold flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            AI & Document Processing
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">Capabilities currently enabled for this workspace.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { key: "autoClassification", label: "Automatic document classification" },
            { key: "metadataExtraction", label: "Metadata extraction" },
            { key: "expirationDetection", label: "Expiration date detection" },
            { key: "aiAssistantIndexing", label: "AI Assistant indexing" },
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between rounded-lg border border-border bg-background/40 px-3 py-2.5">
              <span className="text-sm">{label}</span>
              <div className="flex items-center gap-1.5 text-xs font-medium text-success">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Enabled
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-border bg-surface/50 p-5">
        <div className="mb-4">
          <h3 className="font-display text-base font-semibold flex items-center gap-2">
            <RotateCcw className="h-4 w-4 text-primary" />
            Demo Data
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">Reset demo documents, alerts and assistant data to the original sample set.</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleResetDemo} className="gap-2">
          <RotateCcw className="h-4 w-4" />
          {resetLabel}
        </Button>
      </section>
    </div>
  );
}

