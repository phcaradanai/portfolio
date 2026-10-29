"use client";

import * as THREE from "three";
import React, { useMemo, useRef } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { Edges, Merged, type InstanceProps } from "@react-three/drei";
import { useLogisticsStore } from "@/lib/logistics-store";
import { SITE_BY_ID, SITES, TRUCK } from "@/data/logistics/seed";
import { routeTo, spawnPoint, truckGoal, type Goal, type Waypoint } from "@/data/logistics/routes";
import type { Vec2, Vehicle } from "@/data/logistics/types";
import { matchesFilter } from "@/data/logistics/sim";
import { LIVERIES } from "./palette";
import { labelAnchors, setAnchor } from "./labelAnchors";

const TRUCK_SPEED = 9; // m/s at x1
const FORKLIFT_SPEED = 3;

interface Runtime {
  pos: Vec2;
  heading: number;
  path: Waypoint[];
  goalKey: string;
  hidden: boolean;
}

/** Shared truck/forklift parts; each is one instanced draw call however many vehicles there are. */
function useParts() {
  return useMemo(() => {
    const white = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.55 });
    const dark = new THREE.MeshStandardMaterial({ color: "#22272f", roughness: 0.7 });
    const glass = new THREE.MeshStandardMaterial({ color: "#1b2533", roughness: 0.15, metalness: 0.3 });
    const amber = new THREE.MeshStandardMaterial({ color: "#e0a43a", roughness: 0.5 });
    const mesh = (g: THREE.BufferGeometry, m: THREE.Material) => new THREE.Mesh(g, m);
    const axle = new THREE.CylinderGeometry(0.5, 0.5, 2.6, 10);
    axle.rotateZ(Math.PI / 2);
    return {
      Trailer: mesh(new THREE.BoxGeometry(TRUCK.width, 2.9, TRUCK.trailer), white),
      Cab: mesh(new THREE.BoxGeometry(TRUCK.width, 2.5, 2), white),
      Window: mesh(new THREE.BoxGeometry(2.3, 0.9, 0.06), glass),
      Chassis: mesh(new THREE.BoxGeometry(2.2, 0.35, 9.4), dark),
      Axle: mesh(axle, dark),
      LiftBody: mesh(new THREE.BoxGeometry(1.2, 1.3, 2.2), amber),
      Mast: mesh(new THREE.BoxGeometry(1, 2.6, 0.15), dark),
      Fork: mesh(new THREE.BoxGeometry(0.9, 0.08, 1.1), dark),
    };
  }, []);
}

type Parts = Record<keyof ReturnType<typeof useParts>, React.FC<InstanceProps>>;

/** Local +z is forward; trailer rear sits at z = -length/2. */
function TruckModel({ m, color, cab = true }: { m: Parts; color: string; cab?: boolean }) {
  const rear = -TRUCK.length / 2;
  return (
    <>
      <m.Trailer position={[0, 2.3, rear + TRUCK.trailer / 2]} color={color} />
      <m.Chassis position={[0, 0.7, cab ? 0 : rear + 3.6]} scale={cab ? 1 : [1, 1, 0.77]} />
      <m.Axle position={[0, 0.5, rear + 0.9]} />
      <m.Axle position={[0, 0.5, rear + 2.1]} />
      {cab && (
        <>
          <m.Cab position={[0, 1.85, 3.7]} color="#f4f5f6" />
          <m.Window position={[0, 2.5, 4.72]} />
          <m.Axle position={[0, 0.5, 3.0]} />
          <m.Axle position={[0, 0.5, 4.1]} />
        </>
      )}
    </>
  );
}

function ForkliftModel({ m }: { m: Parts }) {
  return (
    <>
      <m.LiftBody position={[0, 0.95, 0]} />
      <m.Mast position={[0, 1.5, 1.2]} />
      <m.Fork position={[0, 0.25, 1.75]} />
    </>
  );
}

/** Ignore the click that ends a camera drag. */
function selectOnClick(id: string) {
  return (e: ThreeEvent<MouseEvent>) => {
    if (e.delta > 4) return;
    e.stopPropagation();
    useLogisticsStore.getState().selectEntity(id);
  };
}

const setCursor = (c: string) => () => {
  document.body.style.cursor = c;
};

const angleTo = (from: number, to: number) => Math.atan2(Math.sin(to - from), Math.cos(to - from));

