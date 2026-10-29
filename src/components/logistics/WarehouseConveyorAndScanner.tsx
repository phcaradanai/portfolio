"use client";

import * as THREE from "three";
import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useLogisticsStore } from "@/lib/logistics-store";

export function WarehouseConveyorAndScanner() {
  const isNight = useLogisticsStore((state) => state.timeOfDay === "night");

  // Animated packages on the motorized conveyor belt
  const box1Ref = useRef<THREE.Mesh>(null);
  const box2Ref = useRef<THREE.Mesh>(null);
  const box3Ref = useRef<THREE.Mesh>(null);
  const laserBeamRef = useRef<THREE.Mesh>(null);

  // Conveyor path vector from [-4.0, 0.22, -3.2] to [-2.1, 0.22, -1.9]
  const pStart = new THREE.Vector3(-4.2, 0.22, -3.3);
  const pEnd = new THREE.Vector3(-2.1, 0.22, -1.9);

  useFrame((state) => {
    const t = state.clock.elapsedTime * 0.45;

    // Move 3 boxes with phase offsets
    const moveBox = (ref: React.RefObject<THREE.Mesh | null>, phase: number) => {
      if (!ref.current) return;
      const progress = (t + phase) % 1;
      ref.current.position.lerpVectors(pStart, pEnd, progress);
      // Small vertical jiggle from rollers
      ref.current.position.y = 0.28 + Math.sin(progress * Math.PI * 16) * 0.005;
    };

    moveBox(box1Ref, 0.0);
    moveBox(box2Ref, 0.33);
    moveBox(box3Ref, 0.66);

    // Laser scanning pulse oscillation
    if (laserBeamRef.current) {
      const mat = laserBeamRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.4 + Math.sin(state.clock.elapsedTime * 9.0) * 0.3;
    }
  });

  return (
    <group>
      {/* 1. MOTORIZED CONVEYOR BED */}
      <group position={[-3.15, 0.16, -2.6]} rotation={[0, -0.58, 0]}>
        {/* Conveyor Bed Slab */}
        <mesh receiveShadow position={[0, 0, 0]}>
          <boxGeometry args={[0.55, 0.12, 2.6]} />
          <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.8} />
        </mesh>

        {/* Dual Side Steel Guard Rails */}
        <mesh position={[-0.29, 0.08, 0]}>
          <boxGeometry args={[0.03, 0.14, 2.6]} />
          <meshStandardMaterial color="#38bdf8" roughness={0.2} metalness={0.9} />
        </mesh>
        <mesh position={[0.29, 0.08, 0]}>
          <boxGeometry args={[0.03, 0.14, 2.6]} />
          <meshStandardMaterial color="#38bdf8" roughness={0.2} metalness={0.9} />
        </mesh>

        {/* Motorized Rollers */}
        {[-1.1, -0.8, -0.5, -0.2, 0.1, 0.4, 0.7, 1.0].map((rz) => (
          <mesh key={`roller-${rz}`} position={[0, 0.065, rz]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.02, 0.02, 0.52, 8]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.15} />
          </mesh>
        ))}

        {/* Conveyor Support Legs to ground */}
        {[-0.9, 0.9].map((lz) => (
          <group key={`cleg-${lz}`} position={[0, -0.1, lz]}>
            <mesh position={[-0.22, 0, 0]}>
              <boxGeometry args={[0.04, 0.2, 0.04]} />
              <meshStandardMaterial color="#475569" metalness={0.8} />
            </mesh>
            <mesh position={[0.22, 0, 0]}>
              <boxGeometry args={[0.04, 0.2, 0.04]} />
              <meshStandardMaterial color="#475569" metalness={0.8} />
            </mesh>
          </group>
        ))}
      </group>

      {/* 2. OPTICAL BARCODE SCANNER ARCH (360° LiDAR / Barcode Gate) */}
      <group position={[-3.15, 0.22, -2.6]} rotation={[0, -0.58, 0]}>
        {/* Left Vertical Post */}
        <mesh position={[-0.34, 0.35, 0]}>
          <boxGeometry args={[0.06, 0.7, 0.08]} />
          <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Right Vertical Post */}
        <mesh position={[0.34, 0.35, 0]}>
          <boxGeometry args={[0.06, 0.7, 0.08]} />
          <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Overhead Bridge */}
        <mesh position={[0, 0.7, 0]}>
          <boxGeometry args={[0.74, 0.08, 0.12]} />
          <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Neon Status Ring Trim */}
        <mesh position={[0, 0.45, 0]}>
          <boxGeometry args={[0.72, 0.58, 0.02]} />
          <meshBasicMaterial
            color={isNight ? "#00cec9" : "#0284c7"}
            wireframe
          />
        </mesh>

        {/* Optical Barcode Scanning Laser Sheet (Pulsing Red/Pink Laser Beam) */}
        <mesh ref={laserBeamRef} position={[0, 0.32, 0]} rotation={[Math.PI * 0.05, 0, 0]}>
          <planeGeometry args={[0.54, 0.48]} />
          <meshBasicMaterial
            color="#f43f5e"
            transparent
            opacity={0.55}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Top Status LED */}
        <mesh position={[0, 0.76, 0]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshBasicMaterial color="#10b981" />
        </mesh>
      </group>

      {/* 3. MOVING SKU PARCELS ON CONVEYOR */}
      <mesh ref={box1Ref} castShadow>
        <boxGeometry args={[0.26, 0.18, 0.26]} />
        <meshStandardMaterial
          color="#f59e0b"
          emissive="#f59e0b"
          emissiveIntensity={isNight ? 0.35 : 0.1}
          roughness={0.4}
        />
      </mesh>
      <mesh ref={box2Ref} castShadow>
        <boxGeometry args={[0.22, 0.22, 0.28]} />
        <meshStandardMaterial
          color="#38bdf8"
          emissive="#38bdf8"
          emissiveIntensity={isNight ? 0.45 : 0.15}
          roughness={0.4}
        />
      </mesh>
      <mesh ref={box3Ref} castShadow>
        <boxGeometry args={[0.28, 0.15, 0.22]} />
        <meshStandardMaterial
          color="#10b981"
          emissive="#10b981"
          emissiveIntensity={isNight ? 0.35 : 0.1}
          roughness={0.4}
        />
      </mesh>
    </group>
  );
}
