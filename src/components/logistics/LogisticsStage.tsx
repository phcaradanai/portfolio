"use client";

import dynamic from "next/dynamic";
import React from "react";
import { SiteHUD } from "./SiteHUD";
import { SceneLabels } from "./SceneLabels";

const DynamicLogisticsCanvas = dynamic(
  () => import("./LogisticsCanvas").then((mod) => mod.LogisticsCanvas),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          width: "100%",
          height: "100%",
          minHeight: "clamp(34rem, 68vh, 56rem)",
          background: "#0b0e1a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "rgba(255,255,255,0.45)",
          fontFamily: "var(--font-mono, monospace)",
          fontSize: "12px",
          letterSpacing: "0.08em",
        }}
      >
        INITIALIZING 3D MULTI-MODAL LOGISTICS TWIN...
      </div>
    ),
  }
);

export function LogisticsStage() {
  return (
    // data-lenis-prevent: the wheel zooms the map inside the stage instead of scrolling the page.
    <div className="logistics-stage-wrapper" data-lenis-prevent>
      <DynamicLogisticsCanvas />
      <SceneLabels />
      <SiteHUD />
    </div>
  );
}
