"use client";

import * as THREE from "three";
import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useLogisticsStore } from "@/lib/logistics-store";

/** Autonomous Mobile Robot (AMR) inside warehouse */
function AmrRobot({
  aisleX,
  startZ,
  endZ,
  speed,
  phase,
  color = "#7cf5e6",
}: {
  aisleX: number;
  startZ: number;
  endZ: number;
  speed: number;
  phase: number;
  color?: string;
}) {
  const amrRef = useRef<THREE.Group>(null);
  const beaconRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime * speed + phase;
    const range = endZ - startZ;
    const progress = (Math.sin(t) + 1) * 0.5;
    const curZ = startZ + progress * range;

    if (amrRef.current) {
      amrRef.current.position.set(aisleX, 0.12, curZ);
      // Turn direction based on forward/backward velocity
      const dir = Math.cos(t) >= 0 ? 0 : Math.PI;
      amrRef.current.rotation.y = dir;
    }

    if (beaconRef.current) {
      const mat = beaconRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.6 + Math.sin(state.clock.elapsedTime * 6.0) * 0.4;
    }
  });

  return (
    <group ref={amrRef}>
      {/* Low-profile chassis */}
      <mesh castShadow position={[0, 0.08, 0]}>
        <boxGeometry args={[0.55, 0.16, 0.75]} />
        <meshStandardMaterial color="#1e293b" roughness={0.2} metalness={0.8} />
      </mesh>

      {/* Side LED strips */}
      <mesh position={[-0.28, 0.08, 0]}>
        <boxGeometry args={[0.02, 0.06, 0.65]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh position={[0.28, 0.08, 0]}>
        <boxGeometry args={[0.02, 0.06, 0.65]} />
        <meshBasicMaterial color={color} />
      </mesh>

      {/* Payload container on top */}
      <mesh castShadow position={[0, 0.24, 0]}>
        <boxGeometry args={[0.45, 0.18, 0.55]} />
        <meshStandardMaterial
          color="#f59e0b"
          emissive="#f59e0b"
          emissiveIntensity={0.2}
          roughness={0.3}
          metalness={0.4}
        />
      </mesh>

      {/* Lidar sensor dome */}
      <mesh ref={beaconRef} position={[0, 0.38, 0.18]}>
        <cylinderGeometry args={[0.07, 0.07, 0.09, 12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.2} />
      </mesh>
    </group>
  );
}

/** Line-haul highway semi truck */
function HighwayTruck({
  circuitRadius = 7.5,
  speed = 0.35,
  offsetPhase = 0,
  containerColor = "#3867d6",
}: {
  circuitRadius?: number;
  speed?: number;
  offsetPhase?: number;
  containerColor?: string;
}) {
  const truckRef = useRef<THREE.Group>(null);
  const isNight = useLogisticsStore((state) => state.timeOfDay === "night");

  useFrame((state) => {
    const t = state.clock.elapsedTime * speed + offsetPhase;
    // Oval highway track:
    const x = Math.cos(t) * circuitRadius;
    const z = Math.sin(t) * (circuitRadius * 0.65);

    if (truckRef.current) {
      truckRef.current.position.set(x, 0.28, z);
      // Tangent angle
      const dx = -Math.sin(t) * circuitRadius;
      const dz = Math.cos(t) * (circuitRadius * 0.65);
      truckRef.current.rotation.y = Math.atan2(dx, dz);
    }
  });

  return (
    <group ref={truckRef}>
      {/* Tractor cab */}
      <mesh castShadow position={[0, 0.22, 0.65]}>
        <boxGeometry args={[0.65, 0.5, 0.6]} />
        <meshStandardMaterial color="#f5f6fa" roughness={0.15} metalness={0.85} />
      </mesh>

      {/* Cargo container trailer */}
      <mesh castShadow position={[0, 0.34, -0.35]}>
        <boxGeometry args={[0.7, 0.72, 1.4]} />
        <meshStandardMaterial color={containerColor} roughness={0.25} metalness={0.7} />
      </mesh>

      {/* Dual Headlights */}
      <mesh position={[-0.22, 0.16, 0.98]}>
        <boxGeometry args={[0.1, 0.08, 0.04]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#fff8e7"
          emissiveIntensity={isNight ? 2.0 : 0.6}
        />
      </mesh>
      <mesh position={[0.22, 0.16, 0.98]}>
        <boxGeometry args={[0.1, 0.08, 0.04]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#fff8e7"
          emissiveIntensity={isNight ? 2.0 : 0.6}
        />
      </mesh>

      {/* Headlight road spot cone in night mode */}
      {isNight && (
        <spotLight
          position={[0, 0.3, 1.0]}
          target-position={[0, 0, 4.0]}
          intensity={1.8}
          distance={6}
          angle={0.45}
          penumbra={0.5}
          color="#fff8e7"
        />
      )}
    </group>
  );
}

/** Last-mile delivery drone */
function DeliveryDrone() {
  const droneRef = useRef<THREE.Group>(null);
  const rotorsRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (droneRef.current) {
      // Hovering sine oscillation over delivery pad
      const hoverY = 2.4 + Math.sin(t * 2.2) * 0.18;
      const swayX = 4.8 + Math.sin(t * 1.1) * 0.15;
      const swayZ = 4.2 + Math.cos(t * 1.4) * 0.15;
      droneRef.current.position.set(swayX, hoverY, swayZ);
      droneRef.current.rotation.z = Math.sin(t * 1.1) * 0.08;
    }

    if (rotorsRef.current) {
      rotorsRef.current.rotation.y = t * 24.0;
    }
  });

  return (
    <group ref={droneRef} position={[4.8, 2.4, 4.2]}>
      {/* Central body hub */}
      <mesh castShadow>
        <boxGeometry args={[0.35, 0.12, 0.35]} />
        <meshStandardMaterial color="#2c3e50" roughness={0.2} metalness={0.9} />
      </mesh>

      {/* Suspended payload package */}
      <mesh castShadow position={[0, -0.22, 0]}>
        <boxGeometry args={[0.22, 0.2, 0.22]} />
        <meshStandardMaterial
          color="#e67e22"
          emissive="#e67e22"
          emissiveIntensity={0.4}
        />
      </mesh>

      {/* 4 Carbon fiber rotor arms */}
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[0.85, 0.03, 0.06]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.9} />
      </mesh>
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[0.06, 0.03, 0.85]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.9} />
      </mesh>

      {/* Spinning rotor discs */}
      <group ref={rotorsRef}>
        <mesh position={[0.42, 0.08, 0]}>
          <cylinderGeometry args={[0.16, 0.16, 0.01, 8]} />
          <meshBasicMaterial color="#7cf5e6" transparent opacity={0.5} />
        </mesh>
        <mesh position={[-0.42, 0.08, 0]}>
          <cylinderGeometry args={[0.16, 0.16, 0.01, 8]} />
          <meshBasicMaterial color="#7cf5e6" transparent opacity={0.5} />
        </mesh>
        <mesh position={[0, 0.08, 0.42]}>
          <cylinderGeometry args={[0.16, 0.16, 0.01, 8]} />
          <meshBasicMaterial color="#7cf5e6" transparent opacity={0.5} />
        </mesh>
        <mesh position={[0, 0.08, -0.42]}>
          <cylinderGeometry args={[0.16, 0.16, 0.01, 8]} />
          <meshBasicMaterial color="#7cf5e6" transparent opacity={0.5} />
        </mesh>
      </group>
    </group>
  );
}

