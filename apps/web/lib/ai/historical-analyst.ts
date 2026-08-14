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

export const historicalAnalystRequestSchema = z.object({
  question: z.string().trim().min(3).max(500),
});

export const historicalAnalystOutputSchema = z.object({
  directAnswer: z.string().trim().min(1).max(1200),
  evidence: z.array(z.string().trim().min(1).max(400)).max(6),
  likelyContributors: z.array(z.string().trim().min(1).max(400)).max(5),
  caveats: z.array(z.string().trim().min(1).max(400)).max(5),
  suggestedNextAction: z.string().trim().min(1).max(500),
  confidence: z.enum(["low", "medium", "high"]),
});

export type HistoricalAnalystOutput = z.infer<
  typeof historicalAnalystOutputSchema
>;

export type HistoricalAnalystContext = {
  question: string;
  recentRuns: AiRun[];
  weeklyStats: AiWeeklyStats;
  recoverySignals: AiWeeklyStats["recoverySignals"];
  activeGoal: Goal | null;
  sourceRunIds: string[];
};

type HistoricalAnalystDependencies = {
  getRecentRuns: typeof getRecentRuns;
  getWeeklyStats: typeof getWeeklyStats;
  getRecoverySignals: typeof getRecoverySignals;
  getGoal: typeof getGoal;
  saveInsight: typeof saveInsight;
};

const defaultDependencies: HistoricalAnalystDependencies = {
  getRecentRuns,
  getWeeklyStats,
  getRecoverySignals,
  getGoal,
  saveInsight,
};

const systemPrompt = [
  "You are the Laelaps historical training analyst.",
  "Use only the supplied authenticated run history and deterministic metrics.",
  "Cite concrete evidence when available and state when the history is sparse.",
  "Do not diagnose medical conditions or invent causes that the data cannot support.",
  "Separate observed facts, likely contributors, caveats, and one next action.",
  "Return only JSON with directAnswer, evidence, likelyContributors, caveats, suggestedNextAction, and confidence.",
].join(" ");

export async function analyzeTrainingHistory(
  context: AiToolContext,
  question: string,
  provider: AiProvider,
  dependencies: HistoricalAnalystDependencies = defaultDependencies,
): Promise<{ output: HistoricalAnalystOutput; insight: SavedInsight }> {
  const parsedQuestion = historicalAnalystRequestSchema.parse({
    question,
  }).question;
  const [recentRuns, weeklyStats, recoverySignals, activeGoal] =
    await Promise.all([
      dependencies.getRecentRuns(context, 20),
      dependencies.getWeeklyStats(context),
      dependencies.getRecoverySignals(context),
      dependencies.getGoal(context),
    ]);
  const groundedContext = buildHistoricalAnalystContext({
    question: parsedQuestion,
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
      schema: historicalAnalystOutputSchema,
    });
  } catch {
    throw new Error("Unable to analyze training history.");
  }

  const output = historicalAnalystOutputSchema.parse(rawOutput);
  const insight = await dependencies.saveInsight(context, {
    insightType: "historical_analysis",
    inputSummary: {
      question: parsedQuestion,
      sourceRunIds: groundedContext.sourceRunIds,
      weeklyRunCount: weeklyStats.summary.runCount,
      activeGoalId: activeGoal?.id ?? null,
    },
    output,
  });

  return { output, insight };
}

export function buildHistoricalAnalystContext(
  input: Omit<HistoricalAnalystContext, "sourceRunIds">,
): HistoricalAnalystContext {
  return {
    ...input,
    sourceRunIds: input.recentRuns.map((run) => run.id),
  };
}

export type { HistoricalAnalystDependencies };
