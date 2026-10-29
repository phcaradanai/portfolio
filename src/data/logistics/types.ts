/**
 * NuriTrack site data model. The 3D scene is only a view of these records:
 * every object it draws is positioned from here, in site-local metres (x, z).
 */

export type SiteId = "ICN-FC" | "GJ-01" | "ICN-ST";
export type Vec2 = [number, number];

export type ZoneKind = "gate" | "yard" | "receiving" | "outbound" | "storage";

export interface Zone {
  id: string;
  kind: ZoneKind;
  label: string;
  /** Footprint rectangle: [x, z, width, depth], centred on (x, z). */
  rect: [number, number, number, number];
}

export interface Building {
  id: string;
  kind: "warehouse" | "office" | "gatehouse";
  label: string;
  position: Vec2;
  /** [width, depth, height] */
  size: [number, number, number];
}

export interface Dock {
  id: string;
  buildingId: string;
  side: "inbound" | "outbound";
  position: Vec2;
  /** Radians around Y; a docked truck faces away from the building along this heading. */
  heading: number;
}

export interface ParkedTrailer {
  id: string;
  position: Vec2;
  heading: number;
  livery: number;
}

export interface Site {
  id: SiteId;
  code: string;
  name: string;
  kind: "fulfillment" | "megahub" | "subterminal";
  /** World-space centre, so the camera can fly between sites on one canvas. */
  origin: Vec2;
  size: Vec2;
  zones: Zone[];
  buildings: Building[];
  docks: Dock[];
  /** Lane centre lines: z of the north/south lanes, |x| of the side lanes, z of the highway. */
  roads: { north: number; south: number; side: number; highway: number };
  /** Inside-the-fence point every truck passes on its way in or out. */
  gate: Vec2;
  yardSlots: Vec2[];
  trailers: ParkedTrailer[];
}

export type VehicleKind = "truck" | "forklift" | "amr";

export type TruckStatus =
  | "offsite"
  | "arriving"
  | "queued"
  | "docking"
  | "unloading"
  | "loading"
  | "departing";

export type EquipmentStatus = "idle" | "moving" | "lifting" | "charging";

export type VehicleStatus = TruckStatus | EquipmentStatus;

export interface Vehicle {
  id: string;
  siteId: SiteId;
  kind: VehicleKind;
  /** Index into the scene's carrier/livery palette. */
  livery: number;
  status: VehicleStatus;
  /** Sim minutes left in the current status. */
  timer: number;
  dockId: string | null;
  /** Sim minutes spent queued for the current visit; a visit over LATE_AFTER_MIN is late. */
  waited: number;
  /** Sim minute of the last status change. */
  updatedAt: number;
}

export const PARCEL_STEPS = [
  "Picking",
  "Loading",
  "Linehaul",
  "Hub sort",
  "Linehaul",
  "Sub sort",
  "Dispatch",
  "Delivered",
] as const;

export interface Parcel {
  id: string;
  siteId: SiteId;
  recipient: string;
  address: string;
  note: string;
  priority: "standard" | "express";
  /** Index into PARCEL_STEPS of the step in progress. */
  step: number;
  /** Sim minute each finished step completed, by step index. */
  stepTimes: (number | null)[];
  vehicleId: string | null;
}

export interface SiteStats {
  processed: number;
  arrivals: number;
  onTime: number;
}

export interface World {
  simTime: number;
  seed: number;
  vehicles: Vehicle[];
  parcels: Parcel[];
  stats: Record<SiteId, SiteStats>;
}
