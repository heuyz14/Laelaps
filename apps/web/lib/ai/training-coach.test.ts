import { describe, expect, it, vi } from "vitest";

import type { AiToolContext, SavedInsight } from "@/lib/ai/contracts";
import type { AiProvider } from "@/lib/ai/provider";
import {
  buildTrainingCoachContext,
  generateTrainingCoachAdvice,
  trainingCoachOutputSchema,
  type TrainingCoachDependencies,
} from "@/lib/ai/training-coach";

const run = {
  id: "00000000-0000-4000-8000-000000000002",
  run_date: "2026-08-01",
  distance_meters: 5000,
  duration_seconds: 1500,
  avg_heart_rate: 150,
  max_heart_rate: 165,
  effort: 5,
};
const stats = {
  summary: {
    runCount: 1,
    distanceMeters: 5000,
    durationSeconds: 1500,
    averagePaceSecondsPerKm: 300,
  },
  weeklyMileage: [],
  recoverySignals: [],
};
const output = {
  weeklySummary: "Training history is limited this week.",
  recommendation: "Build consistency before adding intensity.",
  nextRunSuggestion: "Run an easy 30-minute effort.",
  riskFlags: [],
  confidence: "low" as const,
};

function dependencies(overrides: Partial<TrainingCoachDependencies> = {}) {
  const insight: SavedInsight = {
    id: "00000000-0000-4000-8000-000000000004",
    insight_type: "training_coach",
    run_id: null,
    input_summary: { sourceRunIds: [run.id] },
    output,
  };
  return {
    getRecentRuns: vi.fn(async () => [run]),
    getWeeklyStats: vi.fn(async () => stats),
    getRecoverySignals: vi.fn(async () => []),
    getGoal: vi.fn(async () => null),
    saveInsight: vi.fn(async () => insight),
    ...overrides,
  } as TrainingCoachDependencies;
}

describe("training coach", () => {
  it("builds a user-scoped context from recent runs", () => {
    const context = buildTrainingCoachContext({
      recentRuns: [run],
      weeklyStats: stats,
      recoverySignals: [],
      activeGoal: null,
    });

    expect(context.sourceRunIds).toEqual([run.id]);
  });

  it("grounds, validates, and saves conservative advice", async () => {
    const provider: AiProvider = {
      generateStructured: vi.fn(async () => output),
    };
    const deps = dependencies();
    const result = await generateTrainingCoachAdvice(
      {} as AiToolContext,
      provider,
      deps,
    );

    expect(result.output).toEqual(output);
    expect(deps.saveInsight).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ insightType: "training_coach" }),
    );
  });

  it("includes recovery signals in the persisted input summary", async () => {
    const deps = dependencies({
      getRecoverySignals: vi.fn(async () => [
        {
          kind: "volume_spike" as const,
          severity: "high" as const,
          message: "Volume increased sharply.",
        },
      ]),
    });

    await generateTrainingCoachAdvice(
      {} as AiToolContext,
      { generateStructured: vi.fn(async () => output) },
      deps,
    );

    expect(deps.saveInsight).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        inputSummary: expect.objectContaining({
          recoverySignalKinds: ["volume_spike"],
        }),
      }),
    );
  });

  it("does not save invalid provider output", async () => {
    const deps = dependencies();
    await expect(
      generateTrainingCoachAdvice(
        {} as AiToolContext,
        {
          generateStructured: vi.fn(async () => ({
            ...output,
            confidence: "certain",
          })),
        },
        deps,
      ),
    ).rejects.toThrow();
    expect(deps.saveInsight).not.toHaveBeenCalled();
  });

  it("keeps risk flags and recommendations bounded", () => {
    expect(() =>
      trainingCoachOutputSchema.parse({
        ...output,
        riskFlags: Array.from({ length: 7 }, () => "flag"),
      }),
    ).toThrow();
  });
});
