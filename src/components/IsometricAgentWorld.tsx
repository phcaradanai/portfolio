"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { IconArrow, IconExternal, IconPrivate, IconRan, IconSource } from "./icons";

export type IsoDistrict = "command" | "games" | "systems" | "tools" | "vault";

export type IsoMonument = {
  slug: string;
  accession: string;
  title: string;
  shortTitle: string;
  kind: "ai" | "game" | "system" | "tool" | "hardware" | "web" | "vault";
  tier: "A" | "B" | "C" | "CORE" | "VAULT";
  maturity: string;
  tagline: string;
  summary: string;
  period: string;
  stack: string[];
  commits: number;
  files: number;
  testFiles: number;
  aiSummary: string;
  aiTools: { name: string; use: string; evidence?: string }[];
  practiceDocs: string[];
  gridX: number;
  gridY: number;
  height: number;
  district: IsoDistrict;
  stages: number[];
  image: { src: string; srcSet?: string; width: number; height: number; alt: string } | null;
  href: string | null;
  repoUrl: string | null;
  pinnedSha: string | null;
};

export type PipelineStageInfo = {
  step: number;
  code: string;
  title: string;
  subtitle: string;
  rule: string;
  artifacts: string[];
  commandSample: string;
};

export const PIPELINE_STAGES: PipelineStageInfo[] = [
  {
    step: 1,
    code: "S01 · DECREE",
    title: "Human Decree & Repository Contract",
    subtitle: "Every agent session starts locked to explicit product truth, architectural boundaries, and non-goals.",
    rule: "Agents never invent product scope: PRODUCT.md, DESIGN.md, AGENTS.md, and CLAUDE.md define the legal workspace and verification rules before a single line is written.",
    artifacts: ["PRODUCT.md", "DESIGN.md", "AGENTS.md", "CLAUDE.md", "init-prompt.md"],
    commandSample: "verifyContextBinding({ task, workspaceRoot, pinnedSha }) -> BOUND",
  },
  {
    step: 2,
    code: "S02 · CONTEXT",
    title: "Path-Confined MCP & Code-Context Graph",
    subtitle: "High-signal symbol graphs and Rust MCP bridges replace blind whole-repo token dumping.",
    rule: "Tools expose only registered workspaces through exact-match patches, create-only writes, and dependency graphs (Graft + Rust rmcp/axum bridge).",
    artifacts: ["chatgpt-mcp (src/workspace.rs)", "Graft context graph", ".claude/settings.json", "TOML check runners"],
    commandSample: "mcp-bridge serve --bind 127.0.0.1:4100 --workspace-confined",
  },
  {
    step: 3,
    code: "S03 · COUNCIL",
    title: "Multi-Agent Role Split & Orchestration",
    subtitle: "Specialised agents own distinct layers under human arbitration instead of colliding in one prompt.",
    rule: "WORK_IN_PROGRESS.md and Grand Vizier councils split UX/UI (Codex), core systems (Claude Opus/Sonnet), security review (Hermes), and status archiving.",
    artifacts: ["AI Kingdom (grandVizierOrchestrator)", "WORK_IN_PROGRESS.md", "prompt_used/#001..#006", "Archivist skill"],
    commandSample: "decreeToDone.advance(taskId) -> COUNCIL_APPROVED -> WORK_ORDER_LINKED",
  },
  {
    step: 4,
    code: "S04 · FORGE",
    title: "AI-Directed Art, Sprites & Depth Shaders",
    subtitle: "Generative imagery is treated as raw material: depth-mapped locally, atlas-packed, and provenance-labelled.",
    rule: "PixelLab sprites and image_gen backplates pass through local Depth-Anything-V2 inference and raw WebGL two-step parallax shaders, with every asset's tool recorded.",
    artifacts: ["Depth-Anything-V2 depth maps", "PixelLab sprite atlases", "Impeccable visual critique", "ASSET_PIPELINE.md"],
    commandSample: "shader: sample(depth, uv - look * (d - 0.45) * 0.04) -> 2KB raw WebGL",
  },
  {
    step: 5,
    code: "S05 · SANDBOX",
    title: "Token-Authenticated Runner & Safety Policy",
    subtitle: "External agent CLIs execute in isolated workspaces with allowlisted git commands and zero auto-push.",
    rule: "Auto-created patch jobs are refused push privileges by a pure policy function; git operations are restricted to kingdom/job-* branches and gated by an 8-check risk policy.",
    artifacts: ["apps/runner (sandbox worker)", "evaluateAutoPatchRisk()", "isPushAllowedForJob() -> false", "Serial hex validator"],
    commandSample: "runner.claimJob(token) -> branch: kingdom/job-042 -> pushAllowed: false",
  },
  {
    step: 6,
    code: "S06 · VERIFY",
    title: "Deterministic Test, Axe & Pinned-SHA Gate",
    subtitle: "No agent claim is trusted until machine-checked against git, unit suites, and WCAG 2.2 AA browser audits.",
    rule: "757 test files across the repositories plus verify-content.ts, scan-secrets.ts, Playwright E2E, and axe-core audits gate every release before human Accept & Learn.",
    artifacts: ["757 repo test files", "scripts/verify-content.ts", "Playwright + @axe-core", "Pinned 40-char git SHAs"],
    commandSample: "npm run verify -> typecheck + lint + vitest + build + scan + playwright PASS",
  },
];

const LENSES: { id: "all" | IsoDistrict; label: string }[] = [
  { id: "all", label: "All Works" },
  { id: "command", label: "AI & MCP" },
  { id: "games", label: "Game Worlds" },
  { id: "systems", label: "Systems & Hardware" },
  { id: "tools", label: "Dev Tools" },
  { id: "vault", label: "Private Vault" },
];

const SCROLL_ZONES: {
  id: number;
  code: string;
  label: string;
  focusX: number;
  focusY: number;
  yawOffset: number;
  zoom: number;
  slug: string;
}[] = [
  { id: 0, code: "Z00", label: "Island Overview", focusX: 0, focusY: 0, yawOffset: 0, zoom: 1.04, slug: "agent-command-core" },
  { id: 1, code: "Z01", label: "AI & MCP Wing", focusX: -2.1, focusY: -2.1, yawOffset: 0.22, zoom: 1.24, slug: "ai-kingdom" },
  { id: 2, code: "Z02", label: "Game Worlds", focusX: 2.1, focusY: -2.1, yawOffset: -0.22, zoom: 1.24, slug: "cursed-market" },
  { id: 3, code: "Z03", label: "Systems & Tools", focusX: -2.1, focusY: 2.1, yawOffset: 0.18, zoom: 1.24, slug: "print-ops" },
  { id: 4, code: "Z04", label: "Private Vault", focusX: 2.1, focusY: 2.1, yawOffset: -0.2, zoom: 1.26, slug: "enterprise-cv-vault" },
];

// Organic cyberpunk low-poly trees / crystal flora coordinates across the campus plazas
const CAMPUS_FLORA: { gx: number; gy: number; scale: number; variant: "sakura" | "mint" | "gold" }[] = [
  { gx: -0.95, gy: -0.95, scale: 0.95, variant: "mint" },
  { gx: 0.95, gy: -0.95, scale: 1.05, variant: "sakura" },
  { gx: -0.95, gy: 0.95, scale: 0.9, variant: "gold" },
  { gx: 0.95, gy: 0.95, scale: 1.0, variant: "mint" },
  { gx: -2.8, gy: -0.7, scale: 0.85, variant: "mint" },
  { gx: -0.8, gy: -2.6, scale: 0.8, variant: "sakura" },
  { gx: 2.8, gy: -2.8, scale: 1.1, variant: "sakura" },
  { gx: 1.2, gy: -1.3, scale: 0.78, variant: "gold" },
  { gx: -2.8, gy: 2.7, scale: 1.0, variant: "mint" },
  { gx: -1.1, gy: 1.8, scale: 0.82, variant: "gold" },
  { gx: 2.8, gy: 2.7, scale: 0.95, variant: "gold" },
  { gx: 2.8, gy: 0.8, scale: 0.85, variant: "sakura" },
  { gx: -4.1, gy: 0.2, scale: 0.9, variant: "mint" },
  { gx: 4.1, gy: -1.1, scale: 0.88, variant: "sakura" },
  { gx: 0.1, gy: -4.1, scale: 0.92, variant: "mint" },
  { gx: -0.2, gy: 4.1, scale: 0.9, variant: "gold" },
];

export type PbrMaterialSpec = {
  roughness: number;
  metalness: number;
  finishLabel: string;
  glintColor: string;
};

export function getMonumentPbr(m: IsoMonument): PbrMaterialSpec {
  if (m.tier === "CORE") {
    return {
      roughness: 0.06,
      metalness: 0.96,
      finishLabel: "Mirror Holo-Chrome",
      glintColor: "#9efcf0",
    };
  }
  if (m.tier === "VAULT" || m.district === "vault") {
    return {
      roughness: 0.08,
      metalness: 0.94,
      finishLabel: "Polished Gold & Obsidian",
      glintColor: "#ffe094",
    };
  }
  if (m.tier === "A") {
    return {
      roughness: 0.1,
      metalness: 0.91,
      finishLabel:
        m.district === "games"
          ? "Iridescent Rose-Titanium"
          : m.district === "systems"
            ? "Brushed Cobalt Chrome"
            : "Anodized Specular Alloy",
      glintColor: m.district === "games" ? "#ffb3d9" : m.district === "systems" ? "#a8ccff" : "#7cf5e6",
    };
  }
  return {
    roughness: 0.15,
    metalness: 0.85,
    finishLabel: "Satin Metallic Cladding",
    glintColor: "#dffef9",
  };
}

// Deterministic organic ecosystem: 32 fluttering leaves/petals, 32 volumetric dust motes, 20 bioluminescent fireflies
export const CAMPUS_PARTICLES: {
  id: number;
  gx: number;
  gy: number;
  gzBase: number;
  speed: number;
  phase: number;
  size: number;
  kind: "leaf" | "dust" | "firefly";
  leafVariant: "sakura" | "mint" | "ginkgo";
  hue: string;
  veinHue: string;
  flutterFreq: number;
  tumbleSpeed: number;
}[] = Array.from({ length: 84 }, (_, i) => {
  const angle = i * 2.3999632; // Golden angle distribution across island
  const radius = 0.38 + ((i * 19) % 43) * 0.098;
  const kind: "leaf" | "dust" | "firefly" = i < 32 ? "leaf" : i < 64 ? "dust" : "firefly";
  const leafVariants: ("sakura" | "mint" | "ginkgo")[] = ["sakura", "mint", "ginkgo"];
  const leafVariant = leafVariants[i % 3]!;
  const dustHues = ["#fff6dc", "#d8f6ff", "#ffe8f2", "#e2dcff", "#9efcf0"];
  const fireflyHues = ["#7cf5e6", "#ff9ec4", "#ffe094", "#b8a8ff", "#9efcf0"];

  const hue =
    kind === "leaf"
      ? leafVariant === "sakura"
        ? "#ffb3d9"
        : leafVariant === "mint"
          ? "#7cf5e6"
          : "#ffd782"
      : kind === "dust"
        ? dustHues[i % dustHues.length]!
        : fireflyHues[i % fireflyHues.length]!;

  const veinHue =
    leafVariant === "sakura" ? "#fff0f8" : leafVariant === "mint" ? "#e6fffb" : "#fff9e2";

  return {
    id: i,
    gx: Math.cos(angle) * radius,
    gy: Math.sin(angle) * radius,
    gzBase: kind === "leaf" ? 0.25 + ((i * 17) % 28) * 0.058 : 0.16 + ((i * 13) % 26) * 0.082,
    speed: kind === "leaf" ? 0.34 + (i % 6) * 0.065 : 0.38 + (i % 7) * 0.095,
    phase: (i * 0.73) % (Math.PI * 2),
    size: kind === "leaf" ? 3.4 + (i % 4) * 0.55 : kind === "firefly" ? 2.5 : 1.45 + (i % 3) * 0.35,
    kind,
    leafVariant,
    hue,
    veinHue,
    flutterFreq: 1.7 + (i % 5) * 0.34,
    tumbleSpeed: 1.25 + (i % 6) * 0.28,
  };
});

type Packet = {
  id: number;
  targetSlug: string;
  tx: number;
  ty: number;
  progress: number;
  speed: number;
  label: string;
  hue: string;
};

type PulseRing = {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  color: string;
};

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