/** Air Cargo Freighter at Airport Tarmac */
function AirCargoFreighter() {
  const strobeRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (strobeRef.current) {
      const mat = strobeRef.current.material as THREE.MeshStandardMaterial;
      const flash = Math.sin(state.clock.elapsedTime * 8.0) > 0.8 ? 2.5 : 0.1;
      mat.emissiveIntensity = flash;
    }
  });

  return (
    <group position={[6.8, 0.65, -4.5]} rotation={[0, -0.4, 0]}>
      {/* Fuselage */}
      <mesh castShadow rotation={[Math.PI * 0.5, 0, 0]}>
        <cylinderGeometry args={[0.45, 0.45, 4.2, 16]} />
        <meshStandardMaterial color="#f8f9fa" roughness={0.15} metalness={0.85} />
      </mesh>

      {/* Cockpit nose cone */}
      <mesh position={[0, 0.05, 2.3]} rotation={[Math.PI * 0.5, 0, 0]}>
        <coneGeometry args={[0.45, 0.8, 16]} />
        <meshStandardMaterial color="#f8f9fa" roughness={0.15} metalness={0.85} />
      </mesh>

      {/* Main wings */}
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[4.8, 0.08, 0.9]} />
        <meshStandardMaterial color="#dfe4ea" roughness={0.2} metalness={0.8} />
      </mesh>

      {/* Tail fin */}
      <mesh position={[0, 0.7, -1.8]}>
        <boxGeometry args={[0.08, 1.1, 0.75]} />
        <meshStandardMaterial color="#00d2d3" roughness={0.2} metalness={0.8} />
      </mesh>

      {/* Red strobe beacon on top of tail */}
      <mesh ref={strobeRef} position={[0, 1.3, -1.8]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="#ff4757" emissive="#ff4757" emissiveIntensity={1.0} />
      </mesh>
    </group>
  );
}

