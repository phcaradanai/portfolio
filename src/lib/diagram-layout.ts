import type { Project } from "@/content/schema";

type Diagram = NonNullable<Project["diagram"]>;
export type PlacedNode = { id: string; label: string; lines: string[]; group?: string; layer: number; x: number; y: number; w: number; h: number };
export type PlacedEdge = { from: string; to: string; label?: string; path: string };
export type Layout = { width: number; height: number; nodes: PlacedNode[]; edges: PlacedEdge[] };

const CHAR = 6.7; // advance of an 11px monospace glyph
const PAD_X = 8, LINE = 14, MIN_W = 130, MAX_W = 210, GAP_X = 64, GAP_Y = 18, PAD = 24;

/** Greedy word wrap into at most two lines of `max` characters; the second line is ellipsised if it still overflows. */
export function wrapLabel(label: string, max: number): string[] {
  if (label.length <= max) return [label];
  const words = label.split(/(?<=[\s/_-])/);
  let first = "";
  while (words.length && (first + words[0]).trimEnd().length <= max) first += words.shift();
  if (!first) { first = label.slice(0, max); words.splice(0, words.length, label.slice(max)); }
  let rest = words.join("").trim();
  if (rest.length > max) rest = rest.slice(0, max - 1).trimEnd() + "…";
  return rest ? [first.trimEnd(), rest] : [first.trimEnd()];
}

/** Layered left-to-right layout: layer = longest path from a source. Cycles are broken by ignoring back edges. */
export function layoutDiagram(d: Diagram): Layout {
  const ids = new Set(d.nodes.map((n) => n.id));
  const edges = d.edges.filter((e) => ids.has(e.from) && ids.has(e.to) && e.from !== e.to);
  const longest = Math.max(...d.nodes.map((n) => n.label.length), 1);
  const w = Math.round(Math.min(MAX_W, Math.max(MIN_W, longest * CHAR + PAD_X * 2)));
  const maxChars = Math.floor((w - PAD_X * 2) / CHAR);
  const lines = new Map(d.nodes.map((n) => [n.id, wrapLabel(n.label, maxChars)]));
  const h = Math.max(...[...lines.values()].map((l) => l.length)) > 1 ? 52 : 40;

  const layer = new Map<string, number>(d.nodes.map((n) => [n.id, 0]));
  // Relax edges |V| times; stops growing when a back edge would exceed |V|.
  for (let i = 0; i < d.nodes.length; i++) {
    let changed = false;
    for (const e of edges) {
      const next = (layer.get(e.from) ?? 0) + 1;
      if (next > (layer.get(e.to) ?? 0) && next < d.nodes.length) { layer.set(e.to, next); changed = true; }
    }
    if (!changed) break;
  }
  const columns = new Map<number, string[]>();
  for (const n of d.nodes) {
    const l = layer.get(n.id) ?? 0;
    columns.set(l, [...(columns.get(l) ?? []), n.id]);
  }
  const used = [...columns.keys()].sort((a, b) => a - b);
  const rows = Math.max(1, ...[...columns.values()].map((c) => c.length));
  const height = PAD * 2 + rows * h + (rows - 1) * GAP_Y;
  const width = PAD * 2 + used.length * w + (used.length - 1) * GAP_X;
  const placed = new Map<string, PlacedNode>();
  used.forEach((l, ci) => {
    const col = columns.get(l)!;
    const colH = col.length * h + (col.length - 1) * GAP_Y;
    col.forEach((id, ri) => {
      const n = d.nodes.find((x) => x.id === id)!;
      placed.set(id, {
        id, label: n.label, lines: lines.get(id)!, group: n.group, layer: ci, w, h,
        x: PAD + ci * (w + GAP_X), y: PAD + (height - PAD * 2 - colH) / 2 + ri * (h + GAP_Y),
      });
    });
  });
  const placedEdges: PlacedEdge[] = edges.map((e) => {
    const a = placed.get(e.from)!, b = placed.get(e.to)!;
    const forward = b.x > a.x;
    const x1 = forward ? a.x + a.w : a.x, x2 = forward ? b.x : b.x + b.w;
    const y1 = a.y + a.h / 2, y2 = b.y + b.h / 2;
    const mx = (x1 + x2) / 2;
    return { from: e.from, to: e.to, label: e.label, path: forward ? `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}` : `M${x1},${y1} C${x1},${y1 - 40} ${x2},${y2 - 40} ${x2},${y2}` };
  });
  return { width, height, nodes: [...placed.values()], edges: placedEdges };
}

export const LINE_HEIGHT = LINE;
