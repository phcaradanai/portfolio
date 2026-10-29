import type { Project } from "@/content/schema";
import { LINE_HEIGHT, layoutDiagram } from "@/lib/diagram-layout";

/** Architecture drawn from the project's real module list. Server-rendered SVG, text stays selectable. */
export function Blueprint({ diagram, title }: { diagram: NonNullable<Project["diagram"]>; title: string }) {
  const l = layoutDiagram(diagram);
  return (
    <svg className="blueprint" viewBox={`0 0 ${l.width} ${l.height}`} role="img" aria-label={`Architecture of ${title}: ${l.nodes.map((n) => n.label).join(", ")}`}>
      <defs>
        <marker id="bp-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L8,4 L0,8 z" fill="var(--thread)" />
        </marker>
      </defs>
      {l.edges.map((e) => <path key={`${e.from}-${e.to}`} d={e.path} className="blueprint__edge" markerEnd="url(#bp-arrow)" />)}
      {l.nodes.map((n) => (
        <g key={n.id} transform={`translate(${n.x} ${n.y})`}>
          <rect width={n.w} height={n.h} rx="2" className="blueprint__node" />
          <title>{n.label}</title>
          <text x={n.w / 2} y={n.h / 2 - ((n.lines.length - 1) * LINE_HEIGHT) / 2} className="blueprint__label" textAnchor="middle" dominantBaseline="central">
            {n.lines.map((t, i) => <tspan key={i} x={n.w / 2} dy={i === 0 ? 0 : LINE_HEIGHT}>{t}</tspan>)}
          </text>
        </g>
      ))}
    </svg>
  );
}
