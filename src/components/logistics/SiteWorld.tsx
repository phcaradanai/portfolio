"use client";

import * as THREE from "three";
import React, { useMemo } from "react";
import { Instance, Instances } from "@react-three/drei";
import { HIGHWAY_Z, SITES } from "@/data/logistics/seed";
import type { Site } from "@/data/logistics/types";
import type { Palette } from "./palette";

type V3 = [number, number, number];

function Box({ position, size, color, emissive, glow = 0, shadow = true }: {
  position: V3; size: V3; color: string; emissive?: string; glow?: number; shadow?: boolean;
}) {
  return (
    <mesh position={position} castShadow={shadow} receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} emissive={emissive ?? "#000000"} emissiveIntensity={glow} roughness={0.85} />
    </mesh>
  );
}

function Strip({ x, z, w, d, color, y = 0.02 }: { x: number; z: number; w: number; d: number; color: string; y?: number }) {
  return (
    <mesh position={[x, y, z]} rotation-x={-Math.PI / 2} receiveShadow>
      <planeGeometry args={[w, d]} />
      <meshStandardMaterial color={color} roughness={0.95} />
    </mesh>
  );
}

/** Cheap deterministic jitter so trees look scattered but never move between renders. */
const hash = (n: number) => {
  const s = Math.sin(n * 127.1) * 43758.5453;
  return s - Math.floor(s);
};

const ROAD_W = 7;
const TREE_GREEN = ["#5f7d4f", "#6b8a57", "#4f6e48"];
const TREE_AUTUMN = ["#d9822b", "#c4512f", "#e0a43a", "#b8662e"];

