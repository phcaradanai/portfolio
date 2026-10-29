import { describe, it, expect } from "vitest";
import { soundscape } from "@/lib/audio";

describe("WebAudio Soundscape Engine", () => {
  it("exports a singleton soundscape engine instance", () => {
    // In node environment, window is undefined or mocked, should not crash
    expect(soundscape !== undefined).toBe(true);
  });

  it("safely handles enable/disable calls in any environment", () => {
    expect(() => {
      soundscape?.setEnabled(true);
      soundscape?.setEnabled(false);
    }).not.toThrow();
  });

  it("safely handles sound triggers without thrown exceptions", () => {
    expect(() => {
      soundscape?.playWaypointChime(1.0);
      soundscape?.playWaypointChime(1.5);
      soundscape?.playHapticTick();
    }).not.toThrow();
  });
});