export function IsometricAgentWorld({
  monuments,
  totalCommits,
  totalFiles,
  totalTests,
  email,
}: {
  monuments: IsoMonument[];
  totalCommits: number;
  totalFiles: number;
  totalTests: number;
  email: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stageSliderId = useId();

  const [selectedSlug, setSelectedSlug] = useState<string>("ai-kingdom");
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);
  const [lens, setLens] = useState<"all" | IsoDistrict>("all");
  const [activeStage, setActiveStage] = useState<number>(0);
  const [rotIndex, setRotIndex] = useState<number>(0);
  const [zoom, setZoom] = useState<number>(1.04);
  const [scrollZoneProgress, setScrollZoneProgress] = useState<number>(0); // 0..4 continuous scroll-driven zone rig
  const [renderTheme, setRenderTheme] = useState<"holo" | "studio">("holo");
  const [postFx, setPostFx] = useState<boolean>(true);
  const [specularEnabled, setSpecularEnabled] = useState<boolean>(true);
  const [natureEnabled, setNatureEnabled] = useState<boolean>(true);
  const [dragMode, setDragMode] = useState<"orbit" | "pan">("orbit");
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  const [pulseCount, setPulseCount] = useState<number>(0);
  const [breezeCount, setBreezeCount] = useState<number>(0);
  const [dossierOpen, setDossierOpen] = useState<boolean>(true);
  const [telemetryLog, setTelemetryLog] = useState<string[]>([
    "[OCTANE-ISO] Low-poly architectural campus initialised · 23 monuments indexed from git.",
    "[PBR-GLINT] Low-roughness (0.06–0.15) high-metalness (0.85–0.96) specular reflectors & 84 organic particles active.",
    "[READY] Drag to orbit camera & shimmer metallic surfaces, WASD to pilot Rover, Space to pulse, or B for breeze.",
  ]);

  const audioRef = useRef<{
    ctx: AudioContext | null;
    droneGain: GainNode | null;
  }>({
    ctx: null,
    droneGain: null,
  });

  const selected = useMemo(
    () => monuments.find((m) => m.slug === selectedSlug) ?? monuments[0]!,
    [monuments, selectedSlug],
  );
  const selectedPbr = useMemo(() => getMonumentPbr(selected), [selected]);

  const visibleMonuments = useMemo(() => {
    return monuments.filter((m) => {
      if (m.tier === "CORE") return true;
      const lensMatch = lens === "all" || m.district === lens;
      const stageMatch = activeStage === 0 || m.stages.includes(activeStage);
      return lensMatch && stageMatch;
    });
  }, [monuments, lens, activeStage]);

  const pushLog = useCallback((line: string) => {
    setTelemetryLog((prev) => [line, ...prev.slice(0, 5)]);
  }, []);

  const playSynthSfx = useCallback(
    (kind: "hover" | "dock" | "pulse" | "waypoint" | "breeze", pitchSeed = 0) => {
      if (!soundEnabled) return;
      const ctx = audioRef.current.ctx;
      if (!ctx || ctx.state !== "running") return;
      const now = ctx.currentTime;

      if (kind === "hover") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        const baseFreq = 740 + (pitchSeed % 5) * 65;
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.25, now + 0.045);
        gain.gain.setValueAtTime(0.025, now);
        gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.05);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.055);
      } else if (kind === "dock" || kind === "waypoint") {
        const notes = kind === "dock" ? [440, 554.37, 659.25] : [392, 523.25];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "triangle";
          const start = now + idx * 0.045;
          osc.frequency.setValueAtTime(freq + pitchSeed * 12, start);
          gain.gain.setValueAtTime(0.045, start);
          gain.gain.exponentialRampToValueAtTime(0.0008, start + 0.24);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(start);
          osc.stop(start + 0.26);
        });
      } else if (kind === "pulse") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.28);
        gain.gain.setValueAtTime(0.055, now);
        gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.32);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.34);
      } else if (kind === "breeze") {
        const notes = [587.33, 739.99, 880, 1174.66];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          const start = now + idx * 0.055;
          osc.frequency.setValueAtTime(freq, start);
          gain.gain.setValueAtTime(0.03, start);
          gain.gain.exponentialRampToValueAtTime(0.0008, start + 0.32);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(start);
          osc.stop(start + 0.34);
        });
      }
    },
    [soundEnabled],
  );

  const toggleSound = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;

      if (!audioRef.current.ctx) {
        const ctx = new AudioCtx();
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 420;

        const droneGain = ctx.createGain();
        droneGain.gain.value = 0.022;

        const oscA = ctx.createOscillator();
        const oscB = ctx.createOscillator();
        oscA.type = "sine";
        oscB.type = "triangle";
        oscA.frequency.value = 146.83; // D3 warm ambient root
        oscB.frequency.value = 220.0; // A3 fifth harmonic

        oscA.connect(filter);
        oscB.connect(filter);
        filter.connect(droneGain);
        droneGain.connect(ctx.destination);

        oscA.start();
        oscB.start();
        audioRef.current = { ctx, droneGain };
        setSoundEnabled(true);
        pushLog("[AUDIO] Procedural Web Audio ambient studio pad & crystalline telemetry chimes enabled.");
        return;
      }

      const { ctx, droneGain } = audioRef.current;
      if (!soundEnabled) {
        void ctx.resume();
        if (droneGain) droneGain.gain.setTargetAtTime(0.022, ctx.currentTime, 0.08);
        setSoundEnabled(true);
        pushLog("[AUDIO] Procedural Web Audio soundscape unmuted.");
      } else {
        if (droneGain) droneGain.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.06);
        setSoundEnabled(false);
        pushLog("[AUDIO] Procedural Web Audio soundscape muted.");
      }
    } catch {
      setSoundEnabled(false);
    }
  }, [pushLog, soundEnabled]);

  useEffect(() => {
    return () => {
      if (audioRef.current.ctx) {
        void audioRef.current.ctx.close().catch(() => undefined);
      }
    };
  }, []);

  const simRef = useRef<{
    roverX: number;
    roverY: number;
    targetX: number;
    targetY: number;
    roverAngle: number;
    camAngle: number;
    targetCamAngle: number;
    customOrbitOffset: number;
    camZoom: number;
    targetZoom: number;
    focusX: number;
    focusY: number;
    targetFocusX: number;
    targetFocusY: number;
    emissiveMap: Record<string, number>;
    panX: number;
    panY: number;
    pointerNormX: number;
    pointerNormY: number;
    pointerWorldX: number;
    pointerWorldY: number;
    windGust: number;
    glintSweepBoost: number;
    dragging: boolean;
    dragStartX: number;
    dragStartY: number;
    dragStartAngle: number;
    dragMoved: boolean;
    keys: Set<string>;
    packets: Packet[];
    rings: PulseRing[];
    projectedHitboxes: {
      slug: string;
      cx: number;
      cy: number;
      topY: number;
      baseY: number;
      halfW: number;
      depth: number;
    }[];
    reducedMotion: boolean;
  }>({
    roverX: -1.4,
    roverY: -1.4,
    targetX: -2.0,
    targetY: -2.0,
    roverAngle: 0,
    camAngle: 0,
    targetCamAngle: 0,
    customOrbitOffset: 0,
    camZoom: 1.04,
    targetZoom: 1.04,
    focusX: 0,
    focusY: 0,
    targetFocusX: 0,
    targetFocusY: 0,
    emissiveMap: {},
    panX: -48,
    panY: 22,
    pointerNormX: 0,
    pointerNormY: 0,
    pointerWorldX: 99,
    pointerWorldY: 99,
    windGust: 0,
    glintSweepBoost: 0,
    dragging: false,
    dragStartX: 0,
    dragStartY: 0,
    dragStartAngle: 0,
    dragMoved: false,
    keys: new Set(),
    packets: [],
    rings: [],
    projectedHitboxes: [],
    reducedMotion: false,
  });

  const selectMonument = useCallback(
    (slug: string, announce = true) => {
      const m = monuments.find((x) => x.slug === slug);
      if (!m) return;
      setSelectedSlug(slug);
      setDossierOpen(true);
      simRef.current.targetX = m.gridX;
      simRef.current.targetY = m.gridY;
      simRef.current.glintSweepBoost = 0.85;
      simRef.current.rings.push({
        x: m.gridX,
        y: m.gridY,
        radius: 0.16,
        alpha: 1,
        color: renderTheme === "holo" ? "#7af5e6" : "#e54835",
      });
      if (announce) {
        playSynthSfx("dock", Math.round((m.gridX + 5) * 2));
        const pbr = getMonumentPbr(m);
        const toolNames = m.aiTools.length
          ? m.aiTools.slice(0, 3).map((t) => t.name.split(" (")[0]).join(", ")
          : m.tier === "C" || m.tier === "VAULT"
            ? "Private / Inquiry Vault"
            : "Core Engineering";
        pushLog(
          `[DOCK] ${m.accession} · ${m.shortTitle} (R:${pbr.roughness.toFixed(2)} M:${pbr.metalness.toFixed(2)}) -> [${toolNames}]`,
        );
      }
    },
    [monuments, playSynthSfx, pushLog, renderTheme],
  );

  const triggerAgentPulse = useCallback(() => {
    const s = simRef.current;
    const labels = ["CLAUDE", "CODEX", "MCP", "GRAFT", "PIXELLAB", "DEPTH-V2", "AXE-QA"];
    const hues = ["#7cf5e6", "#ff9ec4", "#b8a8ff", "#ffe094", "#8ae8ff", "#ff7a6b"];
    const targets = monuments.filter((m) => m.tier !== "CORE");
    targets.forEach((m, idx) => {
      s.packets.push({
        id: Date.now() + idx,
        targetSlug: m.slug,
        tx: m.gridX,
        ty: m.gridY,
        progress: 0,
        speed: 0.0075 + (idx % 5) * 0.002,
        label: labels[idx % labels.length]!,
        hue: hues[idx % hues.length]!,
      });
    });
    s.rings.push({ x: 0, y: 0, radius: 0.22, alpha: 1, color: "#ff7a9e" });
    s.glintSweepBoost = 1.0;
    setPulseCount((c) => c + 1);
    playSynthSfx("pulse");
    pushLog(`[DECREE PULSE] Dispatched ${targets.length} holographic agent packets across the isometric grid.`);
  }, [monuments, playSynthSfx, pushLog]);

  const triggerBreezeAndGlint = useCallback(() => {
    const s = simRef.current;
    s.windGust = 1.65;
    s.glintSweepBoost = 1.25;
    s.customOrbitOffset += 0.38;
    const idx = Math.round(scrollZoneProgress);
    const zone = SCROLL_ZONES[idx] ?? SCROLL_ZONES[0]!;
    s.targetCamAngle = (rotIndex * Math.PI) / 2 + zone.yawOffset + s.customOrbitOffset;
    s.rings.push({ x: 0, y: 0, radius: 0.28, alpha: 0.9, color: "#7cf5e6" });
    setBreezeCount((c) => c + 1);
    playSynthSfx("breeze");
    pushLog(
      "[MICRO-FX] Triggered natural canopy breeze (sakura/ginkgo/mint leaves + dust motes) & metallic specular camera sweep.",
    );
  }, [playSynthSfx, pushLog, rotIndex, scrollZoneProgress]);

  // Interpolate camera focus, zoom, and subtle rotation from scrollZoneProgress (0..4) + rotIndex
  const applyScrollZoneCamera = useCallback(
    (progress: number, selectTarget = false) => {
      const clamped = clamp(progress, 0, SCROLL_ZONES.length - 1);
      setScrollZoneProgress(clamped);
      const idxA = Math.floor(clamped);
      const idxB = Math.min(SCROLL_ZONES.length - 1, idxA + 1);
      const t = clamped - idxA;
      const zA = SCROLL_ZONES[idxA]!;
      const zB = SCROLL_ZONES[idxB]!;

      const s = simRef.current;
      s.customOrbitOffset = 0;
      s.glintSweepBoost = 0.95;
      s.targetFocusX = zA.focusX + (zB.focusX - zA.focusX) * t;
      s.targetFocusY = zA.focusY + (zB.focusY - zA.focusY) * t;
      const yaw = zA.yawOffset + (zB.yawOffset - zA.yawOffset) * t;
      s.targetCamAngle = (rotIndex * Math.PI) / 2 + yaw;
      s.targetZoom = zA.zoom + (zB.zoom - zA.zoom) * t;

      if (selectTarget) {
        const nearestZone = SCROLL_ZONES[Math.round(clamped)]!;
        playSynthSfx("waypoint", nearestZone.id);
        selectMonument(nearestZone.slug, true);
      }
    },
    [playSynthSfx, rotIndex, selectMonument],
  );

  useEffect(() => {
    const idx = Math.round(scrollZoneProgress);
    const zone = SCROLL_ZONES[idx] ?? SCROLL_ZONES[0]!;
    simRef.current.glintSweepBoost = 1.1;
    simRef.current.targetCamAngle =
      (rotIndex * Math.PI) / 2 + zone.yawOffset + simRef.current.customOrbitOffset;
  }, [rotIndex, scrollZoneProgress]);

  useEffect(() => {
    simRef.current.targetZoom = zoom;
  }, [zoom]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rmQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    simRef.current.reducedMotion = rmQuery.matches;

    if (simRef.current.packets.length === 0) {
      const labels = ["CLAUDE", "CODEX", "MCP", "GRAFT", "PIXELLAB", "DEPTH-V2", "VERIFY"];
      const hues = ["#7cf5e6", "#ff9ec4", "#b8a8ff", "#ffe094", "#8ae8ff", "#ff7a6b"];
      monuments
        .filter((m) => m.tier !== "CORE")
        .slice(0, 14)
        .forEach((m, i) => {
          simRef.current.packets.push({
            id: i + 1,
            targetSlug: m.slug,
            tx: m.gridX,
            ty: m.gridY,
            progress: (i * 0.14) % 1,
            speed: 0.0042 + (i % 4) * 0.0011,
            label: labels[i % labels.length]!,
            hue: hues[i % hues.length]!,
          });
        });
    }

    let raf = 0;
    let visible = true;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(320, Math.round(rect.width * dpr));
      const h = Math.max(300, Math.round(rect.height * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    };

    const project = (
      gx: number,
      gy: number,
      gz: number,
      w: number,
      h: number,
      camAngle: number,
      camZoom: number,
      panX: number,
      panY: number,
    ) => {
      const s = simRef.current;
      const cx = gx - s.focusX;
      const cy = gy - s.focusY;
      const cos = Math.cos(camAngle);
      const sin = Math.sin(camAngle);
      const rx = cx * cos - cy * sin;
      const ry = cx * sin + cy * cos;
      const baseScale = Math.min(w / 14.2, h / 8.8) * camZoom;
      const tileW = baseScale * 0.9;
      const tileH = baseScale * 0.47;
      const zScale = baseScale * 0.64;
      const sx = w * 0.46 + panX + (rx - ry) * tileW;
      const sy = h * 0.54 + panY + (rx + ry) * tileH - gz * zScale;
      return { sx, sy, rx, ry, depth: rx + ry, baseScale };
    };

    // Draw soft Octane-style ambient occlusion & directional cast shadow on ground plane
    const drawSoftGroundShadow = (
      gx: number,
      gy: number,
      radiusWorld: number,
      heightZ: number,
      w: number,
      h: number,
      camAngle: number,
      camZoom: number,
      panX: number,
      panY: number,
    ) => {
      const base = project(gx + heightZ * 0.14, gy + heightZ * 0.12, 0.01, w, h, camAngle, camZoom, panX, panY);
      const rx = Math.max(10, radiusWorld * base.baseScale * 1.35);
      const ry = rx * 0.54;
      ctx.save();
      const g = ctx.createRadialGradient(base.sx, base.sy, rx * 0.08, base.sx, base.sy, rx);
      g.addColorStop(0, renderTheme === "holo" ? "rgba(8, 10, 26, 0.58)" : "rgba(4, 8, 12, 0.62)");
      g.addColorStop(0.55, renderTheme === "holo" ? "rgba(14, 16, 38, 0.28)" : "rgba(4, 8, 12, 0.28)");
      g.addColorStop(1, "rgba(8, 10, 26, 0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(base.sx, base.sy, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    // Draw 4-point diamond specular starburst glint when camera angle aligns with metallic bevel
    const drawSpecularStarGlint = (
      sx: number,
      sy: number,
      intensity: number,
      glintColor: string,
      dprVal: number,
    ) => {
      if (intensity <= 0.08) return;
      const armLong = (7.5 + intensity * 12.5) * dprVal;
      const armShort = armLong * 0.24;
      ctx.save();
      ctx.translate(sx, sy);
      // Soft radial metallic halo
      const halo = ctx.createRadialGradient(0, 0, 0.5, 0, 0, armLong * 1.15);
      halo.addColorStop(0, `rgba(255, 255, 255, ${Math.min(0.96, intensity * 0.98).toFixed(2)})`);
      halo.addColorStop(0.38, glintColor);
      halo.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = halo;
      ctx.globalAlpha = Math.min(1, intensity * 0.85);
      ctx.beginPath();
      ctx.arc(0, 0, armLong * 1.15, 0, Math.PI * 2);
      ctx.fill();

      // Crisp 4-point diamond star flare
      ctx.fillStyle = "#ffffff";
      ctx.globalAlpha = Math.min(1, intensity * 0.96);
      ctx.beginPath();
      ctx.moveTo(0, -armLong);
      ctx.quadraticCurveTo(armShort * 0.45, -armShort * 0.45, armLong, 0);
      ctx.quadraticCurveTo(armShort * 0.45, armShort * 0.45, 0, armLong);
      ctx.quadraticCurveTo(-armShort * 0.45, armShort * 0.45, -armLong, 0);
      ctx.quadraticCurveTo(-armShort * 0.45, -armShort * 0.45, 0, -armLong);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    // Draw 3D Isometric Prism with Octane gradient shading, PBR low-roughness/high-metalness specular glint & micro-windows
    const drawOctanePrism = (
      gx: number,
      gy: number,
      gzBase: number,
      halfSize: number,
      heightZ: number,
      colors: {
        topA: string;
        topB: string;
        leftA: string;
        leftB: string;
        rightA: string;
        rightB: string;
        stroke: string;
        windowGlow?: string;
        windowRows?: number;
      },
      w: number,
      h: number,
      camAngle: number,
      camZoom: number,
      panX: number,
      panY: number,
      pbr?: {
        roughness: number;
        metalness: number;
        glintColor: string;
        phaseSeed?: number;
      },
    ) => {
      const s = simRef.current;
      const dprVal = Math.min(window.devicePixelRatio || 1, 2);
      const corners = [
        { x: gx - halfSize, y: gy - halfSize },
        { x: gx + halfSize, y: gy - halfSize },
        { x: gx + halfSize, y: gy + halfSize },
        { x: gx - halfSize, y: gy + halfSize },
      ];
      const bot = corners.map((c) => project(c.x, c.y, gzBase, w, h, camAngle, camZoom, panX, panY));
      const top = corners.map((c) => project(c.x, c.y, gzBase + heightZ, w, h, camAngle, camZoom, panX, panY));

      let frontIdx = 0;
      for (let i = 1; i < 4; i++) {
        if (bot[i]!.sy > bot[frontIdx]!.sy) frontIdx = i;
      }
      const prevIdx = (frontIdx + 3) % 4;
      const nextIdx = (frontIdx + 1) % 4;
      const leftNeighbor = bot[prevIdx]!.sx < bot[nextIdx]!.sx ? prevIdx : nextIdx;
      const rightNeighbor = leftNeighbor === prevIdx ? nextIdx : prevIdx;

      // View-dependent PBR specular computation (low roughness + high metalness)
      let glintStrength = 0;
      let sweepPos = 0.5;
      let leftReflect = 0;
      let rightReflect = 0;
      if (specularEnabled && pbr) {
        const seed = pbr.phaseSeed ?? gx * 1.43 + gy * 0.97 + gzBase * 2.3;
        const specFactor = clamp((1 - pbr.roughness) * pbr.metalness, 0.15, 0.98);
        const viewPhase = camAngle * 2.6 + seed + s.pointerNormX * 1.35 - s.pointerNormY * 0.65;
        const rawPeak = Math.pow(Math.max(0, Math.cos(viewPhase)), 3.5 + (1 - pbr.roughness) * 11);
        const orthoPeak = Math.pow(Math.max(0, Math.sin(viewPhase * 1.25)), 4.5);
        glintStrength = clamp((rawPeak + orthoPeak * 0.45 + s.glintSweepBoost * 0.52) * specFactor, 0, 1);
        sweepPos = clamp(0.5 + 0.44 * Math.sin(viewPhase), 0.08, 0.92);
        leftReflect = clamp(Math.max(0, Math.cos(viewPhase - 0.55)) * specFactor, 0, 1);
        rightReflect = clamp(Math.max(0, Math.sin(viewPhase + 0.45)) * specFactor, 0, 1);
      }

      // Left visible vertical face with vertical Octane GI gradient
      const leftGrad = ctx.createLinearGradient(0, top[leftNeighbor]!.sy, 0, bot[frontIdx]!.sy);
      leftGrad.addColorStop(0, colors.leftA);
      leftGrad.addColorStop(1, colors.leftB);
      ctx.beginPath();
      ctx.moveTo(bot[leftNeighbor]!.sx, bot[leftNeighbor]!.sy);
      ctx.lineTo(bot[frontIdx]!.sx, bot[frontIdx]!.sy);
      ctx.lineTo(top[frontIdx]!.sx, top[frontIdx]!.sy);
      ctx.lineTo(top[leftNeighbor]!.sx, top[leftNeighbor]!.sy);
      ctx.closePath();
      ctx.fillStyle = leftGrad;
      ctx.fill();

      // PBR Anisotropic Metallic Reflection on Left Face
      if (specularEnabled && pbr && leftReflect > 0.14) {
        ctx.save();
        const lSpecGrad = ctx.createLinearGradient(
          top[leftNeighbor]!.sx,
          top[leftNeighbor]!.sy,
          bot[frontIdx]!.sx,
          bot[frontIdx]!.sy,
        );
        const peakAlpha = Math.min(0.62, leftReflect * 0.58);
        lSpecGrad.addColorStop(0, "rgba(255, 255, 255, 0)");
        lSpecGrad.addColorStop(clamp(sweepPos - 0.18, 0.02, 0.9), "rgba(255, 255, 255, 0)");
        lSpecGrad.addColorStop(sweepPos, `rgba(255, 255, 255, ${peakAlpha.toFixed(2)})`);
        lSpecGrad.addColorStop(clamp(sweepPos + 0.18, 0.1, 0.98), "rgba(255, 255, 255, 0)");
        lSpecGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
        ctx.fillStyle = lSpecGrad;
        ctx.fill();
        ctx.restore();
      }

      ctx.strokeStyle = colors.stroke;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Right visible vertical face with shadow gradient
      const rightGrad = ctx.createLinearGradient(0, top[rightNeighbor]!.sy, 0, bot[frontIdx]!.sy);
      rightGrad.addColorStop(0, colors.rightA);
      rightGrad.addColorStop(1, colors.rightB);
      ctx.beginPath();
      ctx.moveTo(bot[frontIdx]!.sx, bot[frontIdx]!.sy);
      ctx.lineTo(bot[rightNeighbor]!.sx, bot[rightNeighbor]!.sy);
      ctx.lineTo(top[rightNeighbor]!.sx, top[rightNeighbor]!.sy);
      ctx.lineTo(top[frontIdx]!.sx, top[frontIdx]!.sy);
      ctx.closePath();
      ctx.fillStyle = rightGrad;
      ctx.fill();

      // PBR Anisotropic Metallic Reflection on Right Face
      if (specularEnabled && pbr && rightReflect > 0.14) {
        ctx.save();
        const rSpecGrad = ctx.createLinearGradient(
          top[frontIdx]!.sx,
          top[frontIdx]!.sy,
          bot[rightNeighbor]!.sx,
          bot[rightNeighbor]!.sy,
        );
        const peakAlpha = Math.min(0.56, rightReflect * 0.52);
        rSpecGrad.addColorStop(0, "rgba(255, 255, 255, 0)");
        rSpecGrad.addColorStop(clamp(sweepPos - 0.18, 0.02, 0.9), "rgba(255, 255, 255, 0)");
        rSpecGrad.addColorStop(sweepPos, `rgba(255, 255, 255, ${peakAlpha.toFixed(2)})`);
        rSpecGrad.addColorStop(clamp(sweepPos + 0.18, 0.1, 0.98), "rgba(255, 255, 255, 0)");
        rSpecGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
        ctx.fillStyle = rSpecGrad;
        ctx.fill();
        ctx.restore();
      }

      ctx.strokeStyle = colors.stroke;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Micro-detail facade windows / server blade LEDs on left & right faces
      if (colors.windowGlow && colors.windowRows && colors.windowRows > 0) {
        const rows = Math.min(7, colors.windowRows);
        ctx.strokeStyle = colors.windowGlow;
        ctx.lineWidth = 1.4;
        for (let r = 1; r <= rows; r++) {
          const t = r / (rows + 1.2);
          // Left face horizontal slit
          const lx1 = bot[leftNeighbor]!.sx + (top[leftNeighbor]!.sx - bot[leftNeighbor]!.sx) * (1 - t);
          const ly1 = bot[leftNeighbor]!.sy + (top[leftNeighbor]!.sy - bot[leftNeighbor]!.sy) * (1 - t);
          const lx2 = bot[frontIdx]!.sx + (top[frontIdx]!.sx - bot[frontIdx]!.sx) * (1 - t);
          const ly2 = bot[frontIdx]!.sy + (top[frontIdx]!.sy - bot[frontIdx]!.sy) * (1 - t);
          ctx.beginPath();
          ctx.moveTo(lx1 + (lx2 - lx1) * 0.18, ly1 + (ly2 - ly1) * 0.18);
          ctx.lineTo(lx1 + (lx2 - lx1) * 0.82, ly1 + (ly2 - ly1) * 0.82);
          ctx.stroke();

          // Right face horizontal slit
          const rx1 = bot[frontIdx]!.sx + (top[frontIdx]!.sx - bot[frontIdx]!.sx) * (1 - t);
          const ry1 = bot[frontIdx]!.sy + (top[frontIdx]!.sy - bot[frontIdx]!.sy) * (1 - t);
          const rx2 = bot[rightNeighbor]!.sx + (top[rightNeighbor]!.sx - bot[rightNeighbor]!.sx) * (1 - t);
          const ry2 = bot[rightNeighbor]!.sy + (top[rightNeighbor]!.sy - bot[rightNeighbor]!.sy) * (1 - t);
          ctx.beginPath();
          ctx.moveTo(rx1 + (rx2 - rx1) * 0.18, ry1 + (ry2 - ry1) * 0.18);
          ctx.lineTo(rx1 + (rx2 - rx1) * 0.82, ry1 + (ry2 - ry1) * 0.82);
          ctx.stroke();
        }
      }

      // Top roof face with diagonal pastel-holographic highlight gradient
      const topGrad = ctx.createLinearGradient(top[0]!.sx, top[0]!.sy, top[2]!.sx, top[2]!.sy);
      topGrad.addColorStop(0, colors.topA);
      topGrad.addColorStop(1, colors.topB);
      ctx.beginPath();
      ctx.moveTo(top[0]!.sx, top[0]!.sy);
      for (let i = 1; i < 4; i++) ctx.lineTo(top[i]!.sx, top[i]!.sy);
      ctx.closePath();
      ctx.fillStyle = topGrad;
      ctx.fill();

      // PBR Low-Roughness Clearcoat Specular Streak across Roof Face
      if (specularEnabled && pbr && glintStrength > 0.12) {
        ctx.save();
        const roofSpecGrad = ctx.createLinearGradient(top[0]!.sx, top[0]!.sy, top[2]!.sx, top[2]!.sy);
        const roofAlpha = Math.min(0.88, glintStrength * 0.78);
        roofSpecGrad.addColorStop(0, "rgba(255, 255, 255, 0)");
        roofSpecGrad.addColorStop(clamp(sweepPos - 0.15, 0.02, 0.9), "rgba(255, 255, 255, 0)");
        roofSpecGrad.addColorStop(sweepPos, `rgba(255, 255, 255, ${roofAlpha.toFixed(2)})`);
        roofSpecGrad.addColorStop(clamp(sweepPos + 0.15, 0.1, 0.98), "rgba(255, 255, 255, 0)");
        roofSpecGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
        ctx.fillStyle = roofSpecGrad;
        ctx.fill();
        ctx.restore();
      }

      ctx.strokeStyle = colors.stroke;
      ctx.lineWidth = 1.1;
      ctx.stroke();

      // PBR Specular Metallic Edge Bevel & Starburst Glint Sparkles when rotating camera
      if (specularEnabled && pbr && glintStrength > 0.18) {
        ctx.save();
        ctx.strokeStyle = "#ffffff";
        ctx.globalAlpha = Math.min(0.95, glintStrength * 0.9);
        ctx.lineWidth = (1.35 + glintStrength * 1.45) * dprVal;
        ctx.beginPath();
        ctx.moveTo(top[leftNeighbor]!.sx, top[leftNeighbor]!.sy);
        ctx.lineTo(top[frontIdx]!.sx, top[frontIdx]!.sy);
        ctx.lineTo(top[rightNeighbor]!.sx, top[rightNeighbor]!.sy);
        ctx.moveTo(top[frontIdx]!.sx, top[frontIdx]!.sy);
        ctx.lineTo(bot[frontIdx]!.sx, bot[frontIdx]!.sy);
        ctx.stroke();
        ctx.restore();

        if (glintStrength > 0.42) {
          drawSpecularStarGlint(
            top[frontIdx]!.sx,
            top[frontIdx]!.sy,
            (glintStrength - 0.35) * 1.35,
            pbr.glintColor,
            dprVal,
          );
        }
      }

      const centerTop = project(gx, gy, gzBase + heightZ, w, h, camAngle, camZoom, panX, panY);
      const centerBot = project(gx, gy, gzBase, w, h, camAngle, camZoom, panX, panY);
      return { centerTop, centerBot, bot, top, frontCornerTop: top[frontIdx]! };
    };

    // Draw stylized low-poly organic cyberpunk tree / crystal flora with gentle canopy breeze sway
    const drawLowPolyFlora = (
      gx: number,
      gy: number,
      scale: number,
      variant: "sakura" | "mint" | "gold",
      now: number,
      w: number,
      h: number,
      camAngle: number,
      camZoom: number,
      panX: number,
      panY: number,
    ) => {
      const s = simRef.current;
      const swayAmp = s.reducedMotion ? 0 : (0.014 + s.windGust * 0.032) * scale;
      const swayX = Math.sin(now * 0.0028 + gx * 1.7 + gy) * swayAmp;
      const swayY = Math.cos(now * 0.0023 + gy * 1.5) * swayAmp * 0.7;

      drawSoftGroundShadow(gx, gy, 0.22 * scale, 0.45 * scale, w, h, camAngle, camZoom, panX, panY);
      // Bioluminescent trunk
      drawOctanePrism(
        gx,
        gy,
        0,
        0.055 * scale,
        0.22 * scale,
        {
          topA: "#4d425e",
          topB: "#362d47",
          leftA: "#3c334f",
          leftB: "#241d33",
          rightA: "#261f36",
          rightB: "#171222",
          stroke: "rgba(255,255,255,0.12)",
        },
        w,
        h,
        camAngle,
        camZoom,
        panX,
        panY,
      );
      // Faceted low-poly canopy (2 stacked tiers that sway in the breeze)
      const canopyColors =
        variant === "sakura"
          ? {
              topA: "#ffe0f0",
              topB: "#ff9ec7",
              leftA: "#f285b4",
              leftB: "#b84d7c",
              rightA: "#9e3b68",
              rightB: "#692042",
              stroke: "rgba(255, 240, 248, 0.55)",
            }
          : variant === "mint"
            ? {
                topA: "#dffef9",
                topB: "#7cf5e6",
                leftA: "#58d9ca",
                leftB: "#2d968c",
                rightA: "#247d74",
                rightB: "#144d47",
                stroke: "rgba(225, 255, 250, 0.55)",
              }
            : {
                topA: "#fff6d6",
                topB: "#ffd782",
                leftA: "#ebb654",
                leftB: "#ad7a24",
                rightA: "#8f6118",
                rightB: "#593a0a",
                stroke: "rgba(255, 248, 220, 0.55)",
              };

      const floraPbr = {
        roughness: 0.14,
        metalness: 0.84,
        glintColor: variant === "sakura" ? "#ffb3d9" : variant === "mint" ? "#7cf5e6" : "#ffe094",
        phaseSeed: gx * 2.1 + gy * 1.7,
      };

      drawOctanePrism(
        gx + swayX * 0.65,
        gy + swayY * 0.65,
        0.18 * scale,
        0.19 * scale,
        0.2 * scale,
        canopyColors,
        w,
        h,
        camAngle,
        camZoom,
        panX,
        panY,
        floraPbr,
      );
      drawOctanePrism(
        gx + swayX * 1.25,
        gy + swayY * 1.25,
        0.34 * scale,
        0.12 * scale,
        0.16 * scale,
        canopyColors,
        w,
        h,
        camAngle,
        camZoom,
        panX,
        panY,
        { ...floraPbr, roughness: 0.09, metalness: 0.9, phaseSeed: gx * 2.7 + gy * 2.1 },
      );
    };

    // Draw floating rotating low-poly crystal octahedron above major towers
    const drawFloatingCrystal = (
      gx: number,
      gy: number,
      gzCenter: number,
      radius: number,
      now: number,
      accentColor: string,
      w: number,
      h: number,
      camAngle: number,
      camZoom: number,
      panX: number,
      panY: number,
      reducedMotion: boolean,
    ) => {
      const spin = reducedMotion ? 0.4 : now / 900;
      const bob = reducedMotion ? 0 : Math.sin(now / 420) * 0.05;
      const topPt = project(gx, gy, gzCenter + radius * 1.45 + bob, w, h, camAngle, camZoom, panX, panY);
      const botPt = project(gx, gy, gzCenter - radius * 1.45 + bob, w, h, camAngle, camZoom, panX, panY);
      const ringPts = [0, 1, 2, 3].map((i) => {
        const a = spin + (i * Math.PI) / 2;
        return project(
          gx + Math.cos(a) * radius,
          gy + Math.sin(a) * radius,
          gzCenter + bob,
          w,
          h,
          camAngle,
          camZoom,
          panX,
          panY,
        );
      });

      ctx.save();
      ctx.strokeStyle = accentColor;
      ctx.fillStyle = "rgba(255, 255, 255, 0.24)";
      ctx.lineWidth = 1.25;
      for (let i = 0; i < 4; i++) {
        const p1 = ringPts[i]!;
        const p2 = ringPts[(i + 1) % 4]!;
        ctx.beginPath();
        ctx.moveTo(topPt.sx, topPt.sy);
        ctx.lineTo(p1.sx, p1.sy);
        ctx.lineTo(p2.sx, p2.sy);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(botPt.sx, botPt.sy);
        ctx.lineTo(p1.sx, p1.sy);
        ctx.lineTo(p2.sx, p2.sy);
        ctx.closePath();
        ctx.stroke();
      }
      ctx.restore();
    };

    const renderFrame = (now: number) => {
      raf = 0;
      resize();
      const s = simRef.current;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.width;
      const h = canvas.height;
      const isHolo = renderTheme === "holo";

      const lerpFactor = s.reducedMotion ? 1 : 0.12;
      s.camAngle += (s.targetCamAngle - s.camAngle) * lerpFactor;
      s.camZoom += (s.targetZoom - s.camZoom) * lerpFactor;
      s.focusX += (s.targetFocusX - s.focusX) * lerpFactor;
      s.focusY += (s.targetFocusY - s.focusY) * lerpFactor;

      const speed = 0.075;
      let kx = 0;
      let ky = 0;
      if (s.keys.has("KeyW") || s.keys.has("ArrowUp")) {
        kx -= 1;
        ky -= 1;
      }
      if (s.keys.has("KeyS") || s.keys.has("ArrowDown")) {
        kx += 1;
        ky += 1;
      }
      if (s.keys.has("KeyA") || s.keys.has("ArrowLeft")) {
        kx -= 1;
        ky += 1;
      }
      if (s.keys.has("KeyD") || s.keys.has("ArrowRight")) {
        kx += 1;
        ky -= 1;
      }

      if (kx !== 0 || ky !== 0) {
        const len = Math.hypot(kx, ky) || 1;
        const cos = Math.cos(-s.camAngle);
        const sin = Math.sin(-s.camAngle);
        const wx = ((kx / len) * cos - (ky / len) * sin) * speed;
        const wy = ((kx / len) * sin + (ky / len) * cos) * speed;
        s.roverX = clamp(s.roverX + wx, -4.3, 4.3);
        s.roverY = clamp(s.roverY + wy, -4.3, 4.3);
        s.targetX = s.roverX;
        s.targetY = s.roverY;
        s.roverAngle = Math.atan2(wy, wx);

        let closest: IsoMonument | null = null;
        let minDist = 0.62;
        for (const m of monuments) {
          const d = Math.hypot(m.gridX - s.roverX, m.gridY - s.roverY);
          if (d < minDist) {
            minDist = d;
            closest = m;
          }
        }
        if (closest && closest.slug !== selectedSlug) {
          setSelectedSlug(closest.slug);
        }
      } else {
        const dx = s.targetX - s.roverX;
        const dy = s.targetY - s.roverY;
        const dist = Math.hypot(dx, dy);
        if (dist > 0.01) {
          s.roverAngle = Math.atan2(dy, dx);
          const step = s.reducedMotion ? dist : Math.min(dist, Math.max(0.03, dist * 0.14));
          s.roverX += (dx / dist) * step;
          s.roverY += (dy / dist) * step;
        }
      }

      const panX = s.panX * dpr;
      const panY = s.panY * dpr;

      // 1. Octane Cinematic Sky & Pastel-Holographic Atmospheric Glow
      const skyGrad = ctx.createLinearGradient(0, 0, w, h);
      if (isHolo) {
        skyGrad.addColorStop(0, "#101326");
        skyGrad.addColorStop(0.45, "#191c38");
        skyGrad.addColorStop(1, "#11182b");
      } else {
        skyGrad.addColorStop(0, "#0b141c");
        skyGrad.addColorStop(0.5, "#12212b");
        skyGrad.addColorStop(1, "#091017");
      }
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h);

      // Pastel Holographic Key & Rim Spotlights
      const keyLight = ctx.createRadialGradient(w * 0.34, h * 0.18, 20, w * 0.44, h * 0.48, Math.max(w, h) * 0.68);
      if (isHolo) {
        keyLight.addColorStop(0, "rgba(156, 246, 255, 0.22)");
        keyLight.addColorStop(0.38, "rgba(218, 178, 255, 0.15)");
        keyLight.addColorStop(0.7, "rgba(255, 176, 208, 0.08)");
        keyLight.addColorStop(1, "rgba(16, 19, 38, 0)");
      } else {
        keyLight.addColorStop(0, "rgba(244, 224, 176, 0.18)");
        keyLight.addColorStop(0.5, "rgba(26, 72, 68, 0.14)");
        keyLight.addColorStop(1, "rgba(8, 14, 20, 0)");
      }
      ctx.fillStyle = keyLight;
      ctx.fillRect(0, 0, w, h);

      // 2. Multi-Layer Isometric Floating Island Platform Slab (-4.7 to +4.7)
      drawSoftGroundShadow(0, 0, 5.1, 0.8, w, h, s.camAngle, s.camZoom, panX, panY);
      drawOctanePrism(
        0,
        0,
        -0.46,
        4.82,
        0.18,
        isHolo
          ? {
              topA: "#23284a",
              topB: "#1b1f3b",
              leftA: "#1c203d",
              leftB: "#111428",
              rightA: "#14172e",
              rightB: "#0b0d1c",
              stroke: "rgba(176, 224, 255, 0.24)",
            }
          : {
              topA: "#162834",
              topB: "#101e27",
              leftA: "#0e1b24",
              leftB: "#091218",
              rightA: "#091218",
              rightB: "#050a0e",
              stroke: "rgba(235, 228, 210, 0.18)",
            },
        w,
        h,
        s.camAngle,
        s.camZoom,
        panX,
        panY,
      );

      drawOctanePrism(
        0,
        0,
        -0.28,
        4.65,
        0.28,
        isHolo
          ? {
              topA: "#252b4d",
              topB: "#1c213f",
              leftA: "#2a3059",
              leftB: "#191d38",
              rightA: "#1c203d",
              rightB: "#101326",
              stroke: "rgba(210, 235, 255, 0.32)",
            }
          : {
              topA: "#14242e",
              topB: "#0f1c24",
              leftA: "#0c171f",
              leftB: "#081016",
              rightA: "#081016",
              rightB: "#05090d",
              stroke: "rgba(235, 228, 210, 0.2)",
            },
        w,
        h,
        s.camAngle,
        s.camZoom,
        panX,
        panY,
      );

      // 3. District Plazas on the Isometric Floor
      const districtZones: {
        id: IsoDistrict;
        gx: number;
        gy: number;
        size: number;
        fill: string;
        border: string;
      }[] = isHolo
        ? [
            { id: "command", gx: -2.2, gy: -2.2, size: 1.98, fill: "rgba(124, 245, 230, 0.12)", border: "rgba(124, 245, 230, 0.45)" },
            { id: "games", gx: 2.2, gy: -2.2, size: 1.98, fill: "rgba(255, 158, 196, 0.12)", border: "rgba(255, 158, 196, 0.45)" },
            { id: "systems", gx: -2.2, gy: 2.2, size: 1.98, fill: "rgba(162, 188, 255, 0.12)", border: "rgba(162, 188, 255, 0.45)" },
            { id: "vault", gx: 2.2, gy: 2.2, size: 1.98, fill: "rgba(255, 224, 148, 0.12)", border: "rgba(255, 224, 148, 0.5)" },
          ]
        : [
            { id: "command", gx: -2.2, gy: -2.2, size: 1.98, fill: "rgba(32, 92, 85, 0.24)", border: "rgba(120, 210, 195, 0.34)" },
            { id: "games", gx: 2.2, gy: -2.2, size: 1.98, fill: "rgba(110, 38, 34, 0.24)", border: "rgba(232, 120, 104, 0.34)" },
            { id: "systems", gx: -2.2, gy: 2.2, size: 1.98, fill: "rgba(28, 62, 98, 0.24)", border: "rgba(130, 180, 235, 0.34)" },
            { id: "vault", gx: 2.2, gy: 2.2, size: 1.98, fill: "rgba(72, 68, 60, 0.24)", border: "rgba(235, 215, 175, 0.36)" },
          ];

      for (const dz of districtZones) {
        const isHighlighted = lens === "all" || lens === dz.id;
        const zCorners = [
          project(dz.gx - dz.size, dz.gy - dz.size, 0.01, w, h, s.camAngle, s.camZoom, panX, panY),
          project(dz.gx + dz.size, dz.gy - dz.size, 0.01, w, h, s.camAngle, s.camZoom, panX, panY),
          project(dz.gx + dz.size, dz.gy + dz.size, 0.01, w, h, s.camAngle, s.camZoom, panX, panY),
          project(dz.gx - dz.size, dz.gy + dz.size, 0.01, w, h, s.camAngle, s.camZoom, panX, panY),
        ];
        ctx.beginPath();
        ctx.moveTo(zCorners[0]!.sx, zCorners[0]!.sy);
        for (let i = 1; i < 4; i++) ctx.lineTo(zCorners[i]!.sx, zCorners[i]!.sy);
        ctx.closePath();
        ctx.fillStyle = isHighlighted ? dz.fill : "rgba(15, 20, 34, 0.08)";
        ctx.fill();
        ctx.save();
        if (dz.id === "vault") ctx.setLineDash([5 * dpr, 4 * dpr]);
        ctx.strokeStyle = isHighlighted ? dz.border : "rgba(255, 255, 255, 0.05)";
        ctx.lineWidth = 1.25 * dpr;
        ctx.stroke();
        ctx.restore();
      }

      // 4. Precision Isometric View Grid & Micro-Crosshairs (+)
      ctx.strokeStyle = isHolo ? "rgba(200, 225, 255, 0.08)" : "rgba(245, 238, 220, 0.07)";
      ctx.lineWidth = 1;
      for (let g = -4; g <= 4; g++) {
        const a = project(g, -4.5, 0.01, w, h, s.camAngle, s.camZoom, panX, panY);
        const b = project(g, 4.5, 0.01, w, h, s.camAngle, s.camZoom, panX, panY);
        ctx.beginPath();
        ctx.moveTo(a.sx, a.sy);
        ctx.lineTo(b.sx, b.sy);
        ctx.stroke();

        const c = project(-4.5, g, 0.01, w, h, s.camAngle, s.camZoom, panX, panY);
        const d = project(4.5, g, 0.01, w, h, s.camAngle, s.camZoom, panX, panY);
        ctx.beginPath();
        ctx.moveTo(c.sx, c.sy);
        ctx.lineTo(d.sx, d.sy);
        ctx.stroke();
      }

      // Micro-crosshairs at integer intersections
      ctx.strokeStyle = isHolo ? "rgba(160, 235, 255, 0.22)" : "rgba(244, 224, 176, 0.18)";
      for (let gx = -4; gx <= 4; gx += 2) {
        for (let gy = -4; gy <= 4; gy += 2) {
          const pt = project(gx, gy, 0.015, w, h, s.camAngle, s.camZoom, panX, panY);
          ctx.beginPath();
          ctx.moveTo(pt.sx - 3 * dpr, pt.sy);
          ctx.lineTo(pt.sx + 3 * dpr, pt.sy);
          ctx.moveTo(pt.sx, pt.sy - 3 * dpr);
          ctx.lineTo(pt.sx, pt.sy + 3 * dpr);
          ctx.stroke();
        }
      }

      // 5. Holographic / Evidence Conduits from Central Command Core (0,0)
      const coreProj = project(0, 0, 0.05, w, h, s.camAngle, s.camZoom, panX, panY);
      const visibleSet = new Set(visibleMonuments.map((m) => m.slug));

      for (const m of monuments) {
        if (m.tier === "CORE") continue;
        const active = visibleSet.has(m.slug);
        const isSel = m.slug === selectedSlug || m.slug === hoveredSlug;
        const midProj = project(m.gridX, 0, 0.03, w, h, s.camAngle, s.camZoom, panX, panY);
        const endProj = project(m.gridX, m.gridY, 0.03, w, h, s.camAngle, s.camZoom, panX, panY);

        ctx.save();
        if (m.tier === "C" || m.tier === "VAULT") {
          ctx.setLineDash([4 * dpr, 4 * dpr]);
        }
        ctx.beginPath();
        ctx.moveTo(coreProj.sx, coreProj.sy);
        ctx.lineTo(midProj.sx, midProj.sy);
        ctx.lineTo(endProj.sx, endProj.sy);
        ctx.strokeStyle = isSel
          ? isHolo
            ? "#7cf5e6"
            : "#e54835"
          : active
            ? isHolo
              ? "rgba(156, 220, 255, 0.34)"
              : "rgba(229, 72, 53, 0.36)"
            : "rgba(255, 255, 255, 0.05)";
        ctx.lineWidth = (isSel ? 2.6 : active ? 1.35 : 0.8) * dpr;
        ctx.stroke();
        ctx.restore();
      }

      // 6. Animated Holographic Agent Packets
      for (const pkt of s.packets) {
        if (!s.reducedMotion) {
          pkt.progress += pkt.speed;
          if (pkt.progress > 1) pkt.progress -= 1;
        }
        if (!visibleSet.has(pkt.targetSlug)) continue;
        const p = pkt.progress;
        const px = p < 0.5 ? pkt.tx * (p * 2) : pkt.tx;
        const py = p < 0.5 ? 0 : pkt.ty * ((p - 0.5) * 2);
        const pos = project(px, py, 0.09, w, h, s.camAngle, s.camZoom, panX, panY);

        ctx.beginPath();
        ctx.arc(pos.sx, pos.sy, 3.6 * dpr, 0, Math.PI * 2);
        ctx.fillStyle = isHolo ? pkt.hue : pkt.targetSlug === selectedSlug ? "#f8e3a3" : "#e54835";
        ctx.fill();
      }

      // 7. Radar Pulse Rings
      for (let i = s.rings.length - 1; i >= 0; i--) {
        const ring = s.rings[i]!;
        ring.radius += s.reducedMotion ? 0.4 : 0.048;
        ring.alpha -= s.reducedMotion ? 0.25 : 0.02;
        if (ring.alpha <= 0) {
          s.rings.splice(i, 1);
          continue;
        }
        ctx.beginPath();
        for (let seg = 0; seg <= 28; seg++) {
          const ang = (seg / 28) * Math.PI * 2;
          const pt = project(
            ring.x + Math.cos(ang) * ring.radius,
            ring.y + Math.sin(ang) * ring.radius,
            0.03,
            w,
            h,
            s.camAngle,
            s.camZoom,
            panX,
            panY,
          );
          if (seg === 0) ctx.moveTo(pt.sx, pt.sy);
          else ctx.lineTo(pt.sx, pt.sy);
        }
        ctx.strokeStyle = isHolo
          ? `rgba(124, 245, 230, ${ring.alpha.toFixed(2)})`
          : `rgba(229, 72, 53, ${ring.alpha.toFixed(2)})`;
        ctx.lineWidth = 2.2 * dpr;
        ctx.stroke();
      }

      // 8. Depth-Sort All Monuments + Low-Poly Cyberpunk Flora + Playable Director Rover
      type RenderItem =
        | { type: "monument"; m: IsoMonument; depth: number }
        | { type: "flora"; f: (typeof CAMPUS_FLORA)[number]; depth: number }
        | { type: "rover"; depth: number };

      const items: RenderItem[] = [];
      for (const m of monuments) {
        const p = project(m.gridX, m.gridY, 0, w, h, s.camAngle, s.camZoom, panX, panY);
        items.push({ type: "monument", m, depth: p.depth });
      }
      for (const f of CAMPUS_FLORA) {
        const p = project(f.gx, f.gy, 0, w, h, s.camAngle, s.camZoom, panX, panY);
        items.push({ type: "flora", f, depth: p.depth });
      }
      const roverBase = project(s.roverX, s.roverY, 0, w, h, s.camAngle, s.camZoom, panX, panY);
      items.push({ type: "rover", depth: roverBase.depth + 0.04 });
      items.sort((a, b) => a.depth - b.depth);

      const newHitboxes: typeof s.projectedHitboxes = [];

      for (const item of items) {
        if (item.type === "flora") {
          drawLowPolyFlora(
            item.f.gx,
            item.f.gy,
            item.f.scale,
            item.f.variant,
            now,
            w,
            h,
            s.camAngle,
            s.camZoom,
            panX,
            panY,
          );
          continue;
        }

        if (item.type === "rover") {
          const rPos = project(s.roverX, s.roverY, 0.04, w, h, s.camAngle, s.camZoom, panX, panY);
          const spotR = 28 * dpr * s.camZoom;
          const rg = ctx.createRadialGradient(rPos.sx, rPos.sy, 2, rPos.sx, rPos.sy, spotR);
          rg.addColorStop(0, isHolo ? "rgba(124, 245, 230, 0.55)" : "rgba(229, 72, 53, 0.48)");
          rg.addColorStop(0.55, isHolo ? "rgba(255, 158, 196, 0.22)" : "rgba(244, 224, 176, 0.18)");
          rg.addColorStop(1, "rgba(124, 245, 230, 0)");
          ctx.fillStyle = rg;
          ctx.beginPath();
          ctx.ellipse(rPos.sx, rPos.sy, spotR, spotR * 0.55, 0, 0, Math.PI * 2);
          ctx.fill();

          const hoverBob = s.reducedMotion ? 0 : Math.sin(now / 240) * 0.045;
          drawOctanePrism(
            s.roverX,
            s.roverY,
            0.08 + hoverBob,
            0.25,
            0.2,
            {
              topA: "#ffffff",
              topB: "#d8f6ff",
              leftA: "#b5dcf0",
              leftB: "#78a4c2",
              rightA: "#7b9eb8",
              rightB: "#496780",
              stroke: "#141a29",
            },
            w,
            h,
            s.camAngle,
            s.camZoom,
            panX,
            panY,
            { roughness: 0.07, metalness: 0.95, glintColor: "#9efcf0", phaseSeed: 1.2 },
          );
          const roverTop = drawOctanePrism(
            s.roverX,
            s.roverY,
            0.28 + hoverBob,
            0.13,
            0.15,
            {
              topA: isHolo ? "#9efcf0" : "#ff6450",
              topB: isHolo ? "#ff9ec4" : "#e54835",
              leftA: isHolo ? "#56d4c6" : "#e54835",
              leftB: isHolo ? "#348c82" : "#a82d1e",
              rightA: isHolo ? "#c76b92" : "#a82d1e",
              rightB: isHolo ? "#7a3553" : "#6e1a10",
              stroke: "#ffffff",
            },
            w,
            h,
            s.camAngle,
            s.camZoom,
            panX,
            panY,
            { roughness: 0.05, metalness: 0.97, glintColor: "#ffffff", phaseSeed: 2.6 },
          );

          const roverText = "AGENT ROVER";
          ctx.font = `700 ${Math.round(9 * dpr)}px ui-monospace, SFMono-Regular, monospace`;
          const rtw = ctx.measureText(roverText).width;
          const rpadX = 6 * dpr;
          const rboxW = rtw + rpadX * 2;
          const rboxH = 15 * dpr;
          const rty = roverTop.centerTop.sy - 10 * dpr;

          ctx.fillStyle = "rgba(10, 14, 28, 0.92)";
          ctx.fillRect(roverTop.centerTop.sx - rboxW * 0.5, rty - rboxH * 0.5, rboxW, rboxH);
          ctx.strokeStyle = isHolo ? "#7cf5e6" : "#f4e0b0";
          ctx.lineWidth = 1 * dpr;
          ctx.strokeRect(roverTop.centerTop.sx - rboxW * 0.5, rty - rboxH * 0.5, rboxW, rboxH);

          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = isHolo ? "#9efcf0" : "#f4e0b0";
          ctx.fillText(roverText, roverTop.centerTop.sx, rty + 0.5 * dpr);
          continue;
        }

        const m = item.m;
        const isVisible = visibleSet.has(m.slug);
        const isSelected = m.slug === selectedSlug;
        const isHovered = m.slug === hoveredSlug;
        const halfW = m.tier === "CORE" ? 0.54 : m.tier === "A" ? 0.45 : 0.37;
        const bHeight = isVisible ? m.height : m.height * 0.35;
        const mPbr = getMonumentPbr(m);

        // Sine-wave floating micro-animation + smooth hover emissive intensity damping
        const floatZ = s.reducedMotion
          ? 0
          : Math.sin(now * 0.0022 + m.gridX * 1.35 + m.gridY * 0.95) * (m.tier === "CORE" || m.tier === "A" ? 0.048 : 0.028);
        const targetEmissive = isHovered ? 1.0 : isSelected ? 0.82 : 0.0;
        const prevEmissive = s.emissiveMap[m.slug] ?? 0;
        const emissive = s.reducedMotion
          ? targetEmissive
          : prevEmissive + (targetEmissive - prevEmissive) * 0.18;
        s.emissiveMap[m.slug] = emissive;

        // Soft Octane Ambient Occlusion & Cast Shadow underneath monument
        drawSoftGroundShadow(m.gridX, m.gridY, halfW + 0.16, bHeight + floatZ, w, h, s.camAngle, s.camZoom, panX, panY);

        // Hover Emissive Floor Halo when emissive > 0.04
        if (emissive > 0.04 && isVisible) {
          const ePos = project(m.gridX, m.gridY, 0.03, w, h, s.camAngle, s.camZoom, panX, panY);
          const eRad = (halfW + 0.45) * ePos.baseScale;
          const eg = ctx.createRadialGradient(ePos.sx, ePos.sy, 2, ePos.sx, ePos.sy, eRad);
          eg.addColorStop(0, `rgba(124, 245, 230, ${(0.42 * emissive).toFixed(2)})`);
          eg.addColorStop(0.55, `rgba(255, 158, 196, ${(0.2 * emissive).toFixed(2)})`);
          eg.addColorStop(1, "rgba(124, 245, 230, 0)");
          ctx.fillStyle = eg;
          ctx.beginPath();
          ctx.ellipse(ePos.sx, ePos.sy, eRad, eRad * 0.54, 0, 0, Math.PI * 2);
          ctx.fill();
        }

        // Select Pastel Holographic Octane palette vs Studio Exhibition palette
        let colors = {
          topA: "#dffef9",
          topB: "#8ee8de",
          leftA: "#5dc4ba",
          leftB: "#2d6e6e",
          rightA: "#3b4e7a",
          rightB: "#1e2747",
          stroke: "rgba(235, 252, 255, 0.52)",
          windowGlow: "rgba(180, 255, 245, 0.55)",
          windowRows: Math.max(2, Math.round(bHeight * 2.5)),
        };

        if (isHolo) {
          if (m.tier === "CORE") {
            colors = {
              topA: "#ffffff",
              topB: "#ffd6ec",
              leftA: "#ff9ec4",
              leftB: "#8358a8",
              rightA: "#7b68c4",
              rightB: "#362c6e",
              stroke: "#ffffff",
              windowGlow: "rgba(255, 245, 252, 0.85)",
              windowRows: 6,
            };
          } else if (m.district === "games") {
            colors = {
              topA: "#ffe8f2",
              topB: "#ffb3d1",
              leftA: "#e884ad",
              leftB: "#8c3b68",
              rightA: "#6e386b",
              rightB: "#321a3d",
              stroke: "rgba(255, 230, 242, 0.52)",
              windowGlow: "rgba(255, 224, 180, 0.65)",
              windowRows: Math.max(2, Math.round(bHeight * 2.4)),
            };
          } else if (m.district === "systems") {
            colors = {
              topA: "#e6f2ff",
              topB: "#a8ccff",
              leftA: "#6fa1eb",
              leftB: "#325594",
              rightA: "#3a4578",
              rightB: "#1c2245",
              stroke: "rgba(225, 240, 255, 0.52)",
              windowGlow: "rgba(156, 246, 255, 0.65)",
              windowRows: Math.max(3, Math.round(bHeight * 2.8)),
            };
          } else if (m.district === "tools") {
            colors = {
              topA: "#ece3ff",
              topB: "#c3b0ff",
              leftA: "#947ce0",
              leftB: "#4e3b8c",
              rightA: "#453875",
              rightB: "#211a40",
              stroke: "rgba(238, 228, 255, 0.52)",
              windowGlow: "rgba(220, 245, 255, 0.6)",
              windowRows: Math.max(2, Math.round(bHeight * 2.5)),
            };
          } else if (m.district === "vault") {
            colors = {
              topA: "#fff6dc",
              topB: "#f5d598",
              leftA: "#cfa863",
              leftB: "#785c2e",
              rightA: "#574636",
              rightB: "#29211c",
              stroke: "rgba(255, 242, 204, 0.6)",
              windowGlow: "rgba(255, 232, 168, 0.5)",
              windowRows: 2,
            };
          }
        } else {
          // Classic Working Studio Exhibition Palette
          if (m.tier === "CORE") {
            colors = {
              topA: "#ff6e5c",
              topB: "#e54835",
              leftA: "#b53222",
              leftB: "#7d1f14",
              rightA: "#7d1f14",
              rightB: "#4a1009",
              stroke: "#f7f4eb",
              windowGlow: "rgba(244, 224, 176, 0.7)",
              windowRows: 5,
            };
          } else if (m.district === "games") {
            colors = {
              topA: "#a34a43",
              topB: "#82352f",
              leftA: "#632622",
              leftB: "#401613",
              rightA: "#401613",
              rightB: "#260c0a",
              stroke: "rgba(245, 232, 220, 0.42)",
              windowGlow: "rgba(244, 224, 176, 0.45)",
              windowRows: 4,
            };
          } else if (m.district === "systems" || m.district === "tools") {
            colors = {
              topA: "#3d719e",
              topB: "#2b5478",
              leftA: "#1f3f5c",
              leftB: "#13283b",
              rightA: "#13283b",
              rightB: "#0b1824",
              stroke: "rgba(225, 238, 250, 0.42)",
              windowGlow: "rgba(220, 240, 255, 0.45)",
              windowRows: 4,
            };
          } else if (m.district === "vault") {
            colors = {
              topA: "#80796d",
              topB: "#635d53",
              leftA: "#4a453e",
              leftB: "#302d28",
              rightA: "#302d28",
              rightB: "#1f1d19",
              stroke: "rgba(244, 224, 176, 0.48)",
              windowGlow: "rgba(244, 224, 176, 0.38)",
              windowRows: 2,
            };
          }
        }

        if (!isVisible) {
          colors = {
            topA: "rgba(44, 52, 72, 0.45)",
            topB: "rgba(32, 38, 54, 0.45)",
            leftA: "rgba(28, 34, 48, 0.45)",
            leftB: "rgba(18, 22, 34, 0.45)",
            rightA: "rgba(18, 22, 34, 0.45)",
            rightB: "rgba(12, 15, 24, 0.45)",
            stroke: "rgba(255, 255, 255, 0.08)",
            windowGlow: "",
            windowRows: 0,
          };
        } else if (isSelected) {
          colors = {
            ...colors,
            topA: "#ffffff",
            topB: isHolo ? "#d4fff9" : "#f7f4eb",
            stroke: isHolo ? "#7cf5e6" : "#e54835",
          };
        } else if (isHovered || emissive > 0.25) {
          colors = {
            ...colors,
            topA: "#ffffff",
            topB: isHolo ? "#ffe0f4" : "#f4e0b0",
            windowGlow: isHolo ? "rgba(124, 245, 230, 0.95)" : "rgba(244, 224, 176, 0.9)",
            stroke: isHolo ? "#7cf5e6" : "#f4e0b0",
          };
        }

        const activePbr = isVisible
          ? {
              roughness: isSelected || isHovered ? Math.max(0.04, mPbr.roughness - 0.03) : mPbr.roughness,
              metalness: isSelected || isHovered ? Math.min(0.99, mPbr.metalness + 0.03) : mPbr.metalness,
              glintColor: mPbr.glintColor,
              phaseSeed: m.gridX * 1.37 + m.gridY * 0.89,
            }
          : undefined;

        // Base terraced podium
        drawOctanePrism(
          m.gridX,
          m.gridY,
          0,
          halfW + 0.11,
          0.11,
          {
            topA: isSelected || isHovered ? (isHolo ? "#7cf5e6" : "#e54835") : "#283052",
            topB: isSelected || isHovered ? (isHolo ? "#ff9ec4" : "#b53222") : "#1c223b",
            leftA: "#1a2038",
            leftB: "#101426",
            rightA: "#121629",
            rightB: "#0a0d1a",
            stroke: isSelected || isHovered ? "#ffffff" : "rgba(255,255,255,0.22)",
          },
          w,
          h,
          s.camAngle,
          s.camZoom,
          panX,
          panY,
          activePbr ? { ...activePbr, phaseSeed: activePbr.phaseSeed + 0.4 } : undefined,
        );

        // Lower architectural body (70% of height) with sine-wave floatZ & PBR metallic sheen
        const lowerH = bHeight * 0.68;
        const prism = drawOctanePrism(
          m.gridX,
          m.gridY,
          0.11 + floatZ,
          halfW,
          lowerH,
          colors,
          w,
          h,
          s.camAngle,
          s.camZoom,
          panX,
          panY,
          activePbr,
        );

        // Setback upper low-poly terrace (30% of height) with ultra-low roughness PBR reflector
        const upperH = bHeight * 0.32;
        const upperPrism = drawOctanePrism(
          m.gridX,
          m.gridY,
          0.11 + floatZ + lowerH,
          halfW * 0.76,
          upperH,
          colors,
          w,
          h,
          s.camAngle,
          s.camZoom,
          panX,
          panY,
          activePbr
            ? {
                ...activePbr,
                roughness: Math.max(0.04, activePbr.roughness - 0.02),
                metalness: Math.min(0.98, activePbr.metalness + 0.02),
                phaseSeed: activePbr.phaseSeed + 1.15,
              }
            : undefined,
        );

        let roofPoint = upperPrism.centerTop;
        if (isVisible && (m.tier === "A" || m.tier === "CORE" || m.tier === "VAULT")) {
          const crown = drawOctanePrism(
            m.gridX,
            m.gridY,
            0.11 + floatZ + bHeight,
            halfW * 0.46,
            0.26,
            {
              topA: "#ffffff",
              topB: isHolo ? "#9efcf0" : "#f4e0b0",
              leftA: isHolo ? "#7cf5e6" : "#d9c290",
              leftB: isHolo ? "#49a89d" : "#9c885a",
              rightA: isHolo ? "#b896ff" : "#9c885a",
              rightB: isHolo ? "#62479e" : "#665735",
              stroke: "#ffffff",
            },
            w,
            h,
            s.camAngle,
            s.camZoom,
            panX,
            panY,
            {
              roughness: 0.05,
              metalness: 0.97,
              glintColor: mPbr.glintColor,
              phaseSeed: m.gridX * 2.05 - m.gridY * 1.4,
            },
          );
          roofPoint = crown.centerTop;

          // Draw rotating low-poly crystal above Command Core & Selected Monument
          if (m.tier === "CORE" || isSelected) {
            drawFloatingCrystal(
              m.gridX,
              m.gridY,
              0.11 + bHeight + 0.56,
              0.22,
              now,
              isHolo ? "#7cf5e6" : "#f4e0b0",
              w,
              h,
              s.camAngle,
              s.camZoom,
              panX,
              panY,
              s.reducedMotion,
            );

            // Volumetric vertical light beam on Core & Selected Monument
            const beamTop = project(m.gridX, m.gridY, 0.11 + bHeight + 1.9, w, h, s.camAngle, s.camZoom, panX, panY);
            const beamW = (m.tier === "CORE" ? 22 : 15) * dpr * s.camZoom;
            const bg = ctx.createLinearGradient(0, roofPoint.sy, 0, beamTop.sy);
            bg.addColorStop(0, isHolo ? "rgba(156, 250, 240, 0.34)" : "rgba(244, 224, 176, 0.28)");
            bg.addColorStop(1, "rgba(156, 250, 240, 0)");
            ctx.fillStyle = bg;
            ctx.fillRect(roofPoint.sx - beamW * 0.5, beamTop.sy, beamW, roofPoint.sy - beamTop.sy);
          }
        }

        newHitboxes.push({
          slug: m.slug,
          cx: prism.centerBot.sx,
          cy: (roofPoint.sy + prism.centerBot.sy) * 0.5,
          topY: roofPoint.sy - 22 * dpr,
          baseY: prism.centerBot.sy + 14 * dpr,
          halfW: Math.max(26 * dpr, halfW * prism.centerBot.baseScale * 1.18),
          depth: item.depth,
        });

        // Floating Clean Micro-UI Callout Pill above visible monuments (Selected & Hovered only to avoid visual collision)
        if (isVisible) {
          const showFullBadge = isSelected || isHovered;
          const labelY = roofPoint.sy - (isSelected ? 26 : 14) * dpr;

          if (showFullBadge) {
            ctx.font = `700 ${Math.round((isSelected ? 11 : 9.5) * dpr)}px system-ui, -apple-system, sans-serif`;
            const text = m.shortTitle;
            const tw = ctx.measureText(text).width;
            const padX = 7 * dpr;
            const boxW = tw + padX * 2;
            const boxH = 18 * dpr;

            ctx.beginPath();
            ctx.moveTo(roofPoint.sx, roofPoint.sy);
            ctx.lineTo(roofPoint.sx, labelY + boxH * 0.5);
            ctx.strokeStyle = isSelected ? (isHolo ? "#7cf5e6" : "#e54835") : "rgba(247, 244, 235, 0.75)";
            ctx.lineWidth = (isSelected ? 2 : 1) * dpr;
            ctx.stroke();

            ctx.fillStyle = isSelected ? (isHolo ? "#0f1629" : "#1a1210") : "rgba(14, 18, 32, 0.94)";
            ctx.fillRect(roofPoint.sx - boxW * 0.5, labelY - boxH * 0.5, boxW, boxH);
            ctx.strokeStyle = isSelected
              ? isHolo
                ? "#7cf5e6"
                : "#ff6e5c"
              : m.tier === "C" || m.tier === "VAULT"
                ? "rgba(255, 224, 148, 0.85)"
                : "rgba(156, 235, 255, 0.65)";
            ctx.lineWidth = (isSelected ? 2 : 1.2) * dpr;
            ctx.strokeRect(roofPoint.sx - boxW * 0.5, labelY - boxH * 0.5, boxW, boxH);

            ctx.fillStyle = isSelected ? (isHolo ? "#9efcf0" : "#ffddd6") : "#f5f7ff";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(text, roofPoint.sx, labelY + 0.5 * dpr);
          } else {
            // Elegant glowing beacon pin for non-hovered monuments
            const pinColor =
              m.tier === "CORE"
                ? "#ffffff"
                : m.district === "command"
                  ? "#7cf5e6"
                  : m.district === "games"
                    ? "#ff9ec4"
                    : m.district === "vault"
                      ? "#ffe094"
                      : "#a8ccff";
            ctx.beginPath();
            ctx.arc(roofPoint.sx, roofPoint.sy - 4 * dpr, (m.tier === "CORE" ? 4.5 : 3.2) * dpr, 0, Math.PI * 2);
            ctx.fillStyle = pinColor;
            ctx.fill();
            ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
            ctx.lineWidth = 1 * dpr;
            ctx.stroke();
          }
        }
      }

      s.projectedHitboxes = newHitboxes;

      // Decay wind gust & specular camera-sweep boost smoothly
      if (!s.reducedMotion) {
        s.windGust *= 0.965;
        s.glintSweepBoost *= 0.94;
      } else {
        s.windGust = 0;
        s.glintSweepBoost = 0;
      }

      // 9. Natural Ecosystem Particle Engine: Volumetric Tyndall Sunbeams, 32 Tumbling Leaves, 32 Dust Motes & 20 Fireflies
      if (natureEnabled) {
        // 9a. Slanted Volumetric Tyndall Sunbeams catching airborne dust & leaves
        if (postFx) {
          ctx.save();
          const sunAngle = -0.52 + Math.sin(s.camAngle * 0.35) * 0.08;
          ctx.translate(w * 0.48, h * 0.42);
          ctx.rotate(sunAngle);
          const shafts = [
            { x: -w * 0.24, width: w * 0.13, alpha: 0.055 + s.windGust * 0.02 },
            { x: -w * 0.02, width: w * 0.17, alpha: 0.07 + s.windGust * 0.025 },
            { x: w * 0.21, width: w * 0.11, alpha: 0.048 + s.windGust * 0.018 },
          ];
          for (const sh of shafts) {
            const sg = ctx.createLinearGradient(sh.x, -h * 0.7, sh.x + sh.width, h * 0.7);
            sg.addColorStop(0, "rgba(255, 255, 255, 0)");
            sg.addColorStop(
              0.45,
              isHolo
                ? `rgba(176, 252, 244, ${Math.min(0.14, sh.alpha).toFixed(3)})`
                : `rgba(244, 224, 176, ${Math.min(0.13, sh.alpha).toFixed(3)})`,
            );
            sg.addColorStop(1, "rgba(255, 255, 255, 0)");
            ctx.fillStyle = sg;
            ctx.fillRect(sh.x, -h * 0.7, sh.width, h * 1.4);
          }
          ctx.restore();
        }

        const tSec = s.reducedMotion ? 0 : now * 0.001;
        const windMultiplier = 1 + s.windGust * 1.85;

        for (const pt of CAMPUS_PARTICLES) {
          let px = pt.gx;
          let py = pt.gy;
          let pz = pt.gzBase;

          if (pt.kind === "leaf") {
            // Natural wind-borne leaf drift across the island with gust acceleration & harmonic flutter
            const driftT = tSec * pt.speed * windMultiplier + pt.phase;
            const rawX = pt.gx + driftT * 0.85 + Math.sin(tSec * pt.flutterFreq + pt.phase) * 0.32;
            const rawY = pt.gy + driftT * 0.52 + Math.cos(tSec * pt.flutterFreq * 0.85 + pt.phase) * 0.28;
            // Wrap smoothly within [-4.5, 4.5] island bounds
            px = ((((rawX + 4.5) % 9.0) + 9.0) % 9.0) - 4.5;
            py = ((((rawY + 4.5) % 9.0) + 9.0) % 9.0) - 4.5;
            const fallCycle = (tSec * pt.speed * 0.55 + pt.phase) % 1;
            pz =
              0.18 +
              (1 - fallCycle) * 1.65 +
              Math.sin(tSec * pt.flutterFreq * 1.3 + pt.phase) * 0.14 +
              s.windGust * 0.18;
          } else {
            // Volumetric dust motes & bioluminescent fireflies suspended in gentle air currents
            px = pt.gx + Math.sin(tSec * pt.speed + pt.phase) * (0.28 + s.windGust * 0.18);
            py = pt.gy + Math.cos(tSec * pt.speed * 0.85 + pt.phase) * (0.28 + s.windGust * 0.15);
            pz = pt.gzBase + (Math.sin(tSec * pt.speed * 1.35 + pt.phase) * 0.5 + 0.5) * 0.62;
          }

          // Interactive cursor wake repulsion on nearby leaves and dust motes
          const cdx = px - s.pointerWorldX;
          const cdy = py - s.pointerWorldY;
          const cDist = Math.hypot(cdx, cdy);
          if (cDist < 1.35 && cDist > 0.001) {
            const push = ((1.35 - cDist) / 1.35) * 0.36;
            px += (cdx / cDist) * push;
            py += (cdy / cDist) * push;
            pz += push * 0.45;
          }

          const proj = project(px, py, pz, w, h, s.camAngle, s.camZoom, panX, panY);
          const depthDelta = Math.abs(proj.depth);
          const dofBokeh = postFx && depthDelta > 3.1 ? 1 + (depthDelta - 3.1) * 0.52 : 1;
          const rad = pt.size * dpr * dofBokeh;
          const pulseAlpha = 0.42 + 0.52 * (0.5 + 0.5 * Math.sin(tSec * 2.1 + pt.phase));

          if (pt.kind === "leaf") {
            // 3D tumbling leaf / petal silhouette with central vein & camera-angle specular flash
            const roll = s.reducedMotion ? pt.phase : tSec * pt.tumbleSpeed * windMultiplier + pt.phase;
            const pitch = s.reducedMotion ? 0.5 : tSec * pt.flutterFreq * 1.4 + pt.phase;
            const aspect = 0.3 + 0.7 * Math.abs(Math.cos(pitch));
            const leafW = rad * 1.55;
            const leafH = rad * 0.92 * aspect;

            ctx.save();
            ctx.translate(proj.sx, proj.sy);
            ctx.rotate(roll);
            ctx.globalAlpha = Math.min(0.94, pulseAlpha + 0.22);
            ctx.fillStyle = isHolo ? pt.hue : pt.leafVariant === "ginkgo" ? "#f4e0b0" : "#e89ab8";

            ctx.beginPath();
            if (pt.leafVariant === "sakura") {
              // Notched sakura blossom petal
              ctx.moveTo(-leafW, 0);
              ctx.quadraticCurveTo(-leafW * 0.25, -leafH * 1.25, leafW, -leafH * 0.32);
              ctx.lineTo(leafW * 0.68, 0);
              ctx.lineTo(leafW, leafH * 0.32);
              ctx.quadraticCurveTo(-leafW * 0.25, leafH * 1.25, -leafW, 0);
            } else if (pt.leafVariant === "ginkgo") {
              // Fan-shaped golden ginkgo leaf
              ctx.moveTo(-leafW * 0.95, 0);
              ctx.quadraticCurveTo(0, -leafH * 1.35, leafW * 0.95, -leafH * 0.75);
              ctx.quadraticCurveTo(leafW * 0.55, 0, leafW * 0.95, leafH * 0.75);
              ctx.quadraticCurveTo(0, leafH * 1.35, -leafW * 0.95, 0);
            } else {
              // Pointed cyber-botanical mint leaf
              ctx.moveTo(-leafW * 1.05, 0);
              ctx.quadraticCurveTo(0, -leafH * 1.2, leafW * 1.05, 0);
              ctx.quadraticCurveTo(0, leafH * 1.2, -leafW * 1.05, 0);
            }
            ctx.closePath();
            ctx.fill();

            // Central botanical leaf vein + specular sun-catch glint
            const leafGlint = specularEnabled ? Math.pow(Math.max(0, Math.sin(pitch + s.camAngle)), 6) : 0;
            ctx.strokeStyle = leafGlint > 0.45 ? "#ffffff" : pt.veinHue;
            ctx.lineWidth = (leafGlint > 0.45 ? 1.35 : 0.85) * dpr;
            ctx.beginPath();
            ctx.moveTo(-leafW * 0.75, 0);
            ctx.lineTo(leafW * 0.65, 0);
            ctx.stroke();
            ctx.restore();
          } else if (pt.kind === "firefly" && postFx) {
            const fg = ctx.createRadialGradient(proj.sx, proj.sy, 0.5, proj.sx, proj.sy, rad * 3.1);
            fg.addColorStop(0, "#ffffff");
            fg.addColorStop(0.32, isHolo ? pt.hue : "#f4e0b0");
            fg.addColorStop(1, "rgba(124, 245, 230, 0)");
            ctx.fillStyle = fg;
            ctx.globalAlpha = pulseAlpha * (dofBokeh > 1.2 ? 0.55 : 0.88);
            ctx.beginPath();
            ctx.arc(proj.sx, proj.sy, rad * 3.1, 0, Math.PI * 2);
            ctx.fill();
          } else {
            // Floating atmospheric dust mote catching sunbeams
            const dg = ctx.createRadialGradient(proj.sx, proj.sy, 0.2, proj.sx, proj.sy, rad * 2.1);
            dg.addColorStop(0, "#ffffff");
            dg.addColorStop(0.45, isHolo ? pt.hue : "#f4e0b0");
            dg.addColorStop(1, "rgba(255, 255, 255, 0)");
            ctx.fillStyle = dg;
            ctx.globalAlpha = pulseAlpha * 0.68;
            ctx.beginPath();
            ctx.arc(proj.sx, proj.sy, rad * 2.1, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.globalAlpha = 1;
      }

      // 10. Post-Processing Pass: Selective Anamorphic Bloom & Tilt-Shift Depth of Field (DOF)
      if (postFx) {
        const selMon = monuments.find((x) => x.slug === selectedSlug) ?? monuments[0]!;
        const bloomCenter = project(
          selMon.gridX,
          selMon.gridY,
          selMon.height * 0.75,
          w,
          h,
          s.camAngle,
          s.camZoom,
          panX,
          panY,
        );
        const bloomRad = 115 * dpr * s.camZoom;
        const bloomGrad = ctx.createRadialGradient(
          bloomCenter.sx,
          bloomCenter.sy,
          4,
          bloomCenter.sx,
          bloomCenter.sy,
          bloomRad,
        );
        bloomGrad.addColorStop(0, isHolo ? "rgba(156, 252, 240, 0.22)" : "rgba(244, 224, 176, 0.2)");
        bloomGrad.addColorStop(0.45, isHolo ? "rgba(255, 158, 196, 0.1)" : "rgba(229, 72, 53, 0.08)");
        bloomGrad.addColorStop(1, "rgba(16, 19, 38, 0)");
        ctx.fillStyle = bloomGrad;
        ctx.fillRect(bloomCenter.sx - bloomRad, bloomCenter.sy - bloomRad, bloomRad * 2, bloomRad * 2);

        // Subtle cinematic atmospheric haze on top & bottom edge
        const dofTop = ctx.createLinearGradient(0, 0, 0, h * 0.14);
        dofTop.addColorStop(0, isHolo ? "rgba(10, 13, 28, 0.22)" : "rgba(8, 12, 18, 0.22)");
        dofTop.addColorStop(1, "rgba(10, 13, 28, 0)");
        ctx.fillStyle = dofTop;
        ctx.fillRect(0, 0, w, h * 0.14);

        const dofBot = ctx.createLinearGradient(0, h * 0.86, 0, h);
        dofBot.addColorStop(0, "rgba(10, 13, 28, 0)");
        dofBot.addColorStop(1, isHolo ? "rgba(10, 13, 28, 0.22)" : "rgba(8, 12, 18, 0.22)");
        ctx.fillStyle = dofBot;
        ctx.fillRect(0, h * 0.86, w, h * 0.14);
      }

      const roverMoving = Math.hypot(s.targetX - s.roverX, s.targetY - s.roverY) > 0.01 || s.keys.size > 0;
      const camMoving =
        Math.abs(s.targetCamAngle - s.camAngle) > 0.005 || Math.abs(s.targetZoom - s.camZoom) > 0.005;
      const fxActive = s.windGust > 0.02 || s.glintSweepBoost > 0.02;

      if (visible && !document.hidden && (!s.reducedMotion || roverMoving || camMoving || fxActive)) {
        raf = requestAnimationFrame(renderFrame);
      }
    };

    const kick = () => {
      if (!raf && visible && !document.hidden) {
        raf = requestAnimationFrame(renderFrame);
      }
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = !!entry?.isIntersecting;
      kick();
    });
    io.observe(canvas);

    const ro = new ResizeObserver(() => {
      resize();
      kick();
    });
    ro.observe(canvas);

    renderFrame(performance.now());

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
    };
  }, [
    monuments,
    visibleMonuments,
    selectedSlug,
    hoveredSlug,
    lens,
    renderTheme,
    postFx,
    specularEnabled,
    natureEnabled,
  ]);

  const findHitMonument = (clientX: number, clientY: number): string | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const x = (clientX - rect.left) * dpr;
    const y = (clientY - rect.top) * dpr;

    const boxes = [...simRef.current.projectedHitboxes].sort((a, b) => b.depth - a.depth);
    for (const b of boxes) {
      if (x >= b.cx - b.halfW && x <= b.cx + b.halfW && y >= b.topY && y <= b.baseY) {
        return b.slug;
      }
    }
    return null;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const s = simRef.current;
    s.dragging = true;
    s.dragStartX = e.clientX;
    s.dragStartY = e.clientY;
    s.dragStartAngle = s.customOrbitOffset;
    s.dragMoved = false;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const s = simRef.current;
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1;
      const ny = ((e.clientY - rect.top) / Math.max(1, rect.height)) * 2 - 1;
      s.pointerNormX = clamp(nx, -1, 1);
      s.pointerNormY = clamp(ny, -1, 1);
      s.pointerWorldX = clamp((nx + ny) * 3.4, -4.5, 4.5);
      s.pointerWorldY = clamp((ny - nx) * 3.4, -4.5, 4.5);
      s.glintSweepBoost = Math.min(1.1, s.glintSweepBoost + 0.05);
    }

    if (s.dragging) {
      const dx = e.clientX - s.dragStartX;
      const dy = e.clientY - s.dragStartY;
      if (Math.hypot(dx, dy) > 4) {
        s.dragMoved = true;
      }
      if (dragMode === "orbit" && !e.shiftKey) {
        // Orbit camera azimuth continuously so low-roughness high-metalness surfaces shimmer & glint
        s.customOrbitOffset = s.dragStartAngle + dx * 0.009;
        const idx = Math.round(scrollZoneProgress);
        const zone = SCROLL_ZONES[idx] ?? SCROLL_ZONES[0]!;
        s.targetCamAngle = (rotIndex * Math.PI) / 2 + zone.yawOffset + s.customOrbitOffset;
        s.panY = clamp(s.panY + dy * 0.08, -150, 170);
        s.glintSweepBoost = 1.2;
      } else {
        s.panX = clamp(s.panX + dx * 0.18, -240, 240);
        s.panY = clamp(s.panY + dy * 0.18, -150, 170);
        s.dragStartX = e.clientX;
        s.dragStartY = e.clientY;
        s.glintSweepBoost = 0.65;
      }
      return;
    }
    const hit = findHitMonument(e.clientX, e.clientY);
    if (canvas) {
      canvas.style.cursor = hit ? "pointer" : "grab";
    }
    if (hit !== hoveredSlug) {
      if (hit) playSynthSfx("hover", hit.length);
      setHoveredSlug(hit);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const s = simRef.current;
    const wasDragged = s.dragMoved;
    s.dragging = false;
    if (!wasDragged) {
      const hit = findHitMonument(e.clientX, e.clientY);
      if (hit) {
        selectMonument(hit);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLCanvasElement>) => {
    const code = e.code;
    if (["KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(code)) {
      e.preventDefault();
      simRef.current.keys.add(code);
    } else if (code === "KeyQ") {
      e.preventDefault();
      setRotIndex((r) => (r + 3) % 4);
    } else if (code === "KeyE") {
      e.preventDefault();
      setRotIndex((r) => (r + 1) % 4);
    } else if (code === "KeyB") {
      e.preventDefault();
      triggerBreezeAndGlint();
    } else if (code === "Space") {
      e.preventDefault();
      triggerAgentPulse();
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLCanvasElement>) => {
    simRef.current.keys.delete(e.code);
  };

  const currentStageInfo = activeStage > 0 ? PIPELINE_STAGES[activeStage - 1]! : null;
  const bearingLabels = ["045° NE · OCTANE ISO", "135° SE · EAST WING", "225° SW · VAULT WING", "315° NW · COMMAND WING"];

  return (
    <div className="iso-world" id="command-table">
      {/* ───────── 100% Full-Width Panoramic 3D Isometric Viewport Hero ───────── */}
      <div className="frame iso-viewport-card">
          <div className="frame__mat iso-viewport-stage">
            {/* Dedicated Top HUD Bar (Sitting cleanly above the canvas) */}
            <div className="iso-hud-bar" role="region" aria-label="Island camera zones">
              <div className="iso-zone-bar" role="group" aria-label="Scroll-driven camera zones">
                {SCROLL_ZONES.map((z) => (
                  <button
                    key={z.id}
                    type="button"
                    className="iso-hud-btn"
                    aria-pressed={Math.round(scrollZoneProgress) === z.id}
                    onClick={() => applyScrollZoneCamera(z.id, true)}
                  >
                    {z.code} · {z.label}
                  </button>
                ))}
              </div>

            </div>

            {/* 3D Canvas Viewport Box with Bottom Corner Widgets */}
            <div className="iso-canvas-box">
              <canvas
                ref={canvasRef}
                className="iso-canvas iso-canvas--hero"
                tabIndex={0}
                role="application"
                aria-label={`Interactive 3D isometric project and agent world. Currently docked at ${selected.title} (${selected.accession}, PBR ${selectedPbr.finishLabel}). Drag to orbit and shimmer metallic surfaces, use WASD or arrow keys to steer the Agent Rover, Q or E to rotate 90 degrees, B for natural leaf breeze and specular sweep, Space to pulse agent packets, or use the monument controls.`}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onKeyDown={handleKeyDown}
                onKeyUp={handleKeyUp}
                onBlur={() => simRef.current.keys.clear()}
              />

              {/* Bottom HUD: Radar Minimap, District Filters & Controls Legend */}
              <div className="iso-hud-bottom">
                {/* Interactive Isometric Waypoint & Hot-Spot Mini-Map Radar */}
                <div className="iso-minimap" role="region" aria-label="Interactive isometric mini-map radar">
                  <div className="iso-minimap__head">
                    <span>RADAR · {SCROLL_ZONES[Math.round(scrollZoneProgress)]?.code}</span>
                    <span>{selected.accession.replace("PK-", "")}</span>
                  </div>
                  <svg
                    className="iso-minimap__svg"
                    viewBox="-5.2 -5.2 10.4 10.4"
                    aria-label="Campus mini-map hot-spots"
                  >
                    <rect x="-4.7" y="-4.7" width="9.4" height="9.4" fill="rgba(16, 20, 38, 0.95)" stroke="rgba(156, 235, 255, 0.35)" strokeWidth="0.12" />
                    <line x1="-4.7" y1="0" x2="4.7" y2="0" stroke="rgba(255,255,255,0.18)" strokeWidth="0.08" strokeDasharray="0.25 0.25" />
                    <line x1="0" y1="-4.7" x2="0" y2="4.7" stroke="rgba(255,255,255,0.18)" strokeWidth="0.08" strokeDasharray="0.25 0.25" />
                    {monuments.map((m) => {
                      const isSel = m.slug === selected.slug;
                      const dotColor =
                        m.tier === "CORE"
                          ? "#ffffff"
                          : m.district === "command"
                            ? "#7cf5e6"
                            : m.district === "games"
                              ? "#ff9ec4"
                              : m.district === "vault"
                                ? "#ffe094"
                                : "#a8ccff";
                      return (
                        <g
                          key={m.slug}
                          className="iso-minimap__blip"
                          onClick={() => selectMonument(m.slug)}
                        >
                          <title>{`${m.shortTitle} (${m.accession})`}</title>
                          {isSel && (
                            <circle
                              cx={m.gridX}
                              cy={m.gridY}
                              r={0.62}
                              fill="none"
                              stroke="#7cf5e6"
                              strokeWidth="0.14"
                            />
                          )}
                          <circle
                            cx={m.gridX}
                            cy={m.gridY}
                            r={m.tier === "CORE" ? 0.36 : isSel ? 0.32 : 0.22}
                            fill={dotColor}
                          />
                        </g>
                      );
                    })}
                  </svg>
                </div>

                <div className="iso-bottom-controls">
                  <div className="filters iso-hero-lenses" role="group" aria-label="Filter monuments by district">
                    {LENSES.map((l) => {
                      const count =
                        l.id === "all"
                          ? monuments.length
                          : monuments.filter((m) => m.district === l.id).length;
                      return (
                        <button
                          key={l.id}
                          type="button"
                          aria-pressed={lens === l.id}
                          onClick={() => {
                            setLens(l.id);
                            const firstInLens = monuments.find((m) => l.id === "all" || m.district === l.id);
                            if (firstInLens) selectMonument(firstInLens.slug);
                          }}
                        >
                          {l.label} <span>{count}</span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="iso-controls-hint" aria-hidden="true">
                    <span>[Drag] Orbit</span>
                    <span>[WASD] Drone</span>
                    <span>[Click] Dock</span>
                    <span>[Q / E] 90°</span>
                    <span>[B] Breeze</span>
                    <span>[Space] Pulse</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* ───────── Dedicated Museum Wall Label & Inspector (Positioned Below Isometric Stage) ───────── */}
      <aside
        className="paper iso-dossier iso-dossier-bottom"
        id="monument-dossier"
        aria-label="Selected monument wall label"
        aria-live="polite"
      >
        <div className="iso-dossier-bottom__grid">
          {/* Column 1: Image Preview, Accession & Specs */}
          <div className="iso-dossier-bottom__media-col">
            <div className="iso-dossier-bottom__kicker">
              <span className="iso-dossier-bottom__acc">{selected.accession}</span>
              <span className="iso-dossier-bottom__sector">{selected.district.toUpperCase()} SECTOR</span>
            </div>

            {selected.image && (
              <div className="iso-dossier-bottom__preview frame">
                <span className="frame__mat">
                  {/* eslint-disable-next-line @next/next/no-img-element -- static export */}
                  <img
                    src={selected.image.src}
                    srcSet={selected.image.srcSet}
                    sizes="(max-width: 52rem) 100vw, 22rem"
                    width={selected.image.width}
                    height={selected.image.height}
                    alt={selected.image.alt}
                    loading="lazy"
                  />
                </span>
              </div>
            )}

            <dl className="label__fields iso-dossier-bottom__dl">
              <div>
                <dt>Status</dt>
                <dd>{selected.maturity} ({selected.tier === "C" || selected.tier === "VAULT" ? "Private / Vault" : `Tier ${selected.tier}`})</dd>
              </div>
              <div>
                <dt>Surface PBR</dt>
                <dd>{selectedPbr.finishLabel} (R {selectedPbr.roughness.toFixed(2)} · M {selectedPbr.metalness.toFixed(2)})</dd>
              </div>
              <div>
                <dt>Evidence</dt>
                <dd>
                  {selected.commits > 0 ? `${selected.commits} commits` : "CV / Vault record"}
                  {selected.files > 0 ? ` · ${selected.files} files` : ""}
                  {selected.testFiles > 0 ? ` · ${selected.testFiles} tests` : ""}
                </dd>
              </div>
              <div>
                <dt>ISO Grid</dt>
                <dd>({selected.gridX >= 0 ? `+${selected.gridX}` : selected.gridX}, {selected.gridY >= 0 ? `+${selected.gridY}` : selected.gridY})</dd>
              </div>
            </dl>
          </div>

          {/* Column 2: Title, Narrative & AI Agent Role */}
          <div className="iso-dossier-bottom__narrative-col">
            <h2 className="iso-dossier-bottom__title">
              {selected.title}
              <small className="iso-dossier-bottom__period">{selected.period}</small>
            </h2>

            <p className="iso-dossier-bottom__tagline">{selected.tagline}</p>

            <div className="iso-dossier-bottom__role-box">
              <strong className="iso-dossier-bottom__role-head">Agent Architecture &amp; Role</strong>
              <p className="iso-dossier-bottom__role-text">{selected.aiSummary}</p>
            </div>

            {selected.aiTools.length > 0 && (
              <div className="iso-dossier-bottom__tools">
                <p className="iso-dossier-bottom__subhead">Recorded Agent &amp; GenAI Stack</p>
                <ul className="iso-tool-list iso-tool-list--grid">
                  {selected.aiTools.slice(0, 4).map((t) => (
                    <li key={t.name}>
                      <strong>{t.name}:</strong> <span>{t.use}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Column 3: Stack, Audit Verification & Action Buttons */}
          <div className="iso-dossier-bottom__actions-col">
            <div>
              <p className="iso-dossier-bottom__subhead">Technical Stack</p>
              <p className="iso-dossier-bottom__stack">{selected.stack.join(", ")}</p>
            </div>

            <div>
              <p className="iso-dossier-bottom__subhead">Audit Verification</p>
              <div className="chips">
                {selected.tier === "C" || selected.tier === "VAULT" ? (
                  <span className="chip chip--private">
                    <IconPrivate />
                    Private · Ask for walkthrough
                  </span>
                ) : (
                  <>
                    <span className="chip chip--source">
                      <IconSource />
                      Source verified
                    </span>
                    {selected.testFiles > 0 && (
                      <span className="chip chip--ran">
                        <IconRan />
                        {selected.testFiles} test files
                      </span>
                    )}
                    {selected.aiTools.length > 0 && (
                      <span className="chip chip--ai">AI-directed ({selected.aiTools.length})</span>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="iso-dossier-bottom__actions">
              {selected.href ? (
                <Link className="btn iso-dossier-bottom__primary" href={selected.href}>
                  Open case study <IconArrow />
                </Link>
              ) : (
                <a className="btn iso-dossier-bottom__primary" href="#vault-desk">
                  Inquire about this work <IconArrow />
                </a>
              )}
              {selected.repoUrl && selected.pinnedSha && (
                <a
                  className="btn btn--small iso-dossier-bottom__sec"
                  href={`${selected.repoUrl}/tree/${selected.pinnedSha}`}
                >
                  GitHub @ {selected.pinnedSha.slice(0, 7)}{" "}
                  <IconExternal width={13} height={13} style={{ display: "inline", verticalAlign: "-2px" }} />
                </a>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Interactive 6-Stage Agent Pipeline Scrubber */}
      <div className="iso-pipeline-box" role="region" aria-label="Six-stage agentic engineering pipeline">
        <div className="iso-pipeline-head">
          <div>
            <h2 className="iso-pipeline-title">The 6-Stage Governed Agent Pipeline</h2>
            <p className="iso-pipeline-sub">
              Select a stage or scrub the slider to isolate which monuments prove each step of the agent workflow.
            </p>
          </div>
          <label className="iso-scrubber-label" htmlFor={stageSliderId}>
            <span>Stage filter: {activeStage === 0 ? "All 6 stages" : PIPELINE_STAGES[activeStage - 1]!.code}</span>
            <input
              id={stageSliderId}
              type="range"
              min={0}
              max={6}
              step={1}
              value={activeStage}
              onChange={(e) => setActiveStage(Number(e.target.value))}
              aria-valuetext={
                activeStage === 0
                  ? "Showing all 6 pipeline stages"
                  : `Stage ${activeStage}: ${PIPELINE_STAGES[activeStage - 1]!.title}`
              }
            />
          </label>
        </div>

        <div className="iso-stage-pills" role="group" aria-label="Pipeline stage buttons">
          <button
            type="button"
            className="iso-stage-pill"
            aria-pressed={activeStage === 0}
            onClick={() => setActiveStage(0)}
          >
            <span className="iso-stage-pill__code">ALL · 01–06</span>
            <strong>Full Loop ({monuments.length})</strong>
          </button>
          {PIPELINE_STAGES.map((st) => {
            const matchCount = monuments.filter((m) => m.stages.includes(st.step)).length;
            return (
              <button
                key={st.step}
                type="button"
                className="iso-stage-pill"
                aria-pressed={activeStage === st.step}
                onClick={() => setActiveStage(activeStage === st.step ? 0 : st.step)}
              >
                <span className="iso-stage-pill__code">{st.code}</span>
                <strong>{st.title.split("&")[0]!.trim()} ({matchCount})</strong>
              </button>
            );
          })}
        </div>

        {currentStageInfo && (
          <div className="iso-stage-detail">
            <div className="iso-stage-detail__main">
              <p className="iso-stage-detail__kicker">{currentStageInfo.code} — {currentStageInfo.title}</p>
              <p>{currentStageInfo.rule}</p>
              <div className="chips" style={{ marginTop: "var(--s-2)" }}>
                {currentStageInfo.artifacts.map((art) => (
                  <span key={art} className="chip">
                    <IconSource />
                    {art}
                  </span>
                ))}
              </div>
            </div>
            <pre className="iso-stage-detail__cmd">
              <code>$ {currentStageInfo.commandSample}</code>
            </pre>
          </div>
        )}
      </div>

      {/* Accessible Quick-Dock Monument Selector Strip */}
      {/* Keyboard and screen-reader route to every work; folded so the island leads. */}
      <details className="iso-dock-strip">
        <summary className="iso-dock-strip__label">Index of works ({visibleMonuments.length})</summary>
        <div className="iso-dock-buttons">
          {visibleMonuments.map((m) => (
            <button
              key={m.slug}
              type="button"
              className="iso-dock-btn"
              data-tier={m.tier}
              aria-pressed={selected.slug === m.slug}
              onClick={() => selectMonument(m.slug)}
            >
              <span className="iso-dock-btn__acc">{m.accession.replace("PK-", "")}</span>
              <span>{m.shortTitle}</span>
            </button>
          ))}
        </div>
      </details>
    </div>
  );
}

type InquiryTopic = {
  id: string;
  code: string;
  label: string;
  subjectEn: string;
  bodyEn: string;
  subjectTh: string;
  bodyTh: string;
};

const INQUIRY_TOPICS: InquiryTopic[] = [
  {
    id: "agent-harness",
    code: "01 · AGENT ORCHESTRATION",
    label: "AI Agent Workflow & Harness Architecture",
    subjectEn: "Inquiry: AI Agent Orchestration & Engineering Workflow",
    bodyEn: `Hi Phatcharadanai,\n\nI explored your Isometric Agent Command exhibition (AI Kingdom, ChatGPT MCP Bridge, and your multi-agent verification harness).\n\nWe would love to discuss how you structure agent contracts (AGENTS.md / CLAUDE.md), MCP tooling, and deterministic verification for our engineering team.\n\nBest regards,`,
    subjectTh: "สอบถามเรื่องการวางระบบ AI Agent Orchestration และ Workflow",
    bodyTh: `สวัสดีครับคุณพัชรดาไนย\n\nได้เข้ามาชมหน้า Isometric Agent Command และผลงานการคุม AI Agent (เช่น AI Kingdom, ChatGPT MCP Bridge และระบบ Verification) แล้วสนใจมากครับ\n\nอยากติดต่อขอพูดคุยเพิ่มเติมเกี่ยวกับการออกแบบ Agent Harness และดูตัวอย่างผลงานเพิ่มเติมครับ\n\nขอบคุณครับ`,
  },
  {
    id: "private-vault",
    code: "02 · PRIVATE & ENTERPRISE VAULT",
    label: "Walkthrough of Additional & Private Works",
    subjectEn: "Request: Walkthrough of Private / Enterprise Works (Go, Rust, Hardware, Web)",
    bodyEn: `Hi Phatcharadanai,\n\nI saw the public works on your portfolio as well as the storage crates (Go, Rust, Godot) and enterprise project records (PTT, SCG, SIPH, ETRAN, AOT).\n\nCould we schedule a short call or walkthrough to hear more about the additional systems and projects you have built?\n\nBest regards,`,
    subjectTh: "ขอชมและพูดคุยเกี่ยวกับผลงานเพิ่มเติม (Private / Enterprise Works)",
    bodyTh: `สวัสดีครับคุณพัชรดาไนย\n\nเห็นผลงานบนเว็บและรายการโปรเจกต์ใน Private Storage (Go, Rust, Hardware, Games) รวมถึงงานฝั่ง Enterprise (PTT, SCG, SIPH, ETRAN, AOT) แล้วอยากสอบถามและขอพูดคุยแลกเปลี่ยนเกี่ยวกับผลงานอื่นๆ เพิ่มเติมครับ\n\nขอบคุณครับ`,
  },
  {
    id: "engineering-role",
    code: "03 · SENIOR / LEAD ROLE",
    label: "Systems, Full-Stack or Game Engineering Role",
    subjectEn: "Engineering Opportunity — Systems / Full-Stack / AI-Native Developer",
    bodyEn: `Hi Phatcharadanai,\n\nWe reviewed your Working Studio portfolio and were impressed by the combination of production systems (PrintOps, ScopeFlow, Vending Serial API), multiplayer games (Cursed Market, Relic Tide), and verified AI-agent delivery.\n\nWe have an engineering role that fits your background and would love to share the details.\n\nBest regards,`,
    subjectTh: "ติดต่อเรื่องโอกาสในการร่วมงาน (Software / Systems / AI Agent Engineer)",
    bodyTh: `สวัสดีครับคุณพัชรดาไนย\n\nได้ชมผลงานทั้งฝั่ง Production Systems, Multiplayer Games และการใช้ AI Agent ช่วยพัฒนาพร้อมระบบตรวจสอบหลักฐาน (Evidence-based verification) แล้วสนใจอยากชวนพูดคุยเรื่องโอกาสในการร่วมงานครับ\n\nขอบคุณครับ`,
  },
  {
    id: "custom-commission",
    code: "04 · TECHNICAL COMMISSION",
    label: "Commission a System, Tool or Interactive Web Build",
    subjectEn: "Project Inquiry: Custom System / Interactive Experience",
    bodyEn: `Hi Phatcharadanai,\n\nWe are looking for a developer who can architect and ship a high-craft system / interactive product using modern AI-agent velocity with strict engineering verification.\n\nLet us know when you might be available for a quick introductory chat.\n\nBest regards,`,
    subjectTh: "ติดต่อสอบถามการพัฒนาโปรเจกต์ / ที่ปรึกษาด้านเทคนิค",
    bodyTh: `สวัสดีครับคุณพัชรดาไนย\n\nสนใจอยากติดต่อสอบถามเกี่ยวกับการพัฒนาซอฟต์แวร์ / ระบบ Agent / Interactive Web แบบครบวงจรครับ รบกวนแจ้งช่วงเวลาที่สะดวกพูดคุยได้เลยครับ\n\nขอบคุณครับ`,
  },
];

export function VaultInquiryDesk({
  email,
  github,
  city,
}: {
  email: string;
  github: string;
  city: string;
}) {
  const textareaId = useId();
  const [topicId, setTopicId] = useState<string>(INQUIRY_TOPICS[0]!.id);
  const [lang, setLang] = useState<"en" | "th">("en");
  const [customBody, setCustomBody] = useState<string>(INQUIRY_TOPICS[0]!.bodyEn);
  const [copied, setCopied] = useState<boolean>(false);

  const currentTopic = useMemo(
    () => INQUIRY_TOPICS.find((t) => t.id === topicId) ?? INQUIRY_TOPICS[0]!,
    [topicId],
  );

  const selectTopicAndLang = (newTopicId: string, newLang: "en" | "th") => {
    const found = INQUIRY_TOPICS.find((t) => t.id === newTopicId) ?? INQUIRY_TOPICS[0]!;
    setTopicId(newTopicId);
    setLang(newLang);
    setCustomBody(newLang === "en" ? found.bodyEn : found.bodyTh);
    setCopied(false);
  };

  const subject = lang === "en" ? currentTopic.subjectEn : currentTopic.subjectTh;
  const mailtoHref = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(customBody)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`To: ${email}\nSubject: ${subject}\n\n${customBody}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 3000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="paper inquiry-desk" id="vault-desk">
      <div className="inquiry-desk__head">
        <div>
          <p className="label__acc">PK-2026-INQ · DIRECT DISPATCH &amp; ARCHIVE INQUIRY</p>
          <h3 className="paper__h" style={{ marginTop: "var(--s-1)", marginBottom: "var(--s-2)" }}>
            Ask About Additional Works or Issue a Technical Brief
          </h3>
          <p className="measure" style={{ color: "var(--ink-soft)" }}>
            Many more systems—private commercial backends in Go and Rust, hardware dispenser controllers, enterprise interfaces,
            and internal AI agent harnesses—cannot be posted publicly. Select a topic below to draft a direct inquiry in English or Thai.
          </p>
        </div>

        <div className="inquiry-desk__lang" role="group" aria-label="Brief language">
          <button
            type="button"
            className="btn btn--small"
            aria-pressed={lang === "en"}
            onClick={() => selectTopicAndLang(topicId, "en")}
          >
            English Brief
          </button>
          <button
            type="button"
            className="btn btn--small"
            aria-pressed={lang === "th"}
            onClick={() => selectTopicAndLang(topicId, "th")}
          >
            ข้อความภาษาไทย
          </button>
        </div>
      </div>

      <div className="inquiry-topics" role="group" aria-label="Inquiry topic presets">
        {INQUIRY_TOPICS.map((t) => (
          <button
            key={t.id}
            type="button"
            className="inquiry-topic-btn"
            aria-pressed={topicId === t.id}
            onClick={() => selectTopicAndLang(t.id, lang)}
          >
            <span className="inquiry-topic-btn__code">{t.code}</span>
            <strong>{t.label}</strong>
          </button>
        ))}
      </div>

      <div className="inquiry-composer">
        <label htmlFor={textareaId} className="inquiry-composer__label">
          <span>Subject: <strong>{subject}</strong></span>
          <span>Recipient: <code>{email}</code> ({city})</span>
        </label>
        <textarea
          id={textareaId}
          className="inquiry-composer__textarea"
          rows={6}
          value={customBody}
          onChange={(e) => setCustomBody(e.target.value)}
        />
      </div>

      <div className="inquiry-desk__footer">
        <div className="btn-row">
          <a className="btn inquiry-desk__primary" href={mailtoHref}>
            Open in Email ({email}) <IconArrow />
          </a>
          <button type="button" className="btn btn--small" onClick={handleCopy}>
            {copied ? "Copied brief to clipboard" : "Copy message brief"}
          </button>
          <a className="btn btn--small" href={github} rel="me">
            GitHub (@phcaradanai){" "}
            <IconExternal width={14} height={14} style={{ display: "inline", verticalAlign: "-2px" }} />
          </a>
          <Link className="btn btn--small" href="/resume/">
            Printable Resume <IconArrow />
          </Link>
        </div>
        <p className="paper__note" aria-live="polite" style={{ marginTop: "var(--s-3)" }}>
          {copied
            ? `Copied to clipboard. Paste directly into an email to ${email}.`
            : "Direct response from Bangkok (UTC+7). Source walkthroughs and live demos of local/LAN systems can be arranged on request."}
        </p>
      </div>
    </div>
  );
}
