"use client";

import { useEffect, useRef, useState } from "react";
import { startDepthPainting } from "@/lib/depth-painting";

/** The static <img> is the LCP element and the fallback; the canvas fades in over it once WebGL is running. */
export function DepthPainting({ image, depth, srcSet, sizes, width, height, alt, priority }: {
  image: string; depth: string; srcSet?: string; sizes?: string; width: number; height: number; alt: string; priority?: boolean;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    // Only where it pays: a fine pointer on a wide screen. Phones keep the still image (battery, software GL).
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || !matchMedia("(pointer: fine) and (min-width: 52rem)").matches) return;
    let stop: (() => void) | null = null;
    let cancelled = false;
    const run = () => {
      if (cancelled || !canvas.current) return;
      startDepthPainting(canvas.current, image, depth).then((s) => {
        if (cancelled) { s?.(); return; }
        stop = s;
        setLive(!!s);
      });
    };
    // Start after first paint so the image is never competing with WebGL setup.
    // Safari lacks requestIdleCallback, so test for the function rather than assume it.
    const idle = typeof window.requestIdleCallback === "function";
    const handle = idle ? window.requestIdleCallback(run, { timeout: 1500 }) : window.setTimeout(run, 400);
    return () => {
      cancelled = true;
      if (idle) window.cancelIdleCallback(handle); else window.clearTimeout(handle);
      stop?.();
    };
  }, [image, depth]);

  return (
    <span className="depth">
      {/* eslint-disable-next-line @next/next/no-img-element -- static export */}
      <img src={image} srcSet={srcSet} sizes={sizes} width={width} height={height} alt={alt}
        loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : "auto"} decoding={priority ? "sync" : "async"} />
      <canvas ref={canvas} className="depth__gl" data-live={live} aria-hidden="true" />
    </span>
  );
}