/** Container Cargo Vessel & Gantry Crane at Port */
function PortContainerShip() {
  const hoistRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (hoistRef.current) {
      // Gentle hoist cable bobbing
      const t = state.clock.elapsedTime;
      hoistRef.current.position.y = 1.35 + Math.sin(t * 1.5) * 0.12;
    }
  });

  return (
    <group position={[7.2, 0.3, 0.8]}>
      {/* Ship Hull */}
      <mesh castShadow position={[0, 0.25, 0]}>
        <boxGeometry args={[1.5, 0.55, 4.5]} />
        <meshStandardMaterial color="#2f3542" roughness={0.3} metalness={0.7} />
      </mesh>

      {/* Ship bridge / superstructure */}
      <mesh castShadow position={[0, 0.8, -1.8]}>
        <boxGeometry args={[1.4, 0.9, 0.7]} />
        <meshStandardMaterial color="#ecf0f1" roughness={0.2} metalness={0.8} />
      </mesh>

      {/* Bridge windows */}
      <mesh position={[0, 1.05, -1.44]}>
        <boxGeometry args={[1.2, 0.2, 0.05]} />
        <meshBasicMaterial color="#38bdf8" />
      </mesh>

      {/* Stacked containers on deck */}
      {/* Tier 1 */}
      <mesh position={[-0.32, 0.65, -0.6]}>
        <boxGeometry args={[0.55, 0.45, 1.1]} />
        <meshStandardMaterial color="#e74c3c" roughness={0.3} metalness={0.5} />
      </mesh>
      <mesh position={[0.32, 0.65, -0.6]}>
        <boxGeometry args={[0.55, 0.45, 1.1]} />
        <meshStandardMaterial color="#0284c7" roughness={0.3} metalness={0.5} />
      </mesh>
      <mesh position={[-0.32, 0.65, 0.6]}>
        <boxGeometry args={[0.55, 0.45, 1.1]} />
        <meshStandardMaterial color="#10b981" roughness={0.3} metalness={0.5} />
      </mesh>
      <mesh position={[0.32, 0.65, 0.6]}>
        <boxGeometry args={[0.55, 0.45, 1.1]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.3} metalness={0.5} />
      </mesh>

      {/* Tier 2 */}
      <mesh position={[-0.32, 1.12, 0]}>
        <boxGeometry args={[0.55, 0.45, 1.1]} />
        <meshStandardMaterial color="#6366f1" roughness={0.3} metalness={0.5} />
      </mesh>

      {/* High-fidelity Gantry Crane along quay */}
      <group position={[-1.45, 1.4, 0]}>
        {/* Twin yellow A-frame steel lattice legs */}
        <mesh position={[-0.45, 0.1, -1.0]}>
          <boxGeometry args={[0.12, 3.0, 0.12]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.8} roughness={0.25} />
        </mesh>
        <mesh position={[-0.45, 0.1, 1.0]}>
          <boxGeometry args={[0.12, 3.0, 0.12]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.8} roughness={0.25} />
        </mesh>
        <mesh position={[0.45, 0.1, -1.0]}>
          <boxGeometry args={[0.12, 3.0, 0.12]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.8} roughness={0.25} />
        </mesh>
        <mesh position={[0.45, 0.1, 1.0]}>
          <boxGeometry args={[0.12, 3.0, 0.12]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.8} roughness={0.25} />
        </mesh>

        {/* Lower cross tie beams */}
        <mesh position={[0, -0.6, -1.0]}>
          <boxGeometry args={[0.9, 0.1, 0.1]} />
          <meshStandardMaterial color="#d97706" metalness={0.7} />
        </mesh>
        <mesh position={[0, -0.6, 1.0]}>
          <boxGeometry args={[0.9, 0.1, 0.1]} />
          <meshStandardMaterial color="#d97706" metalness={0.7} />
        </mesh>

        {/* Upper horizontal boom extending out over ship */}
        <mesh position={[0.5, 1.55, 0]}>
          <boxGeometry args={[2.4, 0.22, 0.35]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Operator control cabin */}
        <mesh position={[-0.3, 1.35, 0.3]}>
          <boxGeometry args={[0.3, 0.35, 0.3]} />
          <meshStandardMaterial color="#ffffff" roughness={0.3} />
        </mesh>

        {/* Hoist Trolley, Cables, and Suspended 20ft Container */}
        <group ref={hoistRef} position={[0.8, 1.35, 0]}>
          {/* Trolley cart on boom */}
          <mesh position={[0, 0.1, 0]}>
            <boxGeometry args={[0.4, 0.08, 0.4]} />
            <meshStandardMaterial color="#1e293b" metalness={0.9} />
          </mesh>

          {/* 4 Steel wire hoist cables */}
          {[-0.18, 0.18].map((cx) =>
            [-0.3, 0.3].map((cz) => (
              <mesh key={`cable-${cx}-${cz}`} position={[cx, -0.55, cz]}>
                <cylinderGeometry args={[0.008, 0.008, 1.1, 6]} />
                <meshStandardMaterial color="#94a3b8" metalness={0.95} />
              </mesh>
            ))
          )}

          {/* Spreader Frame */}
          <mesh position={[0, -1.1, 0]}>
            <boxGeometry args={[0.56, 0.06, 1.12]} />
            <meshStandardMaterial color="#f59e0b" metalness={0.8} />
          </mesh>

          {/* Suspended Red Shipping Container */}
          <mesh castShadow position={[0, -1.35, 0]}>
            <boxGeometry args={[0.54, 0.44, 1.1]} />
            <meshStandardMaterial color="#ef4444" roughness={0.3} metalness={0.6} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

export function VehicleEntities() {
  return (
    <group>
      {/* 4 AMRs inside Icheon Fulfillment Center */}
      <AmrRobot aisleX={-6.8} startZ={-4.8} endZ={-2.4} speed={1.2} phase={0} color="#7cf5e6" />
      <AmrRobot aisleX={-5.6} startZ={-4.8} endZ={-2.4} speed={0.9} phase={1.4} color="#ffd470" />
      <AmrRobot aisleX={-4.4} startZ={-4.8} endZ={-2.4} speed={1.4} phase={2.8} color="#7cf5e6" />
      <AmrRobot aisleX={-3.2} startZ={-4.8} endZ={-2.4} speed={1.0} phase={4.1} color="#ff7aa8" />

      {/* 2 Line-haul trucks on highway network */}
      <HighwayTruck circuitRadius={7.6} speed={0.4} offsetPhase={0} containerColor="#3867d6" />
      <HighwayTruck circuitRadius={7.6} speed={0.4} offsetPhase={Math.PI} containerColor="#e55039" />

      {/* Intermodal Gateways: Air cargo plane & Container ship */}
      <AirCargoFreighter />
      <PortContainerShip />

      {/* Last-mile urban delivery drone */}
      <DeliveryDrone />
    </group>
  );
}
