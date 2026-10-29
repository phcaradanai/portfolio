/**
 * Deterministic NuriTrack simulation: pure functions over World, seeded RNG,
 * no Date or Math.random, so the same seed always replays the same day.
 */

import { ADDRESSES, FLEET, NOTES, RECIPIENTS, SITES, SITE_BY_ID } from "./seed";
import {
  PARCEL_STEPS,
  type EquipmentStatus,
  type Parcel,
  type Site,
  type SiteId,
  type Vehicle,
  type VehicleStatus,
  type World,
  type ZoneKind,
} from "./types";

export const LATE_AFTER_MIN = 5;
const MAX_STEP_MIN = 240;
const WARMUP_MIN = 90;

/** mulberry32; the returned state lets World carry the RNG between ticks. */
function makeRng(seed: number) {
  let s = seed >>> 0;
  return {
    next() {
      s = (s + 0x6d2b79f5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },
    int(min: number, max: number) {
      return min + Math.floor(this.next() * (max - min + 1));
    },
    get state() {
      return s;
    },
  };
}
type Rng = ReturnType<typeof makeRng>;

export function createInitialWorld(seed = 20261029): World {
  const rng = makeRng(seed);
  const vehicles: Vehicle[] = [];
  const parcels: Parcel[] = [];
  let truckNo = 2100;

  for (const site of SITES) {
    const [trucks, forklifts, amrs] = FLEET[site.id];
    const add = (kind: Vehicle["kind"], id: string, status: Vehicle["status"]) =>
      vehicles.push({ id, siteId: site.id, kind, livery: rng.int(0, 5), status, timer: rng.int(0, 30), dockId: null, waited: 0, updatedAt: 0 });
    for (let i = 0; i < trucks; i++) add("truck", `TR-${(truckNo += rng.int(1, 12))}`, "offsite");
    for (let i = 0; i < forklifts; i++) add("forklift", `${site.code}-FL${String(i + 1).padStart(2, "0")}`, "idle");
    for (let i = 0; i < amrs; i++) add("amr", `${site.code}-AMR${String(i + 1).padStart(2, "0")}`, "idle");
  }

  for (let i = 0; i < 25; i++) {
    const site = SITES[i % SITES.length]!;
    const step = rng.int(0, PARCEL_STEPS.length - 2);
    parcels.push({
      id: `#${rng.int(7000, 7999)}-${rng.int(1000, 9999)}-${rng.int(1000, 9999)}`,
      siteId: site.id,
      recipient: RECIPIENTS[rng.int(0, RECIPIENTS.length - 1)]!,
      address: ADDRESSES[rng.int(0, ADDRESSES.length - 1)]!,
      note: NOTES[rng.int(0, NOTES.length - 1)]!,
      priority: rng.next() < 0.3 ? "express" : "standard",
      step,
      stepTimes: PARCEL_STEPS.map((_, s) => (s < step ? 0 : null)),
      vehicleId: null,
    });
  }

  const stats = Object.fromEntries(SITES.map((s) => [s.id, { processed: 0, arrivals: 0, onTime: 0 }])) as World["stats"];
  // Warm up so the first frame shows a busy site, then start the clock at 0.
  const warm = stepSim({ simTime: -WARMUP_MIN, seed: rng.state, vehicles, parcels, stats }, WARMUP_MIN);
  return warm;
}

function freeDock(site: Site, vehicles: Vehicle[], rng: Rng): string | null {
  const taken = new Set(vehicles.map((v) => v.dockId).filter(Boolean));
  const free = site.docks.filter((d) => !taken.has(d.id));
  return free.length ? free[rng.int(0, free.length - 1)]!.id : null;
}

function stepTruck(v: Vehicle, w: World, rng: Rng) {
  const site = SITE_BY_ID[v.siteId];
  const stats = w.stats[v.siteId];
  const set = (status: Vehicle["status"], timer: number) => {
    v.status = status;
    v.timer = timer;
    v.updatedAt = w.simTime;
  };
  const tryDock = () => {
    const dockId = freeDock(site, w.vehicles, rng);
    if (!dockId) return set("queued", 0);
    v.dockId = dockId;
    stats.arrivals++;
    if (v.waited <= LATE_AFTER_MIN) stats.onTime++;
    set("docking", 3);
  };

  if (v.status === "queued") {
    v.waited++;
    return tryDock();
  }
  if (--v.timer > 0) return;
  switch (v.status) {
    case "offsite":
      return set("arriving", 5);
    case "arriving":
      return tryDock();
    case "docking": {
      const side = site.docks.find((d) => d.id === v.dockId)?.side;
      return set(side === "inbound" ? "unloading" : "loading", rng.int(8, 22));
    }
    case "unloading":
    case "loading":
      stats.processed += rng.int(60, 220);
      v.dockId = null;
      return set("departing", 4);
    case "departing":
      v.waited = 0;
      return set("offsite", rng.int(10, 45));
  }
}

const NEXT_EQUIPMENT: Record<EquipmentStatus, EquipmentStatus> = {
  idle: "moving",
  moving: "lifting",
  lifting: "moving",
  charging: "idle",
};

function stepEquipment(v: Vehicle, w: World, rng: Rng) {
  if (--v.timer > 0) return;
  let next = NEXT_EQUIPMENT[v.status as EquipmentStatus];
  if (v.kind === "amr" && next === "lifting") next = "idle";
  if (rng.next() < 0.05) next = "charging";
  v.status = next;
  v.timer = rng.int(2, 8);
  v.updatedAt = w.simTime;
}

/** Advance the world by `minutes` sim minutes (rounded, capped at MAX_STEP_MIN). */
export function stepSim(world: World, minutes: number): World {
  const rng = makeRng(world.seed);
  const w: World = {
    simTime: world.simTime,
    seed: world.seed,
    vehicles: world.vehicles.map((v) => ({ ...v })),
    parcels: world.parcels.map((p) => ({ ...p, stepTimes: [...p.stepTimes] })),
    stats: Object.fromEntries(Object.entries(world.stats).map(([k, s]) => [k, { ...s }])) as World["stats"],
  };

  const steps = Math.min(MAX_STEP_MIN, Math.max(0, Math.round(minutes)));
  for (let m = 0; m < steps; m++) {
    w.simTime++;
    for (const v of w.vehicles) (v.kind === "truck" ? stepTruck : stepEquipment)(v, w, rng);
    for (const p of w.parcels) {
      if (p.step >= PARCEL_STEPS.length - 1 || rng.next() > 0.03) continue;
      p.stepTimes[p.step] = w.simTime;
      p.step++;
    }
  }
  w.seed = rng.state;
  return w;
}

export interface SiteKpis {
  processed: number;
  vehiclesOnSite: number;
  onTimeRate: number;
  docksInUse: number;
  docksTotal: number;
  delayed: number;
}

export function computeSiteKpis(world: World, siteId: SiteId): SiteKpis {
  const trucks = world.vehicles.filter((v) => v.siteId === siteId && v.kind === "truck");
  const s = world.stats[siteId];
  return {
    processed: s.processed,
    vehiclesOnSite: trucks.filter((v) => v.status !== "offsite").length,
    onTimeRate: s.arrivals ? s.onTime / s.arrivals : 1,
    docksInUse: trucks.filter((v) => v.dockId).length,
    docksTotal: SITE_BY_ID[siteId].docks.length,
    delayed: trucks.filter((v) => v.status === "queued" && v.waited > LATE_AFTER_MIN).length,
  };
}

export function computeZoneCounts(world: World, siteId: SiteId): Record<ZoneKind, number> {
  const site = SITE_BY_ID[siteId];
  const sideOf = (dockId: string | null) => site.docks.find((d) => d.id === dockId)?.side;
  const counts: Record<ZoneKind, number> = { gate: 0, yard: 0, receiving: 0, outbound: 0, storage: 0 };
  for (const v of world.vehicles) {
    if (v.siteId !== siteId) continue;
    if (v.kind !== "truck") {
      if (v.status !== "charging") counts.storage++;
    } else if (v.status === "arriving" || v.status === "departing") counts.gate++;
    else if (v.status === "queued") counts.yard++;
    else if (v.dockId) counts[sideOf(v.dockId) === "inbound" ? "receiving" : "outbound"]++;
  }
  return counts;
}

export const STATUS_LABEL: Record<VehicleStatus, string> = {
  offsite: "Leaving site",
  arriving: "To gate",
  queued: "Waiting",
  docking: "To dock",
  unloading: "Unloading",
  loading: "Loading",
  departing: "Departing",
  idle: "Idle",
  moving: "Moving",
  lifting: "Lifting",
  charging: "Charging",
};

export type StatusTone = "work" | "move" | "wait" | "late" | "idle";

export function statusTone(v: Vehicle): StatusTone {
  if (v.status === "queued") return v.waited > LATE_AFTER_MIN ? "late" : "wait";
  if (v.status === "unloading" || v.status === "loading" || v.status === "lifting") return "work";
  if (v.status === "idle" || v.status === "charging" || v.status === "offsite") return "idle";
  return "move";
}

/** Sim minute 0 is 08:00 on the sim day. */
export function simClock(minute: number): string {
  const m = (((8 * 60 + Math.floor(minute)) % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}

export interface FleetFilter {
  delayedOnly: boolean;
  tone: StatusTone | "all";
}

export function matchesFilter(v: Vehicle, f: FleetFilter): boolean {
  const tone = statusTone(v);
  if (f.delayedOnly && tone !== "late") return false;
  return f.tone === "all" || tone === f.tone;
}

export interface DecisionEntry {
  id: string;
  time: string;
  agent: "DISPATCH" | "ROUTER" | "SAFETY" | "TELEMATICS";
  text: string;
}

/** What the deterministic rules decided between two worlds at one site, newest first. */
export function decisionLog(before: World, after: World, siteId: SiteId): DecisionEntry[] {
  const out: DecisionEntry[] = [];
  const docks = SITE_BY_ID[siteId].docks.length;
  const time = simClock(after.simTime);
  after.vehicles.forEach((v, i) => {
    const p = before.vehicles[i];
    if (!p || v.siteId !== siteId || v.kind !== "truck" || p.status === v.status && p.waited === v.waited) return;
    const add = (agent: DecisionEntry["agent"], text: string) => out.push({ id: `${after.simTime}-${v.id}-${agent}`, time, agent, text });
    if (v.status === "docking" && p.status !== "docking") {
      add("DISPATCH", `${v.id} assigned ${v.dockId}${v.waited ? ` after ${v.waited} min in the yard` : ""}.`);
    } else if (v.status === "queued" && p.status !== "queued") {
      add("ROUTER", `${v.id} held in the yard: all ${docks} docks busy.`);
    } else if (v.status === "queued" && p.waited <= LATE_AFTER_MIN && v.waited > LATE_AFTER_MIN) {
      add("SAFETY", `${v.id} flagged late: ${v.waited} min waiting for a dock.`);
    } else if (v.status === "departing" && p.dockId) {
      add("TELEMATICS", `${v.id} cleared ${p.dockId}; dock released.`);
    }
  });
  return out.reverse();
}
