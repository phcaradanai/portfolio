"use client";

import * as THREE from "three";
import { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import { CameraControls, CameraControlsImpl } from "@react-three/drei";
import { useLogisticsStore } from "@/lib/logistics-store";
import { SITE_BY_ID } from "@/data/logistics/seed";

/** Strategy-game view offset from the site centre. */
export const CAMERA_OFFSET: [number, number, number] = [58, 76, 98];

export function SiteCameraRig() {
  const activeSiteId = useLogisticsStore((s) => s.activeSiteId);
  const ref = useRef<CameraControlsImpl>(null);
  const first = useRef(true);
  // Narrow (portrait) stages see less width, so pull the camera back to keep the whole site in view.
  const aspect = useThree((s) => s.size.width / Math.max(1, s.size.height));
  const pull = Math.min(2.2, Math.max(1, 1.3 / aspect));

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const A = CameraControlsImpl.ACTION;
    c.mouseButtons.left = A.SCREEN_PAN;
    c.mouseButtons.right = A.ROTATE;
    c.mouseButtons.wheel = A.DOLLY;
    // One finger scrolls the page past the stage; two fingers pan and zoom the map.
    c.touches.one = A.NONE;
    c.touches.two = A.TOUCH_DOLLY_TRUCK;
    c.touches.three = A.NONE;
    c.dollyToCursor = true;
  }, []);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const site = SITE_BY_ID[activeSiteId];
    const [ox, oz] = site.origin;
    const [W, D] = site.size;
    c.setBoundary(new THREE.Box3(new THREE.Vector3(ox - W / 2, 0, oz - D / 2), new THREE.Vector3(ox + W / 2, 0, oz + D / 2)));
    const [dx, dy, dz] = CAMERA_OFFSET.map((n) => n * pull) as [number, number, number];
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    c.setLookAt(ox + dx, dy, oz + dz, ox, 0, oz, !first.current && !reduced);
    first.current = false;
  }, [activeSiteId, pull]);

  return (
    <CameraControls
      ref={ref}
      makeDefault
      minDistance={28}
      maxDistance={190 * pull}
      minPolarAngle={0.3}
      maxPolarAngle={1.2}
      smoothTime={0.6}
    />
  );
}
