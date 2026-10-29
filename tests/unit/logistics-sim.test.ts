import { describe, it, expect } from "vitest";
import { createInitialWorld, stepSim, computeSiteKpis, computeZoneCounts } from "@/data/logistics/sim";
import { SITES, FLEET } from "@/data/logistics/seed";
import { PARCEL_STEPS } from "@/data/logistics/types";
import { useLogisticsStore } from "@/lib/logistics-store";

describe("NuriTrack site data and simulation", () => {
  it("seeds every site with its fleet, unique ids and 25 parcels", () => {
    const w = createInitialWorld();
    for (const site of SITES) {
      const [trucks, forklifts, amrs] = FLEET[site.id];
      const at = w.vehicles.filter((v) => v.siteId === site.id);
      expect(at.filter((v) => v.kind === "truck")).toHaveLength(trucks);
      expect(at.filter((v) => v.kind === "forklift")).toHaveLength(forklifts);
      expect(at.filter((v) => v.kind === "amr")).toHaveLength(amrs);
    }
    expect(new Set(w.vehicles.map((v) => v.id)).size).toBe(w.vehicles.length);
    expect(w.parcels).toHaveLength(25);
    expect(w.simTime).toBe(0);
  });

  it("replays identically from the same seed and does not mutate its input", () => {
    const a = createInitialWorld(7);
    const snapshot = JSON.stringify(a);
    expect(JSON.stringify(stepSim(a, 60))).toBe(JSON.stringify(stepSim(createInitialWorld(7), 60)));
    expect(JSON.stringify(a)).toBe(snapshot);
  });

  it("never puts two trucks on one dock and only docks at its own site", () => {
    let w = createInitialWorld();
    for (let i = 0; i < 40; i++) {
      w = stepSim(w, 5);
      const docked = w.vehicles.filter((v) => v.dockId);
      expect(new Set(docked.map((v) => v.dockId)).size).toBe(docked.length);
      for (const v of docked) {
        expect(SITES.find((s) => s.id === v.siteId)!.docks.some((d) => d.id === v.dockId)).toBe(true);
      }
    }
  });

  it("keeps KPIs in range and zone counts consistent with the fleet", () => {
    const w = stepSim(createInitialWorld(), 120);
    for (const site of SITES) {
      const k = computeSiteKpis(w, site.id);
      expect(k.processed).toBeGreaterThan(0);
      expect(k.onTimeRate).toBeGreaterThanOrEqual(0);
      expect(k.onTimeRate).toBeLessThanOrEqual(1);
      expect(k.docksInUse).toBeLessThanOrEqual(k.docksTotal);
      const z = computeZoneCounts(w, site.id);
      expect(z.receiving + z.outbound).toBe(
        w.vehicles.filter((v) => v.siteId === site.id && v.dockId && v.status !== "departing").length
      );
    }
    for (const p of w.parcels) expect(p.step).toBeLessThan(PARCEL_STEPS.length);
  });

  it("store tick advances the world only while playing", () => {
    const t0 = useLogisticsStore.getState().world.simTime;
    useLogisticsStore.setState({ playbackState: "playing", playbackSpeed: 2 });
    useLogisticsStore.getState().tick();
    expect(useLogisticsStore.getState().world.simTime).toBe(t0 + 2);
    useLogisticsStore.setState({ playbackState: "paused" });
    useLogisticsStore.getState().tick();
    expect(useLogisticsStore.getState().world.simTime).toBe(t0 + 2);
  });

  it("switching site clears the selection", () => {
    const { selectEntity, setActiveSite } = useLogisticsStore.getState();
    selectEntity("TR-2101");
    setActiveSite("ICN-ST");
    expect(useLogisticsStore.getState().selectedEntityId).toBeNull();
    expect(useLogisticsStore.getState().activeSiteId).toBe("ICN-ST");
  });
});

describe("NuriTrack labels", () => {
  it("formats the sim clock from 08:00 and wraps negatives", async () => {
    const { simClock } = await import("@/data/logistics/sim");
    expect(simClock(0)).toBe("08:00");
    expect(simClock(125)).toBe("10:05");
    expect(simClock(-90)).toBe("06:30");
  });

  it("marks a truck late only after LATE_AFTER_MIN in the yard", async () => {
    const { statusTone, LATE_AFTER_MIN } = await import("@/data/logistics/sim");
    const v = createInitialWorld().vehicles[0]!;
    expect(statusTone({ ...v, status: "queued", waited: LATE_AFTER_MIN })).toBe("wait");
    expect(statusTone({ ...v, status: "queued", waited: LATE_AFTER_MIN + 1 })).toBe("late");
    expect(statusTone({ ...v, status: "unloading" })).toBe("work");
  });
});

describe("NuriTrack decisions and filters", () => {
  it("logs dock assignments made by the rules, stamped with sim time", async () => {
    const { decisionLog } = await import("@/data/logistics/sim");
    let w = createInitialWorld();
    const entries = [];
    for (let i = 0; i < 30; i++) {
      const next = stepSim(w, 1);
      entries.push(...decisionLog(w, next, "GJ-01"));
      w = next;
    }
    const assigned = entries.filter((e) => e.agent === "DISPATCH");
    expect(assigned.length).toBeGreaterThan(0);
    expect(assigned[0]!.text).toMatch(/^TR-\d+ assigned GJ-01-(IN|OUT)\d/);
    expect(new Set(entries.map((e) => e.id)).size).toBe(entries.length);
  });

  it("filters vehicles by tone and delayed-only", async () => {
    const { matchesFilter, LATE_AFTER_MIN } = await import("@/data/logistics/sim");
    const v = createInitialWorld().vehicles[0]!;
    const late = { ...v, status: "queued" as const, waited: LATE_AFTER_MIN + 2 };
    const busy = { ...v, status: "unloading" as const };
    expect(matchesFilter(late, { delayedOnly: true, tone: "all" })).toBe(true);
    expect(matchesFilter(busy, { delayedOnly: true, tone: "all" })).toBe(false);
    expect(matchesFilter(busy, { delayedOnly: false, tone: "work" })).toBe(true);
    expect(matchesFilter(busy, { delayedOnly: false, tone: "move" })).toBe(false);
  });
});
