"use client";

import * as THREE from "three";
import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useLogisticsStore } from "@/lib/logistics-store";

// Covers one site (largest is 84 x 60 m) around the group origin.
const SPREAD = 48;
const HEIGHT = 30;
const RAIN = 2400;
const SNOW = 1800;
const LEAVES = 120;

export function WeatherEcosystem() {
  const weather = useLogisticsStore((state) => state.weather);
  const rainRef = useRef<THREE.Points>(null);
  const snowRef = useRef<THREE.Points>(null);
  const leavesRef = useRef<THREE.InstancedMesh>(null);

  // Rain particle positions (deterministic pseudorandom)
  const rainPositions = useMemo(() => {
    const arr = new Float32Array(RAIN * 3);
    for (let i = 0; i < RAIN; i++) {
      const a = i * 1.61803;
      arr[i * 3] = Math.sin(a * 7.3) * SPREAD;
      arr[i * 3 + 1] = ((i * 3.7) % HEIGHT);
      arr[i * 3 + 2] = Math.cos(a * 5.1) * SPREAD;
    }
    return arr;
  }, []);

  // Snow particle positions (deterministic pseudorandom)
  const snowPositions = useMemo(() => {
    const arr = new Float32Array(SNOW * 3);
    for (let i = 0; i < SNOW; i++) {
      const a = i * 2.39996;
      arr[i * 3] = Math.sin(a * 4.9) * SPREAD;
      arr[i * 3 + 1] = ((i * 2.8) % HEIGHT);
      arr[i * 3 + 2] = Math.cos(a * 6.3) * SPREAD;
    }
    return arr;
  }, []);

  // Autumn leaves seeds (deterministic pseudorandom)
  const leafSeeds = useMemo(
    () =>
      Array.from({ length: LEAVES }, (_, i) => {
        const a = i * 2.39996;
        return {
          x: Math.sin(a * 3.7) * SPREAD,
          y: 2 + ((i * 4.1) % 8),
          z: Math.cos(a * 2.9) * SPREAD,
          speed: 0.6 + (i % 5) * 0.16,
          rotSpeed: 1 + (i % 4) * 0.4,
          phase: i * 0.62,
        };
      }),
    []
  );

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;

    // 1. Rain update
    if (rainRef.current && weather === "rain") {
      const geo = rainRef.current.geometry;
      const pos = geo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < RAIN; i++) {
        let y = pos.getY(i) - delta * 24;
        if (y < 0) y = HEIGHT;
        pos.setY(i, y);
      }
      pos.needsUpdate = true;
    }

    // 2. Snow update
    if (snowRef.current && weather === "snow") {
      const geo = snowRef.current.geometry;
      const pos = geo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < SNOW; i++) {
        let y = pos.getY(i) - delta * 2.2;
        let x = pos.getX(i) + Math.sin(t * 1.5 + i) * 0.02;
        if (y < 0) y = HEIGHT;
        pos.setY(i, y);
        pos.setX(i, x);
      }
      pos.needsUpdate = true;
    }

    // 3. Autumn leaves update
    if (leavesRef.current && weather === "autumn") {
      leafSeeds.forEach((leaf, i) => {
        const curY = ((leaf.y - t * leaf.speed) % 10) + 0.3;
        const curX = leaf.x + Math.sin(t * 1.2 + leaf.phase) * 0.8;
        const curZ = leaf.z + Math.cos(t * 0.9 + leaf.phase) * 0.8;

        dummy.position.set(curX, curY, curZ);
        dummy.rotation.set(t * leaf.rotSpeed, t * 1.2, t * 0.8);
        dummy.scale.setScalar(0.35);
        dummy.updateMatrix();
        leavesRef.current?.setMatrixAt(i, dummy.matrix);
      });
      leavesRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      {weather === "rain" && (
        <points ref={rainRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[rainPositions, 3]}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.18}
            color="#a8e6ff"
            transparent
            opacity={0.65}
            blending={THREE.AdditiveBlending}
          />
        </points>
      )}

      {weather === "snow" && (
        <points ref={snowRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[snowPositions, 3]}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.32}
            color="#ffffff"
            transparent
            opacity={0.8}
            blending={THREE.AdditiveBlending}
          />
        </points>
      )}

      {weather === "autumn" && (
        <instancedMesh ref={leavesRef} args={[undefined, undefined, LEAVES]}>
          <coneGeometry args={[0.8, 1.4, 3]} />
          <meshStandardMaterial
            color="#e67e22"
            roughness={0.4}
            metalness={0.1}
            side={THREE.DoubleSide}
          />
        </instancedMesh>
      )}
    </group>
  );
}
