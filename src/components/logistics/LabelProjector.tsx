"use client";

import * as THREE from "three";
import { useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { labelAnchors, labelElements } from "./labelAnchors";

/** Moves every registered DOM label over its world anchor; runs after the fleet updates anchors. */
export function LabelProjector() {
  const v = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ camera, size }) => {
    for (const [id, el] of labelElements) {
      const a = labelAnchors.get(id);
      if (a) v.set(a.x, a.y, a.z).project(camera);
      if (!a || v.z > 1 || Math.abs(v.x) > 1.1 || Math.abs(v.y) > 1.1) {
        el.style.visibility = "hidden";
        continue;
      }
      el.style.visibility = "visible";
      el.style.transform = `translate3d(${((v.x + 1) / 2) * size.width}px, ${((1 - v.y) / 2) * size.height}px, 0) translate(-50%, -100%)`;
    }
  });
  return null;
}
