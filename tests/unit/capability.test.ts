import { describe, expect, it } from "vitest";
import { detectTier, type CapabilityEnv } from "@/lib/capability";

describe("detectTier capability checks", () => {
  const baseDesktop: CapabilityEnv = {
    isClient: true,
    reducedMotion: false,
    webgl2: true,
    saveData: false,
    coarsePointer: false,
    cores: 8,
    width: 1440,
  };

  it("returns 'full' on a high-spec desktop with WebGL2", () => {
    expect(detectTier(baseDesktop)).toBe("full");
  });

  it("returns 'static' if not in a client environment", () => {
    expect(detectTier({ ...baseDesktop, isClient: false })).toBe("static");
  });

  it("returns 'static' when prefers-reduced-motion is active", () => {
    expect(detectTier({ ...baseDesktop, reducedMotion: true })).toBe("static");
  });

  it("returns 'static' when WebGL2 is unavailable", () => {
    expect(detectTier({ ...baseDesktop, webgl2: false })).toBe("static");
  });

  it("returns 'static' when Save-Data header/flag is enabled", () => {
    expect(detectTier({ ...baseDesktop, saveData: true })).toBe("static");
  });

  it("returns 'lite' on mobile viewports (< 768px)", () => {
    expect(detectTier({ ...baseDesktop, width: 390, coarsePointer: true })).toBe("lite");
  });

  it("returns 'lite' on machines with low CPU cores (<= 4)", () => {
    expect(detectTier({ ...baseDesktop, cores: 4 })).toBe("lite");
  });
});
