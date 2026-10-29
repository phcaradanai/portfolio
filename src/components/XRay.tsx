"use client";

import { useId, useState } from "react";

/**
 * Surface (what runs) over structure (how it is built). A native range input drives the split,
 * so keyboard, touch and screen readers work without custom handlers.
 */
export function XRay({ surface, beneath, surfaceLabel = "Running work", beneathLabel = "Structure", initial = 50 }: {
  surface: React.ReactNode; beneath: React.ReactNode; surfaceLabel?: string; beneathLabel?: string; initial?: number;
}) {
  const id = useId();
  const [p, setP] = useState(initial);
  return (
    <div className="xray frame" style={{ ["--p" as string]: `${p}%` }}>
      <div className="xray__stage frame__mat">
        <div className="xray__surface">{surface}</div>
        <div className="xray__beneath" aria-hidden={p < 4 ? true : undefined}>{beneath}</div>
        <span className="xray__edge" aria-hidden="true" />
      </div>
      <label className="xray__control" htmlFor={id}>
        <span>{surfaceLabel}</span>
        <input id={id} type="range" min={0} max={100} value={p} onChange={(e) => setP(Number(e.target.value))}
          aria-valuetext={p > 94 ? `Showing ${beneathLabel.toLowerCase()} only` : p < 6 ? `Showing ${surfaceLabel.toLowerCase()} only` : `${p}% ${beneathLabel.toLowerCase()}`} />
        <span>{beneathLabel}</span>
      </label>
    </div>
  );
}
