"use client";

import React, { useEffect, useState } from "react";
import { useLogisticsStore, type LabelFilter, type TimeOfDay, type WeatherCondition } from "@/lib/logistics-store";
import { SITES, SITE_BY_ID } from "@/data/logistics/seed";
import {
  LATE_AFTER_MIN,
  STATUS_LABEL,
  computeSiteKpis,
  computeZoneCounts,
  matchesFilter,
  simClock,
  statusTone,
  type StatusTone,
} from "@/data/logistics/sim";
import { PARCEL_STEPS, type Vehicle } from "@/data/logistics/types";
import { Tabs } from "@/components/Tabs";
import { soundscape } from "@/lib/audio";
import { EntityInspector } from "./EntityInspector";

/** Compact labelled select for the top bar. */
function Pick<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: readonly T[]; onChange: (v: T) => void }) {
  return (
    <label className="nt-pick">
      <span>{label}</span>
      <select value={value} onChange={(e) => { soundscape?.playHapticTick(); onChange(e.target.value as T); }}>
        {options.map((o) => (
          <option key={o} value={o}>{o[0]!.toUpperCase() + o.slice(1)}</option>
        ))}
      </select>
    </label>
  );
}

function FullscreenButton() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const sync = () => setOn(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);
  return (
    <button
      type="button"
      className="nt-icon-btn"
      aria-pressed={on}
      onClick={(e) => {
        if (document.fullscreenElement) void document.exitFullscreen();
        else void e.currentTarget.closest<HTMLElement>(".logistics-stage-wrapper")?.requestFullscreen();
      }}
    >
      {on ? "Exit full screen" : "Full screen"}
    </button>
  );
}

function TopBar() {
  const activeSiteId = useLogisticsStore((s) => s.activeSiteId);
  const simTime = useLogisticsStore((s) => s.world.simTime);
  const playing = useLogisticsStore((s) => s.playbackState === "playing");
  const speed = useLogisticsStore((s) => s.playbackSpeed);
  const timeOfDay = useLogisticsStore((s) => s.timeOfDay);
  const weather = useLogisticsStore((s) => s.weather);
  const labelFilter = useLogisticsStore((s) => s.labelFilter);
  const { setActiveSite, togglePlayback, setPlaybackSpeed, setTimeOfDay, setWeather, setLabelFilter } = useLogisticsStore.getState();

  return (
    <header className="nt-top">
      <div className="nt-brand">
        <span className="nt-brand__name">NuriTrack</span>
        <span className="nt-brand__sub">Logistics twin</span>
      </div>
      <label className="nt-site">
        <span className="nt-visually-hidden">Site</span>
        <select value={activeSiteId} onChange={(e) => { soundscape?.playWaypointChime(); setActiveSite(e.target.value as typeof activeSiteId); }}>
          {SITES.map((s) => (
            <option key={s.id} value={s.id}>{s.code} · {s.name}</option>
          ))}
        </select>
      </label>
      <div className="nt-clock" aria-live="off">
        <span className="nt-live" data-on={playing}>{playing ? "LIVE" : "PAUSED"}</span>
        <span>{simClock(simTime)}</span>
      </div>
      <div className="nt-seg" role="group" aria-label="Playback">
        <button type="button" aria-pressed={!playing} onClick={togglePlayback}>{playing ? "Pause" : "Play"}</button>
        {[1, 2, 4].map((x) => (
          <button key={x} type="button" aria-pressed={speed === x} onClick={() => setPlaybackSpeed(x)}>×{x}</button>
        ))}
      </div>
      <div className="nt-top__view">
        <Pick<TimeOfDay> label="Time" value={timeOfDay} options={["day", "sunset", "night"]} onChange={setTimeOfDay} />
        <Pick<WeatherCondition> label="Weather" value={weather} options={["clear", "rain", "snow", "autumn"]} onChange={setWeather} />
        <Pick<LabelFilter> label="Labels" value={labelFilter} options={["fleet", "infra", "all"]} onChange={setLabelFilter} />
        <FullscreenButton />
      </div>
    </header>
  );
}

