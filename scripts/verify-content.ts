/**
 * Verifies content/projects/*.json against the schema, referential integrity and,
 * when a local clone is available, against git itself (path exists at sha, line ranges,
 * verbatim quotes, exact excerpt text). Missing clones warn; `--strict` fails instead.
 * `--only=slug-a,slug-b` limits the run to those projects.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { checkIntegrity } from "../src/content/integrity";
import { findClone, git } from "./lib/clones";
import { Capture, Project } from "../src/content/schema";

const root = path.resolve(import.meta.dirname, "..");
const strict = process.argv.includes("--strict");
const only = process.argv.find((a) => a.startsWith("--only="))?.slice(7).split(",").filter(Boolean);

let errors = 0;
let warnings = 0;
const fail = (m: string) => { errors++; console.error("  ✗", m); };
const warn = (m: string) => { warnings++; console.warn("  !", m); };

/** Reads many `<sha>:<path>` blobs with one `git cat-file --batch` process. Missing objects map to null. */
function readMany(clone: string, specs: string[]): Map<string, string | null> | null {
  const uniq = [...new Set(specs)];
  const res = new Map<string, string | null>();
  if (!uniq.length) return res;
  try {
    const out = execFileSync("git", ["cat-file", "--batch"], { cwd: clone, input: uniq.join("\n") + "\n", maxBuffer: 1024 * 1024 * 1024 });
    let off = 0;
    for (const spec of uniq) {
      const nl = out.indexOf(10, off);
      const header = out.subarray(off, nl).toString("utf8");
      off = nl + 1;
      const [, type, size] = header.split(" ");
      if (!size || header.endsWith(" missing") || header.endsWith(" ambiguous")) { res.set(spec, null); continue; }
      res.set(spec, type === "blob" ? out.subarray(off, off + Number(size)).toString("utf8") : null);
      off += Number(size) + 1;
    }
    return res;
  } catch (err) {
    warn(`Unable to query git clone at ${clone}: ${err instanceof Error ? err.message : String(err)}`);
    return null;
  }
}

const projDir = path.join(root, "content/projects");
const files = (existsSync(projDir) ? readdirSync(projDir).filter((f) => f.endsWith(".json")) : [])
  .filter((f) => !only || only.includes(f.replace(/\.json$/, "")));
const capDir = path.join(root, "content/captures");
const captures = new Map<string, ReturnType<typeof Capture.parse>>();
if (existsSync(capDir)) for (const f of readdirSync(capDir).filter((x) => x.endsWith(".json"))) {
  try { const c = Capture.parse(JSON.parse(readFileSync(path.join(capDir, f), "utf8"))); captures.set(c.id, c); }
  catch (e) { fail(`capture ${f}: ${(e as Error).message.split("\n")[0]}`); }
}

for (const f of files) {
  console.log(`• ${f}`);
  let p;
  try { p = Project.parse(JSON.parse(readFileSync(path.join(projDir, f), "utf8"))); }
  catch (e) { fail(`${f}: schema: ${(e as Error).message.slice(0, 600)}`); continue; }
  if (p.slug + ".json" !== f) fail(`${f}: slug ${p.slug} does not match filename`);
  for (const m of checkIntegrity(p)) fail(m);
  for (const id of p.captures) if (!captures.has(id)) fail(`${p.slug}: capture ${id} missing in content/captures`);
  for (const a of p.assets) if (!existsSync(path.join(root, "content/assets-src", p.slug, a.file))) warn(`${p.slug}: asset file ${a.file} missing (needed for media build)`);

  const own = p.repo?.url.replace("https://github.com/", "") ?? "";
  const repos = new Set(p.evidence.filter((e) => e.level !== "private" && e.repo !== "private").map((e) => e.repo));
  if (own) repos.add(own);
  for (const repo of repos) {
    const clone = findClone(repo);
    if (!clone) { (strict ? fail : warn)(`${p.slug}: no local clone of ${repo}; git-level checks skipped`); continue; }
    const ev = p.evidence.filter((e) => e.repo === repo && e.sha && e.path);
    const ex = repo === own ? p.excerpts : [];
    const blobs = readMany(clone, [...ev.map((e) => `${e.sha}:${e.path}`), ...ex.map((x) => `${x.sha}:${x.path}`)]);
    if (!blobs) { (strict ? fail : warn)(`${p.slug}: git clone ${repo} inaccessible; git-level checks skipped`); continue; }
    for (const e of ev) {
      const text = blobs.get(`${e.sha}:${e.path}`);
      if (text == null) { fail(`${p.slug}: ${e.id} ${e.path}@${e.sha!.slice(0, 7)} not found in clone`); continue; }
      const n = text.split("\n").length;
      if (e.lines && e.lines[1] > n) fail(`${p.slug}: ${e.id} lines ${e.lines.join("-")} beyond file length ${n}`);
      if (e.level === "reported" && e.quote && !text.replace(/\s+/g, " ").includes(e.quote.replace(/\s+/g, " "))) fail(`${p.slug}: ${e.id} quote not found verbatim in ${e.path}`);
    }
    for (const x of ex) {
      const text = blobs.get(`${x.sha}:${x.path}`);
      if (text == null) { fail(`${p.slug}: excerpt ${x.id} ${x.path}@${x.sha.slice(0, 7)} not found`); continue; }
      const actual = text.split("\n").slice(x.startLine - 1, x.endLine).join("\n");
      if (actual !== x.code) fail(`${p.slug}: excerpt ${x.id} differs from ${x.path}@${x.sha.slice(0, 7)} lines ${x.startLine}-${x.endLine}`);
    }
    if (repo === own && p.repo) { try { git(clone, ["cat-file", "-e", `${p.repo.pinnedSha}^{commit}`]); } catch (e) { (strict ? fail : warn)(`${p.slug}: pinnedSha verification skipped: ${(e as Error).message.split("\n")[0]}`); } }
  }
}

if (!only) for (const c of captures.values()) console.log(`• capture ${c.id}: ${c.command} (exit ${c.exitCode})`);
console.log(`\ncontent:verify ${errors ? "FAILED" : "ok"} — ${files.length} projects, ${captures.size} captures, ${errors} errors, ${warnings} warnings`);
process.exit(errors ? 1 : 0);
