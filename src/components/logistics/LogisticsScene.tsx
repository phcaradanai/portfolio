"use client";

import * as THREE from "three";
import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useLogisticsStore } from "@/lib/logistics-store";
import { VehicleEntities } from "./VehicleEntities";
import { WeatherEcosystem } from "./WeatherEcosystem";
import { LogisticsCameraDirector } from "./LogisticsCameraDirector";
import { WarehouseConveyorAndScanner } from "./WarehouseConveyorAndScanner";
import { MegaHubDivertChutes } from "./MegaHubDivertChutes";
import { HighwayGantrySign } from "./HighwayGantrySign";
import { LogisticsRouteArc } from "./LogisticsRouteArc";

export function LogisticsScene() {
  const timeOfDay = useLogisticsStore((state) => state.timeOfDay);

  const isNight = timeOfDay === "night";
  const isSunset = timeOfDay === "sunset";

  // Dynamic light colors based on time of day
  const lightConfig = useMemo(() => {
    if (isNight) {
      return {
        ambientColor: "#1e293b",
        ambientIntensity: 0.95,
        sunColor: "#7dd3fc",
        sunIntensity: 1.8,
        sunPos: [10, 18, 12] as [number, number, number],
        hemiSky: "#38bdf8",
        hemiGround: "#030712",
        hemiIntensity: 1.1,
        fogColor: "#0b0e1a",
      };
    }
    if (isSunset) {
      return {
        ambientColor: "#3b1d32",
        ambientIntensity: 1.05,
        sunColor: "#fb923c",
        sunIntensity: 2.2,
        sunPos: [18, 9, 14] as [number, number, number],
        hemiSky: "#fdba74",
        hemiGround: "#180d1e",
        hemiIntensity: 1.0,
        fogColor: "#221124",
      };
    }
    return {
      ambientColor: "#f1f5f9",
      ambientIntensity: 1.1,
      sunColor: "#fffbeb",
      sunIntensity: 2.4,
      sunPos: [14, 22, 12] as [number, number, number],
      hemiSky: "#bae6fd",
      hemiGround: "#334155",
      hemiIntensity: 1.0,
      fogColor: "#121728",
    };
  }, [isNight, isSunset]);

  const sorterRingRef = useRef<THREE.Group>(null);
  const waterRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (sorterRingRef.current) {
      sorterRingRef.current.rotation.y = t * 0.8;
    }
    if (waterRef.current) {
      const mat = waterRef.current.material as THREE.MeshStandardMaterial;
      mat.roughness = 0.15 + Math.sin(t * 1.5) * 0.05;
    }
  });

  return (
    <group>
      {/* Dynamic Lighting System: Sky Hemisphere + Ambient + Directional Key Sun */}
      <ambientLight color={lightConfig.ambientColor} intensity={lightConfig.ambientIntensity} />
      <hemisphereLight
        args={[lightConfig.hemiSky, lightConfig.hemiGround, lightConfig.hemiIntensity]}
      />
      <directionalLight
        castShadow
        position={lightConfig.sunPos}
        intensity={lightConfig.sunIntensity}
        color={lightConfig.sunColor}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-18}
        shadow-camera-right={18}
        shadow-camera-top={18}
        shadow-camera-bottom={-18}
        shadow-bias={-0.0002}
      />

      {/* Cyberpunk Key Lights for Night Mode */}
      {isNight && (
        <>
          {/* Warehouse Floodlights */}
          <pointLight position={[-5.8, 1.8, -3.6]} color="#38bdf8" intensity={4.5} distance={14} />
          <pointLight position={[-5.8, 0.8, -3.6]} color="#fbbf24" intensity={2.8} distance={9} />

          {/* Sorter Core Tower Floodlight */}
          <pointLight position={[-1.2, 2.2, -1.5]} color="#00cec9" intensity={4.0} distance={14} />

          {/* Harbor & Airport Gateway Floodlight */}
          <pointLight position={[6.8, 2.6, -2.5]} color="#54a0ff" intensity={4.5} distance={16} />

          {/* Urban Residential District Light */}
          <pointLight position={[3.6, 2.4, 4.5]} color="#10b981" intensity={3.5} distance={12} />
        </>
      )}

      {/* Camera Director */}
      <LogisticsCameraDirector />

      {/* ======================================================== */}
      {/* 1. TERRAIN BASE & FOUNDATION                             */}
      {/* ======================================================== */}
      <mesh receiveShadow position={[0, -0.2, 0]}>
        <boxGeometry args={[24, 0.4, 20]} />
        <meshStandardMaterial
          color={isNight ? "#0d1322" : isSunset ? "#1d1429" : "#1e293b"}
          roughness={0.5}
          metalness={0.3}
        />
      </mesh>

      {/* Holographic Cyber Grid Overlay */}
      <gridHelper
        args={[24, 24, isNight ? "#0284c7" : "#64748b", isNight ? "#162036" : "#cbd5e1"]}
        position={[0, 0.005, 0]}
      />

      {/* Island Perimeter Neon Trim Border */}
      <mesh position={[0, 0.012, 0]}>
        <ringGeometry args={[11.9, 12.02, 4]} />
        <meshBasicMaterial color={isNight ? "#38bdf8" : "rgba(255,255,255,0.4)"} />
      </mesh>

      {/* Harbor Water Basin on East edge */}
      <mesh ref={waterRef} receiveShadow position={[7.8, -0.05, 0.8]}>
        <boxGeometry args={[4.8, 0.15, 6.2]} />
        <meshStandardMaterial
          color={isNight ? "#0284c7" : "#0284c7"}
          roughness={0.15}
          metalness={0.85}
        />
      </mesh>

      {/* Dock Quay Concrete Edge */}
      <mesh receiveShadow position={[5.25, 0.03, 0.8]}>
        <boxGeometry args={[0.3, 0.12, 6.2]} />
        <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.6} />
      </mesh>

      {/* Airport Runway Asphalt on Northeast */}
      <mesh receiveShadow position={[6.8, 0.015, -4.5]} rotation={[0, -0.4, 0]}>
        <boxGeometry args={[3.2, 0.02, 6.5]} />
        <meshStandardMaterial color="#1a1c24" roughness={0.7} metalness={0.2} />
      </mesh>

      {/* Runway painted centerline stripes */}
      {[-2, -1, 0, 1, 2].map((off) => (
        <mesh key={`rw-${off}`} position={[6.8 + off * 0.38, 0.028, -4.5 + off * 0.9]} rotation={[0, -0.4, 0]}>
          <boxGeometry args={[0.15, 0.01, 0.6]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      ))}

      {/* Runway green threshold landing lights */}
      {[-1.2, -0.6, 0, 0.6, 1.2].map((tx) => (
        <mesh key={`thresh-${tx}`} position={[6.8 + tx * 0.9, 0.035, -7.2]} rotation={[0, -0.4, 0]}>
          <boxGeometry args={[0.1, 0.02, 0.1]} />
          <meshBasicMaterial color="#10b981" />
        </mesh>
      ))}

      {/* Oval Highway Road Circuit */}
      <mesh receiveShadow position={[0, 0.01, 0]}>
        <ringGeometry args={[7.1, 8.1, 48]} />
        <meshStandardMaterial
          color="#1e2233"
          roughness={0.6}
          metalness={0.3}
        />
      </mesh>

      {/* Neon Road Guide lines */}
      <mesh position={[0, 0.02, 0]}>
        <ringGeometry args={[7.58, 7.62, 48]} />
        <meshBasicMaterial color={isNight ? "#38bdf8" : "rgba(255,255,255,0.5)"} />
      </mesh>

      {/* ======================================================== */}
      {/* 2. FACILITY 1: ICHEON FULFILLMENT CENTER (Warehouse)     */}
      {/* ======================================================== */}
      <group position={[-5.8, 0, -3.6]}>
        {/* Main Warehouse Floor with illuminated safety border */}
        <mesh receiveShadow position={[0, 0.02, 0]}>
          <boxGeometry args={[4.6, 0.04, 3.8]} />
          <meshStandardMaterial color={isNight ? "#1a233a" : "#2b3452"} roughness={0.3} metalness={0.4} />
        </mesh>

        {/* Floor Perimeter Safety Line */}
        <mesh position={[0, 0.045, 0]}>
          <ringGeometry args={[2.3, 2.35, 4]} />
          <meshBasicMaterial color={isNight ? "#38bdf8" : "#f59e0b"} />
        </mesh>

        {/* High-Bay Storage Racks (Tiered Shelves) */}
        {[-1.4, -0.5, 0.5, 1.4].map((rx, idx) => (
          <group key={`rack-${idx}`} position={[rx, 0.75, 0]}>
            {/* Structural Steel Rack Posts */}
            <mesh castShadow receiveShadow>
              <boxGeometry args={[0.45, 1.5, 3.2]} />
              <meshStandardMaterial color={isNight ? "#243254" : "#3b4869"} roughness={0.3} metalness={0.7} />
            </mesh>

            {/* Glowing Rack Aisle LED Strip */}
            <mesh position={[0, 0.76, 0]}>
              <boxGeometry args={[0.08, 0.04, 3.1]} />
              <meshBasicMaterial color="#38bdf8" />
            </mesh>

            {/* Illuminated SKU boxes on shelves */}
            {[-1.0, 0, 1.0].map((rz) => (
              <mesh key={`box-${rz}`} position={[0, 0.2, rz]}>
                <boxGeometry args={[0.38, 0.28, 0.45]} />
                <meshStandardMaterial
                  color={idx === 1 ? "#f472b6" : idx === 2 ? "#38bdf8" : "#fbbf24"}
                  emissive={idx === 1 ? "#f472b6" : idx === 2 ? "#38bdf8" : "#fbbf24"}
                  emissiveIntensity={isNight ? 1.2 : 0.5}
                />
              </mesh>
            ))}
          </group>
        ))}

        {/* Warehouse 4 Corner Steel Columns */}
        {(
          [
            [-2.2, 0.9, -1.8],
            [2.2, 0.9, -1.8],
            [-2.2, 0.9, 1.8],
            [2.2, 0.9, 1.8],
          ] as [number, number, number][]
        ).map(([cx, cy, cz], ci) => (
          <mesh key={`col-${ci}`} position={[cx, cy, cz]}>
            <boxGeometry args={[0.12, 1.8, 0.12]} />
            <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.6} />
          </mesh>
        ))}

        {/* Warehouse Glass Skylight Canopy (NO castShadow to prevent blackouts) */}
        <mesh position={[0, 1.82, 0]}>
          <boxGeometry args={[4.7, 0.06, 3.9]} />
          <meshStandardMaterial
            color="#38bdf8"
            transparent
            opacity={0.16}
            roughness={0.1}
            metalness={0.2}
          />
        </mesh>

        {/* Perimeter Roof Frame */}
        <mesh position={[0, 1.85, 0]}>
          <boxGeometry args={[4.76, 0.08, 0.08]} />
          <meshStandardMaterial color="#0284c7" emissive="#0284c7" emissiveIntensity={0.8} />
        </mesh>

        {/* Facility Signboard */}
        <mesh position={[0, 1.95, 1.95]}>
          <boxGeometry args={[2.6, 0.38, 0.08]} />
          <meshStandardMaterial
            color="#0284c7"
            emissive="#0284c7"
            emissiveIntensity={isNight ? 1.8 : 0.8}
          />
        </mesh>
      </group>

      {/* ======================================================== */}
      {/* 3. FACILITY 2: GONJIAM MEGA HUB (Cross-Belt Sorter)      */}
      {/* ======================================================== */}
      <group position={[-1.2, 0, -1.5]}>
        {/* Hub Foundation */}
        <mesh receiveShadow position={[0, 0.15, 0]}>
          <cylinderGeometry args={[2.2, 2.4, 0.3, 24]} />
          <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.6} />
        </mesh>

        {/* High-speed Rotating Cross-Belt Sorter Loop */}
        <group ref={sorterRingRef} position={[0, 0.5, 0]}>
          <mesh receiveShadow>
            <torusGeometry args={[1.5, 0.12, 12, 32]} />
            <meshStandardMaterial
              color="#00cec9"
              emissive="#00cec9"
              emissiveIntensity={isNight ? 1.2 : 0.4}
              roughness={0.2}
              metalness={0.8}
            />
          </mesh>

          {/* Sorter induction trays carrying packages */}
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const angle = (i / 6) * Math.PI * 2;
            return (
              <mesh
                key={`tray-${i}`}
                position={[Math.cos(angle) * 1.5, 0.14, Math.sin(angle) * 1.5]}
              >
                <boxGeometry args={[0.24, 0.14, 0.24]} />
                <meshStandardMaterial
                  color={i === 2 ? "#f43f5e" : "#fbbf24"}
                  emissive={i === 2 ? "#f43f5e" : "#fbbf24"}
                  emissiveIntensity={isNight ? 1.2 : 0.3}
                />
              </mesh>
            );
          })}
        </group>

        {/* Central Dispatch Core Tower */}
        <mesh castShadow position={[0, 1.2, 0]}>
          <cylinderGeometry args={[0.45, 0.6, 2.1, 16]} />
          <meshStandardMaterial color="#64748b" roughness={0.2} metalness={0.9} />
        </mesh>

        {/* Central Dispatch Beacon Sphere */}
        <mesh position={[0, 2.3, 0]}>
          <sphereGeometry args={[0.18, 16, 16]} />
          <meshStandardMaterial
            color="#00cec9"
            emissive="#00cec9"
            emissiveIntensity={isNight ? 2.5 : 0.8}
          />
        </mesh>
      </group>

      {/* ======================================================== */}
      {/* 4. FACILITY 6: RESIDENTIAL URBAN DELIVERY & SMART LOCKER */}
      {/* ======================================================== */}
      <group position={[3.6, 0, 4.5]}>
        {/* Urban city buildings with illuminated windows */}
        <mesh castShadow receiveShadow position={[-0.8, 1.2, 0]}>
          <boxGeometry args={[1.2, 2.4, 1.2]} />
          <meshStandardMaterial color="#334155" roughness={0.2} metalness={0.8} />
        </mesh>
        <mesh castShadow receiveShadow position={[0.7, 1.6, -0.4]}>
          <boxGeometry args={[1.1, 3.2, 1.1]} />
          <meshStandardMaterial color="#1e293b" roughness={0.2} metalness={0.85} />
        </mesh>

        {/* Window Matrices */}
        {[-0.4, 0.4].map((wx) => (
          <mesh key={`win-${wx}`} position={[0.7 + wx * 0.4, 2.2, 0.16]}>
            <boxGeometry args={[0.2, 1.2, 0.02]} />
            <meshStandardMaterial
              color="#fbbf24"
              emissive="#fbbf24"
              emissiveIntensity={isNight ? 1.4 : 0.4}
            />
          </mesh>
        ))}

        {/* Smart Delivery Locker Pod on street level */}
        <mesh castShadow position={[0.3, 0.35, 1.1]}>
          <boxGeometry args={[1.2, 0.7, 0.35]} />
          <meshStandardMaterial
            color="#10b981"
            emissive="#10b981"
            emissiveIntensity={isNight ? 1.0 : 0.3}
          />
        </mesh>

        {/* Drone Rooftop Vertiport Pad */}
        <mesh position={[0.7, 3.22, -0.4]}>
          <cylinderGeometry args={[0.5, 0.5, 0.04, 16]} />
          <meshBasicMaterial color="#fbbf24" />
        </mesh>
      </group>

      {/* 5. WAREHOUSE MOTORIZED CONVEYOR & OPTICAL BARCODE SCANNER ARCH */}
      <WarehouseConveyorAndScanner />

      {/* 6. GONJIAM MEGA HUB SPIRAL DIVERT CHUTES & TRUCK LOADING DOCKS */}
      <MegaHubDivertChutes />

      {/* 7. HIGHWAY OVERHEAD GANTRY SIGN (ROUTE 1) & STREET LIGHTS */}
      <HighwayGantrySign />

      {/* 8. DYNAMIC 3D PACKAGE TRAJECTORY SPLINE & PHOTON ARC */}
      <LogisticsRouteArc />

      {/* Active Vehicles (AMRs, Line-haul Trucks, Drone, Cargo Plane, Ship) */}
      <VehicleEntities />

      {/* Weather Ecosystem (Rain, Snow, Autumn Leaves) */}
      <WeatherEcosystem />
    </group>
  );
}