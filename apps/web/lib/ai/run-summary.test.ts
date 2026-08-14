import { describe, expect, it } from "vitest";

import {
  buildRunSummaryContext,
  runSummaryOutputSchema,
} from "@/lib/ai/run-summary";

const run = {
  id: "00000000-0000-4000-8000-000000000002",
  run_date: "2026-08-01",
  distance_meters: 5000,
  duration_seconds: 1500,
  avg_heart_rate: 150,
  max_heart_rate: 165,
  effort: 5,
};

describe("buildRunSummaryContext", () => {
  it("adds deterministic pace and source references without inventing data", () => {
    const context = buildRunSummaryContext({
      run,
      comparableRuns: [
        {
          ...run,
          id: "00000000-0000-4000-8000-000000000003",
          duration_seconds: 1600,
        },
      ],
      weeklyStats: {
        summary: {
          runCount: 1,
          distanceMeters: 5000,
          durationSeconds: 1500,
          averagePaceSecondsPerKm: 300,
        },
        weeklyMileage: [],
        recoverySignals: [],
      },
      activeGoal: null,
    });

    expect(context.run.pace_seconds_per_km).toBe(300);
    expect(context.comparableRuns[0].pace_seconds_per_km).toBe(320);
    expect(context.sourceRunIds).toEqual([
      run.id,
      "00000000-0000-4000-8000-000000000003",
    ]);
    expect(context.activeGoal).toBeNull();
  });
});

describe("runSummaryOutputSchema", () => {
  it("accepts the bounded run-summary contract", () => {
    expect(
      runSummaryOutputSchema.parse({
        summary: "A steady aerobic run.",
        highlights: ["Pace was consistent."],
        comparison: "Comparable history is limited.",
        suggestedImprovement: "Keep the next easy day easy.",
        confidence: "medium",
      }).confidence,
    ).toBe("medium");
  });

  it("rejects unbounded or unsupported confidence output", () => {
    expect(() =>
      runSummaryOutputSchema.parse({
        summary: "A run.",
        highlights: [],
        comparison: "Not enough data.",
        suggestedImprovement: "Recover.",
        confidence: "certain",
      }),
    ).toThrow();
  });
});
