"use client";

import React from "react";
import { Canvas } from "@react-three/fiber";
import { useLogisticsStore } from "@/lib/logistics-store";
import { SITE_BY_ID } from "@/data/logistics/seed";
import { PALETTES } from "./palette";
import { SiteScene } from "./SiteScene";
import { CAMERA_OFFSET } from "./SiteCameraRig";

export function LogisticsCanvas({
  className = "",
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  const timeOfDay = useLogisticsStore((state) => state.timeOfDay);

  const bgHex = PALETTES[timeOfDay].bg;
  // Phones and tablets: skip shadow maps and cap pixel ratio to keep the frame rate up.
  const [coarse] = React.useState(() => typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches);
  const [ox, oz] = SITE_BY_ID[useLogisticsStore.getState().activeSiteId].origin;

  return (
    <div
      className={`logistics-canvas-container ${className}`}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        background: bgHex,
        borderRadius: "2px",
        overflow: "hidden",
        transition: "background 500ms ease-out",
        ...style,
      }}
    >
      <Canvas
        camera={{
          fov: 32,
          near: 0.5,
          far: 900,
          position: [ox + CAMERA_OFFSET[0], CAMERA_OFFSET[1], oz + CAMERA_OFFSET[2]],
        }}
        shadows={!coarse}
        dpr={coarse ? [1, 1.5] : [1, 2]}
        performance={{ min: 0.5 }}
        gl={{
          antialias: true,
          powerPreference: "high-performance",
          alpha: false,
        }}
      >
        <SiteScene />
      </Canvas>
    </div>
  );
}
