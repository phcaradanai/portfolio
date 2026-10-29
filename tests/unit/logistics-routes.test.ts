import { describe, it, expect } from "vitest";
import { SITE_BY_ID } from "@/data/logistics/seed";
import { routeTo, spawnPoint, truckGoal } from "@/data/logistics/routes";
import type { Vehicle } from "@/data/logistics/types";

const site = SITE_BY_ID["GJ-01"];
const truck = (over: Partial<Vehicle>): Vehicle => ({
  id: "TR-1", siteId: "GJ-01", kind: "truck", livery: 0, status: "arriving", timer: 1, dockId: null, waited: 0, updatedAt: 0, ...over,
});

describe("NuriTrack truck routes", () => {
  it("drives from the highway through the gate and reverses into an inbound dock", () => {
    const goal = truckGoal(site, truck({ status: "unloading", dockId: "GJ-01-IN3" }), 0);
    const path = routeTo(site, spawnPoint(site), goal);
    expect(path).toContainEqual({ p: site.gate });
    expect(path.at(-1)).toEqual({ p: goal.p, reverse: true });
    expect(path.some((w) => Math.abs(w.p[0]) === site.roads.side)).toBe(false);
  });

  it("uses a side lane to reach an outbound dock on the north face", () => {
    const goal = truckGoal(site, truck({ status: "loading", dockId: "GJ-01-OUT2" }), 0);
    const path = routeTo(site, site.gate, goal);
    expect(path.some((w) => Math.abs(w.p[0]) === site.roads.side && w.p[1] === site.roads.north)).toBe(true);
    expect(goal.p[1]).toBeLessThan(site.roads.south);
  });

  it("backs out of a yard slot and leaves via the gate", () => {
    const slot = site.yardSlots[0]!;
    const path = routeTo(site, slot, truckGoal(site, truck({ status: "departing" }), 0));
    expect(path[0]).toEqual({ p: [slot[0], site.roads.south], reverse: true });
    expect(path.at(-1)!.p[1]).toBeGreaterThan(site.size[1] / 2);
  });

  it("gives every site room for yard slots and parked trailers", () => {
    for (const s of Object.values(SITE_BY_ID)) {
      expect(s.yardSlots.length).toBeGreaterThanOrEqual(6);
      expect(s.trailers.length).toBeGreaterThan(0);
    }
  });
});
