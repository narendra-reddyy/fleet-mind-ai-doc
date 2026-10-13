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
  US_STATES,
  VEHICLE_STATUSES,
  VEHICLE_TYPES,
  draftToVehicle,
  emptyVehicleDraft,
  isVehicleDraftValid,
  validateVehicle,
  type Vehicle,
  type VehicleDraft,
  type VehicleStatus,
  type VehicleType,
} from "@/lib/fleet-vehicles";
import type { Driver } from "@/lib/fleet-drivers";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicles: Vehicle[];
  drivers: Driver[];
  onSave: (vehicle: Vehicle) => void;
};

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1 text-[11px] text-destructive">{msg}</p>;
}

export function AddVehicleDialog({ open, onOpenChange, vehicles, drivers, onSave }: Props) {
  const [draft, setDraft] = useState<VehicleDraft>(emptyVehicleDraft);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const errors = useMemo(() => validateVehicle(draft, vehicles), [draft, vehicles]);
  const valid = isVehicleDraftValid(draft, vehicles);

  const set = <K extends keyof VehicleDraft>(key: K, value: VehicleDraft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));
  const blur = (key: keyof VehicleDraft) => setTouched((t) => ({ ...t, [key]: true }));
  const err = (key: keyof VehicleDraft) => (touched[key] ? errors[key] : undefined);

  function close() {
    onOpenChange(false);
    setDraft(emptyVehicleDraft);
    setTouched({});
  }

  function save() {
    if (!valid) {
      setTouched({ unitId: true, vin: true, make: true, model: true, year: true, mileage: true });
      return;
    }
    onSave(draftToVehicle(draft, drivers));
    close();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? onOpenChange(true) : close())}>
      <DialogContent className="max-w-2xl border-border bg-surface/95 backdrop-blur">
        <DialogHeader>
          <DialogTitle className="font-display">Add vehicle</DialogTitle>
          <DialogDescription>
            New vehicles are immediately available for document linking, compliance tracking and the
            FleetMind Assistant.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-auto pr-1">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="v-unit">Vehicle / Unit ID *</Label>
              <Input
                id="v-unit"
                placeholder="TRK-1520"
                value={draft.unitId}
                onChange={(e) => set("unitId", e.target.value)}
                onBlur={() => blur("unitId")}
                maxLength={32}
              />
              <FieldError msg={err("unitId")} />
            </div>

            <div>
              <Label htmlFor="v-vin">VIN * (17 characters)</Label>
              <Input
                id="v-vin"
                placeholder="1XPBDP9X1MD778201"
                value={draft.vin}
                onChange={(e) => set("vin", e.target.value.toUpperCase())}
                onBlur={() => blur("vin")}
                maxLength={17}
                className="font-mono"
              />
              <FieldError msg={err("vin")} />
            </div>

            <div>
              <Label htmlFor="v-make">Make *</Label>
              <Input
                id="v-make"
                placeholder="Freightliner"
                value={draft.make}
                onChange={(e) => set("make", e.target.value)}
                onBlur={() => blur("make")}
                maxLength={60}
              />
              <FieldError msg={err("make")} />
            </div>

            <div>
              <Label htmlFor="v-model">Model *</Label>
              <Input
                id="v-model"
                placeholder="Cascadia"
                value={draft.model}
                onChange={(e) => set("model", e.target.value)}
                onBlur={() => blur("model")}
                maxLength={60}
              />
              <FieldError msg={err("model")} />
            </div>

            <div>
              <Label htmlFor="v-year">Year *</Label>
              <Input
                id="v-year"
                inputMode="numeric"
                placeholder="2026"
                value={draft.year}
                onChange={(e) => set("year", e.target.value.replace(/[^0-9]/g, "").slice(0, 4))}
                onBlur={() => blur("year")}
              />
              <FieldError msg={err("year")} />
            </div>

            <div>
              <Label htmlFor="v-mileage">Current mileage</Label>
              <Input
                id="v-mileage"
                inputMode="numeric"
                placeholder="52000"
                value={draft.mileage}
                onChange={(e) => set("mileage", e.target.value.replace(/[^0-9]/g, "").slice(0, 8))}
                onBlur={() => blur("mileage")}
              />
              <FieldError msg={err("mileage")} />
            </div>

            <div>
              <Label htmlFor="v-plate">License plate</Label>
              <Input
                id="v-plate"
                placeholder="TX-5401P"
                value={draft.plate}
                onChange={(e) => set("plate", e.target.value.toUpperCase())}
                maxLength={16}
              />
            </div>

            <div>
              <Label>Plate state</Label>
              <Select value={draft.plateState} onValueChange={(v) => set("plateState", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  {US_STATES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError msg={err("plateState")} />
            </div>

            <div>
              <Label>Vehicle type</Label>
              <Select
                value={draft.type}
                onValueChange={(v) => set("type", v as VehicleType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VEHICLE_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Status</Label>
              <Select
                value={draft.status}
                onValueChange={(v) => set("status", v as VehicleStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VEHICLE_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="sm:col-span-2">
              <Label>Assigned driver</Label>
              <Select value={draft.driverId} onValueChange={(v) => set("driverId", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {drivers.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="v-notes">Notes</Label>
              <Textarea
                id="v-notes"
                rows={3}
                placeholder="Optional notes — spec, lease, telematics unit…"
                value={draft.notes}
                onChange={(e) => set("notes", e.target.value.slice(0, 500))}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={close}>
            Cancel
          </Button>
          <Button variant="hero" onClick={save} disabled={!valid}>
            Save vehicle
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
