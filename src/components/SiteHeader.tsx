"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { ROOMS, SITE } from "@/lib/site";
import { useExperience } from "@/components/experience/ExperienceProvider";
import { soundscape } from "@/lib/audio";

/** Mini floor plan: six rooms, the current one marked with the thread colour. */
function Plan({ current }: { current: string | undefined }) {
  const cells = [
    { id: "studio", x: 0, y: 0, w: 13, h: 12 }, { id: "works", x: 15, y: 0, w: 14, h: 12 }, { id: "agents", x: 31, y: 0, w: 13, h: 12 },
    { id: "lab", x: 0, y: 14, w: 13, h: 12 }, { id: "gallery", x: 15, y: 14, w: 14, h: 12 }, { id: "journey", x: 31, y: 14, w: 13, h: 12 },
  ];
  return (
    <svg className="rail__plan" viewBox="0 0 44 26" aria-hidden="true">
      {cells.map((c) => (
        <rect key={c.id} x={c.x} y={c.y} width={c.w} height={c.h} rx="1"
          fill={c.id === current ? "var(--thread)" : "none"} stroke={c.id === current ? "var(--thread)" : "oklch(1 0 0 / 0.45)"} strokeWidth="1" />
      ))}
    </svg>
  );
}

export function SiteHeader() {
  const path = usePathname() ?? "/";
  const current = ROOMS.find((r) => path.startsWith(r.href))?.id;
  const menu = useRef<HTMLDetailsElement>(null);
  const { effectiveTier, plainView, togglePlainView, soundEnabled, toggleSound } = useExperience();

  useEffect(() => { if (menu.current) menu.current.open = false; }, [path]);

  const handleSoundToggle = () => {
    soundscape?.playHapticTick();
    toggleSound();
  };

  const handlePlainToggle = () => {
    soundscape?.playHapticTick();
    togglePlainView();
  };

  return (
    <header className="rail">
      <div className="rail__in">
        <Link className="rail__mark" href="/" aria-label={`${SITE.name}, home`}>
          {SITE.short}<small>{SITE.role}</small>
        </Link>
        <nav aria-label="Rooms" className="rail__nav">
          {ROOMS.map((r) => (
            <Link key={r.id} className="rail__link" href={r.href} aria-current={current === r.id ? "page" : undefined}>{r.name}</Link>
          ))}
          <Plan current={current} />
        </nav>

        <div className="rail__controls">
          <button
            type="button"
            className="rail__ctrl-btn"
            data-active={effectiveTier !== "static"}
            onClick={handlePlainToggle}
            aria-label={plainView ? "Switch to 3D Museum Stage" : "Switch to Plain Paper View"}
            title={plainView ? "Switch to 3D Museum Stage" : "Switch to Plain Paper View"}
          >
            <span>{plainView ? "2D PAPER" : "3D STAGE"}</span>
          </button>

          <button
            type="button"
            className="rail__ctrl-btn"
            data-active={soundEnabled}
            onClick={handleSoundToggle}
            aria-label={soundEnabled ? "Mute ambient soundscape" : "Enable ambient soundscape"}
            title={soundEnabled ? "Mute ambient soundscape" : "Enable ambient soundscape"}
          >
            <span className="rail__audio-bars" aria-hidden="true">
              <span className="rail__audio-bar" />
              <span className="rail__audio-bar" />
              <span className="rail__audio-bar" />
            </span>
            <span>{soundEnabled ? "SOUND ON" : "SOUND OFF"}</span>
          </button>
        </div>

        <details className="rail__menu" ref={menu}>
          <summary>Rooms</summary>
          <nav className="rail__sheet" aria-label="Rooms">
            <Link href="/">Foyer</Link>
            {ROOMS.map((r) => <Link key={r.id} href={r.href} aria-current={current === r.id ? "page" : undefined}>{r.full}</Link>)}
            <div style={{ display: "flex", gap: "var(--s-2)", marginTop: "var(--s-4)", paddingTop: "var(--s-4)", borderTop: "1px solid oklch(1 0 0 / 0.12)" }}>
              <button type="button" className="rail__ctrl-btn" data-active={effectiveTier !== "static"} onClick={handlePlainToggle}>
                {plainView ? "2D PAPER" : "3D STAGE"}
              </button>
              <button type="button" className="rail__ctrl-btn" data-active={soundEnabled} onClick={handleSoundToggle}>
                {soundEnabled ? "SOUND ON" : "SOUND OFF"}
              </button>
            </div>
          </nav>
        </details>
      </div>
    </header>
  );
}
