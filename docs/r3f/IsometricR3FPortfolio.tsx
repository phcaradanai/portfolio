/**
 * Complete React Three Fiber (R3F) + @react-three/drei Isometric Portfolio Scene
 * Tailored for Phatcharadanai Kanyapan — Working Studio & Agent Command
 *
 * Dependencies when switching to full WebGL R3F bundle:
 *   npm install three @types/three @react-three/fiber @react-three/drei
 */

"use client";

import * as THREE from "three";
import React, { useMemo, useRef, useState, useCallback } from "react";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import {
  OrthographicCamera,
  ScrollControls,
  Scroll,
  useScroll,
  ContactShadows,
  Html,
} from "@react-three/drei";

/* ──────────────────────────────────────────────────────────────────────────
 * 1. PORTFOLIO ZONES & MONUMENT DATA (Guided by Phatcharadanai's 21 Repos + Vault)
 * ────────────────────────────────────────────────────────────────────────── */

export type ZoneWaypoint = {
  id: string;
  code: string;
  title: string;
  subtitle: string;
  lookAt: [number, number, number];
  cameraOffset: [number, number, number];
  azimuthRot: number;
  zoom: number;
};

export const ISLAND_ZONES: ZoneWaypoint[] = [
  {
    id: "core",
    code: "ZONE 00 · OVERVIEW",
    title: "Agent Command & Working Studio",
    subtitle: "21 verified repositories, 757 test files, and governed multi-agent pipelines.",
    lookAt: [0, 0.4, 0],
    cameraOffset: [22, 18, 22],
    azimuthRot: 0,
    zoom: 44,
  },
  {
    id: "command",
    code: "ZONE 01 · AI & MCP HARNESS",
    title: "AI Kingdom & Rust MCP Bridge",
    subtitle: "Decree-to-Done state machines, Grand Vizier councils, and path-confined Rust MCP tools.",
    lookAt: [-3.8, 0.8, -3.8],
    cameraOffset: [19, 16, 23],
    azimuthRot: 0.24,
    zoom: 56,
  },
  {
    id: "games",
    code: "ZONE 02 · AUTHORITATIVE GAME WORLDS",
    title: "Cursed Market, Relic Tide & The Fisher",
    subtitle: "Multiplayer economies, PixelLab sprite pipelines, and Depth-Anything-V2 shaders.",
    lookAt: [3.8, 0.8, -3.8],
    cameraOffset: [23, 16, 19],
    azimuthRot: -0.24,
    zoom: 56,
  },
  {
    id: "systems",
    code: "ZONE 03 · SYSTEMS, HARDWARE & TOOLS",
    title: "PrintOps, ScopeFlow & Vending Serial API",
    subtitle: "969-file IPP gateways, Tauri/Rust desktop tools, and 3-port RS-232/MQTT/NATS controllers.",
    lookAt: [-3.8, 0.8, 3.8],
    cameraOffset: [20, 16, 22],
    azimuthRot: 0.18,
    zoom: 56,
  },
  {
    id: "vault",
    code: "ZONE 04 · PRIVATE VAULT & ENTERPRISE",
    title: "Beyond the Public Wall — Direct Inquiry",
    subtitle: "Private Go/Rust/Godot crates + PTT, SCG, SIPH, ETRAN, AOT records. Contact to ask for a walkthrough.",
    lookAt: [3.8, 0.8, 3.8],
    cameraOffset: [22, 16, 20],
    azimuthRot: -0.2,
    zoom: 58,
  },
];

export type MonumentNode = {
  id: string;
  accession: string;
  title: string;
  metric: string;
  position: [number, number, number];
  size: [number, number, number];
  baseColor: string;
  emissiveHoverColor: string;
  roughness: number;
  metalness: number;
  floatPhase: number;
  floatAmp: number;
  href: string;
};

