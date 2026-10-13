import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CDL_CLASSES,
  DRIVER_STATUSES,
  draftToDriver,
  emptyDriverDraft,
  isDriverDraftValid,
  validateDriver,
  type CdlClass,
  type Driver,
  type DriverDraft,
  type DriverStatus,
} from "@/lib/fleet-drivers";
import { US_STATES, type Vehicle } from "@/lib/fleet-vehicles";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  drivers: Driver[];
  vehicles: Vehicle[];
  onSave: (driver: Driver) => void;
};

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1 text-[11px] text-destructive">{msg}</p>;
}

export function AddDriverDialog({ open, onOpenChange, drivers, vehicles, onSave }: Props) {
  const [draft, setDraft] = useState<DriverDraft>(emptyDriverDraft);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const errors = useMemo(() => validateDriver(draft, drivers), [draft, drivers]);
  const valid = isDriverDraftValid(draft, drivers);

  const set = <K extends keyof DriverDraft>(key: K, value: DriverDraft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));
  const blur = (key: keyof DriverDraft) => setTouched((t) => ({ ...t, [key]: true }));
  const err = (key: keyof DriverDraft) => (touched[key] ? errors[key] : undefined);

  function close() {
    onOpenChange(false);
    setDraft(emptyDriverDraft);
    setTouched({});
  }

  function save() {
    if (!valid) return;
    onSave(draftToDriver(draft));
    close();
  }

  const text = (key: keyof DriverDraft, id: string, label: string, placeholder: string, opts: { max?: number; type?: string; upper?: boolean } = {}) => (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={opts.type ?? "text"}
        placeholder={placeholder}
        value={draft[key] as string}
        onChange={(e) => set(key, (opts.upper ? e.target.value.toUpperCase() : e.target.value) as never)}
        onBlur={() => blur(key)}
        maxLength={opts.max ?? 80}
      />
      <FieldError msg={err(key)} />
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? onOpenChange(true) : close())}>
      <DialogContent className="max-w-2xl border-border bg-surface/95 backdrop-blur">
        <DialogHeader>
          <DialogTitle className="font-display">Add driver</DialogTitle>
          <DialogDescription>
            New drivers are immediately available for vehicle assignment, CDL compliance tracking and
            the FleetMind Assistant.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-auto pr-1">
          <div className="grid gap-4 sm:grid-cols-2">
            {text("firstName", "d-first", "First name *", "Jordan", { max: 50 })}
            {text("lastName", "d-last", "Last name *", "Reyes", { max: 50 })}
            {text("employeeId", "d-emp", "Driver ID / Employee ID *", "EMP-1006", { max: 32, upper: true })}
            {text("cdlNumber", "d-cdl", "CDL number *", "TX-CDL-120044", { max: 32, upper: true })}

            <div>
              <Label>CDL class *</Label>
              <Select value={draft.cdl} onValueChange={(v) => set("cdl", v as CdlClass)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CDL_CLASSES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>CDL state *</Label>
              <Select value={draft.state} onValueChange={(v) => { set("state", v); blur("state"); }}>
                <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                <SelectContent className="max-h-64">
                  {US_STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
              <FieldError msg={err("state")} />
            </div>

            {text("expires", "d-exp", "CDL expiration date *", "", { type: "date", max: 10 })}

            <div>
              <Label>Driver status *</Label>
              <Select value={draft.status} onValueChange={(v) => set("status", v as DriverStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DRIVER_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {text("phone", "d-phone", "Phone number", "(512) 555-0142", { max: 20, type: "tel" })}
            {text("email", "d-email", "Email", "jordan@northboundlogistics.com", { max: 255, type: "email" })}
            {text("medicalExpires", "d-med", "Medical card expiration", "", { type: "date", max: 10 })}
            {text("hireDate", "d-hire", "Hire date", "", { type: "date", max: 10 })}

            <div className="sm:col-span-2">
              <Label>Assigned vehicle</Label>
              <Select value={draft.vehicleId} onValueChange={(v) => set("vehicleId", v)}>
                <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
                <SelectContent className="max-h-64">
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {vehicles.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.unitId} — {v.make} {v.model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="d-notes">Notes</Label>
              <Textarea
                id="d-notes"
                rows={3}
                placeholder="Optional notes — endorsements, home terminal, restrictions…"
                value={draft.notes}
                onChange={(e) => set("notes", e.target.value.slice(0, 500))}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={close}>Cancel</Button>
          <Button variant="hero" onClick={save} disabled={!valid}>Save driver</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
