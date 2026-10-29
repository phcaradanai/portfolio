"use client";

import React from "react";
import {
  JOURNEY_STAGES,
  useLogisticsStore,
  type LabelFilter,
  type TimeOfDay,
  type WeatherCondition,
} from "@/lib/logistics-store";
import { soundscape } from "@/lib/audio";
import { SITES } from "@/data/logistics/seed";
import type { SiteId } from "@/data/logistics/types";
import { EntityInspector } from "./EntityInspector";

export function LogisticsHUD() {
  const {
    timeOfDay,
    weather,
    activeSiteId,
    labelFilter,
    activeStage,
    playbackState,
    playbackSpeed,
    activePackage,
    metrics,
    aiLogs,
    setTimeOfDay,
    setWeather,
    setActiveSite,
    setLabelFilter,
    setActiveStage,
    togglePlayback,
    setPlaybackSpeed,
    nextStage,
    prevStage,
  } = useLogisticsStore();

  const currentStage = JOURNEY_STAGES[activeStage] ?? JOURNEY_STAGES[0]!;

  // Autonomous simulation playback step
  React.useEffect(() => {
    if (playbackState !== "playing") return;
    const intervalMs = 6500 / playbackSpeed;
    const timer = setInterval(() => {
      nextStage();
    }, intervalMs);
    return () => clearInterval(timer);
  }, [playbackState, playbackSpeed, nextStage]);

  const handleTimeChange = (t: TimeOfDay) => {
    soundscape?.playHapticTick();
    setTimeOfDay(t);
  };

  const handleWeatherChange = (w: WeatherCondition) => {
    soundscape?.playHapticTick();
    setWeather(w);
  };

  const handleSiteChange = (id: SiteId) => {
    soundscape?.playWaypointChime();
    setActiveSite(id);
  };

  const handleStageSelect = (idx: number) => {
    soundscape?.playWaypointChime();
    setActiveStage(idx);
  };

  return (
    <div className="logistics-hud-overlay">
      {/* 1. TOP HEADER CONTROLS */}
      <div className="logistics-top-bar">
        <div className="logistics-brand-badge">
          <span className="logistics-pulse-dot" />
          <span className="logistics-brand-title">
            NURITRACK 3D · MULTI-MODAL LOGISTICS TWIN
          </span>
          <span className="logistics-brand-sub">AI INTERPRETS · CODE DECIDES</span>
        </div>

        {/* Environmental Control Pills */}
        <div className="logistics-control-groups">
          {/* Time of Day */}
          <div className="logistics-pill-group" role="group" aria-label="Time of Day">
            <span className="logistics-pill-label">CYCLE:</span>
            {(["day", "sunset", "night"] as TimeOfDay[]).map((t) => (
              <button
                key={t}
                type="button"
                className="logistics-ctrl-btn"
                data-active={timeOfDay === t}
                onClick={() => handleTimeChange(t)}
              >
                {t.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Weather */}
          <div className="logistics-pill-group" role="group" aria-label="Weather">
            <span className="logistics-pill-label">WEATHER:</span>
            {(["clear", "rain", "snow", "autumn"] as WeatherCondition[]).map((w) => (
              <button
                key={w}
                type="button"
                className="logistics-ctrl-btn"
                data-active={weather === w}
                onClick={() => handleWeatherChange(w)}
              >
                {w.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Site selector: the camera flies to the chosen site */}
          <div className="logistics-pill-group" role="group" aria-label="Site">
            <span className="logistics-pill-label">SITE:</span>
            {SITES.map((site) => (
              <button
                key={site.id}
                type="button"
                className="logistics-ctrl-btn"
                data-active={activeSiteId === site.id}
                aria-pressed={activeSiteId === site.id}
                title={site.name}
                onClick={() => handleSiteChange(site.id)}
              >
                {site.code}
              </button>
            ))}
          </div>

          {/* Which floating labels the scene shows */}
          <div className="logistics-pill-group" role="group" aria-label="Labels">
            <span className="logistics-pill-label">LABELS:</span>
            {(["fleet", "infra", "all"] as LabelFilter[]).map((f) => (
              <button
                key={f}
                type="button"
                className="logistics-ctrl-btn"
                data-active={labelFilter === f}
                aria-pressed={labelFilter === f}
                onClick={() => setLabelFilter(f)}
              >
                {f.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. RIGHT-SIDE TELEMETRY & AI DISPATCH STREAM */}
      <aside className="logistics-side-telemetry" aria-label="Telemetry & AI Dispatch Log">
        <EntityInspector />
        <div className="logistics-telemetry-box">
          <div className="logistics-panel-header">
            <span>LIVE TELEMETRY</span>
            <span className="logistics-active-pulse">● 60 FPS</span>
          </div>

          <div className="logistics-stats-grid">
            <div className="logistics-stat-card">
              <span className="stat-label">ACTIVE AMRS</span>
              <span className="stat-value">{metrics.activeAmrs} UNITS</span>
            </div>
            <div className="logistics-stat-card">
              <span className="stat-label">FLEET HEALTH</span>
              <span className="stat-value">{metrics.fleetHealth}%</span>
            </div>
            <div className="logistics-stat-card">
              <span className="stat-label">THROUGHPUT</span>
              <span className="stat-value">{metrics.throughputPps} PKTS/H</span>
            </div>
            <div className="logistics-stat-card">
              <span className="stat-label">COLD-CHAIN</span>
              <span className="stat-value">{activePackage.temp}</span>
            </div>
          </div>
        </div>

        {/* AI Reasoning Log Stream */}
        <div className="logistics-ai-stream-box">
          <div className="logistics-panel-header">
            <span>STRUCTURED AI REASONING</span>
            <span className="logistics-agent-tag">REASONER ACTIVE</span>
          </div>
          <div className="logistics-log-scroll">
            {aiLogs.map((log) => (
              <div key={log.id} className="logistics-log-row">
                <span className="log-time">{log.time}</span>
                <span className={`log-agent agent-${log.agent.toLowerCase()}`}>
                  [{log.agent}]
                </span>
                <span className="log-msg">{log.text}</span>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* 3. BOTTOM PACKAGE JOURNEY SCRUBBER */}
      <div className="logistics-bottom-scrubber">
        <div className="logistics-scrubber-top">
          <div className="logistics-pkg-info">
            <span className="pkg-id">{activePackage.id}</span>
            <span className="pkg-name">{activePackage.name}</span>
            <span className="pkg-route">
              {activePackage.origin} ➔ {activePackage.dest}
            </span>
          </div>

          <div className="logistics-transport-controls">
            <button
              type="button"
              className="logistics-transport-btn"
              onClick={() => {
                soundscape?.playHapticTick();
                prevStage();
              }}
              aria-label="Previous stage"
            >
              ◀ PREV
            </button>
            <button
              type="button"
              className="logistics-transport-btn"
              data-active={playbackState === "playing"}
              onClick={() => {
                soundscape?.playHapticTick();
                togglePlayback();
              }}
            >
              {playbackState === "playing" ? "⏸ PAUSE" : "▶ PLAY"}
            </button>
            <button
              type="button"
              className="logistics-transport-btn"
              onClick={() => {
                soundscape?.playHapticTick();
                nextStage();
              }}
              aria-label="Next stage"
            >
              NEXT ▶
            </button>

            {([1, 2, 4] as number[]).map((spd) => (
              <button
                key={spd}
                type="button"
                className="logistics-transport-btn"
                data-active={playbackSpeed === spd}
                onClick={() => {
                  soundscape?.playHapticTick();
                  setPlaybackSpeed(spd);
                }}
              >
                {spd}X
              </button>
            ))}
          </div>
        </div>

        {/* 7-Step Journey Stepper */}
        <div className="logistics-stepper-bar">
          {JOURNEY_STAGES.map((stg, i) => {
            const isCompleted = i < activeStage;
            const isCurrent = i === activeStage;
            return (
              <button
                key={stg.code}
                type="button"
                className="logistics-step-tab"
                data-active={isCurrent}
                data-completed={isCompleted}
                onClick={() => handleStageSelect(i)}
              >
                <div className="step-num">{String(i + 1).padStart(2, "0")}</div>
                <div className="step-meta">
                  <div className="step-title">{stg.title}</div>
                  <div className="step-facility">{stg.facility}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Current Stage Telemetry Footer */}
        <div className="logistics-status-footer">
          <span className="status-label">ACTIVE OPERATION:</span>
          <span className="status-text">{currentStage.statusText}</span>
          <span className="status-machinery">⚙ {currentStage.machinery}</span>
        </div>
      </div>
    </div>
  );
}
