import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "../..");
const cloneRoots = [process.env.CLONE_ROOT, path.join(root, ".clones"), "/Users/Projects"].filter(Boolean) as string[];

/** Local clone for "owner/name", or null. Tries the exact name and space-separated variants. */
export function findClone(repo: string): string | null {
  const name = repo.split("/")[1] ?? repo;
  const variants = [name, name.replace(/-/g, " "), name.replace(/_/g, " ")];
  for (const r of cloneRoots) for (const v of variants) {
    const p = path.join(r, v);
    if (existsSync(path.join(p, ".git"))) return p;
  }
  return null;
}

export const git = (cwd: string, args: string[]) =>
  execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], maxBuffer: 256 * 1024 * 1024 });
