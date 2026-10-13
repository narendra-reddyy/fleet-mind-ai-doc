import { useState } from "react";
import { AlertTriangle, ArrowLeft, CheckCircle2, FileText, Truck, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Driver } from "@/lib/fleet-drivers";
import { formatMileage, type Vehicle } from "@/lib/fleet-vehicles";
import type { LinkedDoc } from "./VehicleDetail";

type Props = {
  driver: Driver;
  vehicles: Vehicle[]; // vehicles assigned to this driver
  docs: LinkedDoc[];
  today: Date;
  onBack: () => void;
  statusPill: (status: string) => React.ReactNode;
  onGoToDocuments: () => void;
};

const TABS = ["Overview", "Documents", "Vehicles / Assignment", "Compliance"] as const;
type Tab = (typeof TABS)[number];

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-2.5 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value ?? "—"}</span>
    </div>
  );
}

function Empty({ icon: Icon, title, hint, action }: { icon: typeof FileText; title: string; hint?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-surface/30 px-6 py-12 text-center">
      <Icon className="h-6 w-6 text-muted-foreground" />
      <div className="text-sm font-medium">{title}</div>
      {hint && <p className="max-w-sm text-xs text-muted-foreground">{hint}</p>}
      {action}
    </div>
  );
}

export function DriverDetail({ driver, vehicles, docs, today, onBack, statusPill, onGoToDocuments }: Props) {
  const [tab, setTab] = useState<Tab>("Overview");
  const days = (date?: string) =>
    date ? Math.ceil((new Date(date).getTime() - today.getTime()) / 86_400_000) : undefined;

  const checks = [
    { label: "CDL expiration", date: driver.expires },
    { label: "Medical card expiration", date: driver.medicalExpires },
  ].map((c) => {
    const d = days(c.date);
    const state = d === undefined ? "Missing" : d < 0 ? "Expired" : d <= 60 ? "Expiring Soon" : "Active";
    return { ...c, d, state };
  });
  const alerts = checks.filter((c) => c.state !== "Active");

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <button onClick={onBack} className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" /> Drivers
          </button>
          <h2 className="font-display text-xl font-semibold">{driver.name}</h2>
          <p className="text-sm text-muted-foreground">
            {driver.employeeId ?? "—"} · {driver.cdl} · {driver.state}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {statusPill(driver.status === "Active" ? "Active" : driver.status === "Renewal Due" ? "Expiring Soon" : "Action Required")}
          <Button variant="hero" size="sm" onClick={onGoToDocuments}>
            <Upload className="h-4 w-4" /> Upload document
          </Button>
        </div>
      </div>

      <div className="flex gap-1 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`-mb-px border-b-2 px-3 py-2 text-sm transition-colors ${
              tab === t ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Overview" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-border bg-surface/50 p-5">
            <div className="mb-2 text-sm font-semibold">Driver profile</div>
            <Row label="Full name" value={driver.name} />
            <Row label="Driver / Employee ID" value={driver.employeeId ?? "—"} />
            <Row label="Status" value={driver.status} />
            <Row label="Phone" value={driver.phone ?? "—"} />
            <Row label="Email" value={driver.email ?? "—"} />
            <Row label="Hire date" value={driver.hireDate ?? "—"} />
          </div>
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-surface/50 p-5">
              <div className="mb-2 text-sm font-semibold">CDL & medical</div>
              <Row label="CDL number" value={<span className="font-mono text-xs">{driver.cdlNumber ?? "—"}</span>} />
              <Row label="CDL class" value={driver.cdl} />
              <Row label="CDL state" value={driver.state} />
              <Row label="CDL expiration" value={driver.expires} />
              <Row label="Medical card expiration" value={driver.medicalExpires ?? "—"} />
              <Row label="Assigned vehicle" value={vehicles.map((v) => v.unitId).join(", ") || "Unassigned"} />
            </div>
            <div className="rounded-xl border border-border bg-surface/50 p-5">
              <div className="mb-2 text-sm font-semibold">Notes</div>
              <p className="text-sm text-muted-foreground">{driver.notes || "No notes for this driver."}</p>
            </div>
          </div>
        </div>
      )}

      {tab === "Documents" &&
        (docs.length ? (
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-surface/80 text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-2.5 text-left font-medium">Document</th>
                  <th className="px-4 py-2.5 text-left font-medium">Type</th>
                  <th className="px-4 py-2.5 text-left font-medium">Status</th>
                  <th className="px-4 py-2.5 text-left font-medium">Uploaded</th>
                  <th className="px-4 py-2.5 text-left font-medium">Expires</th>
                </tr>
              </thead>
              <tbody>
                {docs.map((d) => (
                  <tr key={d.id} className="border-t border-border hover:bg-surface/40">
                    <td className="px-4 py-3 font-medium">{d.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{d.type}</td>
                    <td className="px-4 py-3">{statusPill(d.status)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{d.uploaded}</td>
                    <td className="px-4 py-3 text-muted-foreground">{d.expires ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty
            icon={FileText}
            title="No driver documents yet"
            hint="Upload CDL, medical card, MVR or other driver-related documents."
            action={
              <Button variant="glass" size="sm" className="mt-2" onClick={onGoToDocuments}>
                <Upload className="h-4 w-4" /> Upload document
              </Button>
            }
          />
        ))}

      {tab === "Vehicles / Assignment" &&
        (vehicles.length ? (
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-surface/80 text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-2.5 text-left font-medium">Vehicle ID</th>
                  <th className="px-4 py-2.5 text-left font-medium">Make/Model</th>
                  <th className="px-4 py-2.5 text-left font-medium">Year</th>
                  <th className="px-4 py-2.5 text-left font-medium">Status</th>
                  <th className="px-4 py-2.5 text-left font-medium">Mileage</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((v) => (
                  <tr key={v.id} className="border-t border-border">
                    <td className="px-4 py-3 font-medium">{v.unitId}</td>
                    <td className="px-4 py-3 text-muted-foreground">{v.make} {v.model}</td>
                    <td className="px-4 py-3 text-muted-foreground">{v.year}</td>
                    <td className="px-4 py-3 text-muted-foreground">{v.status}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatMileage(v.mileage)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty icon={Truck} title="No vehicle assigned" hint="Assign this driver from a vehicle record or when adding a driver." />
        ))}

      {tab === "Compliance" && (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {checks.map((c) => (
              <div key={c.label} className="rounded-xl border border-border bg-surface/50 p-4">
                <div className="text-xs text-muted-foreground">{c.label}</div>
                <div className="mt-1 flex items-center justify-between">
                  <span className="font-display text-lg font-semibold">{c.date ?? "Not on file"}</span>
                  {statusPill(c.state === "Missing" ? "Review Needed" : c.state)}
                </div>
                {c.d !== undefined && (
                  <div className="mt-1 text-xs text-muted-foreground">
                    {c.d < 0 ? `Expired ${-c.d} days ago` : `${c.d} days remaining`}
                  </div>
                )}
              </div>
            ))}
          </div>
          {alerts.length ? (
            <div className="space-y-2">
              {alerts.map((a) => (
                <div key={a.label} className="flex items-center gap-2 rounded-lg border border-warning/30 bg-warning/10 px-4 py-2.5 text-sm text-warning">
                  <AlertTriangle className="h-4 w-4" />
                  {a.state === "Missing"
                    ? `${a.label} is missing — upload a medical certificate.`
                    : `${a.label} ${a.state === "Expired" ? "has expired" : `in ${a.d} days`} (${a.date}).`}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 px-4 py-2.5 text-sm text-success">
              <CheckCircle2 className="h-4 w-4" /> No driver compliance alerts.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