function forkliftTarget(v: Vehicle, index: number): { p: Vec2; heading: number } {
  const site = SITE_BY_ID[v.siteId];
  if (v.status === "idle" || v.status === "charging") {
    const [ox, oz] = site.buildings[1]!.position;
    return { p: [ox - 3 + (index % 4) * 2.2, oz + 5], heading: Math.PI };
  }
  // Work the apron between docks on one side, hopping dock to dock as the sim changes status.
  const side = index % 2 ? "outbound" : "inbound";
  const docks = site.docks.filter((d) => d.side === side);
  // updatedAt is negative during warm-up, so wrap the index both ways.
  const n = docks.length;
  const dock = docks[(((index + Math.floor(v.updatedAt / 3)) % n) + n) % n]!;
  const out = side === "inbound" ? 1 : -1;
  return { p: [dock.position[0] + 3.65, dock.position[1] + out * (v.status === "lifting" ? 1.8 : 4)], heading: side === "inbound" ? Math.PI : 0 };
}

export function Fleet() {
  const world = useLogisticsStore((s) => s.world);
  const selectedId = useLogisticsStore((s) => s.selectedEntityId);
  const activeSiteId = useLogisticsStore((s) => s.activeSiteId);
  const fleetFilter = useLogisticsStore((s) => s.fleetFilter);
  // Table filters also thin out the active site's vehicles in the scene.
  const filteredOut = useMemo(
    () => new Set(world.vehicles.filter((v) => v.siteId === activeSiteId && !matchesFilter(v, fleetFilter)).map((v) => v.id)),
    [world, activeSiteId, fleetFilter]
  );
  const parts = useParts();
  const groups = useRef(new Map<string, THREE.Group>());
  const marker = useRef<THREE.Group>(null);
  const selectedKind = world.vehicles.find((v) => v.id === selectedId)?.kind;
  const runtimes = useRef(new Map<string, Runtime>());

  const trucks = useMemo(() => world.vehicles.filter((v) => v.kind === "truck"), [world]);
  const forklifts = useMemo(() => world.vehicles.filter((v) => v.kind === "forklift"), [world]);

  // Goal per vehicle from the current sim state; queued trucks take yard slots in id order.
  const goals = useMemo(() => {
    const out = new Map<string, Goal>();
    for (const site of SITES) {
      const queued = trucks.filter((v) => v.siteId === site.id && v.status === "queued").map((v) => v.id).sort();
      for (const v of trucks) if (v.siteId === site.id) out.set(v.id, truckGoal(site, v, queued.indexOf(v.id)));
    }
    return out;
  }, [trucks]);

  const liftTargets = useMemo(() => {
    const perSite = new Map<string, number>();
    return new Map(
      forklifts.map((v) => {
        const i = perSite.get(v.siteId) ?? 0;
        perSite.set(v.siteId, i + 1);
        return [v.id, forkliftTarget(v, i)] as const;
      })
    );
  }, [forklifts]);

  useFrame((_, rawDt) => {
    const { playbackState, playbackSpeed } = useLogisticsStore.getState();
    const dt = playbackState === "playing" ? Math.min(rawDt, 0.1) * playbackSpeed : 0;

    for (const v of trucks) {
      const goal = goals.get(v.id)!;
      const site = SITE_BY_ID[v.siteId];
      let rt = runtimes.current.get(v.id);
      if (!rt) {
        // First sight: start where the sim says the truck is, no drive-in.
        rt = { pos: [...goal.p], heading: goal.heading, path: [], goalKey: goal.key, hidden: v.status === "offsite" };
        runtimes.current.set(v.id, rt);
      } else if (rt.goalKey !== goal.key) {
        if (rt.hidden) {
          rt.pos = spawnPoint(site);
          rt.heading = -Math.PI / 2;
          rt.hidden = false;
        }
        rt.path = routeTo(site, rt.pos, goal);
        rt.goalKey = goal.key;
      }

      let budget = TRUCK_SPEED * dt;
      while (budget > 0 && rt.path.length) {
        const wp = rt.path[0]!;
        const dx = wp.p[0] - rt.pos[0];
        const dz = wp.p[1] - rt.pos[1];
        const dist = Math.hypot(dx, dz);
        if (dist > 0.01) {
          const want = Math.atan2(dx, dz) + (wp.reverse ? Math.PI : 0);
          rt.heading += angleTo(rt.heading, want) * Math.min(1, dt * 8);
        }
        const step = Math.min(budget, dist);
        if (dist > 0) {
          rt.pos[0] += (dx / dist) * step;
          rt.pos[1] += (dz / dist) * step;
        }
        budget -= step;
        if (step >= dist) rt.path.shift();
      }
      if (!rt.path.length) {
        rt.heading += angleTo(rt.heading, goal.heading) * Math.min(1, dt * 4);
        if (v.status === "offsite") rt.hidden = true;
      }

      const g = groups.current.get(v.id);
      if (g) {
        g.position.set(site.origin[0] + rt.pos[0], 0, site.origin[1] + rt.pos[1]);
        g.rotation.y = rt.heading;
        g.scale.setScalar(rt.hidden || filteredOut.has(v.id) ? 0 : 1);
      }
      if (rt.hidden || filteredOut.has(v.id)) labelAnchors.delete(v.id);
      else setAnchor(v.id, site.origin[0] + rt.pos[0], 4.4, site.origin[1] + rt.pos[1]);
    }

    for (const v of forklifts) {
      const target = liftTargets.get(v.id)!;
      const site = SITE_BY_ID[v.siteId];
      let rt = runtimes.current.get(v.id);
      if (!rt) {
        rt = { pos: [...target.p], heading: target.heading, path: [], goalKey: "", hidden: false };
        runtimes.current.set(v.id, rt);
      }
      const dx = target.p[0] - rt.pos[0];
      const dz = target.p[1] - rt.pos[1];
      const dist = Math.hypot(dx, dz);
      const step = Math.min(dist, FORKLIFT_SPEED * dt);
      if (dist > 0.05) {
        rt.pos[0] += (dx / dist) * step;
        rt.pos[1] += (dz / dist) * step;
        rt.heading += angleTo(rt.heading, Math.atan2(dx, dz)) * Math.min(1, dt * 6);
      } else {
        rt.heading += angleTo(rt.heading, target.heading) * Math.min(1, dt * 4);
      }
      const g = groups.current.get(v.id);
      if (g) {
        g.position.set(site.origin[0] + rt.pos[0], 0, site.origin[1] + rt.pos[1]);
        g.rotation.y = rt.heading;
        g.scale.setScalar(filteredOut.has(v.id) ? 0 : 1);
      }
      if (filteredOut.has(v.id)) labelAnchors.delete(v.id);
      else setAnchor(v.id, site.origin[0] + rt.pos[0], 3.2, site.origin[1] + rt.pos[1]);
    }

    // Selection marker rides on the selected vehicle's group.
    const m = marker.current;
    if (m) {
      const g = selectedId ? groups.current.get(selectedId) : undefined;
      const rt = selectedId ? runtimes.current.get(selectedId) : undefined;
      m.visible = !!g && !!rt && !rt.hidden && !filteredOut.has(selectedId!);
      if (g && m.visible) {
        m.position.copy(g.position);
        m.rotation.y = g.rotation.y;
        const ring = m.children[0]!;
        ring.scale.setScalar(1 + Math.sin(performance.now() / 260) * 0.06);
      }
    }
  });

  const markerSize: [number, number, number] = selectedKind === "forklift" ? [1.8, 3, 3] : [3, 4, 10.2];

  const bind = (id: string) => (g: THREE.Group | null) => {
    if (g) groups.current.set(id, g);
    else groups.current.delete(id);
  };

  return (
    <>
    <group ref={marker} visible={false}>
      <mesh rotation-x={-Math.PI / 2} position-y={0.08}>
        <ringGeometry args={[markerSize[2] * 0.55, markerSize[2] * 0.55 + 0.45, 48]} />
        <meshBasicMaterial color="#e0a43a" transparent opacity={0.9} depthWrite={false} />
      </mesh>
      <mesh position-y={markerSize[1] / 2}>
        <boxGeometry args={markerSize} />
        <meshBasicMaterial color="#e0a43a" transparent opacity={0.1} depthWrite={false} />
        <Edges color="#e0a43a" />
      </mesh>
    </group>
    <Merged meshes={parts} limit={2000} castShadow receiveShadow>
      {(instances) => {
        // Merged hands back one component per key of `parts`.
        const m = instances as unknown as Parts;
        return (
        <>
          {trucks.map((v) => (
            <group key={v.id} ref={bind(v.id)} scale={0} onClick={selectOnClick(v.id)} onPointerOver={setCursor("pointer")} onPointerOut={setCursor("")}>
              <TruckModel m={m} color={LIVERIES[v.livery]!} />
            </group>
          ))}
          {forklifts.map((v) => (
            <group key={v.id} ref={bind(v.id)} onClick={selectOnClick(v.id)} onPointerOver={setCursor("pointer")} onPointerOut={setCursor("")}>
              <ForkliftModel m={m} />
            </group>
          ))}
          {SITES.flatMap((s) =>
            s.trailers.map((t) => (
              <group key={t.id} position={[s.origin[0] + t.position[0], 0, s.origin[1] + t.position[1]]} rotation-y={t.heading}>
                <group position={[0, 0, TRUCK.length / 2 - TRUCK.trailer / 2]}>
                  <TruckModel m={m} color={LIVERIES[t.livery]!} cab={false} />
                </group>
              </group>
            ))
          )}
        </>
        );
      }}
    </Merged>
    </>
  );
}
