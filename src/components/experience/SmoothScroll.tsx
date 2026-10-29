"use client";

import React, { useEffect } from "react";
import Lenis from "lenis";
import { useExperience } from "./ExperienceProvider";

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const { effectiveTier } = useExperience();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isTouch || isReduced || effectiveTier === "static") return;

    let lenis: Lenis | null = null;
    let rafId: number;

    try {
      lenis = new Lenis({
        duration: 1.15,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: "vertical",
        gestureOrientation: "vertical",
        smoothWheel: true,
        wheelMultiplier: 0.95,
        touchMultiplier: 1.5,
      });

      const raf = (time: number) => {
        lenis?.raf(time);
        rafId = requestAnimationFrame(raf);
      };
      rafId = requestAnimationFrame(raf);
    } catch {
      // Lenis initialization fallback
    }

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      lenis?.destroy();
    };
  }, [effectiveTier]);

  return <>{children}</>;
}
