/**
 * NuriTrack 3D Logistics & Supply Chain Simulation State Store (Zustand)
 * Reverse-engineered via REA principles: "AI Interprets, Code Decides".
 * Bridges UI controls directly into React Three Fiber 60fps render loops.
 */

import { create } from "zustand";
import { createInitialWorld, decisionLog, stepSim, type FleetFilter } from "@/data/logistics/sim";
import type { SiteId, World } from "@/data/logistics/types";

export type LabelFilter = "fleet" | "infra" | "all";

export type TimeOfDay = "day" | "sunset" | "night";
export type WeatherCondition = "clear" | "rain" | "snow" | "autumn";
export type CameraMode =
  | "overview"
  | "fulfillment"
  | "megahub"
  | "intermodal"
  | "truck_follow"
  | "drone_follow"
  | "stage";

export interface PackageJourneyStage {
  step: number;
  code: string;
  facility: string;
  title: string;
  location: string;
  machinery: string;
  statusText: string;
  lookAtTarget: [number, number, number];
  cameraOffset: [number, number, number];
  zoom: number;
}

export const STAGE_TO_CAMERA_MODE: CameraMode[] = [
  "overview",
  "fulfillment",
  "megahub",
  "truck_follow",
  "intermodal",
  "drone_follow",
  "drone_follow",
];

export const JOURNEY_STAGES: PackageJourneyStage[] = [
  {
    step: 0,
    code: "STG-01 · ORDERED",
    facility: "Customer Ingestion Gate",
    title: "Order Processed & SKU Bound",
    location: "Icheon Metro Fulfillment",
    machinery: "WCS Dispatch Engine",
    statusText: "Package order verified; picking wave scheduled for autonomous AMR fleet.",
    lookAtTarget: [0, 0, 0],
    cameraOffset: [14, 13, 14],
    zoom: 34,
  },
  {
    step: 1,
    code: "STG-02 · PICKING",
    facility: "High-Bay Fulfillment Center",
    title: "Autonomous AMR Shelf Retrieval",
    location: "Icheon Facility Zone B-4",
    machinery: "AMR-01 & AMR-03 Robots",
    statusText: "AMR-03 navigated automated rack grid to aisle 14; payload loaded on conveyor belt.",
    lookAtTarget: [-4.8, 0.6, -3.0],
    cameraOffset: [8, 9, 8],
    zoom: 40,
  },
  {
    step: 2,
    code: "STG-03 · SORTING",
    facility: "Gonjiam Mega Hub",
    title: "Cross-Belt High-Speed Sorting",
    location: "Gonjiam Central Distribution",
    machinery: "Cross-Belt Loop Sorter (4.2 m/s)",
    statusText: "Barcode optical scanned (360° array); routed to Expressway Line-haul Chute #12.",
    lookAtTarget: [-1.2, 0.6, -1.5],
    cameraOffset: [8, 9, 8],
    zoom: 42,
  },
  {
    step: 3,
    code: "STG-04 · LINE-HAUL",
    facility: "Gyeongbu Arterial Expressway",
    title: "Inter-Facility Line-Haul Highway",
    location: "Route 1 Arterial Corridor",
    machinery: "Autonomous Wing-Body Semi #88",
    statusText: "Platooning convoy moving at 88 km/h; telematics telemetry transmitting at 10Hz.",
    lookAtTarget: [1.2, 0.4, 0.4],
    cameraOffset: [8, 9, 8],
    zoom: 38,
  },
  {
    step: 4,
    code: "STG-05 · GATEWAY",
    facility: "Intermodal Logistics Terminal",
    title: "Air Cargo & Container Port Gateway",
    location: "Incheon Cargo Port & Aerotropolis",
    machinery: "Boeing 777F Freighter & Gantry Crane",
    statusText: "Cross-dock transfer initiated; unit load device (ULD) secured for express flight.",
    lookAtTarget: [6.0, 0.7, -1.5],
    cameraOffset: [9, 9, 9],
    zoom: 38,
  },
  {
    step: 5,
    code: "STG-06 · LAST-MILE",
    facility: "Urban Micro-Fulfillment Station",
    title: "Electric Cargo Van & Drone Dispatch",
    location: "Bangkok Metro District Hub",
    machinery: "AeroDrone Hexacopter #04",
    statusText: "Drone departed rooftop vertiport; LiDAR terrain clearance maintained at 45m.",
    lookAtTarget: [3.8, 1.0, 3.8],
    cameraOffset: [7, 8, 7],
    zoom: 42,
  },
  {
    step: 6,
    code: "STG-07 · DELIVERED",
    facility: "Residential Safe Drop Zone",
    title: "Final Delivery & Signature Verifier",
    location: "Destination Smart Locker Pod",
    machinery: "Automated Contactless Locker",
    statusText: "Package deposited securely. Cryptographic proof-of-delivery written to ledger.",
    lookAtTarget: [3.6, 0.6, 4.2],
    cameraOffset: [7, 7, 7],
    zoom: 44,
  },
];