export const MONUMENT_NODES: MonumentNode[] = [
  {
    id: "command-core",
    accession: "PK-2026-CMD",
    title: "Agent Command Core",
    metric: "757 Tests · 4,887 Files",
    position: [0, 1.5, 0],
    size: [1.5, 3.0, 1.5],
    baseColor: "#f3e8ff",
    emissiveHoverColor: "#7cf5e6",
    roughness: 0.06,
    metalness: 0.96,
    floatPhase: 0,
    floatAmp: 0.12,
    href: "/agents/#command-table",
  },
  {
    id: "ai-kingdom",
    accession: "PK-2026-004",
    title: "AI Kingdom",
    metric: "270 Commits · 154 Tests",
    position: [-3.6, 1.35, -3.4],
    size: [1.3, 2.7, 1.3],
    baseColor: "#d8f8f3",
    emissiveHoverColor: "#5ce1e6",
    roughness: 0.09,
    metalness: 0.92,
    floatPhase: 1.1,
    floatAmp: 0.08,
    href: "/works/ai-kingdom/",
  },
  {
    id: "chatgpt-mcp",
    accession: "PK-2026-013",
    title: "ChatGPT MCP (Rust)",
    metric: "9 Path-Confined Tools",
    position: [-5.4, 0.9, -2.4],
    size: [1.05, 1.8, 1.05],
    baseColor: "#d0eff5",
    emissiveHoverColor: "#7cf5e6",
    roughness: 0.12,
    metalness: 0.88,
    floatPhase: 2.0,
    floatAmp: 0.07,
    href: "/works/chatgpt-mcp/",
  },
  {
    id: "cursed-market",
    accession: "PK-2026-001",
    title: "Cursed Market",
    metric: "730 Files · 56 Tests",
    position: [3.6, 1.4, -3.4],
    size: [1.35, 2.8, 1.35],
    baseColor: "#ffe0ec",
    emissiveHoverColor: "#ff7aa8",
    roughness: 0.09,
    metalness: 0.91,
    floatPhase: 2.8,
    floatAmp: 0.09,
    href: "/works/cursed-market/",
  },
  {
    id: "relic-tide",
    accession: "PK-2026-002",
    title: "Relic Tide",
    metric: "387 Files · Depth-V2 Shader",
    position: [5.4, 1.25, -2.4],
    size: [1.2, 2.5, 1.2],
    baseColor: "#ffd6e7",
    emissiveHoverColor: "#ff9ec4",
    roughness: 0.1,
    metalness: 0.91,
    floatPhase: 3.6,
    floatAmp: 0.08,
    href: "/works/relic-tide/",
  },
  {
    id: "print-ops",
    accession: "PK-2026-003",
    title: "PrintOps Gateway",
    metric: "969 Files · 178 Tests",
    position: [-3.6, 1.45, 3.4],
    size: [1.35, 2.9, 1.35],
    baseColor: "#ddeaff",
    emissiveHoverColor: "#7aa8ff",
    roughness: 0.09,
    metalness: 0.92,
    floatPhase: 4.2,
    floatAmp: 0.08,
    href: "/works/print-ops/",
  },
  {
    id: "scopeflow",
    accession: "PK-2026-005",
    title: "ScopeFlow (Tauri + Rust)",
    metric: "405 Files · 106 Tests",
    position: [-5.4, 1.15, 2.4],
    size: [1.15, 2.3, 1.15],
    baseColor: "#e5dfff",
    emissiveHoverColor: "#b896ff",
    roughness: 0.1,
    metalness: 0.9,
    floatPhase: 5.0,
    floatAmp: 0.07,
    href: "/works/scopeflow/",
  },
  {
    id: "codescape",
    accession: "PK-2026-006",
    title: "CodeScape",
    metric: "290 Files · 57 Tests",
    position: [-2.4, 1.1, 5.2],
    size: [1.1, 2.2, 1.1],
    baseColor: "#e2dcff",
    emissiveHoverColor: "#9c88ff",
    roughness: 0.1,
    metalness: 0.9,
    floatPhase: 5.6,
    floatAmp: 0.07,
    href: "/works/codescape/",
  },
  {
    id: "enterprise-vault",
    accession: "PK-2020-CV5",
    title: "Private & Enterprise Vault",
    metric: "4 Crates + PTT, SCG, SIPH, ETRAN, AOT",
    position: [3.8, 1.25, 3.6],
    size: [1.45, 2.5, 1.45],
    baseColor: "#fff2cc",
    emissiveHoverColor: "#ffd470",
    roughness: 0.07,
    metalness: 0.95,
    floatPhase: 6.1,
    floatAmp: 0.09,
    href: "/agents/#vault-desk",
  },
];