function SiteOverview() {
  const world = useLogisticsStore((s) => s.world);
  const site = useLogisticsStore((s) => SITE_BY_ID[s.activeSiteId]);
  const k = computeSiteKpis(world, site.id);
  const z = computeZoneCounts(world, site.id);
  const perSide = site.docks.length / 2;
  const zones: [string, string][] = [
    ["Gate", String(z.gate)],
    ["Truck yard", String(z.yard)],
    ["Inbound docks", `${z.receiving}/${perSide}`],
    ["Outbound docks", `${z.outbound}/${perSide}`],
    ["Equipment working", String(z.storage)],
  ];
  return (
    <details className="nt-card" open>
      <summary>
        <span className="nt-card__kicker">{site.code}</span> {site.name}
      </summary>
      <dl className="nt-kpis">
        <div><dt>Processed today</dt><dd>{k.processed.toLocaleString("en-US")}</dd></div>
        <div><dt>Trucks on site</dt><dd>{k.vehiclesOnSite}</dd></div>
        <div><dt>On-time arrival</dt><dd>{(k.onTimeRate * 100).toFixed(1)}%</dd></div>
        <div><dt>Docks in use</dt><dd>{k.docksInUse}/{k.docksTotal}</dd></div>
      </dl>
      {k.delayed > 0 && <p className="nt-alert">{k.delayed} truck{k.delayed > 1 ? "s" : ""} waiting over {LATE_AFTER_MIN} min</p>}
      <ul className="nt-zones">
        {zones.map(([label, n]) => (
          <li key={label}><span>{label}</span><span>{n}</span></li>
        ))}
      </ul>
    </details>
  );
}

const TONES: (StatusTone | "all")[] = ["all", "move", "work", "wait", "late", "idle"];
const TONE_LABEL: Record<StatusTone | "all", string> = { all: "All", move: "Moving", work: "Working", wait: "Waiting", late: "Late", idle: "Idle" };

