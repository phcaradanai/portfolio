"use client";

import React, { useEffect } from "react";
import { useLogisticsStore } from "@/lib/logistics-store";
import { SITE_BY_ID } from "@/data/logistics/seed";
import { LATE_AFTER_MIN, STATUS_LABEL, statusTone } from "@/data/logistics/sim";
import { labelAnchors, labelElements, setAnchor } from "./labelAnchors";

const bind = (id: string) => (el: HTMLElement | null) => {
  if (el) labelElements.set(id, el);
  else labelElements.delete(id);
};

/**
 * DOM pills over the 3D scene for the active site. One React tree for every label;
 * LabelProjector (inside the canvas) positions them each frame.
 */
export function SceneLabels() {
  const world = useLogisticsStore((s) => s.world);
  const site = useLogisticsStore((s) => SITE_BY_ID[s.activeSiteId]);
  const labelFilter = useLogisticsStore((s) => s.labelFilter);
  const selectedId = useLogisticsStore((s) => s.selectedEntityId);
  const selectEntity = useLogisticsStore((s) => s.selectEntity);
  const fleet = labelFilter !== "infra";
  const infra = labelFilter !== "fleet";

  // Buildings and docks never move, so their anchors are set once per site.
  useEffect(() => {
    const [ox, oz] = site.origin;
    const ids: string[] = [];
    for (const b of site.buildings) {
      setAnchor(b.id, ox + b.position[0], b.size[2] + 2, oz + b.position[1]);
      ids.push(b.id);
    }
    for (const d of site.docks) {
      setAnchor(d.id, ox + d.position[0], 4.4, oz + d.position[1] + (d.side === "inbound" ? 0.2 : -0.2));
      ids.push(d.id);
    }
    return () => ids.forEach((id) => labelAnchors.delete(id));
  }, [site]);

  const occupant = new Map(world.vehicles.filter((v) => v.dockId).map((v) => [v.dockId!, v.id]));
  const vehicles = fleet ? world.vehicles.filter((v) => v.siteId === site.id && v.kind !== "amr") : [];

  return (
    <div className="lt-layer">
      {vehicles.map((v) => {
        const tone = statusTone(v);
        return (
          <button
            key={v.id}
            ref={bind(v.id)}
            type="button"
            className="lt-label"
            data-tone={tone}
            data-selected={v.id === selectedId}
            aria-pressed={v.id === selectedId}
            onClick={() => selectEntity(v.id)}
          >
            <span className="lt-dot" aria-hidden="true" />
            {v.id}
            <span className="lt-status">{tone === "late" ? `Late +${v.waited - LATE_AFTER_MIN}m` : STATUS_LABEL[v.status]}</span>
          </button>
        );
      })}
      {infra &&
        site.buildings.map((b) => (
          <button key={b.id} ref={bind(b.id)} type="button" className="lt-label lt-label--infra" data-selected={b.id === selectedId} aria-pressed={b.id === selectedId} onClick={() => selectEntity(b.id)}>
            {b.label}
          </button>
        ))}
      {infra &&
        site.docks.map((d) => {
          const truck = occupant.get(d.id);
          return (
            <button
              key={d.id}
              ref={bind(d.id)}
              type="button"
              className="lt-label lt-label--dock"
              data-tone={truck ? "work" : "idle"}
              data-selected={d.id === selectedId}
              aria-pressed={d.id === selectedId}
              aria-label={`${d.id}, ${truck ? `occupied by ${truck}` : "free"}`}
              onClick={() => selectEntity(d.id)}
            >
              <span className="lt-dot" aria-hidden="true" />
              {d.id.split("-").at(-1)}
            </button>
          );
        })}
    </div>
  );
}
