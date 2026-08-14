import { z } from "zod";

import type { AiToolContext, SavedInsight } from "@/lib/ai/contracts";
import type { AiProvider } from "@/lib/ai/provider";
import {
  getRecoverySignals,
  getWeeklyStats,
  saveInsight,
} from "@/lib/ai/tools";

export const recoveryAnalysisOutputSchema = z.object({
  summary: z.string().trim().min(1).max(1000),
  riskFlags: z.array(z.string().trim().min(1).max(300)).max(6),
  recommendation: z.string().trim().min(1).max(600),
  confidence: z.enum(["low", "medium", "high"]),
});

export type RecoveryAnalysisOutput = z.infer<
  typeof recoveryAnalysisOutputSchema
>;

const systemPrompt = [
  "You are the Laelaps recovery analyst.",
  "Use only deterministic weekly statistics and recovery signals supplied in the context.",
  "Do not diagnose illness or make medical claims.",
  "Describe uncertainty when the training history is sparse and give one conservative next action.",
].join(" ");

export async function analyzeRecovery(
  context: AiToolContext,
  provider: AiProvider,
  dependencies: {
    getWeeklyStats: typeof getWeeklyStats;
    getRecoverySignals: typeof getRecoverySignals;
    saveInsight: typeof saveInsight;
  } = { getWeeklyStats, getRecoverySignals, saveInsight },
): Promise<{ output: RecoveryAnalysisOutput; insight: SavedInsight }> {
  const [weeklyStats, recoverySignals] = await Promise.all([
    dependencies.getWeeklyStats(context),
    dependencies.getRecoverySignals(context),
  ]);
  const inputSummary = {
    runCount: weeklyStats.summary.runCount,
    recoverySignals,
  };

  let rawOutput: unknown;
  try {
    rawOutput = await provider.generateStructured({
      systemPrompt,
      userPrompt: JSON.stringify({ weeklyStats, recoverySignals }),
      schema: recoveryAnalysisOutputSchema,
    });
  } catch {
    throw new Error("Unable to analyze recovery signals.");
  }

  const output = recoveryAnalysisOutputSchema.parse(rawOutput);
  const insight = await dependencies.saveInsight(context, {
    insightType: "recovery_analysis",
    inputSummary,
    output,
  });
  return { output, insight };
}
