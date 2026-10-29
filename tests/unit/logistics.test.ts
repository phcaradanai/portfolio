import { describe, it, expect, beforeEach } from "vitest";
import { useLogisticsStore, JOURNEY_STAGES } from "@/lib/logistics-store";

describe("NuriTrack 3D Logistics State Store", () => {
  beforeEach(() => {
    useLogisticsStore.setState({
      activeStage: 0,
      timeOfDay: "night",
      weather: "clear",
      cameraMode: "overview",
      playbackState: "playing",
    });
  });

  it("initializes with 7 valid multimodal journey stages", () => {
    expect(JOURNEY_STAGES.length).toBe(7);
    expect(JOURNEY_STAGES[0]!.code).toContain("STG-01");
    expect(JOURNEY_STAGES[6]!.code).toContain("STG-07");
  });

  it("advances and wraps stages cyclically", () => {
    const { nextStage, prevStage } = useLogisticsStore.getState();

    nextStage();
    expect(useLogisticsStore.getState().activeStage).toBe(1);

    prevStage();
    expect(useLogisticsStore.getState().activeStage).toBe(0);

    prevStage();
    expect(useLogisticsStore.getState().activeStage).toBe(6);
  });

  it("safely handles environmental and camera mode changes", () => {
    const { setTimeOfDay, setWeather, setCameraMode } = useLogisticsStore.getState();

    setTimeOfDay("day");
    expect(useLogisticsStore.getState().timeOfDay).toBe("day");

    setWeather("snow");
    expect(useLogisticsStore.getState().weather).toBe("snow");

    setCameraMode("fulfillment");
    expect(useLogisticsStore.getState().cameraMode).toBe("fulfillment");
  });

  it("appends structured AI reasoning logs cleanly", () => {
    const { addAiLog } = useLogisticsStore.getState();
    const prevCount = useLogisticsStore.getState().aiLogs.length;

    addAiLog({
      agent: "ROUTER",
      text: "Test decision event: weather congestion reroute engaged.",
    });

    const currentLogs = useLogisticsStore.getState().aiLogs;
    expect(currentLogs.length).toBe(prevCount + 1);
    expect(currentLogs[0]!.agent).toBe("ROUTER");
    expect(currentLogs[0]!.text).toContain("weather congestion reroute");
  });
});
