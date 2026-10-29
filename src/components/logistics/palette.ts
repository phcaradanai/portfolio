import type { TimeOfDay } from "@/lib/logistics-store";

/** Scene colours per time of day: muted overcast day, warm dusk, navy night with lit lamps. */
export const PALETTES = {
  day: {
    bg: "#c7cfd8", ground: "#c9d0c4", snow: "#eef1f4", pad: "#a9b0b8", road: "#7f8893", marking: "#f4f1e6",
    building: "#e3e6ea", roof: "#9aa6b4", trim: "#3f5b7d", office: "#8fb3cf",
    hemiSky: "#f1f4f8", hemiGround: "#8a919a", hemi: 1.5, sun: "#ffffff", sunIntensity: 1.6, sunDir: [40, 70, 30],
    glow: 0,
  },
  sunset: {
    bg: "#d6a58c", ground: "#b9a493", snow: "#ead9cf", pad: "#9a8c88", road: "#6f6366", marking: "#f6e3c8",
    building: "#e6d6cc", roof: "#8f7f86", trim: "#5b3f5d", office: "#c79b8a",
    hemiSky: "#ffd6b8", hemiGround: "#5a4a52", hemi: 1.1, sun: "#ffad6b", sunIntensity: 2.1, sunDir: [70, 28, 20],
    glow: 0.6,
  },
  night: {
    bg: "#0c1524", ground: "#18212f", snow: "#2a3545", pad: "#1f2938", road: "#161e2b", marking: "#e9cf86",
    building: "#56647a", roof: "#334055", trim: "#e0a43a", office: "#3d5c80",
    hemiSky: "#5a75a8", hemiGround: "#0d1220", hemi: 1.15, sun: "#a9bfff", sunIntensity: 0.9, sunDir: [-30, 60, 40],
    glow: 1.6,
  },
} satisfies Record<TimeOfDay, Record<string, unknown>>;

export type Palette = (typeof PALETTES)[TimeOfDay];

/** Trailer liveries, indexed by Vehicle.livery / ParkedTrailer.livery. */
export const LIVERIES = ["#f3f4f2", "#d4d9df", "#e0a43a", "#d9533f", "#34507f", "#2f8a83"];
