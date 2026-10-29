"use client";

import * as THREE from "three";
import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { ISLAND_ZONES, MONUMENT_NODES, type ZoneWaypoint } from "./IslandScene";
import { useExperience } from "@/components/experience/ExperienceProvider";

const _targetLookAt = new THREE.Vector3();
const _currentLookAt = new THREE.Vector3(0, 0.4, 0);
const _targetCamPos = new THREE.Vector3();

export function CameraDirector({
  scrollProgress,
  customWaypoint,
}: {
  scrollProgress?: number;
  customWaypoint?: string;
}) {
  const { activeWaypoint, activeMonumentSlug, setActiveMonumentSlug } = useExperience();
  const currentWaypointId = customWaypoint ?? activeWaypoint;

  // Keyboard navigation: Left/Right to cycle monuments, Esc to overview
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === "Escape") {
        setActiveMonumentSlug(null);
      } else if (e.key === "ArrowRight") {
        const idx = MONUMENT_NODES.findIndex((m) => m.slug === activeMonumentSlug);
        const next = MONUMENT_NODES[(idx + 1) % MONUMENT_NODES.length]!;
        setActiveMonumentSlug(next.slug);
      } else if (e.key === "ArrowLeft") {
        const idx = MONUMENT_NODES.findIndex((m) => m.slug === activeMonumentSlug);
        const prev = MONUMENT_NODES[(idx - 1 + MONUMENT_NODES.length) % MONUMENT_NODES.length]!;
        setActiveMonumentSlug(prev.slug);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeMonumentSlug, setActiveMonumentSlug]);

  const activeZone = useRef<ZoneWaypoint>(ISLAND_ZONES[0]!);

  useFrame((state, delta) => {
    const totalZones = ISLAND_ZONES.length - 1;

    let targetZoneA = ISLAND_ZONES[0]!;
    let targetZoneB = ISLAND_ZONES[0]!;
    let smoothT = 0;

    if (scrollProgress !== undefined) {
      const scaled = THREE.MathUtils.clamp(scrollProgress * totalZones, 0, totalZones);
      const idxA = Math.floor(scaled);
      const idxB = Math.min(totalZones, idxA + 1);
      const t = scaled - idxA;
      smoothT = t * t * (3 - 2 * t);
      targetZoneA = ISLAND_ZONES[idxA]!;
      targetZoneB = ISLAND_ZONES[idxB]!;
    } else {
      const found = ISLAND_ZONES.find((z) => z.id === currentWaypointId) ?? ISLAND_ZONES[0]!;
      activeZone.current = found;
      targetZoneA = found;
      targetZoneB = found;
      smoothT = 0;
    }

    let targetLookAtX = THREE.MathUtils.lerp(targetZoneA.lookAt[0], targetZoneB.lookAt[0], smoothT);
    let targetLookAtY = THREE.MathUtils.lerp(targetZoneA.lookAt[1], targetZoneB.lookAt[1], smoothT);
    let targetLookAtZ = THREE.MathUtils.lerp(targetZoneA.lookAt[2], targetZoneB.lookAt[2], smoothT);
    let targetZoom = THREE.MathUtils.lerp(targetZoneA.zoom, targetZoneB.zoom, smoothT);

    const monument = activeMonumentSlug ? MONUMENT_NODES.find((m) => m.slug === activeMonumentSlug) : null;
    if (monument) {
      targetLookAtX = monument.position[0];
      targetLookAtY = monument.position[1] + 0.4;
      targetLookAtZ = monument.position[2];
      targetZoom = 50;
    }

    _targetLookAt.set(targetLookAtX, targetLookAtY, targetLookAtZ);

    const azimuth = THREE.MathUtils.lerp(targetZoneA.azimuthRot, targetZoneB.azimuthRot, smoothT);
    const ox = THREE.MathUtils.lerp(targetZoneA.cameraOffset[0], targetZoneB.cameraOffset[0], smoothT);
    const oy = THREE.MathUtils.lerp(targetZoneA.cameraOffset[1], targetZoneB.cameraOffset[1], smoothT);
    const oz = THREE.MathUtils.lerp(targetZoneA.cameraOffset[2], targetZoneB.cameraOffset[2], smoothT);

    const cosA = Math.cos(azimuth);
    const sinA = Math.sin(azimuth);
    const rotX = ox * cosA - oz * sinA;
    const rotZ = ox * sinA + oz * cosA;

    _targetCamPos.set(_targetLookAt.x + rotX, _targetLookAt.y + oy, _targetLookAt.z + rotZ);

    const dampLambda = 6.0;
    state.camera.position.x = THREE.MathUtils.damp(state.camera.position.x, _targetCamPos.x, dampLambda, delta);
    state.camera.position.y = THREE.MathUtils.damp(state.camera.position.y, _targetCamPos.y, dampLambda, delta);
    state.camera.position.z = THREE.MathUtils.damp(state.camera.position.z, _targetCamPos.z, dampLambda, delta);

    _currentLookAt.x = THREE.MathUtils.damp(_currentLookAt.x, _targetLookAt.x, dampLambda, delta);
    _currentLookAt.y = THREE.MathUtils.damp(_currentLookAt.y, _targetLookAt.y, dampLambda, delta);
    _currentLookAt.z = THREE.MathUtils.damp(_currentLookAt.z, _targetLookAt.z, dampLambda, delta);

    const orthCamera = state.camera as THREE.OrthographicCamera;
    if (orthCamera.isOrthographicCamera) {
      orthCamera.zoom = THREE.MathUtils.damp(orthCamera.zoom, targetZoom, dampLambda, delta);
      orthCamera.updateProjectionMatrix();
    }

    state.camera.lookAt(_currentLookAt);
  });

  return null;
}
