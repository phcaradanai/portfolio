"use client";

import React from "react";
import { useLogisticsStore } from "@/lib/logistics-store";

export function MegaHubDivertChutes() {
  const isNight = useLogisticsStore((state) => state.timeOfDay === "night");

  return (
    <group position={[-1.2, 0, -1.5]}>
      {/* 1. SPIRAL / DIVERT CHUTE #12 (Sloping outward to South Loading Bay) */}
      <group position={[0.8, 0.32, 1.2]} rotation={[0.22, 0.45, -0.28]}>
        {/* Chute bed */}
        <mesh receiveShadow>
          <boxGeometry args={[0.38, 0.05, 1.6]} />
          <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Chute side flanges */}
        <mesh position={[-0.19, 0.05, 0]}>
          <boxGeometry args={[0.02, 0.1, 1.6]} />
          <meshStandardMaterial color={isNight ? "#00cec9" : "#64748b"} metalness={0.9} />
        </mesh>
        <mesh position={[0.19, 0.05, 0]}>
          <boxGeometry args={[0.02, 0.1, 1.6]} />
          <meshStandardMaterial color={isNight ? "#00cec9" : "#64748b"} metalness={0.9} />
        </mesh>
        {/* Package sliding down chute */}
        <mesh position={[0, 0.08, 0.2]}>
          <boxGeometry args={[0.2, 0.14, 0.2]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.3} />
        </mesh>
      </group>

      {/* 2. DIVERT CHUTE #14 (Sloping Northwest toward Secondary Bay) */}
      <group position={[-1.1, 0.35, -0.6]} rotation={[-0.2, -0.65, 0.25]}>
        <mesh receiveShadow>
          <boxGeometry args={[0.38, 0.05, 1.4]} />
          <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[-0.19, 0.05, 0]}>
          <boxGeometry args={[0.02, 0.1, 1.4]} />
          <meshStandardMaterial color={isNight ? "#00cec9" : "#64748b"} metalness={0.9} />
        </mesh>
        <mesh position={[0.19, 0.05, 0]}>
          <boxGeometry args={[0.02, 0.1, 1.4]} />
          <meshStandardMaterial color={isNight ? "#00cec9" : "#64748b"} metalness={0.9} />
        </mesh>
      </group>

      {/* 3. TRUCK LOADING DOCKS (Dock Bay Doors & Safety Bumpers) */}
      <group position={[1.4, 0, 1.8]}>
        {/* Concrete Dock Foundation */}
        <mesh receiveShadow position={[0, 0.2, 0]}>
          <boxGeometry args={[2.2, 0.4, 1.2]} />
          <meshStandardMaterial color="#1e293b" roughness={0.5} metalness={0.4} />
        </mesh>

        {/* Dock Bay Doors (Roll-up corrugated doors) */}
        {[-0.6, 0.6].map((dx, di) => (
          <group key={`dock-door-${di}`} position={[dx, 0.55, 0.58]}>
            <mesh>
              <boxGeometry args={[0.8, 0.8, 0.04]} />
              <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.3} />
            </mesh>
            {/* Bay Number Digital Sign */}
            <mesh position={[0, 0.48, 0.03]}>
              <boxGeometry args={[0.4, 0.12, 0.02]} />
              <meshBasicMaterial color="#38bdf8" />
            </mesh>
            {/* Rubber Yellow/Black Dock Bumpers */}
            <mesh position={[-0.38, -0.3, 0.08]}>
              <boxGeometry args={[0.06, 0.35, 0.08]} />
              <meshStandardMaterial color="#eab308" />
            </mesh>
            <mesh position={[0.38, -0.3, 0.08]}>
              <boxGeometry args={[0.06, 0.35, 0.08]} />
              <meshStandardMaterial color="#eab308" />
            </mesh>
          </group>
        ))}

        {/* Staged Parked Delivery Semi-Truck at Bay #1 */}
        <group position={[-0.6, 0.32, 1.6]}>
          {/* Trailer backed into bay */}
          <mesh castShadow position={[0, 0.22, -0.2]}>
            <boxGeometry args={[0.68, 0.7, 1.4]} />
            <meshStandardMaterial color="#f1f5f9" roughness={0.3} metalness={0.6} />
          </mesh>
          {/* Tractor Cab */}
          <mesh castShadow position={[0, 0.12, 0.75]}>
            <boxGeometry args={[0.64, 0.5, 0.5]} />
            <meshStandardMaterial color="#0284c7" roughness={0.2} metalness={0.8} />
          </mesh>
        </group>
      </group>
    </group>
  );
}
