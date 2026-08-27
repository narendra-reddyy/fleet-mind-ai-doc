/**
 * Driver domain model.
 *
 * Drivers are referenced by stable `id` (uuid in the DB later) so vehicle
 * assignments survive renames and never duplicate driver records.
 */

export type DriverStatus = "Active" | "Renewal Due" | "Inactive";

export type Driver = {
  id: string;
  name: string;
  cdl: string;
  state: string;
  status: DriverStatus;
  expires: string;
};

/** Demo roster — unchanged records, now with stable IDs. */
export const drivers: Driver[] = [
  { id: "drv_marcus_johnson", name: "Marcus Johnson", cdl: "Class A", state: "TX", status: "Active", expires: "2028-09-21" },
  { id: "drv_elena_vasquez", name: "Elena Vasquez", cdl: "Class A", state: "AZ", status: "Active", expires: "2027-03-14" },
  { id: "drv_maria_gonzalez", name: "Maria Gonzalez", cdl: "Class A", state: "TX", status: "Renewal Due", expires: "2026-07-19" },
  { id: "drv_david_park", name: "David Park", cdl: "Class B", state: "CA", status: "Active", expires: "2029-01-08" },
  { id: "drv_priya_ramachandran", name: "Priya Ramachandran", cdl: "Class A", state: "TX", status: "Active", expires: "2028-11-02" },
];

/** Drivers eligible for vehicle assignment (excludes inactive records). */
export const assignableDrivers = () => drivers.filter((d) => d.status !== "Inactive");

export const driverById = (id?: string) => drivers.find((d) => d.id === id);

export const driverIdByName = (name?: string) =>
  name ? drivers.find((d) => d.name.toLowerCase() === name.toLowerCase())?.id : undefined;

export const driverName = (id?: string) => driverById(id)?.name;
