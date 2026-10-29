"use client";

import * as THREE from "three";
import React, { useMemo, useRef, useState, useCallback } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { EvidenceBeam } from "./EvidenceBeam";
import { useExperience } from "@/components/experience/ExperienceProvider";

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
  slug: string;
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
    slug: "ai-kingdom",
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
    slug: "ai-kingdom",
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
    slug: "chatgpt-mcp",
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
    slug: "cursed-market",
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
    slug: "relic-tide",
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
    slug: "print-ops",
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
    slug: "scopeflow",
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
    slug: "codescape",
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
    slug: "enterprise-vault",
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

const _baseEmissive = new THREE.Color("#000000");
const _hoverEmissive = new THREE.Color();
const _dummyObj = new THREE.Object3D();

function useIsometricGridTexture() {
  return useMemo(() => {
    if (typeof document === "undefined") return null;
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.fillStyle = "#161a32";
    ctx.fillRect(0, 0, 512, 512);

    ctx.strokeStyle = "rgba(168, 224, 255, 0.12)";
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

    ctx.strokeStyle = "rgba(124, 245, 230, 0.35)";
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
    tex.anisotropy = 4;
    return tex;
  }, []);
}

function NaturalParticleEcosystem() {
  const leavesRef = useRef<THREE.InstancedMesh>(null);
  const dustRef = useRef<THREE.Points>(null);

  const leafSeeds = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => ({
        angle: i * 2.39996,
        radius: 1.4 + (i % 14) * 0.38,
        yBase: 0.6 + (i % 8) * 0.35,
        speed: 0.32 + (i % 5) * 0.07,
        phase: i * 0.71,
        scale: 0.08 + (i % 4) * 0.02,
      })),
    []
  );

  const dustPositions = useMemo(() => {
    const arr = new Float32Array(96 * 3);
    for (let i = 0; i < 96; i++) {
      const a = i * 2.39996;
      const r = 0.8 + (i % 20) * 0.28;
      arr[i * 3] = Math.cos(a) * r;
      arr[i * 3 + 1] = 0.3 + (i % 12) * 0.25;
      arr[i * 3 + 2] = Math.sin(a) * r;
    }
    return arr;
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (leavesRef.current) {
      leafSeeds.forEach((lf, idx) => {
        const driftX = Math.cos(lf.angle) * lf.radius + Math.sin(t * lf.speed + lf.phase) * 0.75;
        const driftZ = Math.sin(lf.angle) * lf.radius + Math.cos(t * lf.speed * 0.8 + lf.phase) * 0.75;
        const fallY = lf.yBase + Math.sin(t * lf.speed * 1.3 + lf.phase) * 0.35;
        _dummyObj.position.set(driftX, fallY, driftZ);
        _dummyObj.rotation.set(t * 1.5 + lf.phase, t * 1.1 + lf.phase, Math.sin(t * 2.0 + lf.phase) * 0.6);
        _dummyObj.scale.set(lf.scale * 1.3, lf.scale * 0.3, lf.scale);
        _dummyObj.updateMatrix();
        leavesRef.current!.setMatrixAt(idx, _dummyObj.matrix);
      });
      leavesRef.current.instanceMatrix.needsUpdate = true;
    }

    if (dustRef.current) {
      dustRef.current.rotation.y = t * 0.035;
      dustRef.current.position.y = Math.sin(t * 0.6) * 0.08;
    }
  });

  return (
    <group>
      <instancedMesh ref={leavesRef} args={[undefined, undefined, 40]} castShadow>
        <octahedronGeometry args={[1, 0]} />
        <meshPhysicalMaterial
          color="#ffb3d9"
          emissive="#7cf5e6"
          emissiveIntensity={0.25}
          roughness={0.08}
          metalness={0.88}
          clearcoat={1}
        />
      </instancedMesh>

      <points ref={dustRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[dustPositions, 3]} />
        </bufferGeometry>
        <pointsMaterial color="#fff6dc" size={0.08} transparent opacity={0.65} sizeAttenuation />
      </points>
    </group>
  );
}