export interface AiLogEntry {
  id: string;
  time: string;
  agent: "DISPATCH" | "ROUTER" | "SAFETY" | "TELEMATICS";
  text: string;
}

interface LogisticsStoreState {
  timeOfDay: TimeOfDay;
  weather: WeatherCondition;
  cameraMode: CameraMode;
  activeStage: number;
  playbackState: "playing" | "paused";
  playbackSpeed: number;
  activePackage: {
    id: string;
    sku: string;
    name: string;
    weight: string;
    temp: string;
    origin: string;
    dest: string;
    priority: "STANDARD" | "EXPRESS" | "CRITICAL";
  };
  metrics: {
    activeAmrs: number;
    transitTrucks: number;
    throughputPps: number;
    fleetHealth: number;
  };
  aiLogs: AiLogEntry[];
  world: World;
  activeSiteId: SiteId;
  selectedEntityId: string | null;
  labelFilter: LabelFilter;
  fleetFilter: FleetFilter;
  /** Parcel shown in the journey card; null follows the first open parcel at the active site. */
  trackedParcelId: string | null;

  // Actions
  setFleetFilter: (filter: Partial<FleetFilter>) => void;
  setTrackedParcel: (id: string | null) => void;
  setActiveSite: (siteId: SiteId) => void;
  selectEntity: (id: string | null) => void;
  setLabelFilter: (filter: LabelFilter) => void;
  /** One live tick: advances the sim by playbackSpeed minutes unless paused, logging what the rules decided. */
  tick: () => void;
  setTimeOfDay: (time: TimeOfDay) => void;
  setWeather: (weather: WeatherCondition) => void;
  setCameraMode: (mode: CameraMode) => void;
  setActiveStage: (stage: number) => void;
  nextStage: () => void;
  prevStage: () => void;
  togglePlayback: () => void;
  setPlaybackSpeed: (speed: number) => void;
  addAiLog: (log: Omit<AiLogEntry, "id" | "time">) => void;
}

export const PACKAGE_CATALOG = [
  {
    id: "PK-NURI-8092",
    sku: "SKU-OPTIC-742",
    name: "Precision LiDAR & Sensor Array",
    weight: "2.84 kg",
    temp: "+4.2°C",
    origin: "Icheon High-Bay Fulfillment (KR)",
    dest: "Bangkok Systems Studio (TH)",
    priority: "CRITICAL" as const,
  },
  {
    id: "PK-NURI-8093",
    sku: "SKU-NEURAL-880",
    name: "Cryogenic Neural TPU Wafer",
    weight: "1.15 kg",
    temp: "-18.5°C",
    origin: "Busan Semiconductor Port (KR)",
    dest: "Singapore Quantum Lab (SG)",
    priority: "CRITICAL" as const,
  },
  {
    id: "PK-NURI-8094",
    sku: "SKU-ENCODER-310",
    name: "Sub-Millimeter Optical Encoder",
    weight: "0.64 kg",
    temp: "+18.0°C",
    origin: "Gonjiam Metro Hub (KR)",
    dest: "Tokyo Robotics Center (JP)",
    priority: "EXPRESS" as const,
  },
  {
    id: "PK-NURI-8095",
    sku: "SKU-AVIONIC-550",
    name: "Autonomous Drone Avionics Core",
    weight: "3.20 kg",
    temp: "+21.0°C",
    origin: "Incheon Aerotropolis (KR)",
    dest: "Munich System Werk (DE)",
    priority: "STANDARD" as const,
  },
];

const STAGE_REASONING: { agent: AiLogEntry["agent"]; text: (pkgId: string) => string }[] = [
  {
    agent: "DISPATCH",
    text: (pkgId) => `Order wave verified for ${pkgId}; picking wave scheduled for autonomous AMR fleet.`,
  },
  {
    agent: "ROUTER",
    text: (pkgId) => `AMR-03 dynamic route resolved for ${pkgId} -> shelf pod lifted onto conveyor.`,
  },
  {
    agent: "SAFETY",
    text: () => `Barcode optical 360° LiDAR scanned -> routed to Expressway Line-haul Chute #12.`,
  },
  {
    agent: "TELEMATICS",
    text: () => `Platooning semi #88 locked at 88 km/h along Gyeongbu Expressway corridor.`,
  },
  {
    agent: "ROUTER",
    text: (pkgId) => `Intermodal cross-dock transfer verified; ULD container with ${pkgId} secured for cargo flight.`,
  },
  {
    agent: "DISPATCH",
    text: () => `Drone departed rooftop vertiport; LiDAR terrain clearance maintained at 45m.`,
  },
  {
    agent: "SAFETY",
    text: (pkgId) => `Package ${pkgId} deposited in smart locker. Proof-of-delivery ledger signed.`,
  },
];

