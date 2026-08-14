import { describe, expect, it, vi } from "vitest";

import type { AiToolContext, SavedInsight } from "@/lib/ai/contracts";
import type { AiProvider } from "@/lib/ai/provider";
import {
  analyzeTrainingHistory,
  buildHistoricalAnalystContext,
  historicalAnalystOutputSchema,
  type HistoricalAnalystDependencies,
} from "@/lib/ai/historical-analyst";

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
  directAnswer: "Your recent history is too sparse to confirm a trend.",
  evidence: ["One run is available in the current history."],
  likelyContributors: ["Limited logged history."],
  caveats: ["More consistent data is needed."],
  suggestedNextAction: "Log several comparable runs before judging progress.",
  confidence: "low" as const,
};

function dependencies(overrides: Partial<HistoricalAnalystDependencies> = {}) {
  const insight: SavedInsight = {
    id: "00000000-0000-4000-8000-000000000004",
    insight_type: "historical_analysis",
    run_id: null,
    input_summary: { question: "Am I improving?", sourceRunIds: [run.id] },
    output,
  };
  return {
    getRecentRuns: vi.fn(async () => [run]),
    getWeeklyStats: vi.fn(async () => stats),
    getRecoverySignals: vi.fn(async () => []),
    getGoal: vi.fn(async () => null),
    saveInsight: vi.fn(async () => insight),
    ...overrides,
  } as HistoricalAnalystDependencies;
}

describe("historical analyst", () => {
  it("builds context with only supplied run IDs", () => {
    const context = buildHistoricalAnalystContext({
      question: "Am I improving?",
      recentRuns: [run],
      weeklyStats: stats,
      recoverySignals: [],
      activeGoal: null,
    });

    expect(context.sourceRunIds).toEqual([run.id]);
    expect(context.question).toBe("Am I improving?");
  });

  it("grounds, validates, and saves a historical analysis", async () => {
    const provider: AiProvider = {
      generateStructured: vi.fn(async () => output),
    };
    const deps = dependencies();
    const result = await analyzeTrainingHistory(
      {} as AiToolContext,
      " Am I improving? ",
      provider,
      deps,
    );

    expect(result.output).toEqual(output);
    expect(deps.getRecentRuns).toHaveBeenCalledWith(expect.anything(), 20);
    expect(deps.saveInsight).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ insightType: "historical_analysis" }),
    );
  });

  it("rejects empty or oversized questions before loading data", async () => {
    const deps = dependencies();
    await expect(
      analyzeTrainingHistory(
        {} as AiToolContext,
        "?",
        { generateStructured: vi.fn() },
        deps,
      ),
    ).rejects.toThrow();
    expect(deps.getRecentRuns).not.toHaveBeenCalled();
  });

  it("rejects invalid provider output and does not save it", async () => {
    const deps = dependencies();
    await expect(
      analyzeTrainingHistory(
        {} as AiToolContext,
        "Why did this feel harder?",
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

  it("keeps the output contract bounded", () => {
    expect(() =>
      historicalAnalystOutputSchema.parse({
        ...output,
        evidence: ["x".repeat(401)],
      }),
    ).toThrow();
  });
});