function VehicleRows({ vehicles }: { vehicles: Vehicle[] }) {
  const selectedId = useLogisticsStore((s) => s.selectedEntityId);
  const selectEntity = useLogisticsStore((s) => s.selectEntity);
  if (!vehicles.length) return <p className="nt-empty">Nothing matches the filter.</p>;
  return (
    <ul className="nt-rows">
      {vehicles.map((v) => (
        <li key={v.id}>
          <button type="button" aria-pressed={v.id === selectedId} onClick={() => selectEntity(v.id)}>
            <span className="nt-rows__id">{v.id}</span>
            <span className="nt-rows__detail">{v.dockId?.split("-").at(-1) ?? (v.status === "queued" ? `${v.waited} min` : "")}</span>
            <span className="lt-inspector__status" data-tone={statusTone(v)}>
              <span className="lt-dot" aria-hidden="true" />
              {STATUS_LABEL[v.status]}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

function EntityTable() {
  const world = useLogisticsStore((s) => s.world);
  const site = useLogisticsStore((s) => SITE_BY_ID[s.activeSiteId]);
  const filter = useLogisticsStore((s) => s.fleetFilter);
  const selectedId = useLogisticsStore((s) => s.selectedEntityId);
  const { setFleetFilter, selectEntity } = useLogisticsStore.getState();

  const at = world.vehicles.filter((v) => v.siteId === site.id && v.status !== "offsite");
  const shown = at.filter((v) => matchesFilter(v, filter));
  const trucks = shown.filter((v) => v.kind === "truck");
  const forklifts = shown.filter((v) => v.kind === "forklift");
  const robots = shown.filter((v) => v.kind === "amr");
  const occupant = new Map(world.vehicles.filter((v) => v.dockId).map((v) => [v.dockId!, v]));
  const tabs = [
    { id: "nt-trucks", label: `Trucks ${trucks.length}` },
    { id: "nt-docks", label: `Docks ${site.docks.filter((d) => occupant.has(d.id)).length}/${site.docks.length}` },
    { id: "nt-forklifts", label: `Forklifts ${forklifts.length}` },
    ...(at.some((v) => v.kind === "amr") ? [{ id: "nt-robots", label: `Robots ${robots.length}` }] : []),
  ];

  return (
    <details className="nt-card nt-card--table" open>
      <summary>Fleet &amp; docks</summary>
      <div className="nt-filters">
        <label>
          <input type="checkbox" checked={filter.delayedOnly} onChange={(e) => setFleetFilter({ delayedOnly: e.target.checked })} /> Delayed only
        </label>
        <label>
          <span className="nt-visually-hidden">Status</span>
          <select value={filter.tone} onChange={(e) => setFleetFilter({ tone: e.target.value as StatusTone | "all" })}>
            {TONES.map((t) => <option key={t} value={t}>{TONE_LABEL[t]}</option>)}
          </select>
        </label>
      </div>
      {/* Remount per site so a tab that only one site has (Robots) can't stay picked. */}
      <Tabs key={site.id} tabs={tabs} label="Fleet tables" />
      <div id="panel-nt-trucks" role="tabpanel" aria-labelledby="tab-nt-trucks"><VehicleRows vehicles={trucks} /></div>
      <div id="panel-nt-docks" role="tabpanel" aria-labelledby="tab-nt-docks" hidden>
        <ul className="nt-rows">
          {site.docks.map((d) => {
            const v = occupant.get(d.id);
            return (
              <li key={d.id}>
                <button type="button" aria-pressed={d.id === selectedId} onClick={() => selectEntity(d.id)}>
                  <span className="nt-rows__id">{d.id.split("-").at(-1)}</span>
                  <span className="nt-rows__detail">{v?.id ?? ""}</span>
                  <span className="lt-inspector__status" data-tone={v ? "work" : "idle"}>
                    <span className="lt-dot" aria-hidden="true" />
                    {v ? STATUS_LABEL[v.status] : "Free"}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      <div id="panel-nt-forklifts" role="tabpanel" aria-labelledby="tab-nt-forklifts" hidden><VehicleRows vehicles={forklifts} /></div>
      {tabs.length > 3 && <div id="panel-nt-robots" role="tabpanel" aria-labelledby="tab-nt-robots" hidden><VehicleRows vehicles={robots} /></div>}
    </details>
  );
}

function ParcelCard() {
  const world = useLogisticsStore((s) => s.world);
  const siteId = useLogisticsStore((s) => s.activeSiteId);
  const trackedId = useLogisticsStore((s) => s.trackedParcelId);
  const setTracked = useLogisticsStore((s) => s.setTrackedParcel);
  const parcels = world.parcels.filter((p) => p.siteId === siteId);
  const parcel = parcels.find((p) => p.id === trackedId) ?? parcels.find((p) => p.step < PARCEL_STEPS.length - 1) ?? parcels[0];
  if (!parcel) return null;
  const i = parcels.indexOf(parcel);
  const go = (d: number) => setTracked(parcels[(i + d + parcels.length) % parcels.length]!.id);

  return (
    <details className="nt-card nt-card--parcel" open>
      <summary>Journey of one parcel</summary>
      <div className="nt-parcel__head">
        <div>
          <p className="nt-parcel__id">{parcel.id}{parcel.priority === "express" && <span className="nt-tag">Express</span>}</p>
          <p className="nt-parcel__to">{parcel.recipient} · {parcel.address}</p>
          {parcel.note && <p className="nt-parcel__note">“{parcel.note}”</p>}
        </div>
        <div className="nt-seg" role="group" aria-label="Tracked parcel">
          <button type="button" onClick={() => go(-1)} aria-label="Previous parcel">‹</button>
          <span className="nt-seg__count">{i + 1}/{parcels.length}</span>
          <button type="button" onClick={() => go(1)} aria-label="Next parcel">›</button>
        </div>
      </div>
      <ol className="nt-steps">
        {PARCEL_STEPS.map((label, s) => (
          <li key={s} data-state={s < parcel.step ? "done" : s === parcel.step ? "now" : "todo"}>
            <span className="nt-steps__dot" aria-hidden="true" />
            <span className="nt-steps__label">{label}</span>
            <span className="nt-steps__time">{s < parcel.step && parcel.stepTimes[s] !== null && parcel.stepTimes[s]! > 0 ? simClock(parcel.stepTimes[s]!) : s === parcel.step ? "now" : ""}</span>
          </li>
        ))}
      </ol>
    </details>
  );
}

function DecisionLog() {
  const logs = useLogisticsStore((s) => s.aiLogs);
  return (
    <details className="nt-card nt-card--log">
      <summary>Code decides · rule log</summary>
      <ul className="nt-log">
        {logs.map((l) => (
          <li key={l.id}><span className="nt-log__time">{l.time}</span><span className="nt-log__agent">{l.agent}</span>{l.text}</li>
        ))}
      </ul>
    </details>
  );
}

/** NuriTrack-style control room over the 3D stage; every number comes from the store. */
export function SiteHUD() {
  return (
    <div className="nt-hud">
      <TopBar />
      <div className="nt-left">
        <SiteOverview />
        <ParcelCard />
      </div>
      <div className="nt-right">
        <EntityInspector />
        <EntityTable />
        <DecisionLog />
      </div>
    </div>
  );
}
