import { describe, expect, it } from "vitest";
import {
  CAMPUS_PARTICLES,
  getMonumentPbr,
  PIPELINE_STAGES,
  type IsoMonument,
} from "@/components/IsometricAgentWorld";

function makeMonument(overrides: Partial<IsoMonument> = {}): IsoMonument {
  return {
    slug: "ai-kingdom",
    accession: "PK-2026-004",
    title: "AI Kingdom",
    shortTitle: "AI Kingdom",
    kind: "ai",
    tier: "A",
    maturity: "Active",
    tagline: "Multi-agent orchestration",
    summary: "Summary",
    period: "2026",
    stack: ["TypeScript"],
    commits: 270,
    files: 400,
    testFiles: 154,
    aiSummary: "Governed council",
    aiTools: [],
    practiceDocs: ["AGENTS.md"],
    gridX: -2,
    gridY: -2,
    height: 2.18,
    district: "command",
    stages: [1, 2, 3, 5, 6],
    image: null,
    href: "/works/ai-kingdom/",
    repoUrl: "https://github.com/phcaradanai/ai-kingdom",
    pinnedSha: "a".repeat(40),
    ...overrides,
  };
}

describe("IsometricAgentWorld PBR & Natural Ecosystem", () => {
  it("assigns low-roughness, high-metalness PBR specs across CORE, VAULT, Tier A, and Tier B monuments", () => {
    const core = getMonumentPbr(makeMonument({ tier: "CORE", district: "command" }));
    expect(core.roughness).toBeLessThanOrEqual(0.08);
    expect(core.metalness).toBeGreaterThanOrEqual(0.95);
    expect(core.finishLabel).toContain("Mirror Holo-Chrome");

    const vault = getMonumentPbr(makeMonument({ tier: "VAULT", district: "vault" }));
    expect(vault.roughness).toBeLessThanOrEqual(0.1);
    expect(vault.metalness).toBeGreaterThanOrEqual(0.92);
    expect(vault.finishLabel).toContain("Polished Gold");

    const gamesA = getMonumentPbr(makeMonument({ tier: "A", district: "games" }));
    expect(gamesA.roughness).toBeLessThanOrEqual(0.12);
    expect(gamesA.metalness).toBeGreaterThanOrEqual(0.9);
    expect(gamesA.finishLabel).toContain("Rose-Titanium");

    const systemsA = getMonumentPbr(makeMonument({ tier: "A", district: "systems" }));
    expect(systemsA.roughness).toBeLessThanOrEqual(0.12);
    expect(systemsA.metalness).toBeGreaterThanOrEqual(0.9);
    expect(systemsA.finishLabel).toContain("Cobalt Chrome");

    const tierB = getMonumentPbr(makeMonument({ tier: "B", district: "tools" }));
    expect(tierB.roughness).toBeLessThanOrEqual(0.16);
    expect(tierB.metalness).toBeGreaterThanOrEqual(0.84);
  });

  it("populates 84 natural ecosystem particles with 32 leaves (sakura/mint/ginkgo), 32 dust motes, and 20 fireflies", () => {
    expect(CAMPUS_PARTICLES).toHaveLength(84);

    const leaves = CAMPUS_PARTICLES.filter((p) => p.kind === "leaf");
    const dust = CAMPUS_PARTICLES.filter((p) => p.kind === "dust");
    const fireflies = CAMPUS_PARTICLES.filter((p) => p.kind === "firefly");

    expect(leaves).toHaveLength(32);
    expect(dust).toHaveLength(32);
    expect(fireflies).toHaveLength(20);

    const variants = new Set(leaves.map((l) => l.leafVariant));
    expect(variants).toEqual(new Set(["sakura", "mint", "ginkgo"]));

    for (const p of CAMPUS_PARTICLES) {
      expect(Number.isFinite(p.gx)).toBe(true);
      expect(Number.isFinite(p.gy)).toBe(true);
      expect(p.gzBase).toBeGreaterThan(0);
      expect(p.speed).toBeGreaterThan(0);
      expect(p.flutterFreq).toBeGreaterThan(1);
      expect(p.tumbleSpeed).toBeGreaterThan(1);
    }
  });

  it("exposes all 6 governed agent pipeline stages", () => {
    expect(PIPELINE_STAGES).toHaveLength(6);
    expect(PIPELINE_STAGES.map((s) => s.step)).toEqual([1, 2, 3, 4, 5, 6]);
  });
});
