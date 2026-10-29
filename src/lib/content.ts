import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { Capture, Profile, Project } from "@/content/schema";

const root = path.join(process.cwd(), "content");
let projects: Project[] | undefined;
let captures: Map<string, Capture> | undefined;

function readJson(file: string): unknown {
  return JSON.parse(readFileSync(file, "utf8"));
}

/** All projects, validated, ordered by accession number. Throws on invalid content so the build fails. */
export function getProjects(): Project[] {
  if (projects) return projects;
  const dir = path.join(root, "projects");
  const files = existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith(".json")) : [];
  projects = files.map((f) => Project.parse(readJson(path.join(dir, f)))).sort((a, b) => a.accession.localeCompare(b.accession));
  return projects;
}

export const getProject = (slug: string) => getProjects().find((p) => p.slug === slug);

export function getCapture(id: string): Capture | undefined {
  if (!captures) {
    captures = new Map();
    const dir = path.join(root, "captures");
    if (existsSync(dir)) for (const f of readdirSync(dir).filter((x) => x.endsWith(".json"))) {
      const c = Capture.parse(readJson(path.join(dir, f)));
      captures.set(c.id, c);
    }
  }
  return captures.get(id);
}

export function getProfile(): Profile {
  return Profile.parse(readJson(path.join(root, "profile.json")));
}

export const tiers = () => {
  const all = getProjects();
  return { A: all.filter((p) => p.tier === "A"), B: all.filter((p) => p.tier === "B"), C: all.filter((p) => p.tier === "C") };
};
