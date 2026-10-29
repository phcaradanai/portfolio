"use client";

import React, { useEffect } from "react";
import { useLogisticsStore } from "@/lib/logistics-store";
import { SITE_BY_ID } from "@/data/logistics/seed";
import { LATE_AFTER_MIN, STATUS_LABEL, computeZoneCounts, simClock, statusTone } from "@/data/logistics/sim";

type Row = [label: string, value: React.ReactNode];

/** Paper wall-label card for whatever is selected in the scene; reads only from the store. */
export function EntityInspector() {
  const selectedId = useLogisticsStore((s) => s.selectedEntityId);
  const world = useLogisticsStore((s) => s.world);
  const site = useLogisticsStore((s) => SITE_BY_ID[s.activeSiteId]);
  const selectEntity = useLogisticsStore((s) => s.selectEntity);

  useEffect(() => {
    if (!selectedId) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && selectEntity(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId, selectEntity]);

  if (!selectedId) return null;

  const link = (id: string) => (
    <button type="button" className="lt-inspector__link" onClick={() => selectEntity(id)}>
      {id}
    </button>
  );

  let kicker = "";
  let title = selectedId;
  let rows: Row[] = [];

  const vehicle = world.vehicles.find((v) => v.id === selectedId);
  const dock = site.docks.find((d) => d.id === selectedId);
  const building = site.buildings.find((b) => b.id === selectedId);

  if (vehicle) {
    const tone = statusTone(vehicle);
    kicker = vehicle.kind === "truck" ? "Line-haul truck" : vehicle.kind === "forklift" ? "Forklift" : "AMR";
    rows = [
      ["Site", SITE_BY_ID[vehicle.siteId].name],
      [
        "Status",
        <span key="s" className="lt-inspector__status" data-tone={tone}>
          <span className="lt-dot" aria-hidden="true" />
          {STATUS_LABEL[vehicle.status]}
          {tone === "late" && ` · late ${vehicle.waited - LATE_AFTER_MIN} min`}
        </span>,
      ],
    ];
    if (vehicle.kind === "truck") {
      rows.push(["Dock", vehicle.dockId ? link(vehicle.dockId) : "None"]);
      if (vehicle.status === "queued") rows.push(["Waiting", `${vehicle.waited} min`]);
    }
    rows.push(["Last update", simClock(vehicle.updatedAt)]);
  } else if (dock) {
    const truck = world.vehicles.find((v) => v.dockId === dock.id);
    kicker = dock.side === "inbound" ? "Inbound dock" : "Outbound dock";
    rows = [
      ["Site", site.name],
      ["Status", truck ? STATUS_LABEL[truck.status] : "Free"],
      ["Truck", truck ? link(truck.id) : "None"],
    ];
  } else if (building) {
    kicker = building.kind === "warehouse" ? "Main hall" : building.kind === "office" ? "Office" : "Gatehouse";
    title = building.label;
    rows = [["Site", site.name]];
    if (building.kind === "warehouse") {
      const z = computeZoneCounts(world, site.id);
      rows.push(["Inbound docks", `${z.receiving} busy`], ["Outbound docks", `${z.outbound} busy`], ["Equipment working", String(z.storage)]);
    }
    if (building.kind === "gatehouse") {
      const z = computeZoneCounts(world, site.id);
      rows.push(["At the gate", String(z.gate)], ["Waiting in yard", String(z.yard)]);
    }
  } else {
    return null;
  }

  return (
    <section className="lt-inspector" aria-label={`Inspector: ${title}`}>
      {/* Announce only the selection, not the rows that change every tick. */}
      <span className="nt-visually-hidden" aria-live="polite">{kicker} {title} selected</span>
      <header className="lt-inspector__head">
        <div>
          <p className="lt-inspector__kicker">{kicker}</p>
          <h3 className="lt-inspector__title">{title}</h3>
        </div>
        <button type="button" className="lt-inspector__close" aria-label="Close inspector" onClick={() => selectEntity(null)}>
          ×
        </button>
      </header>
      <dl className="lt-inspector__rows">
        {rows.map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
      <p className="lt-inspector__foot">Sim time {simClock(world.simTime)} · Esc to close</p>
    </section>
  );
}
