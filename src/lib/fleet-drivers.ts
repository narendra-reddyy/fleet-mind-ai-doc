/**
 * Driver domain model + validation.
 *
 * Drivers are referenced by stable `id` (uuid in the DB later) so vehicle
 * assignments survive renames and never duplicate driver records.
 */

export type DriverStatus = "Active" | "Renewal Due" | "Inactive" | "On Leave";
export type CdlClass = "Class A" | "Class B" | "Class C";

export type Driver = {
  id: string;
  name: string; // display name — derived from first + last
  firstName?: string;
  lastName?: string;
  employeeId?: string; // Driver ID / Employee ID — unique
  cdl: string; // CDL class
  cdlNumber?: string; // unique among active drivers
  state: string; // CDL state
  status: DriverStatus;
  expires: string; // CDL expiration (yyyy-mm-dd)
  phone?: string;
  email?: string;
  medicalExpires?: string;
  hireDate?: string;
  vehicleId?: string; // FK -> vehicles.id
  notes?: string;
  createdAt?: string;
};

export const DRIVER_STATUSES: DriverStatus[] = ["Active", "Inactive", "On Leave"];
export const CDL_CLASSES: CdlClass[] = ["Class A", "Class B", "Class C"];

/** Demo roster — unchanged records, now with stable IDs. */
export const drivers: Driver[] = [
  { id: "drv_marcus_johnson", name: "Marcus Johnson", firstName: "Marcus", lastName: "Johnson", employeeId: "EMP-1001", cdl: "Class A", cdlNumber: "TX-CDL-884210", state: "TX", status: "Active", expires: "2028-09-21", medicalExpires: "2027-02-11", hireDate: "2021-04-05" },
  { id: "drv_elena_vasquez", name: "Elena Vasquez", firstName: "Elena", lastName: "Vasquez", employeeId: "EMP-1002", cdl: "Class A", cdlNumber: "AZ-CDL-441907", state: "AZ", status: "Active", expires: "2027-03-14", medicalExpires: "2026-12-02", hireDate: "2022-01-17" },
  { id: "drv_maria_gonzalez", name: "Maria Gonzalez", firstName: "Maria", lastName: "Gonzalez", employeeId: "EMP-1003", cdl: "Class A", cdlNumber: "TX-CDL-554019", state: "TX", status: "Renewal Due", expires: "2026-07-19", medicalExpires: "2026-09-30", hireDate: "2020-08-24" },
  { id: "drv_david_park", name: "David Park", firstName: "David", lastName: "Park", employeeId: "EMP-1004", cdl: "Class B", cdlNumber: "CA-CDL-287402", state: "CA", status: "Active", expires: "2029-01-08", medicalExpires: "2028-03-19", hireDate: "2019-11-12" },
  { id: "drv_priya_ramachandran", name: "Priya Ramachandran", firstName: "Priya", lastName: "Ramachandran", employeeId: "EMP-1005", cdl: "Class A", cdlNumber: "TX-CDL-778201", state: "TX", status: "Active", expires: "2028-11-02", medicalExpires: "2027-06-08", hireDate: "2023-02-06" },
];

/** Drivers eligible for vehicle assignment (excludes inactive records). */
export const assignableDrivers = (roster: Driver[] = drivers) =>
  roster.filter((d) => d.status !== "Inactive");

export const driverById = (id?: string, roster: Driver[] = drivers) =>
  roster.find((d) => d.id === id);

export const driverIdByName = (name?: string, roster: Driver[] = drivers) =>
  name ? roster.find((d) => d.name.toLowerCase() === name.toLowerCase())?.id : undefined;

export const driverName = (id?: string, roster: Driver[] = drivers) =>
  driverById(id, roster)?.name;

/* ---------------- Draft + validation ---------------- */

export type DriverDraft = {
  firstName: string;
  lastName: string;
  employeeId: string;
  cdlNumber: string;
  cdl: CdlClass;
  state: string;
  expires: string;
  status: DriverStatus;
  phone: string;
  email: string;
  medicalExpires: string;
  hireDate: string;
  vehicleId: string; // vehicle id or "unassigned"
  notes: string;
};

export const emptyDriverDraft: DriverDraft = {
  firstName: "",
  lastName: "",
  employeeId: "",
  cdlNumber: "",
  cdl: "Class A",
  state: "",
  expires: "",
  status: "Active",
  phone: "",
  email: "",
  medicalExpires: "",
  hireDate: "",
  vehicleId: "unassigned",
  notes: "",
};

export type DriverErrors = Partial<Record<keyof DriverDraft, string>>;

const isValidDate = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
};

export function validateDriver(draft: DriverDraft, existing: Driver[]): DriverErrors {
  const e: DriverErrors = {};
  const emp = draft.employeeId.trim();
  const cdlNo = draft.cdlNumber.trim();

  if (!draft.firstName.trim()) e.firstName = "First name is required.";
  if (!draft.lastName.trim()) e.lastName = "Last name is required.";

  if (!emp) e.employeeId = "Driver / Employee ID is required.";
  else if (existing.some((d) => (d.employeeId ?? "").toLowerCase() === emp.toLowerCase()))
    e.employeeId = "This Driver ID already exists.";

  if (!cdlNo) e.cdlNumber = "CDL number is required.";
  else if (
    existing.some(
      (d) =>
        d.status !== "Inactive" &&
        (d.cdlNumber ?? "").toLowerCase() === cdlNo.toLowerCase(),
    )
  )
    e.cdlNumber = "An active driver already uses this CDL number.";

  if (!draft.state) e.state = "CDL state is required.";

  if (!draft.expires.trim()) e.expires = "CDL expiration date is required.";
  else if (!isValidDate(draft.expires)) e.expires = "Enter a valid date.";

  if (draft.medicalExpires.trim() && !isValidDate(draft.medicalExpires))
    e.medicalExpires = "Enter a valid date.";
  if (draft.hireDate.trim() && !isValidDate(draft.hireDate)) e.hireDate = "Enter a valid date.";

  if (draft.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(draft.email.trim()))
    e.email = "Enter a valid email address.";

  return e;
}

export function isDriverDraftValid(draft: DriverDraft, existing: Driver[]) {
  return Object.keys(validateDriver(draft, existing)).length === 0;
}

export function draftToDriver(draft: DriverDraft): Driver {
  const first = draft.firstName.trim();
  const last = draft.lastName.trim();
  return {
    id: `drv_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name: `${first} ${last}`.trim(),
    firstName: first,
    lastName: last,
    employeeId: draft.employeeId.trim(),
    cdl: draft.cdl,
    cdlNumber: draft.cdlNumber.trim(),
    state: draft.state,
    status: draft.status,
    expires: draft.expires,
    phone: draft.phone.trim() || undefined,
    email: draft.email.trim() || undefined,
    medicalExpires: draft.medicalExpires.trim() || undefined,
    hireDate: draft.hireDate.trim() || undefined,
    vehicleId: draft.vehicleId !== "unassigned" ? draft.vehicleId : undefined,
    notes: draft.notes.trim() || undefined,
    createdAt: new Date().toISOString().slice(0, 10),
  };
}
