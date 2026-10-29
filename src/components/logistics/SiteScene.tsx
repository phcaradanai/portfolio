"use client";

import * as THREE from "three";
import React, { useEffect, useMemo } from "react";
import { useLogisticsStore } from "@/lib/logistics-store";
import { SITE_BY_ID } from "@/data/logistics/seed";
import { PALETTES } from "./palette";
import { SiteWorld } from "./SiteWorld";
import { Fleet } from "./Fleet";
import { SiteCameraRig } from "./SiteCameraRig";
import { WeatherEcosystem } from "./WeatherEcosystem";
import { LabelProjector } from "./LabelProjector";

const TICK_MS = 2000;

/** Drives the sim: one tick every 2 s, each worth playbackSpeed sim minutes. */
function SimClock() {
  useEffect(() => {
    // Reduced motion: the sim waits for an explicit Play instead of running on its own.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) useLogisticsStore.setState({ playbackState: "paused" });
  }, []);
  useEffect(() => {
    const id = setInterval(() => useLogisticsStore.getState().tick(), TICK_MS);
    return () => clearInterval(id);
  }, []);
  return null;
}

export function SiteScene() {
  const timeOfDay = useLogisticsStore((s) => s.timeOfDay);
  const weather = useLogisticsStore((s) => s.weather);
  const activeSiteId = useLogisticsStore((s) => s.activeSiteId);
  const pal = PALETTES[timeOfDay];
  const [ox, oz] = SITE_BY_ID[activeSiteId].origin;
  const sunTarget = useMemo(() => new THREE.Object3D(), []);
  // Falling snow and rain are pure motion; reduced motion keeps the snowy ground but drops the particles.
  const [reducedMotion] = React.useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [sx, sy, sz] = pal.sunDir as [number, number, number];

  return (
    <>
      <color attach="background" args={[pal.bg]} />
      <fog attach="fog" args={[pal.bg, 170, 460]} />
      <hemisphereLight args={[pal.hemiSky, pal.hemiGround, pal.hemi]} />
      {/* Shadow frustum follows the active site. */}
      <primitive object={sunTarget} position={[ox, 0, oz]} />
      <directionalLight
        castShadow
        target={sunTarget}
        position={[ox + sx, sy, oz + sz]}
        intensity={pal.sunIntensity}
        color={pal.sun}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-60}
        shadow-camera-right={60}
        shadow-camera-top={60}
        shadow-camera-bottom={-60}
        shadow-camera-near={1}
        shadow-camera-far={220}
        shadow-bias={-0.0004}
        shadow-normalBias={0.04}
      />

      <SiteCameraRig />
      <SimClock />
      <SiteWorld pal={pal} snowy={weather === "snow"} autumn={weather === "autumn"} />
      <Fleet />
      <LabelProjector />
      {!reducedMotion && (
        <group position={[ox, 0, oz]}>
          <WeatherEcosystem />
        </group>
      )}
    </>
  );
}
