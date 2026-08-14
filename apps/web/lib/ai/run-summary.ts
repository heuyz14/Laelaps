import { z } from "zod";

import { getAveragePaceSecondsPerKm } from "@/lib/runs";
import type { AiRun, AiWeeklyStats } from "@/lib/ai/contracts";
import type { Goal } from "@/lib/goals";

export const runSummaryOutputSchema = z.object({
  summary: z.string().trim().min(1).max(1200),
  highlights: z.array(z.string().trim().min(1).max(300)).max(5),
  comparison: z.string().trim().min(1).max(800),
  suggestedImprovement: z.string().trim().min(1).max(500),
  confidence: z.enum(["low", "medium", "high"]),
});

export type RunSummaryOutput = z.infer<typeof runSummaryOutputSchema>;

export type RunSummaryContext = {
  run: AiRun & { pace_seconds_per_km: number };
  comparableRuns: Array<AiRun & { pace_seconds_per_km: number }>;
  weeklyStats: AiWeeklyStats;
  activeGoal: Goal | null;
  sourceRunIds: string[];
};

export function buildRunSummaryContext(input: {
  run: AiRun;
  comparableRuns: AiRun[];
  weeklyStats: AiWeeklyStats;
  activeGoal: Goal | null;
}): RunSummaryContext {
  const run = withPace(input.run);
  const comparableRuns = input.comparableRuns.map(withPace);

  return {
    run,
    comparableRuns,
    weeklyStats: input.weeklyStats,
    activeGoal: input.activeGoal,
    sourceRunIds: [run.id, ...comparableRuns.map((item) => item.id)],
  };
}

function withPace(run: AiRun) {
  return {
    ...run,
    pace_seconds_per_km: getAveragePaceSecondsPerKm({
      distance_meters: run.distance_meters,
      duration_seconds: run.duration_seconds,
    }),
  };
}
