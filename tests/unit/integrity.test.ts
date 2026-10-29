import { describe, expect, it } from "vitest";
import { checkIntegrity } from "@/content/integrity";
import { Project } from "@/content/schema";

const sha = "a".repeat(40);
const base = (): Record<string, any> => ({
  slug: "demo", accession: "PK-2026-001", title: "Demo", kind: "tool", tier: "B", maturity: "prototype",
  visibility: "public", tagline: "t", summary: "s", period: { start: "2026-01-01", end: "2026-01-02" },
  repo: { url: "https://github.com/phcaradanai/demo", pinnedSha: sha, ownerCommits: 1, totalCommits: 1, languages: { TypeScript: 10 }, checkedAt: "2026-10-24" },
  stack: ["TypeScript"], aiRole: { summary: "x", tools: [] }, narrative: null,
  evidence: [{ id: "E1", level: "source", repo: "phcaradanai/demo", sha, path: "a.ts" }],
  claims: [{ text: "Does a thing in a file.", evidence: ["E1"] }],
  excerpts: [], captures: [], assets: [], demo: { url: null, note: "none" }, limitations: ["prototype"],
  contribution: "1 commit", lastVerified: "2026-10-24",
});
const parse = (o: unknown) => Project.parse(o);

describe("checkIntegrity", () => {
  it("accepts a clean project", () => expect(checkIntegrity(parse(base()))).toEqual([]));
  it("flags a claim that cites missing evidence", () => {
    const p = base(); p.claims[0].evidence = ["E9"];
    expect(checkIntegrity(parse(p))[0]).toMatch(/unknown evidence E9/);
  });
  it("requires a quote for reported evidence", () => {
    const p = base(); p.evidence[0] = { id: "E1", level: "reported", repo: "x/y", sha, path: "README.md" };
    expect(checkIntegrity(parse(p)).join()).toMatch(/verbatim quote/);
  });
  it("blocks repo urls on redacted projects", () => {
    const p = base(); p.tier = "C"; p.visibility = "private-redacted";
    expect(checkIntegrity(parse(p)).join()).toMatch(/must not expose a repo url/);
  });
  it("checks excerpt line arithmetic", () => {
    const p = base();
    p.excerpts = [{ id: "x", title: "t", path: "a.ts", sha, startLine: 1, endLine: 5, language: "ts", code: "a\nb", why: "w", claimIndexes: [] }];
    expect(checkIntegrity(parse(p)).join()).toMatch(/2 lines but range says 5/);
  });
});
