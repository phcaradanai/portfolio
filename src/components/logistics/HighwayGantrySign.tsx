"use client";

import React from "react";
import { useLogisticsStore } from "@/lib/logistics-store";

export function HighwayGantrySign() {
  const isNight = useLogisticsStore((state) => state.timeOfDay === "night");

  return (
    <group>
      {/* 1. OVERHEAD HIGHWAY GANTRY SIGN (Crossing Route 1 at South Arc) */}
      <group position={[0, 0, 4.88]}>
        {/* Left Steel Column Post */}
        <mesh position={[-1.35, 0.9, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 1.8, 8]} />
          <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.3} />
        </mesh>

        {/* Right Steel Column Post */}
        <mesh position={[1.35, 0.9, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 1.8, 8]} />
          <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.3} />
        </mesh>

        {/* Overhead Horizontal Truss Beam */}
        <mesh position={[0, 1.72, 0]}>
          <boxGeometry args={[2.8, 0.12, 0.14]} />
          <meshStandardMaterial color="#334155" metalness={0.85} roughness={0.2} />
        </mesh>

        {/* Highway Signboard (Green Express Highway Guide) */}
        <mesh position={[0, 1.48, 0]}>
          <boxGeometry args={[2.3, 0.42, 0.06]} />
          <meshStandardMaterial
            color="#047857"
            emissive="#047857"
            emissiveIntensity={isNight ? 0.6 : 0.15}
            roughness={0.3}
          />
        </mesh>

        {/* White Signboard Border Trim */}
        <mesh position={[0, 1.48, 0.035]}>
          <boxGeometry args={[2.24, 0.36, 0.01]} />
          <meshBasicMaterial color="#ffffff" wireframe />
        </mesh>

        {/* Digital Matrix / Telematics LED display box on top */}
        <mesh position={[0.65, 1.84, 0]}>
          <boxGeometry args={[0.9, 0.16, 0.08]} />
          <meshStandardMaterial
            color="#0f172a"
            emissive="#f59e0b"
            emissiveIntensity={isNight ? 1.4 : 0.4}
          />
        </mesh>
      </group>

      {/* 2. HIGHWAY STREET LIGHT POLES AROUND PERIMETER */}
      {(
        [
          [-5.8, 0, 3.2],
          [5.8, 0, 3.2],
          [-5.8, 0, -2.8],
          [5.8, 0, -2.8],
        ] as [number, number, number][]
      ).map(([lx, ly, lz], i) => (
        <group key={`lamp-${i}`} position={[lx, ly, lz]}>
          {/* Vertical Pole */}
          <mesh position={[0, 1.0, 0]}>
            <cylinderGeometry args={[0.03, 0.04, 2.0, 8]} />
            <meshStandardMaterial color="#64748b" metalness={0.8} />
          </mesh>
          {/* Curved Arm */}
          <mesh position={[lx > 0 ? -0.2 : 0.2, 1.95, 0]}>
            <boxGeometry args={[0.4, 0.04, 0.04]} />
            <meshStandardMaterial color="#64748b" metalness={0.8} />
          </mesh>
          {/* Luminaire Head */}
          <mesh position={[lx > 0 ? -0.38 : 0.38, 1.92, 0]}>
            <boxGeometry args={[0.1, 0.03, 0.06]} />
            <meshBasicMaterial color={isNight ? "#fde047" : "#e2e8f0"} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
