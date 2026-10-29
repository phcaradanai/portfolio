"use client";

import dynamic from "next/dynamic";
import React, { useState } from "react";
import Link from "next/link";
import { Frame } from "@/components/Frame";
import { DepthPainting } from "@/components/DepthPainting";
import { WallLabel } from "@/components/WallLabel";
import { Chip } from "@/components/Evidence";
import { IconArrow } from "@/components/icons";
import { useExperience } from "@/components/experience/ExperienceProvider";
import { ISLAND_ZONES, MONUMENT_NODES } from "./IslandScene";
import { soundscape } from "@/lib/audio";

const DynamicWorldCanvas = dynamic(
  () => import("./WorldCanvas").then((mod) => mod.WorldCanvas),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          width: "100%",
          height: "100%",
          minHeight: "clamp(34rem, 64vh, 52rem)",
          background: "#101326",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "rgba(255,255,255,0.4)",
          fontFamily: "var(--font-mono, monospace)",
          fontSize: "12px",
          letterSpacing: "0.06em",
        }}
      >
        INITIALIZING 3D WORLD STAGE...
      </div>
    ),
  }
);

export function FoyerFutureHero({
  rtAccession,
  colorSrc,
  depthSrc,
  srcSet,
  width,
  height,
  alt,
}: {
  rtAccession: string;
  colorSrc: string;
  depthSrc: string;
  srcSet: string;
  width: number;
  height: number;
  alt: string;
}) {
  const { effectiveTier, activeWaypoint, setActiveWaypoint, activeMonumentSlug, setActiveMonumentSlug } = useExperience();
  const [selectedWaypoint, setSelectedWaypoint] = useState<string>("core");

  const is3DActive = effectiveTier !== "static";

  const handleWaypointClick = (zoneId: string) => {
    soundscape?.playWaypointChime();
    setSelectedWaypoint(zoneId);
    setActiveWaypoint(zoneId);
  };

  const selectedMonument = activeMonumentSlug
    ? MONUMENT_NODES.find((m) => m.slug === activeMonumentSlug)
    : null;

  return (
    <div style={{ gridColumn: "1 / -1", width: "100%", marginTop: "var(--s-4)" }}>
      {is3DActive ? (
        <div className="foyer-future-stage">
          <div className="foyer-hero-hud">
            <div className="foyer-badge">
              <span className="foyer-badge__pulse" />
              <span>FUTURE MUSEUM · 21 VERIFIED REPOSITORIES</span>
            </div>

            <div className="foyer-waypoint-pills" role="group" aria-label="District Waypoints">
              {ISLAND_ZONES.map((z) => (
                <button
                  key={z.id}
                  type="button"
                  className="foyer-waypoint-btn"
                  aria-pressed={selectedWaypoint === z.id}
                  onClick={() => handleWaypointClick(z.id)}
                >
                  {z.code.split("·")[0]?.trim()} · {z.title.split("&")[0]?.trim()}
                </button>
              ))}
            </div>
          </div>

          <DynamicWorldCanvas
            customWaypoint={selectedWaypoint}
            onSelectMonument={(slug) => {
              soundscape?.playHapticTick();
              setActiveMonumentSlug(slug);
            }}
          />

          {selectedMonument && (
            <div className="foyer-monument-inspector" role="region" aria-label="Monument Inspector">
              <div className="foyer-inspector-top">
                <span className="foyer-inspector-acc">{selectedMonument.accession}</span>
                <button
                  type="button"
                  className="foyer-inspector-close"
                  onClick={() => {
                    soundscape?.playHapticTick();
                    setActiveMonumentSlug(null);
                  }}
                  aria-label="Close inspector"
                >
                  ✕
                </button>
              </div>
              <div>
                <h3 className="foyer-inspector-title">{selectedMonument.title}</h3>
                <p className="foyer-inspector-metric">{selectedMonument.metric}</p>
              </div>
              <Link
                href={selectedMonument.href}
                className="foyer-inspector-btn"
                onClick={() => soundscape?.playHapticTick()}
              >
                <span>Inspect Case Study &amp; Evidence</span>
                <IconArrow />
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(12, minmax(0, 1fr))", gap: "var(--s-4)" }}>
          <div style={{ gridColumn: "span 7" }}>
            <Frame src={colorSrc} width={width} height={height} alt={alt}>
              <DepthPainting
                image={colorSrc}
                depth={depthSrc}
                srcSet={srcSet}
                sizes="(max-width: 52rem) 92vw, 50vw"
                width={width}
                height={height}
                alt={alt}
                priority
              />
            </Frame>
          </div>
          <div style={{ gridColumn: "span 5" }}>
            <WallLabel
              accession={rtAccession}
              title="Atlantis city, backdrop"
              year="2026"
              fields={[
                {
                  k: "Medium",
                  v: "AI-generated image with a depth map from local Depth-Anything-V2 inference.",
                },
                {
                  k: "Status",
                  v: "Superseded in the game by playable-map levels; kept here as a study.",
                },
                { k: "From", v: <Link href="/works/relic-tide/">Relic Tide</Link> },
              ]}
              chips={
                <>
                  <span className="chip chip--ai">AI-generated</span>
                  <Chip level="source" href="/works/relic-tide/#e-E22">
                    Same technique as the game&apos;s shader
                  </Chip>
                </>
              }
              label="About this study"
            />
          </div>
        </div>
      )}
    </div>
  );
}
