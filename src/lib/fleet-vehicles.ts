/**
 * Vehicle domain model + validation.
 *
 * Kept free of React so the same shapes/validators can back a real
 * `vehicles` table later (see plan §3) without touching the UI layer.
 */

export type VehicleType = "Tractor" | "Trailer" | "Box Truck" | "Van" | "Other";
export type VehicleStatus = "Active" | "In Maintenance" | "Out of Service";

export type Vehicle = {
  id: string; // internal id (uuid in the DB later)
  unitId: string; // Vehicle / Unit ID — unique
  vin: string; // 17 chars — unique
  make: string;
  model: string;
  year: number;
  plate?: string;
  plateState?: string;
  type: VehicleType;
  status: VehicleStatus;
  mileage?: number;
  driver?: string; // assigned driver name (driver_id later)
  notes?: string;
  createdAt: string; // yyyy-mm-dd
};

export const VEHICLE_TYPES: VehicleType[] = ["Tractor", "Trailer", "Box Truck", "Van", "Other"];
export const VEHICLE_STATUSES: VehicleStatus[] = ["Active", "In Maintenance", "Out of Service"];

export const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME",
  "MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA",
  "RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY",
];

export type VehicleDraft = {
  unitId: string;
  vin: string;
  make: string;
  model: string;
  year: string;
  plate: string;
  plateState: string;
  type: VehicleType;
  status: VehicleStatus;
  mileage: string;
  driver: string;
  notes: string;
};

export const emptyVehicleDraft: VehicleDraft = {
  unitId: "",
  vin: "",
  make: "",
  model: "",
  year: "",
  plate: "",
  plateState: "",
  type: "Tractor",
  status: "Active",
  mileage: "",
  driver: "",
  notes: "",
};

export type VehicleErrors = Partial<Record<keyof VehicleDraft, string>>;

const VIN_RE = /^[A-HJ-NPR-Z0-9]{17}$/; // no I, O, Q per VIN spec

export function validateVehicle(draft: VehicleDraft, existing: Vehicle[]): VehicleErrors {
  const e: VehicleErrors = {};
  const unit = draft.unitId.trim();
  const vin = draft.vin.trim().toUpperCase();

  if (!unit) e.unitId = "Vehicle / Unit ID is required.";
  else if (existing.some((v) => v.unitId.toLowerCase() === unit.toLowerCase()))
    e.unitId = "This Vehicle ID already exists.";

  if (!vin) e.vin = "VIN is required.";
  else if (vin.length !== 17) e.vin = "VIN must be exactly 17 characters.";
  else if (!VIN_RE.test(vin)) e.vin = "VIN may not contain I, O, or Q.";
  else if (existing.some((v) => v.vin.toUpperCase() === vin)) e.vin = "This VIN already exists.";

  if (!draft.make.trim()) e.make = "Make is required.";
  if (!draft.model.trim()) e.model = "Model is required.";

  const year = Number(draft.year);
  const maxYear = new Date().getFullYear() + 2;
  if (!draft.year.trim()) e.year = "Year is required.";
  else if (!Number.isInteger(year) || year < 1950 || year > maxYear)
    e.year = `Enter a year between 1950 and ${maxYear}.`;

  if (draft.mileage.trim()) {
    const m = Number(draft.mileage);
    if (!Number.isFinite(m) || m < 0) e.mileage = "Mileage must be 0 or greater.";
  }

  if (draft.plateState && !US_STATES.includes(draft.plateState)) e.plateState = "Invalid state.";

  return e;
}

export function isVehicleDraftValid(draft: VehicleDraft, existing: Vehicle[]) {
  return Object.keys(validateVehicle(draft, existing)).length === 0;
}

export function draftToVehicle(draft: VehicleDraft): Vehicle {
  return {
    id: `veh_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    unitId: draft.unitId.trim(),
    vin: draft.vin.trim().toUpperCase(),
    make: draft.make.trim(),
    model: draft.model.trim(),
    year: Number(draft.year),
    plate: draft.plate.trim() || undefined,
    plateState: draft.plateState || undefined,
    type: draft.type,
    status: draft.status,
    mileage: draft.mileage.trim() ? Number(draft.mileage) : undefined,
    driver: draft.driver && draft.driver !== "unassigned" ? draft.driver : undefined,
    notes: draft.notes.trim() || undefined,
    createdAt: new Date().toISOString().slice(0, 10),
  };
}

export function formatMileage(mileage?: number) {
  return mileage === undefined ? "—" : `${mileage.toLocaleString("en-US")} mi`;
}

/** Demo fleet — preserved exactly as previously shown in the Vehicles table. */
export const seedVehicles: Vehicle[] = [
  {
    id: "veh_1024", unitId: "TRK-1024", vin: "1XPBDP9X1MD778201", make: "Peterbilt", model: "579",
    year: 2023, plate: "TX-8842K", plateState: "TX", type: "Tractor", status: "Active",
    mileage: 184210, driver: "Marcus Johnson", createdAt: "2025-01-14",
  },
  {
    id: "veh_1132", unitId: "TRK-1132", vin: "1XKYDP9X2NJ441907", make: "Kenworth", model: "T680",
    year: 2022, plate: "TX-4419L", plateState: "TX", type: "Tractor", status: "Active",
    mileage: 212540, driver: "Elena Vasquez", createdAt: "2025-01-14",
  },
  {
    id: "veh_1402", unitId: "TRK-1402", vin: "3AKJHHDR8PSLB2114", make: "Freightliner", model: "Cascadia",
    year: 2024, plate: "TX-2114M", plateState: "TX", type: "Tractor", status: "In Maintenance",
    mileage: 92118, createdAt: "2025-03-02",
  },
  {
    id: "veh_0871", unitId: "TRK-0871", vin: "4V4NC9EH5MN287402", make: "Volvo", model: "VNL 760",
    year: 2021, plate: "AZ-8740R", plateState: "AZ", type: "Tractor", status: "Active",
    mileage: 298402, driver: "David Park", createdAt: "2024-11-08",
  },
  {
    id: "veh_1488", unitId: "TRK-1488", vin: "1XPXDP9X8RD554019", make: "Peterbilt", model: "389",
    year: 2024, plate: "TX-5401P", plateState: "TX", type: "Tractor", status: "Active",
    mileage: 54019, driver: "Maria Gonzalez", createdAt: "2025-06-21",
  },
];
