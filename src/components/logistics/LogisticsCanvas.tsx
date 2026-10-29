"use client";

import React from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { useLogisticsStore } from "@/lib/logistics-store";
import { SITE_BY_ID } from "@/data/logistics/seed";
import { PALETTES } from "./palette";
import { SiteScene } from "./SiteScene";
import { CAMERA_OFFSET } from "./SiteCameraRig";

/** Software WebGL (no GPU): redraw a few times a second instead of every frame. */
function SoftwareTicker() {
  const invalidate = useThree((s) => s.invalidate);
  React.useEffect(() => {
    const id = setInterval(() => invalidate(), 250);
    return () => clearInterval(id);
  }, [invalidate]);
  return null;
}

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
  const [coarse] = React.useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(pointer: coarse)").matches,
  );
  const [ox, oz] = SITE_BY_ID[useLogisticsStore.getState().activeSiteId].origin;
  const box = React.useRef<HTMLDivElement>(null);
  // Mount when the stage nears the viewport and stop drawing while it is off-screen.
  const [near, setNear] = React.useState(false);
  const [seen, setSeen] = React.useState(false);
  const [software, setSoftware] = React.useState(false);
  React.useEffect(() => {
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        setNear(!!e?.isIntersecting);
        if (e?.isIntersecting) setSeen(true);
      },
      { rootMargin: "300px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={box}
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
      {seen && (
        <Canvas
          frameloop={!near ? "never" : software ? "demand" : "always"}
          onCreated={({ gl }) => {
            const ctx = gl.getContext();
            const info = ctx.getExtension("WEBGL_debug_renderer_info");
            const renderer = info
              ? String(ctx.getParameter(info.UNMASKED_RENDERER_WEBGL))
              : "";
            if (/swiftshader|llvmpipe|software/i.test(renderer)) {
              gl.shadowMap.enabled = false;
              gl.setPixelRatio(1);
              setSoftware(true);
            }
          }}
          camera={{
            fov: 32,
            near: 0.5,
            far: 900,
            position: [
              ox + CAMERA_OFFSET[0],
              CAMERA_OFFSET[1],
              oz + CAMERA_OFFSET[2],
            ],
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
          {software && near && <SoftwareTicker />}
        </Canvas>
      )}
    </div>
  );
}
