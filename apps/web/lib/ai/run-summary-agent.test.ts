import { describe, expect, it, vi } from "vitest";

import type { AiToolContext, SavedInsight } from "@/lib/ai/contracts";
import type { AiProvider } from "@/lib/ai/provider";
import {
  generateRunSummary,
  type RunSummaryDependencies,
} from "@/lib/ai/run-summary-agent";

const runId = "00000000-0000-4000-8000-000000000002";
const comparableId = "00000000-0000-4000-8000-000000000003";
const context = {} as AiToolContext;

const run = {
  id: runId,
  run_date: "2026-08-01",
  distance_meters: 5000,
  duration_seconds: 1500,
  avg_heart_rate: 150,
  max_heart_rate: 165,
  effort: 5,
};

const weeklyStats = {
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
  summary: "A steady aerobic run.",
  highlights: ["Pace was consistent."],
  comparison: "Comparable history is limited.",
  suggestedImprovement: "Keep the next easy day easy.",
  confidence: "medium" as const,
};

function dependencies(overrides: Partial<RunSummaryDependencies> = {}) {
  const savedInsight: SavedInsight = {
    id: "00000000-0000-4000-8000-000000000004",
    insight_type: "run_summary",
    run_id: runId,
    input_summary: {
      sourceRunIds: [runId, comparableId],
      weeklyRunCount: 1,
      activeGoalId: null,
    },
    output,
  };

  return {
    getRunById: vi.fn(async () => run),
    getComparableRuns: vi.fn(async () => [
      { ...run, id: comparableId, duration_seconds: 1600 },
    ]),
    getWeeklyStats: vi.fn(async () => weeklyStats),
    getGoal: vi.fn(async () => null),
    saveInsight: vi.fn(async () => savedInsight),
    ...overrides,
  } as RunSummaryDependencies;
}

function providerReturning(value: unknown): AiProvider & { request?: unknown } {
  const provider = {
    generateStructured: vi.fn(async (request: unknown) => {
      provider.request = request;
      return value;
    }),
  } as AiProvider & { request?: unknown };

  return provider;
}

describe("generateRunSummary", () => {
  it("grounds the provider request and saves the validated output", async () => {
    const provider = providerReturning(output);
    const deps = dependencies();
    const result = await generateRunSummary(context, runId, provider, deps);

    expect(result.output).toEqual(output);
    expect(result.insight.insight_type).toBe("run_summary");
    expect(deps.saveInsight).toHaveBeenCalledWith(
      context,
      expect.objectContaining({
        insightType: "run_summary",
        runId,
        inputSummary: expect.objectContaining({
          sourceRunIds: [runId, comparableId],
        }),
      }),
    );
    expect(JSON.stringify(provider.request)).toContain(runId);
  });

  it("does not call the provider when the run is missing", async () => {
    const provider = providerReturning(output);
    const deps = dependencies({ getRunById: vi.fn(async () => null) });

    await expect(
      generateRunSummary(context, runId, provider, deps),
    ).rejects.toThrow("Run not found");
    expect(provider.generateStructured).not.toHaveBeenCalled();
    expect(deps.saveInsight).not.toHaveBeenCalled();
  });

  it("rejects provider output that violates the response contract", async () => {
    const provider = providerReturning({ ...output, confidence: "certain" });
    const deps = dependencies();

    await expect(
      generateRunSummary(context, runId, provider, deps),
    ).rejects.toThrow();
    expect(deps.saveInsight).not.toHaveBeenCalled();
  });

  it("maps provider failures to a stable application error", async () => {
    const provider: AiProvider = {
      generateStructured: vi.fn(async () => {
        throw new Error("provider secret or transport details");
      }),
    };

    await expect(
      generateRunSummary(context, runId, provider, dependencies()),
    ).rejects.toThrow("Unable to generate run summary");
  });
});
