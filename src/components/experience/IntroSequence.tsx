"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useExperience } from "./ExperienceProvider";
import { soundscape } from "@/lib/audio";

export function IntroSequence() {
  const { introSeen, markIntroSeen, effectiveTier } = useExperience();
  const [progress, setProgress] = useState(0);
  const [stageText, setStageText] = useState("INITIALIZING GOVERNED AGENT HARNESS...");
  const [dismissed, setDismissed] = useState(false);

  const handleSkip = useCallback(() => {
    soundscape?.playWaypointChime();
    setDismissed(true);
    markIntroSeen();
  }, [markIntroSeen]);

  // Handle keyboard shortcut (Space or Enter to skip)
  useEffect(() => {
    if (introSeen || dismissed) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter" || e.key === "Escape") {
        e.preventDefault();
        handleSkip();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [introSeen, dismissed, handleSkip]);

  // Progress animation (0 to 100% in ~2.0s)
  useEffect(() => {
    if (introSeen || dismissed || effectiveTier === "static") return;

    const start = performance.now();
    const duration = 2100;

    let rafId: number;

    const tick = (now: number) => {
      const elapsed = now - start;
      const p = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(p);

      if (p < 35) {
        setStageText("INITIALIZING GOVERNED AGENT HARNESS...");
      } else if (p < 75) {
        setStageText("CALIBRATING 21 REPOSITORIES & 757 TEST PROOFS...");
      } else {
        setStageText("CLEAR FOR FUTURE MUSEUM EXPLORATION");
      }

      if (elapsed < duration) {
        rafId = requestAnimationFrame(tick);
      } else {
        setTimeout(handleSkip, 250);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [introSeen, dismissed, effectiveTier, handleSkip]);

  if (introSeen || dismissed || effectiveTier === "static") {
    return null;
  }

  const accessionCode = `PK-${String(Math.round((progress / 100) * 2026)).padStart(4, "0")}`;

  return (
    <div
      className="intro-overlay"
      role="dialog"
      aria-label="Experience introduction"
      aria-modal="true"
    >
      <div className="intro-card">
        <div className="intro-top">
          <span className="intro-code">{accessionCode}</span>
          <button
            type="button"
            className="btn btn--small intro-skip"
            onClick={handleSkip}
            autoFocus
          >
            Skip intro [Space]
          </button>
        </div>

        <h1 className="intro-title">
          PHATCHARADANAI KANYAPAN
          <small className="intro-sub">FUTURE MUSEUM &amp; AGENT COMMAND</small>
        </h1>

        <div className="intro-bar-box">
          <div className="intro-bar-fill" style={{ width: `${progress}%` }} />
        </div>

        <div className="intro-footer">
          <span className="intro-stage">{stageText}</span>
          <span className="intro-pct">{progress}%</span>
        </div>
      </div>
    </div>
  );
}