/* ──────────────────────────────────────────────────────────────────────────
 * 2. PRE-ALLOCATED SCRATCH OBJECTS FOR 60FPS GC-FREE RENDER LOOP
 * ────────────────────────────────────────────────────────────────────────── */

const _targetLookAt = new THREE.Vector3();
const _currentLookAt = new THREE.Vector3(0, 0.4, 0);
const _targetCamPos = new THREE.Vector3();
const _baseEmissive = new THREE.Color("#000000");
const _hoverEmissive = new THREE.Color();
const _dummyObj = new THREE.Object3D();

/* ──────────────────────────────────────────────────────────────────────────
 * 3. PROCEDURAL ISOMETRIC GRID TEXTURE GENERATOR
 * ────────────────────────────────────────────────────────────────────────── */

function useIsometricGridTexture() {
  return useMemo(() => {
    if (typeof document === "undefined") return null;
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d")!;

    // Deep pastel-cyberpunk obsidian slate base
    ctx.fillStyle = "#191d36";
    ctx.fillRect(0, 0, 512, 512);

    // Fine grid lines
    ctx.strokeStyle = "rgba(168, 224, 255, 0.14)";
    ctx.lineWidth = 1;
    const step = 32;
    for (let i = 0; i <= 512; i += step) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 512);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(512, i);
      ctx.stroke();
    }

    // Micro-crosshairs (+) at major intersections
    ctx.strokeStyle = "rgba(124, 245, 230, 0.38)";
    ctx.lineWidth = 1.5;
    for (let x = 64; x < 512; x += 64) {
      for (let y = 64; y < 512; y += 64) {
        ctx.beginPath();
        ctx.moveTo(x - 4, y);
        ctx.lineTo(x + 4, y);
        ctx.moveTo(x, y - 4);
        ctx.lineTo(x, y + 4);
        ctx.stroke();
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 4);
    tex.anisotropy = 8;
    return tex;
  }, []);
}

/* ──────────────────────────────────────────────────────────────────────────
 * 4. SCROLL-DRIVEN ORTHOGRAPHIC ISOMETRIC CAMERA RIG
 * ────────────────────────────────────────────────────────────────────────── */

