import { useState } from "react";
import { ArrowLeft, FileText, Shield, Upload, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatMileage, type Vehicle } from "@/lib/fleet-vehicles";

export type LinkedDoc = {
  id: string;
  name: string;
  type: string;
  status: string;
  uploaded: string;
  expires?: string;
};

type Props = {
  vehicle: Vehicle;
  docs: LinkedDoc[];
  onBack: () => void;
  statusPill: (status: string) => React.ReactNode;
  onGoToDocuments: () => void;
};

const TABS = ["Overview", "Documents", "Maintenance", "Compliance"] as const;
type Tab = (typeof TABS)[number];

function EmptyState({
  icon: Icon,
  title,
  hint,
  action,
}: {
  icon: typeof FileText;
  title: string;
  hint?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-surface/30 px-6 py-12 text-center">
      <Icon className="h-6 w-6 text-muted-foreground" />
      <div className="text-sm font-medium">{title}</div>
      {hint && <p className="max-w-sm text-xs text-muted-foreground">{hint}</p>}
      {action}
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-2.5 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value ?? "—"}</span>
    </div>
  );
}

function DocTable({ docs, statusPill }: { docs: LinkedDoc[]; statusPill: Props["statusPill"] }) {
  return (
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
  );
}

export function VehicleDetail({ vehicle, docs, onBack, statusPill, onGoToDocuments }: Props) {
  const [tab, setTab] = useState<Tab>("Overview");

  const maintenanceDocs = docs.filter((d) => d.type === "Maintenance");
  const complianceDocs = docs.filter((d) =>
    ["Registration", "Insurance", "DOT Inspection"].includes(d.type),
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <button
            onClick={onBack}
            className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Vehicles
          </button>
          <h2 className="font-display text-xl font-semibold">{vehicle.unitId}</h2>
          <p className="text-sm text-muted-foreground">
            {vehicle.year} {vehicle.make} {vehicle.model} · {vehicle.type}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {statusPill(vehicle.status === "Active" ? "Active" : "Action Required")}
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
              tab === t
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Overview" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-border bg-surface/50 p-5">
            <div className="mb-2 text-sm font-semibold">Vehicle details</div>
            <Row label="Vehicle / Unit ID" value={vehicle.unitId} />
            <Row label="VIN" value={<span className="font-mono text-xs">{vehicle.vin}</span>} />
            <Row label="Make / Model" value={`${vehicle.make} ${vehicle.model}`} />
            <Row label="Year" value={vehicle.year} />
            <Row label="Vehicle type" value={vehicle.type} />
            <Row label="Status" value={vehicle.status} />
            <Row label="Current mileage" value={formatMileage(vehicle.mileage)} />
          </div>
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-surface/50 p-5">
              <div className="mb-2 text-sm font-semibold">Registration & assignment</div>
              <Row label="License plate" value={vehicle.plate ?? "—"} />
              <Row label="Plate state" value={vehicle.plateState ?? "—"} />
              <Row label="Assigned driver" value={vehicle.driver ?? "Unassigned"} />
              <Row label="Added" value={vehicle.createdAt} />
            </div>
            <div className="rounded-xl border border-border bg-surface/50 p-5">
              <div className="mb-2 text-sm font-semibold">Notes</div>
              <p className="text-sm text-muted-foreground">
                {vehicle.notes || "No notes for this vehicle."}
              </p>
            </div>
          </div>
        </div>
      )}

      {tab === "Documents" &&
        (docs.length ? (
          <DocTable docs={docs} statusPill={statusPill} />
        ) : (
          <EmptyState
            icon={FileText}
            title="No documents yet"
            hint="Upload registration, insurance, inspection, or other vehicle documents."
            action={
              <Button variant="glass" size="sm" className="mt-2" onClick={onGoToDocuments}>
                <Upload className="h-4 w-4" /> Upload document
              </Button>
            }
          />
        ))}

      {tab === "Maintenance" &&
        (maintenanceDocs.length ? (
          <DocTable docs={maintenanceDocs} statusPill={statusPill} />
        ) : (
          <EmptyState
            icon={Wrench}
            title="No maintenance history"
            hint="Maintenance invoices and service records for this vehicle will appear here."
          />
        ))}

      {tab === "Compliance" &&
        (complianceDocs.length ? (
          <DocTable docs={complianceDocs} statusPill={statusPill} />
        ) : (
          <EmptyState
            icon={Shield}
            title="No compliance documents uploaded yet"
            hint="Registration, insurance and DOT inspection documents drive compliance alerts."
          />
        ))}
    </div>
  );
}
