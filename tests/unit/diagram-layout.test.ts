import { describe, expect, it } from "vitest";
import { layoutDiagram } from "@/lib/diagram-layout";

const n = (id: string) => ({ id, label: id });

describe("layoutDiagram", () => {
  it("puts targets in later columns than sources", () => {
    const l = layoutDiagram({ nodes: [n("a"), n("b"), n("c")], edges: [{ from: "a", to: "b" }, { from: "b", to: "c" }] });
    const x = Object.fromEntries(l.nodes.map((p) => [p.id, p.x]));
    expect(x.a).toBeLessThan(x.b!);
    expect(x.b).toBeLessThan(x.c!);
  });
  it("survives cycles and unknown ids", () => {
    const l = layoutDiagram({ nodes: [n("a"), n("b")], edges: [{ from: "a", to: "b" }, { from: "b", to: "a" }, { from: "a", to: "zzz" }] });
    expect(l.nodes).toHaveLength(2);
    expect(l.edges).toHaveLength(2);
    expect(Number.isFinite(l.width)).toBe(true);
  });
  it("stacks siblings in one column without overlap", () => {
    const l = layoutDiagram({ nodes: [n("r"), n("x"), n("y")], edges: [{ from: "r", to: "x" }, { from: "r", to: "y" }] });
    const [x, y] = ["x", "y"].map((id) => l.nodes.find((p) => p.id === id)!);
    expect(x!.x).toBe(y!.x);
    expect(Math.abs(x!.y - y!.y)).toBeGreaterThanOrEqual(x!.h);
  });
});

describe("layoutDiagram labels", () => {
  it("wraps long labels onto at most two lines that fit the node", () => {
    const l = layoutDiagram({ nodes: [{ id: "a", label: "External integration program (HIS adapter)" }, n("b")], edges: [{ from: "a", to: "b" }] });
    const a = l.nodes.find((p) => p.id === "a")!;
    expect(a.lines.length).toBeLessThanOrEqual(2);
    for (const line of a.lines) expect(line.length * 6.7).toBeLessThanOrEqual(a.w - 16);
  });
  it("keeps short labels on one line", () => {
    const l = layoutDiagram({ nodes: [n("api"), n("web")], edges: [] });
    expect(l.nodes[0]!.lines).toEqual(["api"]);
  });
});