function ScrollIsometricCameraRig() {
  const scroll = useScroll();

  useFrame((state, delta) => {
    // Map scroll.offset (0..1) across the 5 zones
    const totalZones = ISLAND_ZONES.length - 1;
    const scaled = THREE.MathUtils.clamp(scroll.offset * totalZones, 0, totalZones);
    const idxA = Math.floor(scaled);
    const idxB = Math.min(totalZones, idxA + 1);
    const t = scaled - idxA;

    // Smoothstep interpolation between adjacent zone waypoints
    const smoothT = t * t * (3 - 2 * t);
    const zoneA = ISLAND_ZONES[idxA]!;
    const zoneB = ISLAND_ZONES[idxB]!;

    // Interpolate lookAt target
    _targetLookAt.set(
      THREE.MathUtils.lerp(zoneA.lookAt[0], zoneB.lookAt[0], smoothT),
      THREE.MathUtils.lerp(zoneA.lookAt[1], zoneB.lookAt[1], smoothT),
      THREE.MathUtils.lerp(zoneA.lookAt[2], zoneB.lookAt[2], smoothT),
    );

    // Subtle azimuth rotation around the isometric axis as user scrolls
    const azimuth = THREE.MathUtils.lerp(zoneA.azimuthRot, zoneB.azimuthRot, smoothT);
    const ox = THREE.MathUtils.lerp(zoneA.cameraOffset[0], zoneB.cameraOffset[0], smoothT);
    const oy = THREE.MathUtils.lerp(zoneA.cameraOffset[1], zoneB.cameraOffset[1], smoothT);
    const oz = THREE.MathUtils.lerp(zoneA.cameraOffset[2], zoneB.cameraOffset[2], smoothT);

    const cosA = Math.cos(azimuth);
    const sinA = Math.sin(azimuth);
    const rotX = ox * cosA - oz * sinA;
    const rotZ = ox * sinA + oz * cosA;

    _targetCamPos.set(
      _targetLookAt.x + rotX,
      _targetLookAt.y + oy,
      _targetLookAt.z + rotZ,
    );

    // Frame-rate independent exponential damping (60fps smooth)
    const dampLambda = 6.5;
    state.camera.position.x = THREE.MathUtils.damp(state.camera.position.x, _targetCamPos.x, dampLambda, delta);
    state.camera.position.y = THREE.MathUtils.damp(state.camera.position.y, _targetCamPos.y, dampLambda, delta);
    state.camera.position.z = THREE.MathUtils.damp(state.camera.position.z, _targetCamPos.z, dampLambda, delta);

    _currentLookAt.x = THREE.MathUtils.damp(_currentLookAt.x, _targetLookAt.x, dampLambda, delta);
    _currentLookAt.y = THREE.MathUtils.damp(_currentLookAt.y, _targetLookAt.y, dampLambda, delta);
    _currentLookAt.z = THREE.MathUtils.damp(_currentLookAt.z, _targetLookAt.z, dampLambda, delta);

    const targetZoom = THREE.MathUtils.lerp(zoneA.zoom, zoneB.zoom, smoothT);
    state.camera.zoom = THREE.MathUtils.damp(state.camera.zoom, targetZoom, dampLambda, delta);
    state.camera.lookAt(_currentLookAt);
    state.camera.updateProjectionMatrix();
  });

  return null;
}

/* ──────────────────────────────────────────────────────────────────────────
 * 5. INTERACTIVE 3D MONUMENT WITH LOW-ROUGHNESS HIGH-METALNESS PBR GLINT
 * ────────────────────────────────────────────────────────────────────────── */

