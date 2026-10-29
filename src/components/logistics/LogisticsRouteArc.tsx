"use client";

import * as THREE from "three";
import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useLogisticsStore } from "@/lib/logistics-store";

// Node waypoints corresponding to journey stages
const STAGE_WAYPOINTS: [number, number, number][] = [
  [-5.4, 0.35, -3.4], // 0: Order Ingestion / High-Bay Racks
  [-4.0, 0.35, -2.8], // 1: AMR Shelf Retrieval / Conveyor
  [-1.2, 0.65, -1.5], // 2: Gonjiam Mega Hub Sorter Ring
  [0.8, 0.35, 0.6],   // 3: Line-Haul Highway Expressway
  [6.4, 0.65, 0.8],   // 4: Intermodal Sea Port / Air Cargo
  [3.8, 1.4, 3.8],    // 5: Urban Micro-Fulfillment / Drone Vertiport
  [3.6, 0.4, 4.5],    // 6: Final Destination Smart Locker
];

export function LogisticsRouteArc() {
  const activeStage = useLogisticsStore((state) => state.activeStage);
  const timeOfDay = useLogisticsStore((state) => state.timeOfDay);
  const isNight = timeOfDay === "night";

  // Arc curve connecting previous/current node to next node
  const { curve, points } = useMemo(() => {
    const fromIdx = Math.max(0, activeStage - 1);
    const toIdx = Math.min(STAGE_WAYPOINTS.length - 1, activeStage);

    const p0 = new THREE.Vector3(...(STAGE_WAYPOINTS[fromIdx] ?? STAGE_WAYPOINTS[0]!));
    const p2 = new THREE.Vector3(...(STAGE_WAYPOINTS[toIdx] ?? STAGE_WAYPOINTS[0]!));

    // Midpoint with parabolic height arc
    const mid = new THREE.Vector3().addVectors(p0, p2).multiplyScalar(0.5);
    const dist = p0.distanceTo(p2);
    mid.y += Math.max(1.2, dist * 0.35);

    const bezier = new THREE.QuadraticBezierCurve3(p0, mid, p2);
    const pts = bezier.getPoints(40);
    return { curve: bezier, points: pts };
  }, [activeStage]);

  // Traveling photon pulse along the curve
  const photonRef = useRef<THREE.Mesh>(null);
  const arcLineRef = useRef<THREE.Line>(null);

  useFrame((state) => {
    const t = (state.clock.elapsedTime * 0.85) % 1;
    if (photonRef.current && curve) {
      const pos = curve.getPointAt(t);
      photonRef.current.position.copy(pos);
    }
  });

  const lineGeometry = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [points]);

  return (
    <group>
      {/* Dynamic 3D Trajectory Laser Arc */}
      <primitive object={new THREE.Line(
        lineGeometry,
        new THREE.LineBasicMaterial({
          color: isNight ? "#38bdf8" : "#0284c7",
          linewidth: 2,
          transparent: true,
          opacity: 0.85,
        })
      )} ref={arcLineRef} />

      {/* Pulsing Photon Energy Particle */}
      <mesh ref={photonRef}>
        <sphereGeometry args={[0.12, 12, 12]} />
        <meshBasicMaterial color="#7cf5e6" />
      </mesh>

      {/* Target Node Beacon Ring */}
      <mesh
        position={STAGE_WAYPOINTS[activeStage] ?? [0, 0, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[0.35, 0.45, 24]} />
        <meshBasicMaterial
          color={isNight ? "#00cec9" : "#0284c7"}
          transparent
          opacity={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
