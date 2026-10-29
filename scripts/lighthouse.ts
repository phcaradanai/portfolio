/**
 * Runs Lighthouse (mobile and desktop presets) against the static preview and writes
 * docs/reports/lighthouse/<preset>-<route>.json plus a markdown table with the run conditions.
 * Usage: npm start (in another shell), then `npx tsx scripts/lighthouse.ts`.
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const base = process.env.PREVIEW_URL ?? "http://localhost:4173";
const routes = (process.env.ROUTES ?? "/,/works/,/works/relic-tide/,/lab/,/gallery/").split(",");
const outDir = path.join(root, "docs/reports/lighthouse");
mkdirSync(outDir, { recursive: true });
const cli = path.join(root, "node_modules/lighthouse/cli/index.js");
// Lighthouse refuses an x64 Node on Apple Silicon (Chrome would run under Rosetta); LH_NODE points at a native arm64 node.
const node = process.env.LH_NODE ?? process.execPath;
const [cmd, pre] = process.platform === "darwin" && process.env.LH_NODE ? ["arch", ["-arm64", node, cli]] : [node, [cli]];

const rows: string[] = [];
for (const preset of ["mobile", "desktop"] as const) {
  for (const r of routes) {
    const name = `${preset}-${r === "/" ? "home" : r.replace(/^\/|\/$/g, "").replace(/\//g, "_")}`;
    const file = path.join(outDir, `${name}.json`);
    const load = os.loadavg()[0]!.toFixed(1);
    const args = [`${base}${r}`, "--quiet", "--output=json", `--output-path=${file}`, "--only-categories=performance,accessibility,best-practices,seo",
      "--chrome-flags=--headless=new --no-first-run", ...(preset === "desktop" ? ["--preset=desktop"] : [])];
    execFileSync(cmd, [...pre, ...args], { stdio: "inherit", env: { ...process.env, CHROME_PATH: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" } });
    const j = JSON.parse(readFileSync(file, "utf8"));
    const a = j.audits;
    const s = (k: string) => Math.round((j.categories[k]?.score ?? 0) * 100);
    rows.push(`| ${preset} | ${r} | ${(a["largest-contentful-paint"].numericValue / 1000).toFixed(2)} s | ${a["cumulative-layout-shift"].numericValue.toFixed(3)} | ${Math.round(a["total-blocking-time"].numericValue)} ms | ${s("performance")} | ${s("accessibility")} | ${s("best-practices")} | ${s("seo")} | ${load} |`);
  }
}
const md = [
  `Lighthouse ${JSON.parse(readFileSync(path.join(root, "node_modules/lighthouse/package.json"), "utf8")).version}, ${new Date().toISOString()}, ${os.cpus().length}× ${os.cpus()[0]?.model}, ${process.platform}, Lighthouse run under ${process.env.LH_NODE ? "native arm64 Node (" + process.env.LH_NODE + ")" : "Node " + process.version}.`,
  `Target: static export served by \`npx serve out\` on localhost. Mobile preset = Lighthouse default (Moto G Power emulation, simulated slow 4G, 4× CPU slowdown); desktop preset = Lighthouse desktop. "Load" is the 1-minute load average when each run started.`,
  "",
  "| Preset | Route | LCP | CLS | TBT | Perf | A11y | Best practices | SEO | Load |",
  "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
  ...rows,
].join("\n");
writeFileSync(path.join(outDir, "SUMMARY.md"), md + "\n");
console.log(md);
