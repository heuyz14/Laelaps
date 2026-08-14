import { z } from "zod";

import type {
  AiRun,
  AiToolContext,
  AiWeeklyStats,
  SavedInsight,
} from "@/lib/ai/contracts";
import type { AiProvider } from "@/lib/ai/provider";
import type { Goal } from "@/lib/goals";
import {
  getGoal,
  getRecentRuns,
  getRecoverySignals,
  getWeeklyStats,
  saveInsight,
} from "@/lib/ai/tools";

export const trainingCoachOutputSchema = z.object({
  weeklySummary: z.string().trim().min(1).max(1200),
  recommendation: z.string().trim().min(1).max(1000),
  nextRunSuggestion: z.string().trim().min(1).max(700),
  riskFlags: z.array(z.string().trim().min(1).max(300)).max(6),
  confidence: z.enum(["low", "medium", "high"]),
});

export type TrainingCoachOutput = z.infer<typeof trainingCoachOutputSchema>;

export type TrainingCoachContext = {
  recentRuns: AiRun[];
  weeklyStats: AiWeeklyStats;
  recoverySignals: AiWeeklyStats["recoverySignals"];
  activeGoal: Goal | null;
  sourceRunIds: string[];
};

type TrainingCoachDependencies = {
  getRecentRuns: typeof getRecentRuns;
  getWeeklyStats: typeof getWeeklyStats;
  getRecoverySignals: typeof getRecoverySignals;
  getGoal: typeof getGoal;
  saveInsight: typeof saveInsight;
};

const defaultDependencies: TrainingCoachDependencies = {
  getRecentRuns,
  getWeeklyStats,
  getRecoverySignals,
  getGoal,
  saveInsight,
};

const systemPrompt = [
  "You are the Laelaps training coach.",
  "Use only the supplied authenticated run history, goals, and deterministic metrics.",
  "Give conservative, non-medical guidance and do not invent missing data.",
  "If recovery signals are present, reflect them in the recommendation and next-run suggestion.",
  "Make uncertainty explicit when history is limited.",
].join(" ");

export async function generateTrainingCoachAdvice(
  context: AiToolContext,
  provider: AiProvider,
  dependencies: TrainingCoachDependencies = defaultDependencies,
): Promise<{ output: TrainingCoachOutput; insight: SavedInsight }> {
  const [recentRuns, weeklyStats, recoverySignals, activeGoal] =
    await Promise.all([
      dependencies.getRecentRuns(context, 20),
      dependencies.getWeeklyStats(context),
      dependencies.getRecoverySignals(context),
      dependencies.getGoal(context),
    ]);
  const groundedContext = buildTrainingCoachContext({
    recentRuns,
    weeklyStats,
    recoverySignals,
    activeGoal,
  });

  let rawOutput: unknown;
  try {
    rawOutput = await provider.generateStructured({
      systemPrompt,
      userPrompt: JSON.stringify(groundedContext),
      schema: trainingCoachOutputSchema,
    });
  } catch {
    throw new Error("Unable to generate training guidance.");
  }

  const output = trainingCoachOutputSchema.parse(rawOutput);
  const insight = await dependencies.saveInsight(context, {
    insightType: "training_coach",
    inputSummary: {
      sourceRunIds: groundedContext.sourceRunIds,
      weeklyRunCount: weeklyStats.summary.runCount,
      activeGoalId: activeGoal?.id ?? null,
      recoverySignalKinds: recoverySignals.map((signal) => signal.kind),
    },
    output,
  });

  return { output, insight };
}

export function buildTrainingCoachContext(
  input: Omit<TrainingCoachContext, "sourceRunIds">,
): TrainingCoachContext {
  return {
    ...input,
    sourceRunIds: input.recentRuns.map((run) => run.id),
  };
}

export type { TrainingCoachDependencies };