function SiteLot({ site, pal, autumn }: { site: Site; pal: Palette; autumn: boolean }) {
  const [W, D] = site.size;
  const { north: zn, south: zs, side, highway } = site.roads;
  const [gx] = site.gate;
  const [wh, office, gatehouse] = site.buildings as [typeof site.buildings[0], typeof site.buildings[0], typeof site.buildings[0]];
  const [whW, whD, whH] = wh.size;
  const whZ = wh.position[1];

  const layout = useMemo(() => {
    const dashes: [number, number, number][] = [];
    for (let x = -W / 2 + 5; x < gx; x += 4.5) dashes.push([x, zs, 0]);
    for (let x = -side; x <= side; x += 4.5) dashes.push([x, zn, 0]);
    for (const sx of [-side, side]) for (let z = zn + 4; z < zs - 3; z += 4.5) dashes.push([sx, z, Math.PI / 2]);
    for (let z = D / 2 + 1; z < highway - 5; z += 4.5) dashes.push([gx, z, Math.PI / 2]);

    const posts: [number, number][] = [];
    for (let x = -W / 2; x <= W / 2; x += 3) {
      posts.push([x, -D / 2]);
      if (Math.abs(x - gx) > 4.5) posts.push([x, D / 2]);
    }
    for (let z = -D / 2 + 3; z < D / 2; z += 3) posts.push([-W / 2, z], [W / 2, z]);

    const trees: { p: V3; s: number; c: string }[] = [];
    const palette = autumn ? TREE_AUTUMN : TREE_GREEN;
    let n = 0;
    const tree = (x: number, z: number) => {
      n++;
      trees.push({ p: [x, 0, z], s: 0.8 + hash(n) * 0.6, c: palette[Math.floor(hash(n + 7) * palette.length)]! });
    };
    for (let x = -W / 2 - 4; x <= W / 2 + 4; x += 5.5) {
      tree(x + (hash(x) - 0.5) * 2, -D / 2 - 4 - hash(x + 3) * 4);
      if (Math.abs(x - gx) > 8) tree(x + (hash(x + 9) - 0.5) * 2, D / 2 + 3 + hash(x + 5) * 1.5);
    }
    for (let z = -D / 2; z <= D / 2; z += 5.5) {
      tree(-W / 2 - 4 - hash(z) * 4, z + (hash(z + 1) - 0.5) * 2);
      tree(W / 2 + 4 + hash(z + 2) * 4, z + (hash(z + 4) - 0.5) * 2);
    }

    const lamps: [number, number][] = [];
    for (let x = -W / 2 + 6; x < gx - 4; x += 14) lamps.push([x, zs + ROAD_W / 2 + 0.7]);
    for (let x = -side + 4; x <= side; x += 14) lamps.push([x, zn - ROAD_W / 2 - 0.7]);

    const yardLines = site.yardSlots.map(([x, z]) => [x - 1.8, z] as [number, number]);
    if (site.yardSlots.length) {
      const [lx, lz] = site.yardSlots.at(-1)!;
      yardLines.push([lx + 1.8, lz]);
    }
    return { dashes, posts, trees, lamps, yardLines };
  }, [site, W, D, zn, zs, side, highway, gx, autumn]);

  const yardZ = site.yardSlots[0]?.[1] ?? zs + 6;

  return (
    <group position={[site.origin[0], 0, site.origin[1]]}>
      {/* Lot surface and roads */}
      <Strip x={0} z={0} w={W} d={D} color={pal.pad} y={0.01} />
      <Strip x={(gx + 3.5 - W / 2 + 2) / 2} z={zs} w={gx + 3.5 + W / 2 - 2} d={ROAD_W} color={pal.road} y={0.03} />
      <Strip x={0} z={zn} w={2 * side + ROAD_W} d={ROAD_W} color={pal.road} y={0.03} />
      {[-side, side].map((sx) => (
        <Strip key={sx} x={sx} z={(zn + zs) / 2} w={ROAD_W} d={zs - zn} color={pal.road} y={0.03} />
      ))}
      <Strip x={gx} z={(zs + highway) / 2} w={ROAD_W} d={highway - zs} color={pal.road} y={0.03} />

      <Instances limit={400} receiveShadow>
        <boxGeometry args={[2, 0.02, 0.18]} />
        <meshStandardMaterial color={pal.marking} emissive={pal.marking} emissiveIntensity={pal.glow * 0.15} />
        {layout.dashes.map(([x, z, r], i) => (
          <Instance key={i} position={[x, 0.05, z]} rotation-y={r} />
        ))}
      </Instances>

      {/* Yard slot lines */}
      <Instances limit={64}>
        <boxGeometry args={[0.15, 0.02, 10.5]} />
        <meshStandardMaterial color={pal.marking} />
        {layout.yardLines.map(([x, z], i) => (
          <Instance key={i} position={[x, 0.05, z]} />
        ))}
      </Instances>
      <Strip x={(site.yardSlots[0]?.[0] ?? 0) + ((site.yardSlots.length - 1) * 3.6) / 2} z={yardZ - 5.4} w={site.yardSlots.length * 3.6} d={0.15} color={pal.marking} y={0.05} />

      {/* Main hall */}
      <Box position={[0, whH / 2, whZ]} size={[whW, whH, whD]} color={pal.building} />
      <Box position={[0, whH + 0.2, whZ]} size={[whW + 0.6, 0.4, whD + 0.6]} color={pal.roof} />
      <Box position={[0, whH - 1.3, whZ]} size={[whW + 0.04, 0.7, whD + 0.04]} color={pal.trim} emissive={pal.trim} glow={pal.glow * 0.3} shadow={false} />
      {[-0.28, 0, 0.28].map((f) => (
        <Box key={f} position={[0, whH + 0.45, whZ + f * whD]} size={[whW * 0.82, 0.12, 1.3]} color="#c9d6e2" emissive="#ffe2a8" glow={pal.glow * 0.15} shadow={false} />
      ))}

      {/* Dock doors and bumpers */}
      <Instances limit={32}>
        <boxGeometry args={[3.4, 3.5, 0.12]} />
        <meshStandardMaterial color="#2a3240" emissive="#ffcf7a" emissiveIntensity={pal.glow * 0.25} />
        {site.docks.map((d) => (
          <Instance key={d.id} position={[d.position[0], 1.75, d.position[1] + (d.side === "inbound" ? 0.06 : -0.06)]} />
        ))}
      </Instances>
      <Instances limit={32}>
        <boxGeometry args={[3.4, 0.04, 0.5]} />
        <meshStandardMaterial color="#e0a43a" />
        {site.docks.map((d) => (
          <Instance key={d.id} position={[d.position[0], 0.05, d.position[1] + (d.side === "inbound" ? 0.4 : -0.4)]} />
        ))}
      </Instances>

      {/* Office and gatehouse */}
      <Box position={[office.position[0], office.size[2] / 2, office.position[1]]} size={[office.size[0], office.size[2], office.size[1]]} color={pal.office} emissive="#ffd9a0" glow={pal.glow * 0.35} />
      <Box position={[office.position[0], office.size[2] + 0.15, office.position[1]]} size={[office.size[0] + 0.4, 0.3, office.size[1] + 0.4]} color={pal.roof} />
      <Box position={[gatehouse.position[0], gatehouse.size[2] / 2, gatehouse.position[1]]} size={[gatehouse.size[0], gatehouse.size[2], gatehouse.size[1]]} color={pal.building} emissive="#ffd9a0" glow={pal.glow * 0.3} />
      <Box position={[gx, 1.1, D / 2 + 0.4]} size={[6, 0.16, 0.16]} color="#d9533f" shadow={false} />

      {/* Fence */}
      <Instances limit={200} castShadow>
        <boxGeometry args={[0.12, 1.8, 0.12]} />
        <meshStandardMaterial color="#5d6672" />
        {layout.posts.map(([x, z], i) => (
          <Instance key={i} position={[x, 0.9, z]} />
        ))}
      </Instances>
      {(
        [
          [0, -D / 2, W, 0],
          [-W / 2, 0, D, Math.PI / 2],
          [W / 2, 0, D, Math.PI / 2],
          [(-W / 2 + gx - 4.5) / 2, D / 2, gx - 4.5 + W / 2, 0],
          [(W / 2 + gx + 4.5) / 2, D / 2, W / 2 - gx - 4.5, 0],
        ] as [number, number, number, number][]
      ).map(([x, z, len, r], i) => (
        <mesh key={i} position={[x, 0.9, z]} rotation-y={r}>
          <boxGeometry args={[len, 1.6, 0.04]} />
          <meshStandardMaterial color="#8a939e" transparent opacity={0.35} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      ))}

      {/* Lamps */}
      <Instances limit={40} castShadow>
        <cylinderGeometry args={[0.08, 0.1, 6, 6]} />
        <meshStandardMaterial color="#4a525e" />
        {layout.lamps.map(([x, z], i) => (
          <Instance key={i} position={[x, 3, z]} />
        ))}
      </Instances>
      <Instances limit={40}>
        <boxGeometry args={[0.9, 0.18, 0.4]} />
        <meshStandardMaterial color="#f6f1df" emissive="#ffd88a" emissiveIntensity={pal.glow * 1.4} />
        {layout.lamps.map(([x, z], i) => (
          <Instance key={i} position={[x, 6, z]} />
        ))}
      </Instances>

      {/* Trees: trunk + two cone tiers */}
      <Instances limit={200} castShadow>
        <cylinderGeometry args={[0.15, 0.2, 1.4, 5]} />
        <meshStandardMaterial color="#5a4636" />
        {layout.trees.map((t, i) => (
          <Instance key={i} position={[t.p[0], 0.7 * t.s, t.p[2]]} scale={t.s} />
        ))}
      </Instances>
      <Instances limit={200} castShadow>
        <coneGeometry args={[1.3, 2.6, 6]} />
        <meshStandardMaterial color="#ffffff" roughness={0.9} flatShading />
        {layout.trees.map((t, i) => (
          <Instance key={i} position={[t.p[0], 2.3 * t.s, t.p[2]]} scale={t.s} color={t.c} />
        ))}
      </Instances>

      {/* Roadside billboard */}
      <Box position={[-W / 2 + 12, 3, highway - 6.5]} size={[0.25, 6, 0.25]} color="#4a525e" />
      <Box position={[-W / 2 + 12, 7, highway - 6.5]} size={[8, 3.4, 0.3]} color="#d9533f" emissive="#d9533f" glow={pal.glow * 0.3} />
    </group>
  );
}

export function SiteWorld({ pal, snowy, autumn }: { pal: Palette; snowy: boolean; autumn: boolean }) {
  const dashes = useMemo(() => Array.from({ length: 80 }, (_, i) => -237 + i * 6), []);
  return (
    <group>
      <Strip x={0} z={0} w={760} d={340} color={snowy ? pal.snow : pal.ground} y={-0.02} />
      {/* Shared highway linking the site gates */}
      <Strip x={0} z={HIGHWAY_Z} w={480} d={9} color={pal.road} y={0.02} />
      {[-4.2, 4.2].map((o) => (
        <Strip key={o} x={0} z={HIGHWAY_Z + o} w={480} d={0.15} color={pal.marking} y={0.04} />
      ))}
      <Instances limit={80}>
        <boxGeometry args={[3, 0.02, 0.18]} />
        <meshStandardMaterial color={pal.marking} />
        {dashes.map((x) => (
          <Instance key={x} position={[x, 0.05, HIGHWAY_Z]} />
        ))}
      </Instances>
      {SITES.map((s) => (
        <SiteLot key={s.id} site={s} pal={pal} autumn={autumn || snowy} />
      ))}
    </group>
  );
}
