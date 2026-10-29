"use client";

import * as THREE from "three";
import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { JOURNEY_STAGES, useLogisticsStore } from "@/lib/logistics-store";

export function LogisticsCameraDirector() {
  const cameraMode = useLogisticsStore((state) => state.cameraMode);
  const activeStage = useLogisticsStore((state) => state.activeStage);
  const gl = useThree((state) => state.gl);

  // Local state vectors (avoiding module-level singleton state leaks)
  const targetCamPosRef = useRef(new THREE.Vector3(20, 18, 20));
  const targetLookAtRef = useRef(new THREE.Vector3(0, 0, 0));
  const currentLookAtRef = useRef(new THREE.Vector3(0, 0, 0));

  // User interactive orbit & zoom offsets
  const userYawRef = useRef(0);
  const userPitchRef = useRef(0);
  const userZoomRef = useRef(0);
  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });

  // Reset user offsets smoothly when user selects a different CCTV mode or stage
  useEffect(() => {
    userYawRef.current = 0;
    userPitchRef.current = 0;
    userZoomRef.current = 0;
  }, [cameraMode, activeStage]);

  // Pointer & wheel listener bindings on canvas
  useEffect(() => {
    const canvas = gl.domElement;
    if (!canvas) return;

    const handlePointerDown = (e: PointerEvent) => {
      isDraggingRef.current = true;
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
      canvas.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - lastMousePosRef.current.x;
      const dy = e.clientY - lastMousePosRef.current.y;
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };

      userYawRef.current += dx * 0.005;
      userPitchRef.current = Math.max(-0.35, Math.min(0.35, userPitchRef.current + dy * 0.003));
    };

    const handlePointerUp = (e: PointerEvent) => {
      isDraggingRef.current = false;
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch {
        // Pointer might already be released
      }
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      userZoomRef.current = Math.max(-12, Math.min(18, userZoomRef.current - e.deltaY * 0.02));
    };

    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerup", handlePointerUp);
    canvas.addEventListener("pointercancel", handlePointerUp);
    canvas.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerup", handlePointerUp);
      canvas.removeEventListener("pointercancel", handlePointerUp);
      canvas.removeEventListener("wheel", handleWheel);
    };
  }, [gl]);

  useFrame((state, delta) => {
    const stage = JOURNEY_STAGES[activeStage] ?? JOURNEY_STAGES[0]!;
    let lookTarget: [number, number, number] = stage.lookAtTarget;
    let camOffset: [number, number, number] = stage.cameraOffset;
    let baseZoom = stage.zoom;

    // Camera Mode overrides
    if (cameraMode === "overview") {
      lookTarget = [0, 0, 0];
      camOffset = [14, 13, 14];
      baseZoom = 34;
    } else if (cameraMode === "fulfillment") {
      lookTarget = [-4.8, 0.6, -3.0];
      camOffset = [8, 9, 8];
      baseZoom = 40;
    } else if (cameraMode === "megahub") {
      lookTarget = [-1.2, 0.6, -1.5];
      camOffset = [8, 9, 8];
      baseZoom = 42;
    } else if (cameraMode === "intermodal") {
      lookTarget = [6.0, 0.7, -1.5];
      camOffset = [9, 9, 9];
      baseZoom = 38;
    } else if (cameraMode === "truck_follow") {
      const t = state.clock.elapsedTime * 0.4;
      const truckX = Math.cos(t) * 7.6;
      const truckZ = Math.sin(t) * (7.6 * 0.65);
      lookTarget = [truckX, 0.4, truckZ];
      camOffset = [7, 8, 7];
      baseZoom = 42;
    } else if (cameraMode === "drone_follow") {
      lookTarget = [3.8, 1.0, 3.8];
      camOffset = [7, 8, 7];
      baseZoom = 42;
    }

    // Apply interactive yaw and pitch rotation to camera offset
    const radiusXZ = Math.hypot(camOffset[0], camOffset[2]);
    const baseAngle = Math.atan2(camOffset[0], camOffset[2]);
    const finalAngle = baseAngle + userYawRef.current;
    const finalOffsetX = Math.sin(finalAngle) * radiusXZ;
    const finalOffsetZ = Math.cos(finalAngle) * radiusXZ;
    const finalOffsetY = camOffset[1] + userPitchRef.current * radiusXZ;

    targetLookAtRef.current.set(...lookTarget);
    targetCamPosRef.current.set(
      targetLookAtRef.current.x + finalOffsetX,
      targetLookAtRef.current.y + finalOffsetY,
      targetLookAtRef.current.z + finalOffsetZ
    );

    const dampLambda = 5.5;
    state.camera.position.x = THREE.MathUtils.damp(
      state.camera.position.x,
      targetCamPosRef.current.x,
      dampLambda,
      delta
    );
    state.camera.position.y = THREE.MathUtils.damp(
      state.camera.position.y,
      targetCamPosRef.current.y,
      dampLambda,
      delta
    );
    state.camera.position.z = THREE.MathUtils.damp(
      state.camera.position.z,
      targetCamPosRef.current.z,
      dampLambda,
      delta
    );

    currentLookAtRef.current.x = THREE.MathUtils.damp(
      currentLookAtRef.current.x,
      targetLookAtRef.current.x,
      dampLambda,
      delta
    );
    currentLookAtRef.current.y = THREE.MathUtils.damp(
      currentLookAtRef.current.y,
      targetLookAtRef.current.y,
      dampLambda,
      delta
    );
    currentLookAtRef.current.z = THREE.MathUtils.damp(
      currentLookAtRef.current.z,
      targetLookAtRef.current.z,
      dampLambda,
      delta
    );

    const targetZoom = Math.max(24, Math.min(56, baseZoom + userZoomRef.current));
    const orthCamera = state.camera as THREE.OrthographicCamera;
    if (orthCamera.isOrthographicCamera) {
      orthCamera.zoom = THREE.MathUtils.damp(orthCamera.zoom, targetZoom, dampLambda, delta);
      orthCamera.updateProjectionMatrix();
    }

    state.camera.lookAt(currentLookAtRef.current);
  });

  return null;
}
