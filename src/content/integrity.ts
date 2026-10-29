import type { Project } from "./schema";

/** Pure referential checks. Returns human-readable problems; empty array means clean. */
export function checkIntegrity(p: Project): string[] {
  const problems: string[] = [];
  const ids = new Set<string>();
  for (const e of p.evidence) {
    if (ids.has(e.id)) problems.push(`${p.slug}: duplicate evidence id ${e.id}`);
    ids.add(e.id);
    if (e.level !== "private" && !e.sha) problems.push(`${p.slug}: ${e.id} (${e.level}) needs a sha`);
    if ((e.level === "source" || e.level === "reported") && !e.path) problems.push(`${p.slug}: ${e.id} needs a path`);
    if (e.level === "reported" && !e.quote) problems.push(`${p.slug}: ${e.id} is "reported" and needs a verbatim quote`);
    if (e.level === "ran" && !e.captureId) problems.push(`${p.slug}: ${e.id} is "ran" and needs a captureId`);
    if (e.level === "ran" && e.captureId && !p.captures.includes(e.captureId)) {
      problems.push(`${p.slug}: ${e.id} references capture ${e.captureId} not listed on the project`);
    }
    if (e.lines && e.lines[0] > e.lines[1]) problems.push(`${p.slug}: ${e.id} has reversed line range`);
  }
  p.claims.forEach((c, i) => {
    for (const id of c.evidence) if (!ids.has(id)) problems.push(`${p.slug}: claim #${i} cites unknown evidence ${id}`);
  });
  for (const t of p.aiRole.tools) if (!ids.has(t.evidence)) problems.push(`${p.slug}: aiRole tool ${t.name} cites unknown evidence ${t.evidence}`);
  const ex = new Set<string>();
  for (const x of p.excerpts) {
    if (ex.has(x.id)) problems.push(`${p.slug}: duplicate excerpt id ${x.id}`);
    ex.add(x.id);
    if (x.endLine < x.startLine) problems.push(`${p.slug}: excerpt ${x.id} has reversed lines`);
    const n = x.code.split("\n").length;
    if (n !== x.endLine - x.startLine + 1) problems.push(`${p.slug}: excerpt ${x.id} has ${n} lines but range says ${x.endLine - x.startLine + 1}`);
    for (const ci of x.claimIndexes) if (ci >= p.claims.length) problems.push(`${p.slug}: excerpt ${x.id} cites missing claim index ${ci}`);
  }
  const assetIds = new Set<string>();
  for (const a of p.assets) {
    if (assetIds.has(a.id)) problems.push(`${p.slug}: duplicate asset id ${a.id}`);
    assetIds.add(a.id);
    if (a.category === "ai-generated" && a.tools.length === 0) problems.push(`${p.slug}: ai-generated asset ${a.id} must name a tool or say "tool not recorded" in provenance`);
  }
  if (p.tier === "C" || p.visibility === "private-redacted") {
    if (p.excerpts.length || p.assets.length) problems.push(`${p.slug}: private/redacted project must have no excerpts or assets`);
    if (p.repo) problems.push(`${p.slug}: private/redacted project must not expose a repo url`);
  }
  if (p.tier === "A" && !p.narrative) problems.push(`${p.slug}: tier A needs a narrative`);
  return problems;
}
