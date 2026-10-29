/**
 * Where each truck should be for its status, and the road path that gets it there.
 * Site-local coordinates; heading 0 faces +z, forward = (sin h, cos h).
 */

import { TRUCK } from "./seed";
import type { Site, Vec2, Vehicle } from "./types";

export interface Waypoint {
  p: Vec2;
  /** Drive this leg backwards (reversing into a dock or out of a yard slot). */
  reverse?: boolean;
}

export interface Goal {
  /** Changes only when the destination changes, so the scene knows when to re-route. */
  key: string;
  p: Vec2;
  heading: number;
  kind: "spawn" | "gate" | "yard" | "dock" | "exit";
}

const HIGHWAY_LANE = 1.8;

export function spawnPoint(site: Site): Vec2 {
  return [site.gate[0] + 45, site.roads.highway - HIGHWAY_LANE];
}

export function truckGoal(site: Site, v: Vehicle, queueIndex: number): Goal {
  if (v.dockId) {
    const dock = site.docks.find((d) => d.id === v.dockId)!;
    const out = dock.side === "inbound" ? 1 : -1;
    return { key: `dock:${dock.id}`, kind: "dock", heading: dock.heading, p: [dock.position[0], dock.position[1] + out * (TRUCK.length / 2 + 0.3)] };
  }
  if (v.status === "queued") {
    const slot = site.yardSlots[queueIndex % site.yardSlots.length]!;
    return { key: `yard:${queueIndex}`, kind: "yard", heading: 0, p: slot };
  }
  if (v.status === "arriving") return { key: "gate", kind: "gate", heading: 0, p: site.gate };
  // departing and offsite both head for the highway exit; the scene hides offsite trucks once there.
  return { key: "exit", kind: "exit", heading: Math.PI / 2, p: [site.gate[0] + 45, site.roads.highway + HIGHWAY_LANE] };
}

/** Road path from `from` to the goal: lanes around the hall, the gate, then the highway. */
export function routeTo(site: Site, from: Vec2, goal: Goal): Waypoint[] {
  const { north: zn, south: zs, side, highway } = site.roads;
  const [gx, gz] = site.gate;
  const fenceZ = site.size[1] / 2;
  const midZ = (zn + zs) / 2;
  const path: Waypoint[] = [];
  let lane: "S" | "N";
  let x = from[0];

  if (from[1] > fenceZ) {
    // On the highway: drive to the driveway, through the gate, onto the south lane.
    path.push({ p: [gx, from[1]] }, { p: [gx, gz] }, { p: [gx, zs] });
    lane = "S";
    x = gx;
  } else if (from[1] > zs) {
    // Yard slot (nose to the fence, so back out) or the gate driveway (drive forward).
    path.push({ p: [x, zs], reverse: Math.abs(x - gx) > 2 });
    lane = "S";
  } else if (from[1] < midZ) {
    lane = "N";
    if (Math.abs(from[1] - zn) > 0.5) path.push({ p: [x, zn] });
  } else {
    lane = "S";
    if (Math.abs(from[1] - zs) > 0.5) path.push({ p: [x, zs] });
  }

  const target = goal.kind === "dock" && goal.p[1] < midZ ? "N" : "S";
  const tx = goal.kind === "gate" || goal.kind === "exit" ? gx : goal.p[0];
  if (lane !== target) {
    const sx = Math.abs(x - side) + Math.abs(tx - side) <= Math.abs(x + side) + Math.abs(tx + side) ? side : -side;
    const [z0, z1] = lane === "S" ? [zs, zn] : [zn, zs];
    path.push({ p: [sx, z0] }, { p: [sx, z1] });
  }
  path.push({ p: [tx, target === "S" ? zs : zn] });

  if (goal.kind === "dock") path.push({ p: goal.p, reverse: true });
  else if (goal.kind === "yard" || goal.kind === "gate") path.push({ p: goal.p });
  else if (goal.kind === "exit") path.push({ p: [gx, gz] }, { p: [gx, highway + HIGHWAY_LANE] }, { p: goal.p });
  return path;
}
