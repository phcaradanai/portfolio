"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { detectTier, getClientCapabilityEnv, type ExperienceTier } from "@/lib/capability";
import { soundscape } from "@/lib/audio";

export type ExperienceContextType = {
  tier: ExperienceTier;
  effectiveTier: ExperienceTier;
  soundEnabled: boolean;
  toggleSound: () => void;
  plainView: boolean;
  togglePlainView: () => void;
  introSeen: boolean;
  markIntroSeen: () => void;
  activeWaypoint: string;
  setActiveWaypoint: (id: string) => void;
  activeMonumentSlug: string | null;
  setActiveMonumentSlug: (slug: string | null) => void;
};

const ExperienceContext = createContext<ExperienceContextType | null>(null);

export function ExperienceProvider({ children }: { children: React.ReactNode }) {
  const [tier, setTier] = useState<ExperienceTier>("static");
  const [plainView, setPlainView] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [introSeen, setIntroSeen] = useState(true); // default true for SSR safety
  const [activeWaypoint, setActiveWaypoint] = useState<string>("core");
  const [activeMonumentSlug, setActiveMonumentSlug] = useState<string | null>("cursed-market");

  useEffect(() => {
    // Client-side capability and preferences synchronization
    const frame = requestAnimationFrame(() => {
      const env = getClientCapabilityEnv();
      const detected = detectTier(env);
      setTier(detected);

      // Check stored user preferences
      try {
        const storedPlain = localStorage.getItem("pk_plain_view");
        if (storedPlain === "true") setPlainView(true);

        const storedSound = localStorage.getItem("pk_sound_enabled");
        if (storedSound === "true") setSoundEnabled(true);

        const storedIntro = sessionStorage.getItem("pk_intro_seen");
        if (storedIntro === "true" || env.reducedMotion || detected === "static") {
          setIntroSeen(true);
        } else {
          setIntroSeen(false);
        }
      } catch {
        // Storage access blocked or unavailable
      }
    });

    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    soundscape?.setEnabled(soundEnabled);
  }, [soundEnabled]);

  const toggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("pk_sound_enabled", String(next));
      } catch {}
      return next;
    });
  };

  const togglePlainView = () => {
    setPlainView((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("pk_plain_view", String(next));
      } catch {}
      return next;
    });
  };

  const markIntroSeen = () => {
    setIntroSeen(true);
    try {
      sessionStorage.setItem("pk_intro_seen", "true");
    } catch {}
  };

  const effectiveTier: ExperienceTier = plainView ? "static" : tier;

  const value = useMemo(
    () => ({
      tier,
      effectiveTier,
      soundEnabled,
      toggleSound,
      plainView,
      togglePlainView,
      introSeen,
      markIntroSeen,
      activeWaypoint,
      setActiveWaypoint,
      activeMonumentSlug,
      setActiveMonumentSlug,
    }),
    [
      tier,
      effectiveTier,
      soundEnabled,
      plainView,
      introSeen,
      activeWaypoint,
      activeMonumentSlug,
    ]
  );

  return <ExperienceContext.Provider value={value}>{children}</ExperienceContext.Provider>;
}

export function useExperience() {
  const ctx = useContext(ExperienceContext);
  if (!ctx) {
    // Graceful fallback for non-provider contexts or unit tests
    return {
      tier: "static" as ExperienceTier,
      effectiveTier: "static" as ExperienceTier,
      soundEnabled: false,
      toggleSound: () => {},
      plainView: false,
      togglePlainView: () => {},
      introSeen: true,
      markIntroSeen: () => {},
      activeWaypoint: "core",
      setActiveWaypoint: () => {},
      activeMonumentSlug: null,
      setActiveMonumentSlug: () => {},
    };
  }
  return ctx;
}
