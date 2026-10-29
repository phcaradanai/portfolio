"use client";

import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrthographicCamera, ContactShadows } from "@react-three/drei";
import { IslandScene } from "./IslandScene";
import { CameraDirector } from "./CameraDirector";

export function WorldCanvas({
  scrollProgress,
  customWaypoint,
  onSelectMonument,
  className = "",
  style,
}: {
  scrollProgress?: number;
  customWaypoint?: string;
  onSelectMonument?: (slug: string) => void;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`world-canvas-container ${className}`}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        background: "#101326",
        borderRadius: "2px",
        overflow: "hidden",
        ...style,
      }}
    >
      <Canvas
        shadows
        dpr={[1, 2]}
        performance={{ min: 0.5 }}
        gl={{ antialias: true, powerPreference: "high-performance", alpha: false }}
      >
        <OrthographicCamera
          makeDefault
          position={[22, 18, 22]}
          zoom={44}
          near={-100}
          far={200}
        />

        <color attach="background" args={["#101326"]} />
        <fog attach="fog" args={["#101326", 26, 72]} />

        {/* Ambient & Directional Key Lighting */}
        <ambientLight intensity={0.65} color="#d8e8ff" />
        <hemisphereLight args={["#9efcf0", "#261b3d", 0.55]} />
        <directionalLight
          castShadow
          position={[16, 26, 14]}
          intensity={1.65}
          color="#fff4e0"
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-14}
          shadow-camera-right={14}
          shadow-camera-top={14}
          shadow-camera-bottom={-14}
          shadow-bias={-0.0005}
        />
        <pointLight position={[-8, 6, -8]} intensity={1.2} color="#7cf5e6" distance={24} />
        <pointLight position={[8, 6, -8]} intensity={1.2} color="#ff9ec4" distance={24} />

        <CameraDirector scrollProgress={scrollProgress} customWaypoint={customWaypoint} />

        <IslandScene onSelectMonument={onSelectMonument} />

        <ContactShadows
          position={[0, -0.01, 0]}
          opacity={0.5}
          scale={24}
          blur={2.2}
          far={8}
          color="#070914"
        />
      </Canvas>
    </div>
  );
}
