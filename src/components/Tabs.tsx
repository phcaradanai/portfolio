"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

type Tab = { id: string; label: string };

const subscribeHash = (cb: () => void) => { window.addEventListener("hashchange", cb); return () => window.removeEventListener("hashchange", cb); };
const readHash = () => decodeURIComponent(location.hash.slice(1));

/**
 * Tab buttons for panels the server already rendered (`#panel-<id>`, others with `hidden`).
 * Without JS the first panel shows and a <noscript> rule reveals the rest, so content is never lost.
 */
export function Tabs({ tabs, label, defaultId, hash = false }: { tabs: Tab[]; label: string; defaultId?: string; hash?: boolean }) {
  const fromHash = useSyncExternalStore(subscribeHash, readHash, () => "");
  const [picked, setPicked] = useState<string | null>(null);
  const linked = hash && tabs.some((t) => t.id === fromHash) ? fromHash : null;
  const active = picked ?? linked ?? defaultId ?? tabs[0]!.id;
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  const list = useRef<HTMLDivElement>(null);

  // Hydration marker for tests and scripts; a DOM write, not state.
  useEffect(() => { list.current?.setAttribute("data-ready", ""); }, []);

  useEffect(() => {
    for (const t of tabs) {
      const el = document.getElementById(`panel-${t.id}`);
      if (el) el.hidden = t.id !== active;
    }
    if (hash && picked) history.replaceState(null, "", `#${active}`);
  }, [active, tabs, hash, picked]);

  const move = (i: number) => {
    const t = tabs[(i + tabs.length) % tabs.length]!;
    setPicked(t.id);
    refs.current[t.id]?.focus();
  };

  return (
    <div className="tabs" role="tablist" aria-label={label} ref={list}>
      {tabs.map((t, i) => (
        <button
          key={t.id} ref={(el) => { refs.current[t.id] = el; }} role="tab" type="button"
          id={`tab-${t.id}`} aria-selected={t.id === active} aria-controls={`panel-${t.id}`} tabIndex={t.id === active ? 0 : -1}
          onClick={() => setPicked(t.id)}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); move(i + 1); }
            else if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); move(i - 1); }
            else if (e.key === "Home") { e.preventDefault(); move(0); }
            else if (e.key === "End") { e.preventDefault(); move(tabs.length - 1); }
          }}
        >{t.label}</button>
      ))}
    </div>
  );
}
