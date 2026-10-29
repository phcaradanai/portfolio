import type { Asset, Evidence, Project } from "@/content/schema";
import { media } from "./media";

export const MATURITY: Record<Project["maturity"], string> = {
  "production-style": "Production-style",
  prototype: "Prototype",
  experiment: "Experiment",
  research: "Research",
};
export const KIND: Record<Project["kind"], string> = {
  game: "Game", system: "System", ai: "AI tooling", tool: "Tool", hardware: "Hardware integration", web: "Web",
};
export const CATEGORY: Record<Asset["category"], string> = {
  screenshot: "Screenshot of implemented work",
  "project-asset": "Project asset",
  concept: "Concept art",
  "ai-generated": "AI-generated image",
  diagram: "Diagram",
};

export const year = (p: Project) => p.period.start.slice(0, 4);

/** "May 2026" or "May to Jul 2026". */
export function period(p: Project): string {
  const f = (d: string) => new Date(d + "T00:00:00Z").toLocaleDateString("en-GB", { month: "short", year: "numeric", timeZone: "UTC" });
  const [a, b] = [f(p.period.start), f(p.period.end)];
  return a === b ? a : `${a} to ${b}`;
}

/** Short credit line for a wall label; the full tool list lives on the case study. */
export function madeBy(p: Project): string {
  const n = p.aiRole.tools.length;
  return n ? "P. Kanyapan with AI agents" : "P. Kanyapan";
}

/**
 * Best asset to represent a project: proof of running work first (featured screenshot, then any screenshot),
 * then featured art, then anything built. Depth maps are half of a painting pair, never shown alone.
 */
export function heroAsset(p: Project): Asset | undefined {
  const built = p.assets.filter((a) => media(p.slug, a.id) && !/-depth$/.test(a.id));
  return built.find((a) => a.featured && a.category === "screenshot")
    ?? built.find((a) => a.category === "screenshot")
    ?? built.find((a) => a.featured)
    ?? built[0];
}

export const sha7 = (s?: string) => s?.slice(0, 7);

export function githubUrl(e: Pick<Evidence, "repo" | "sha" | "path" | "lines">): string | null {
  if (e.repo === "private" || !e.sha) return null;
  const base = `https://github.com/${e.repo}`;
  if (!e.path) return `${base}/commit/${e.sha}`;
  const hash = e.lines ? `#L${e.lines[0]}-L${e.lines[1]}` : "";
  return `${base}/blob/${e.sha}/${e.path}${hash}`;
}
