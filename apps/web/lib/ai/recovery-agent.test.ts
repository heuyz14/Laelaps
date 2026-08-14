import { describe, expect, it, vi } from "vitest";

import type { AiToolContext, SavedInsight } from "@/lib/ai/contracts";
import type { AiProvider } from "@/lib/ai/provider";
import { analyzeRecovery } from "@/lib/ai/recovery-agent";

const output = {
  summary: "The current data shows a possible workload increase.",
  riskFlags: ["Volume increased sharply."],
  recommendation: "Take an easy day and reassess before adding intensity.",
  confidence: "medium" as const,
};

describe("recovery agent", () => {
  it("uses deterministic signals and persists validated output", async () => {
    const insight: SavedInsight = {
      id: "00000000-0000-4000-8000-000000000004",
      insight_type: "recovery_analysis",
      run_id: null,
      input_summary: { runCount: 4, recoverySignals: [] },
      output,
    };
    const saveInsight = vi.fn(async () => insight);
    const result = await analyzeRecovery(
      {} as AiToolContext,
      { generateStructured: vi.fn(async () => output) } as AiProvider,
      {
        getWeeklyStats: vi.fn(async () => ({
          summary: {
            runCount: 4,
            distanceMeters: 20000,
            durationSeconds: 7200,
            averagePaceSecondsPerKm: 360,
          },
          weeklyMileage: [],
          recoverySignals: [],
        })),
        getRecoverySignals: vi.fn(async () => [
          {
            kind: "volume_spike" as const,
            severity: "high" as const,
            message: "Volume increased sharply.",
          },
        ]),
        saveInsight,
      },
    );

    expect(result.output).toEqual(output);
    expect(saveInsight).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ insightType: "recovery_analysis" }),
    );
  });

  it("does not persist malformed provider output", async () => {
    const saveInsight = vi.fn();
    await expect(
      analyzeRecovery(
        {} as AiToolContext,
        {
          generateStructured: vi.fn(async () => ({
            ...output,
            confidence: "certain",
          })),
        } as AiProvider,
        {
          getWeeklyStats: vi.fn(async () => ({
            summary: {
              runCount: 0,
              distanceMeters: 0,
              durationSeconds: 0,
              averagePaceSecondsPerKm: null,
            },
            weeklyMileage: [],
            recoverySignals: [],
          })),
          getRecoverySignals: vi.fn(async () => []),
          saveInsight: saveInsight as never,
        },
      ),
    ).rejects.toThrow();
    expect(saveInsight).not.toHaveBeenCalled();
  });
});
