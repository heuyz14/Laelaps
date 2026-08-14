import type { AiToolContext, SavedInsight } from "@/lib/ai/contracts";
import {
  buildRunSummaryContext,
  runSummaryOutputSchema,
  type RunSummaryOutput,
} from "@/lib/ai/run-summary";
import type { AiProvider } from "@/lib/ai/provider";
import {
  getComparableRuns,
  getGoal,
  getRunById,
  getWeeklyStats,
  saveInsight,
} from "@/lib/ai/tools";

const systemPrompt = [
  "You are the Laelaps run analyst.",
  "Use only the supplied authenticated run context.",
  "Treat numeric metrics as application-generated facts; do not recalculate or invent metrics.",
  "Separate observations from recommendations and avoid medical certainty.",
  "If history is sparse, state that confidence is low.",
  "Return only JSON with summary, highlights, comparison, suggestedImprovement, and confidence.",
].join(" ");

type RunSummaryDependencies = {
  getRunById: typeof getRunById;
  getComparableRuns: typeof getComparableRuns;
  getWeeklyStats: typeof getWeeklyStats;
  getGoal: typeof getGoal;
  saveInsight: typeof saveInsight;
};

const defaultDependencies: RunSummaryDependencies = {
  getRunById,
  getComparableRuns,
  getWeeklyStats,
  getGoal,
  saveInsight,
};

export async function generateRunSummary(
  context: AiToolContext,
  runId: string,
  provider: AiProvider,
  dependencies: RunSummaryDependencies = defaultDependencies,
): Promise<{ output: RunSummaryOutput; insight: SavedInsight }> {
  const run = await dependencies.getRunById(context, runId);
  if (!run) {
    throw new Error("Run not found.");
  }

  const [comparableRuns, weeklyStats, activeGoal] = await Promise.all([
    dependencies.getComparableRuns(context, run.id),
    dependencies.getWeeklyStats(context),
    dependencies.getGoal(context),
  ]);
  const groundedContext = buildRunSummaryContext({
    run,
    comparableRuns,
    weeklyStats,
    activeGoal,
  });

  let rawOutput: unknown;
  try {
    rawOutput = await provider.generateStructured({
      systemPrompt,
      userPrompt: JSON.stringify(groundedContext),
      schema: runSummaryOutputSchema,
    });
  } catch {
    throw new Error("Unable to generate run summary.");
  }

  const output = runSummaryOutputSchema.parse(rawOutput);
  const insight = await dependencies.saveInsight(context, {
    insightType: "run_summary",
    runId: run.id,
    inputSummary: {
      sourceRunIds: groundedContext.sourceRunIds,
      weeklyRunCount: groundedContext.weeklyStats.summary.runCount,
      activeGoalId: groundedContext.activeGoal?.id ?? null,
    },
    output,
  });

  return { output, insight };
}

export type { RunSummaryDependencies };
