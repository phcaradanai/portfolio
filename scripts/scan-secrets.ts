/** Fails if shipped content or build output contains an address, credential, phone or home path. */
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { findSecrets } from "../src/lib/secrets";

const root = path.resolve(import.meta.dirname, "..");
const targets = process.argv.slice(2).length ? process.argv.slice(2) : ["content/projects", "content/captures", "content/profile.json", "out"];
const TEXT = /\.(json|html|txt|js|css|md|xml|svg|webmanifest)$/;
let bad = 0, scanned = 0;

function walk(p: string) {
  const s = statSync(p, { throwIfNoEntry: false });
  if (!s) return;
  if (s.isDirectory()) { for (const e of readdirSync(p)) walk(path.join(p, e)); return; }
  if (!TEXT.test(p)) return;
  scanned++;
  for (const f of findSecrets(readFileSync(p, "utf8"))) {
    bad++;
    console.error(`✗ ${path.relative(root, p)}: ${f.rule}: ${f.match.slice(0, 60)}`);
  }
}
for (const t of targets) walk(path.join(root, t));
console.log(`content:scan ${bad ? "FAILED" : "ok"}: ${scanned} files, ${bad} findings`);
process.exit(bad ? 1 : 0);
