"use client";

import * as THREE from "three";
import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";

export function EvidenceBeam({
  startPos,
  targetPos = [0, 4.5, 0],
  active = true,
}: {
  startPos: [number, number, number];
  targetPos?: [number, number, number];
  active?: boolean;
}) {
  const lineRef = useRef<THREE.Line>(null);

  const points = useMemo(() => {
    const vStart = new THREE.Vector3(...startPos);
    const vEnd = new THREE.Vector3(...targetPos);
    const vMid = new THREE.Vector3()
      .addVectors(vStart, vEnd)
      .multiplyScalar(0.5)
      .add(new THREE.Vector3(0, 1.4, 0));
    const curve = new THREE.QuadraticBezierCurve3(vStart, vMid, vEnd);
    return curve.getPoints(32);
  }, [startPos, targetPos]);

  const geometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points]);

  const material = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: new THREE.Color("#e64a19"), // thread red
        transparent: true,
        opacity: 0.9,
      }),
    []
  );

  useFrame((state) => {
    if (lineRef.current) {
      const mat = lineRef.current.material as THREE.LineBasicMaterial;
      const pulse = 0.55 + Math.sin(state.clock.elapsedTime * 5.0) * 0.45;
      mat.opacity = active ? pulse : 0.1;
    }
  });

  if (!active) return null;

  return <primitive object={new THREE.Line(geometry, material)} ref={lineRef} />;
}
