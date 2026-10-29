export type ExperienceTier = "full" | "lite" | "static";

export type CapabilityEnv = {
  reducedMotion: boolean;
  webgl2: boolean;
  saveData: boolean;
  coarsePointer: boolean;
  cores: number;
  width: number;
  isClient: boolean;
};

export function detectTier(env: CapabilityEnv): ExperienceTier {
  if (!env.isClient) return "static";
  if (env.reducedMotion || !env.webgl2 || env.saveData) return "static";
  if (env.coarsePointer || env.cores <= 4 || env.width < 768) return "lite";
  return "full";
}

export function getClientCapabilityEnv(): CapabilityEnv {
  if (typeof window === "undefined") {
    return {
      reducedMotion: true,
      webgl2: false,
      saveData: false,
      coarsePointer: true,
      cores: 2,
      width: 0,
      isClient: false,
    };
  }

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const width = window.innerWidth;
  const cores = navigator.hardwareConcurrency || 4;
  const navAny = navigator as unknown as { connection?: { saveData?: boolean } };
  const saveData = Boolean(navAny.connection?.saveData);

  let webgl2 = false;
  try {
    const canvas = document.createElement("canvas");
    webgl2 = Boolean(canvas.getContext("webgl2"));
  } catch {
    webgl2 = false;
  }

  return {
    reducedMotion,
    webgl2,
    saveData,
    coarsePointer,
    cores,
    width,
    isClient: true,
  };
}