export const useLogisticsStore = create<LogisticsStoreState>((set) => ({
  timeOfDay: "day",
  weather: "snow",
  cameraMode: "overview",
  activeStage: 0,
  playbackState: "playing",
  playbackSpeed: 1,
  activePackage: PACKAGE_CATALOG[0]!,
  metrics: {
    activeAmrs: 8,
    transitTrucks: 4,
    throughputPps: 1420,
    fleetHealth: 99.4,
  },
  aiLogs: [],
  world: createInitialWorld(),
  activeSiteId: "GJ-01",
  selectedEntityId: null,
  labelFilter: "fleet",
  fleetFilter: { delayedOnly: false, tone: "all" },
  trackedParcelId: null,

  // The rule log is per site, so it starts fresh on a switch.
  setActiveSite: (activeSiteId) => set({ activeSiteId, selectedEntityId: null, trackedParcelId: null, aiLogs: [] }),
  setFleetFilter: (filter) => set((state) => ({ fleetFilter: { ...state.fleetFilter, ...filter } })),
  setTrackedParcel: (trackedParcelId) => set({ trackedParcelId }),
  selectEntity: (selectedEntityId) => set({ selectedEntityId }),
  setLabelFilter: (labelFilter) => set({ labelFilter }),
  tick: () =>
    set((state) => {
      if (state.playbackState !== "playing") return {};
      const world = stepSim(state.world, state.playbackSpeed);
      const logs = decisionLog(state.world, world, state.activeSiteId);
      return { world, aiLogs: logs.length ? [...logs, ...state.aiLogs].slice(0, 16) : state.aiLogs };
    }),

  setTimeOfDay: (timeOfDay) => set({ timeOfDay }),
  setWeather: (weather) => set({ weather }),
  setCameraMode: (cameraMode) => set({ cameraMode }),
  setActiveStage: (activeStage) => {
    const clamped = Math.max(0, Math.min(JOURNEY_STAGES.length - 1, activeStage));
    set((state) => {
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
      const reasoner = STAGE_REASONING[clamped] ?? STAGE_REASONING[0]!;
      const newEntry: AiLogEntry = {
        id: `log-${Date.now()}-${clamped}`,
        time: timeStr,
        agent: reasoner.agent,
        text: reasoner.text(state.activePackage.id),
      };

      return {
        activeStage: clamped,
        cameraMode: STAGE_TO_CAMERA_MODE[clamped] ?? "overview",
        aiLogs: [newEntry, ...state.aiLogs.slice(0, 15)],
      };
    });
  },
  nextStage: () =>
    set((state) => {
      const next = (state.activeStage + 1) % JOURNEY_STAGES.length;
      let nextPkg = state.activePackage;
      if (next === 0) {
        // Full journey loop completed! Cycle to next package SKU
        const currentIdx = PACKAGE_CATALOG.findIndex((p) => p.id === state.activePackage.id);
        nextPkg = PACKAGE_CATALOG[(currentIdx + 1) % PACKAGE_CATALOG.length] ?? PACKAGE_CATALOG[0]!;
      }

      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
      const reasoner = STAGE_REASONING[next] ?? STAGE_REASONING[0]!;
      const newEntry: AiLogEntry = {
        id: `log-${Date.now()}-${next}`,
        time: timeStr,
        agent: reasoner.agent,
        text: reasoner.text(nextPkg.id),
      };

      return {
        activeStage: next,
        cameraMode: STAGE_TO_CAMERA_MODE[next] ?? "overview",
        activePackage: nextPkg,
        aiLogs: [newEntry, ...state.aiLogs.slice(0, 15)],
        metrics: {
          activeAmrs: 7 + (next % 3),
          transitTrucks: 3 + (next % 2),
          throughputPps: 1400 + ((next * 23) % 90),
          fleetHealth: Number((99.1 + ((next * 0.12) % 0.8)).toFixed(1)),
        },
      };
    }),
  prevStage: () =>
    set((state) => {
      const prev = (state.activeStage - 1 + JOURNEY_STAGES.length) % JOURNEY_STAGES.length;
      return {
        activeStage: prev,
        cameraMode: STAGE_TO_CAMERA_MODE[prev] ?? "overview",
      };
    }),
  togglePlayback: () =>
    set((state) => ({
      playbackState: state.playbackState === "playing" ? "paused" : "playing",
    })),
  setPlaybackSpeed: (playbackSpeed) => set({ playbackSpeed }),
  addAiLog: (log) =>
    set((state) => {
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
      const newEntry: AiLogEntry = {
        id: `log-${Date.now()}`,
        time: timeStr,
        ...log,
      };
      return {
        aiLogs: [newEntry, ...state.aiLogs.slice(0, 15)],
      };
    }),
}));
