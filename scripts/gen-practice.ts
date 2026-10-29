/** Observed working practice per repository: which kinds of documents exist at the pinned commit. Facts only; links point at git blobs. */
import { writeFileSync } from "node:fs";
import path from "node:path";
import { findClone, git } from "./lib/clones";

const REPOS = ["Cursed-Market", "relic-tide", "the-fisher", "shadow_council", "print_ops", "AI_Kingdom", "ScopeFlow", "Project-Explorer",
  "ai-product-intelligence", "chatgpt-mcp", "platform-control-plane", "vending-3d-ctl-agent", "coup_coop", "escape-room", "Splendor-Online", "pvp_td"];

const CHECKS: Record<string, RegExp> = {
  product: /^(PRODUCT|PRODUCT_VISION)\.md$/i,
  design: /^DESIGN\.md$/i,
  architecture: /^(ARCHITECTURE[^/]*\.md|docs\/architecture[^/]*)$/i,
  decisions: /^(ADR|docs\/adr|docs\/decisions)\/[^/]+/i,
  verification: /(^|\/)([^/]*(VERIFICATION|TEST_REPORT|REVIEW_PLAN)[^/]*\.md|validation\/[^/]+)$/i,
  agentNotes: /^(AGENTS|CLAUDE|GEMINI)\.md$/i,
};
const TEST = /(^|\/)(tests?|__tests__|e2e)\/|\.(test|spec)\.[cm]?[jt]sx?$|_test\.go$|\.test\.gd$/i;

const out: Record<string, unknown> = {};
for (const name of REPOS) {
  const clone = findClone(`phcaradanai/${name}`);
  if (!clone) { console.warn(`no clone for ${name}`); continue; }
  const sha = git(clone, ["rev-parse", "HEAD"]).trim();
  const files = git(clone, ["ls-tree", "-r", "--name-only", sha]).split("\n").filter(Boolean);
  const found: Record<string, string | null> = {};
  for (const [k, re] of Object.entries(CHECKS)) found[k] = files.find((f) => re.test(f)) ?? null;
  out[name] = { repo: `phcaradanai/${name}`, sha, files: files.length, testFiles: files.filter((f) => TEST.test(f)).length, found };
}
const file = path.resolve(import.meta.dirname, "../content/practice.json");
writeFileSync(file, JSON.stringify({ generatedAt: new Date().toISOString(), note: "Paths tracked in git at the pinned sha; absence means no such file was found by name, not that the practice is absent.", repos: out }, null, 1) + "\n");
console.log(`practice: ${Object.keys(out).length} repos`);
