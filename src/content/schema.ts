import { z } from "zod";

/**
 * Content contract for every verified fact on the site.
 * Rule: nothing renders unless it is a claim with evidence, or labelled prose.
 * `npm run content:verify` re-checks evidence against the local clones.
 */

/** How strongly an evidence item supports a claim. Shown to visitors. */
export const EvidenceLevel = z.enum([
  "source", // the thing exists at path (and lines) in the repo at `sha`; machine-checked
  "reported", // stated in the repo's own documents; this project did NOT re-run it
  "ran", // this project executed a command on `capturedAt`; output stored in a capture
  "private", // redacted: derived from non-sensitive metadata only
]);
export type EvidenceLevel = z.infer<typeof EvidenceLevel>;

const Sha = z.string().regex(/^[0-9a-f]{40}$/, "full 40-char commit sha");
const IsoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}(T[\d:.]+Z)?$/);

export const Evidence = z.object({
  id: z.string().regex(/^E\d+$/), // E1, E2 ... unique within a project
  level: EvidenceLevel,
  repo: z.string(), // "phcaradanai/relic-tide"
  sha: Sha.optional(), // required unless level === "private"
  path: z.string().optional(),
  lines: z.tuple([z.number().int().positive(), z.number().int().positive()]).optional(),
  quote: z.string().max(400).optional(), // verbatim text from the file for `reported`
  captureId: z.string().optional(), // for `ran`
  note: z.string().max(300).optional(),
});
export type Evidence = z.infer<typeof Evidence>;

export const Claim = z.object({
  text: z.string().min(8).max(400),
  evidence: z.array(z.string().regex(/^E\d+$/)).min(1),
});
export type Claim = z.infer<typeof Claim>;

export const CodeExcerpt = z.object({
  id: z.string(),
  title: z.string(),
  path: z.string(),
  sha: Sha,
  startLine: z.number().int().positive(),
  endLine: z.number().int().positive(),
  language: z.string(), // shiki language id
  code: z.string(), // exact text of those lines (verified against the clone)
  why: z.string().max(600), // what to notice
  /** claims this excerpt backs; used by the evidence thread */
  claimIndexes: z.array(z.number().int().nonnegative()).default([]),
});
export type CodeExcerpt = z.infer<typeof CodeExcerpt>;

/** A real command run by this project. Never synthetic. */
export const Capture = z.object({
  id: z.string(),
  repo: z.string(),
  sha: Sha,
  cwd: z.string(), // path relative to the clone root
  command: z.string(),
  capturedAt: z.string(), // ISO timestamp
  exitCode: z.number().int(),
  durationMs: z.number().int().nonnegative(),
  output: z.string(), // trimmed, verbatim lines; `truncated` says whether lines were dropped
  truncated: z.boolean(),
  environment: z.string(), // e.g. "macOS 26 arm64, node v26.12.0"
});
export type Capture = z.infer<typeof Capture>;

export const AssetCategory = z.enum([
  "screenshot", // screenshot of implemented, running work
  "project-asset", // an asset that ships inside the project (sprite, texture, UI art)
  "concept", // concept art or UI concept that is not shipped as-is
  "ai-generated", // exploratory or shipped imagery produced by a generator (tool named)
  "diagram", // diagram authored for the project docs
]);
export type AssetCategory = z.infer<typeof AssetCategory>;

export const Asset = z.object({
  id: z.string(),
  file: z.string(), // path under content/assets-src/<slug>/ (original)
  alt: z.string().min(8), // describes what is visible, not the filename
  title: z.string(),
  category: AssetCategory,
  tools: z.array(z.string()).default([]), // generators/editors the repo documents, e.g. "PixelLab"
  provenance: z.string(), // 1–2 sentences; "Provenance not recorded." if unknown
  sourcePath: z.string(), // path in the source repo
  sourceSha: Sha.optional(),
  provenanceEvidence: z.string().optional(), // path of doc in repo that records the tool/prompt
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  featured: z.boolean().default(false),
});
export type Asset = z.infer<typeof Asset>;

export const Maturity = z.enum(["production-style", "prototype", "experiment", "research"]);
export const Kind = z.enum(["game", "system", "ai", "tool", "hardware", "web"]);

const Narrative = z.object({
  /** each section is 1–3 short paragraphs; claims go in `claims`, not buried here */
  problem: z.string(),
  approach: z.string(),
  architecture: z.string(),
  implementation: z.string(),
  outcome: z.string(),
  lessons: z.string(),
});

export const DiagramNode = z.object({ id: z.string(), label: z.string(), group: z.string().optional(), note: z.string().optional() });
export const DiagramEdge = z.object({ from: z.string(), to: z.string(), label: z.string().optional() });

export const Project = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  accession: z.string().regex(/^PK-\d{4}-\d{3}$/), // PK-2026-004
  title: z.string(),
  kind: Kind,
  tier: z.enum(["A", "B", "C"]), // A case study, B compact, C in storage (private, redacted)
  maturity: Maturity,
  visibility: z.enum(["public", "private-redacted", "public-site-private-repo"]),
  tagline: z.string().max(140),
  summary: z.string().max(600),
  period: z.object({ start: IsoDate, end: IsoDate }),
  repo: z
    .object({
      url: z.string().url(),
      pinnedSha: Sha,
      ownerCommits: z.number().int().nonnegative(),
      totalCommits: z.number().int().nonnegative(),
      languages: z.record(z.string(), z.number()), // bytes, from GitHub
      checkedAt: z.string(),
    })
    .nullable(),
  stack: z.array(z.string()).min(1),
  /** plain statement of AI involvement, per owner decision; every item needs evidence */
  aiRole: z.object({
    summary: z.string(),
    tools: z.array(z.object({ name: z.string(), use: z.string(), evidence: z.string().regex(/^E\d+$/) })),
  }),
  narrative: Narrative.nullable(), // null for tier B/C
  evidence: z.array(Evidence),
  claims: z.array(Claim),
  excerpts: z.array(CodeExcerpt),
  captures: z.array(z.string()).default([]), // ids in content/captures/*.json
  assets: z.array(Asset),
  diagram: z.object({ nodes: z.array(DiagramNode), edges: z.array(DiagramEdge) }).optional(),
  demo: z.object({ url: z.string().url().nullable(), note: z.string() }),
  limitations: z.array(z.string()).min(1), // the repo's own caveats, kept
  contribution: z.string(), // what the owner's account did, from git facts only
  lastVerified: z.string(),
});
export type Project = z.infer<typeof Project>;

export const Profile = z.object({
  name: z.string(),
  role: z.string(),
  city: z.string(),
  email: z.string().email(),
  github: z.string().url(),
  education: z.array(z.object({ school: z.string(), degree: z.string(), start: z.string(), end: z.string(), source: z.string() })),
  skills: z.array(z.object({ group: z.string(), items: z.array(z.string()), source: z.string() })),
  cvProjectLabels: z.array(z.string()), // text list as published on the owner's CV
  cvSource: z.string(),
  lastVerified: z.string(),
});
export type Profile = z.infer<typeof Profile>;