function InteractiveMonument({
  node,
  isSelected,
  onSelect,
}: {
  node: MonumentNode;
  isSelected: boolean;
  onSelect: (node: MonumentNode) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const bodyMatRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const reflectorMatRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const crownRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const handlePointerOver = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(true);
    document.body.style.cursor = "pointer";
  }, []);

  const handlePointerOut = useCallback(() => {
    setHovered(false);
    document.body.style.cursor = "auto";
  }, []);

  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      onSelect(node);
    },
    [node, onSelect],
  );

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;

    // 1. Subtle Sine-Wave Floating Animation
    if (groupRef.current) {
      const floatOffset = Math.sin(t * 2.1 + node.floatPhase) * node.floatAmp;
      groupRef.current.position.y = node.position[1] + floatOffset;
    }

    // 2. Rotating Low-Poly Octahedron Crown
    if (crownRef.current) {
      crownRef.current.rotation.y = t * 1.1 + node.floatPhase;
      crownRef.current.position.y = node.size[1] * 0.5 + 0.55 + Math.sin(t * 3.0 + node.floatPhase) * 0.06;
    }

    // 3. Camera-Angle Specular Glint + Smooth Hover Emissive Transition (GC-free)
    const camAzimuth = Math.atan2(state.camera.position.x, state.camera.position.z);
    const glintPeak = Math.pow(Math.max(0, Math.cos(camAzimuth * 3.0 + node.floatPhase)), 6);

    if (bodyMatRef.current) {
      const targetIntensity = (hovered ? 0.85 : isSelected ? 0.55 : 0.08) + glintPeak * 0.45;
      bodyMatRef.current.emissiveIntensity = THREE.MathUtils.damp(
        bodyMatRef.current.emissiveIntensity,
        targetIntensity,
        8.0,
        delta,
      );
      _hoverEmissive.set(hovered || isSelected || glintPeak > 0.35 ? node.emissiveHoverColor : "#1b2038");
      bodyMatRef.current.emissive.lerp(_hoverEmissive, 1 - Math.exp(-8.0 * delta));
    }

    if (reflectorMatRef.current) {
      reflectorMatRef.current.emissiveIntensity = (hovered || isSelected ? 1.1 : 0.3) + glintPeak * 0.95;
    }
  });

  return (
    <group ref={groupRef} position={node.position}>
      {/* Main Low-Poly Stepped Tower Body with Low-Roughness High-Metalness Clearcoat PBR */}
      <mesh
        castShadow
        receiveShadow
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      >
        <boxGeometry args={node.size} />
        <meshPhysicalMaterial
          ref={bodyMatRef}
          color={node.baseColor}
          roughness={node.roughness}
          metalness={node.metalness}
          clearcoat={1}
          clearcoatRoughness={0.05}
          reflectivity={1}
          emissive={_baseEmissive}
          emissiveIntensity={0.08}
        />
      </mesh>

      {/* Upper Mirror-Chrome Setback Reflector Terrace (Roughness 0.05 / Metalness 0.96) */}
      <mesh
        castShadow
        receiveShadow
        position={[0, node.size[1] * 0.5 + 0.16, 0]}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      >
        <boxGeometry args={[node.size[0] * 0.72, 0.32, node.size[2] * 0.72]} />
        <meshPhysicalMaterial
          ref={reflectorMatRef}
          color="#ffffff"
          emissive={node.emissiveHoverColor}
          emissiveIntensity={hovered || isSelected ? 0.9 : 0.28}
          roughness={0.05}
          metalness={0.96}
          clearcoat={1}
          clearcoatRoughness={0.04}
        />
      </mesh>

      {/* Floating Low-Poly Octahedron Crystal Beacon */}
      <mesh ref={crownRef} castShadow position={[0, node.size[1] * 0.5 + 0.55, 0]}>
        <octahedronGeometry args={[0.24, 0]} />
        <meshPhysicalMaterial
          color={node.emissiveHoverColor}
          emissive={node.emissiveHoverColor}
          emissiveIntensity={hovered || isSelected ? 1.45 : 0.65}
          roughness={0.04}
          metalness={0.96}
          clearcoat={1}
        />
      </mesh>

      {/* Clean Micro-UI Floating Callout Badge */}
      <Html
        position={[0, node.size[1] * 0.5 + 1.05, 0]}
        center
        distanceFactor={18}
        style={{ pointerEvents: "none" }}
      >
        <div
          style={{
            padding: "4px 9px",
            background: hovered || isSelected ? "#f7f4eb" : "rgba(16, 19, 38, 0.9)",
            color: hovered || isSelected ? "#121624" : "#f5f7ff",
            border: `1.5px solid ${hovered || isSelected ? node.emissiveHoverColor : "rgba(255,255,255,0.28)"}`,
            borderRadius: "2px",
            fontFamily: "system-ui, sans-serif",
            fontSize: "11px",
            fontWeight: 700,
            whiteSpace: "nowrap",
            boxShadow: "0 6px 16px rgba(0,0,0,0.45)",
          }}
        >
          {node.title} · R{node.roughness.toFixed(2)} M{node.metalness.toFixed(2)}
        </div>
      </Html>
    </group>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
 * 6. NATURAL ECOSYSTEM PARTICLES: FLUTTERING 3D LEAVES & VOLUMETRIC DUST MOTES
 * ────────────────────────────────────────────────────────────────────────── */

function NaturalParticleEcosystem() {
  const leavesRef = useRef<THREE.InstancedMesh>(null);
  const dustRef = useRef<THREE.Points>(null);

  const leafSeeds = useMemo(
    () =>
      Array.from({ length: 48 }, (_, i) => ({
        angle: i * 2.39996,
        radius: 1.2 + (i % 16) * 0.42,
        yBase: 0.6 + (i % 9) * 0.38,
        speed: 0.35 + (i % 6) * 0.08,
        phase: i * 0.71,
        scale: 0.09 + (i % 4) * 0.025,
      })),
    [],
  );

  const dustPositions = useMemo(() => {
    const arr = new Float32Array(120 * 3);
    for (let i = 0; i < 120; i++) {
      const a = i * 2.39996;
      const r = 0.8 + (i % 24) * 0.3;
      arr[i * 3] = Math.cos(a) * r;
      arr[i * 3 + 1] = 0.3 + (i % 15) * 0.28;
      arr[i * 3 + 2] = Math.sin(a) * r;
    }
    return arr;
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (leavesRef.current) {
      leafSeeds.forEach((lf, idx) => {
        const driftX = Math.cos(lf.angle) * lf.radius + Math.sin(t * lf.speed + lf.phase) * 0.85;
        const driftZ = Math.sin(lf.angle) * lf.radius + Math.cos(t * lf.speed * 0.8 + lf.phase) * 0.85;
        const fallY = lf.yBase + Math.sin(t * lf.speed * 1.3 + lf.phase) * 0.45;
        _dummyObj.position.set(driftX, fallY, driftZ);
        _dummyObj.rotation.set(t * 1.6 + lf.phase, t * 1.2 + lf.phase, Math.sin(t * 2.1 + lf.phase) * 0.8);
        _dummyObj.scale.set(lf.scale * 1.4, lf.scale * 0.35, lf.scale);
        _dummyObj.updateMatrix();
        leavesRef.current!.setMatrixAt(idx, _dummyObj.matrix);
      });
      leavesRef.current.instanceMatrix.needsUpdate = true;
    }

    if (dustRef.current) {
      dustRef.current.rotation.y = t * 0.04;
      dustRef.current.position.y = Math.sin(t * 0.7) * 0.12;
    }
  });

  return (
    <group>
      {/* 48 Instanced 3D Tumbling Leaves / Sakura & Ginkgo Petals */}
      <instancedMesh ref={leavesRef} args={[undefined, undefined, 48]} castShadow>
        <octahedronGeometry args={[1, 0]} />
        <meshPhysicalMaterial
          color="#ffb3d9"
          emissive="#7cf5e6"
          emissiveIntensity={0.28}
          roughness={0.08}
          metalness={0.88}
          clearcoat={1}
        />
      </instancedMesh>

      {/* 120 Volumetric Atmospheric Dust Motes */}
      <points ref={dustRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[dustPositions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          color="#fff6dc"
          size={0.09}
          transparent
          opacity={0.72}
          sizeAttenuation
        />
      </points>
    </group>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
 * 7. FLOATING 3D ISLAND & ORGANIC CYBERPUNK FLORA
 * ────────────────────────────────────────────────────────────────────────── */

function FloatingStudioIsland({
  selectedId,
  onSelect,
}: {
  selectedId: string;
  onSelect: (node: MonumentNode) => void;
}) {
  const islandGroupRef = useRef<THREE.Group>(null);
  const gridTexture = useIsometricGridTexture();

  // Subtle breathing sine-wave for the entire floating island
  useFrame((state) => {
    if (islandGroupRef.current) {
      islandGroupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.85) * 0.06;
    }
  });

  return (
    <group ref={islandGroupRef}>
      {/* Upper Isometric Grid Deck */}
      <mesh receiveShadow position={[0, -0.2, 0]}>
        <boxGeometry args={[14.5, 0.4, 14.5]} />
        <meshStandardMaterial
          map={gridTexture}
          color="#24294a"
          roughness={0.22}
          metalness={0.68}
        />
      </mesh>

      {/* Lower Tapered Low-Poly Island Hull */}
      <mesh receiveShadow castShadow position={[0, -0.75, 0]}>
        <cylinderGeometry args={[10.2, 6.8, 0.75, 8]} />
        <meshStandardMaterial color="#15182e" roughness={0.45} metalness={0.45} flatShading />
      </mesh>

      {/* Holographic Data Conduits Connecting Central Core to All 4 Wings */}
      {MONUMENT_NODES.filter((n) => n.id !== "command-core").map((n) => (
        <mesh key={`conduit-${n.id}`} position={[n.position[0] * 0.5, 0.02, n.position[2] * 0.5]}>
          <boxGeometry args={[Math.abs(n.position[0]) || 0.12, 0.02, Math.abs(n.position[2]) || 0.12]} />
          <meshStandardMaterial
            color={n.emissiveHoverColor}
            emissive={n.emissiveHoverColor}
            emissiveIntensity={0.45}
            transparent
            opacity={0.35}
          />
        </mesh>
      ))}

      {/* Natural Ecosystem Particle Layer (Fluttering Leaves + Volumetric Dust Motes) */}
      <NaturalParticleEcosystem />

      {/* All Interactive 3D Project Monuments */}
      {MONUMENT_NODES.map((node) => (
        <InteractiveMonument
          key={node.id}
          node={node}
          isSelected={selectedId === node.id}
          onSelect={onSelect}
        />
      ))}
    </group>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
 * 7. COMPLETE R3F ISOMETRIC PORTFOLIO HERO COMPONENT
 * ────────────────────────────────────────────────────────────────────────── */

export function IsometricR3FPortfolio() {
  const [selected, setSelected] = useState<MonumentNode>(MONUMENT_NODES[0]!);

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh", background: "#101326" }}>
      <Canvas
        shadows
        dpr={[1, 2]}
        performance={{ min: 0.5 }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        {/* 1. True Isometric Orthographic Camera */}
        <OrthographicCamera
          makeDefault
          position={[22, 18, 22]}
          zoom={44}
          near={-100}
          far={200}
        />

        {/* 2. Octane-Inspired Pastel Holographic & Studio Lighting */}
        <color attach="background" args={["#101326"]} />
        <fog attach="fog" args={["#101326", 28, 68]} />
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
        <pointLight position={[-8, 6, -8]} intensity={1.2} color="#7cf5e6" distance={22} />
        <pointLight position={[8, 6, -8]} intensity={1.2} color="#ff9ec4" distance={22} />

        {/* 3. Scroll-Driven Camera & Floating 3D Island */}
        <ScrollControls pages={5} damping={0.18}>
          <ScrollIsometricCameraRig />
          <FloatingStudioIsland selectedId={selected.id} onSelect={setSelected} />
          <ContactShadows
            position={[0, -0.01, 0]}
            opacity={0.5}
            scale={24}
            blur={2.2}
            far={8}
            color="#070914"
          />

          {/* Overlaid Clean HTML Story Zones Synced with Scroll */}
          <Scroll html style={{ width: "100%" }}>
            {ISLAND_ZONES.map((zone, idx) => (
              <section
                key={zone.id}
                style={{
                  height: "100vh",
                  display: "flex",
                  alignItems: "center",
                  padding: "0 clamp(1.5rem, 5vw, 4rem)",
                  pointerEvents: "none",
                }}
              >
                <div
                  style={{
                    maxWidth: "24rem",
                    padding: "1.5rem",
                    background: "rgba(16, 19, 38, 0.9)",
                    color: "#f5f7ff",
                    border: "1px solid rgba(156, 246, 255, 0.28)",
                    borderRadius: "2px",
                    boxShadow: "0 16px 36px rgba(0, 0, 0, 0.55)",
                    pointerEvents: "auto",
                  }}
                >
                  <p style={{ fontFamily: "monospace", fontSize: "0.75rem", color: "#7cf5e6", margin: 0 }}>
                    {zone.code} (0{idx + 1}/05)
                  </p>
                  <h2 style={{ fontSize: "1.65rem", margin: "0.4rem 0" }}>{zone.title}</h2>
                  <p style={{ fontSize: "0.95rem", lineHeight: 1.55, color: "#c9d4f0" }}>{zone.subtitle}</p>
                  <a
                    href={selected.href}
                    style={{
                      display: "inline-block",
                      marginTop: "0.75rem",
                      padding: "0.6rem 1rem",
                      background: "#f7f4eb",
                      color: "#121624",
                      fontWeight: 700,
                      textDecoration: "none",
                      borderRadius: "2px",
                    }}
                  >
                    Inspect {selected.title} ({selected.metric}) →
                  </a>
                </div>
              </section>
            ))}
          </Scroll>
        </ScrollControls>
      </Canvas>
    </div>
  );
}