function useMonumentBadgeTexture(title: string, accession: string, borderColor: string) {
  return useMemo(() => {
    if (typeof document === "undefined") return null;
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.clearRect(0, 0, 512, 128);

    // High-resolution rounded pill background
    const x = 16, y = 16, w = 480, h = 96, r = 18;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();

    ctx.fillStyle = "rgba(10, 14, 28, 0.94)";
    ctx.fill();

    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 5;
    ctx.stroke();

    // Badge Title & Accession
    ctx.fillStyle = "#f5f7ff";
    ctx.font = "bold 28px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`${title} · ${accession}`, 256, 64);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    return texture;
  }, [title, accession, borderColor]);
}

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

  const badgeTexture = useMonumentBadgeTexture(node.title, node.accession, node.emissiveHoverColor);

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
    [node, onSelect]
  );

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;

    if (groupRef.current) {
      const floatOffset = Math.sin(t * 2.0 + node.floatPhase) * node.floatAmp;
      groupRef.current.position.y = node.position[1] + floatOffset;
    }

    if (crownRef.current) {
      crownRef.current.rotation.y = t * 1.0 + node.floatPhase;
      crownRef.current.position.y = node.size[1] * 0.5 + 0.5 + Math.sin(t * 2.8 + node.floatPhase) * 0.05;
    }

    const camAzimuth = Math.atan2(state.camera.position.x, state.camera.position.z);
    const glintPeak = Math.pow(Math.max(0, Math.cos(camAzimuth * 3.0 + node.floatPhase)), 6);

    if (bodyMatRef.current) {
      const targetIntensity = (hovered ? 0.8 : isSelected ? 0.55 : 0.08) + glintPeak * 0.4;
      bodyMatRef.current.emissiveIntensity = THREE.MathUtils.damp(
        bodyMatRef.current.emissiveIntensity,
        targetIntensity,
        8.0,
        delta
      );
      _hoverEmissive.set(hovered || isSelected || glintPeak > 0.35 ? node.emissiveHoverColor : "#181d33");
      bodyMatRef.current.emissive.lerp(_hoverEmissive, 1 - Math.exp(-8.0 * delta));
    }

    if (reflectorMatRef.current) {
      reflectorMatRef.current.emissiveIntensity = (hovered || isSelected ? 1.0 : 0.25) + glintPeak * 0.9;
    }
  });

  return (
    <group ref={groupRef} position={node.position}>
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
          emissiveIntensity={hovered || isSelected ? 0.9 : 0.25}
          roughness={0.05}
          metalness={0.96}
          clearcoat={1}
          clearcoatRoughness={0.04}
        />
      </mesh>

      <mesh ref={crownRef} castShadow position={[0, node.size[1] * 0.5 + 0.5, 0]}>
        <octahedronGeometry args={[0.22, 0]} />
        <meshPhysicalMaterial
          color={node.emissiveHoverColor}
          emissive={node.emissiveHoverColor}
          emissiveIntensity={hovered || isSelected ? 1.4 : 0.6}
          roughness={0.04}
          metalness={0.96}
          clearcoat={1}
        />
      </mesh>

      {badgeTexture && (hovered || isSelected) && (
        <sprite
          position={[0, node.size[1] * 0.5 + 1.15, 0]}
          scale={[2.6, 0.65, 1]}
        >
          <spriteMaterial
            map={badgeTexture}
            transparent
            opacity={hovered || isSelected ? 1 : 0}
            depthTest={false}
          />
        </sprite>
      )}
    </group>
  );
}

export function IslandScene({
  selectedSlug,
  onSelectMonument,
}: {
  selectedSlug?: string;
  onSelectMonument?: (slug: string) => void;
}) {
  const { activeMonumentSlug, setActiveMonumentSlug } = useExperience();
  const currentSlug = selectedSlug ?? activeMonumentSlug ?? "cursed-market";

  const selectedNode = useMemo(() => {
    return MONUMENT_NODES.find((n) => n.slug === currentSlug) ?? MONUMENT_NODES[0]!;
  }, [currentSlug]);

  const handleSelect = useCallback(
    (node: MonumentNode) => {
      setActiveMonumentSlug(node.slug);
      if (onSelectMonument) onSelectMonument(node.slug);
    },
    [setActiveMonumentSlug, onSelectMonument]
  );

  const gridTexture = useIsometricGridTexture();
  const islandGroupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (islandGroupRef.current) {
      islandGroupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.05;
    }
  });

  return (
    <group ref={islandGroupRef}>
      <mesh receiveShadow position={[0, -0.2, 0]}>
        <boxGeometry args={[14.5, 0.4, 14.5]} />
        <meshStandardMaterial
          map={gridTexture || undefined}
          color="#222744"
          roughness={0.25}
          metalness={0.65}
        />
      </mesh>

      <mesh receiveShadow castShadow position={[0, -0.75, 0]}>
        <cylinderGeometry args={[10.2, 6.8, 0.75, 8]} />
        <meshStandardMaterial color="#13162b" roughness={0.5} metalness={0.4} flatShading />
      </mesh>

      {/* Holographic District Conduits */}
      {MONUMENT_NODES.filter((n) => n.id !== "command-core").map((n) => (
        <mesh key={`conduit-${n.id}`} position={[n.position[0] * 0.5, 0.02, n.position[2] * 0.5]}>
          <boxGeometry args={[Math.abs(n.position[0]) || 0.12, 0.02, Math.abs(n.position[2]) || 0.12]} />
          <meshStandardMaterial
            color={n.emissiveHoverColor}
            emissive={n.emissiveHoverColor}
            emissiveIntensity={0.4}
            transparent
            opacity={0.3}
          />
        </mesh>
      ))}

      <NaturalParticleEcosystem />

      {MONUMENT_NODES.map((node) => (
        <InteractiveMonument
          key={node.id}
          node={node}
          isSelected={node.slug === currentSlug}
          onSelect={handleSelect}
        />
      ))}

      {/* Red Thread Evidence Beam Connecting Selected Monument */}
      {selectedNode && (
        <EvidenceBeam
          startPos={[selectedNode.position[0], selectedNode.position[1] + selectedNode.size[1] * 0.5 + 0.6, selectedNode.position[2]]}
          targetPos={[0, 4.2, 0]}
          active={true}
        />
      )}
    </group>
  );
}
