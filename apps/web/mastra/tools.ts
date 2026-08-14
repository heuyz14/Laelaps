import { createTool } from "@mastra/core/tools";
import { z } from "zod";

import type { AiToolContext } from "@/lib/ai/contracts";
import {
  getComparableRuns,
  getGoal,
  getRecentRuns,
  getRecoverySignals,
  getRunById,
  getSavedInsights,
  getWeeklyStats,
  saveInsight,
} from "@/lib/ai/tools";

type LaelapsRequestContext = { aiContext: AiToolContext };

function aiContext(value: unknown): AiToolContext {
  const context = value as {
    requestContext?: { get: (key: string) => unknown };
  };
  const result = context.requestContext?.get("aiContext");
  if (!result) throw new Error("Authenticated AI tool context required.");
  return result as AiToolContext;
}

export const mastraGetRunById = createTool({
  id: "get-run-by-id",
  description: "Load one authenticated user's run by ID.",
  inputSchema: z.object({ runId: z.string().uuid() }),
  execute: async (input, context) =>
    getRunById(aiContext(context), input.runId),
});

export const mastraGetRecentRuns = createTool({
  id: "get-recent-runs",
  description: "Load recent authenticated runs for analysis.",
  inputSchema: z.object({ limit: z.number().int().min(1).max(100).default(8) }),
  execute: async (input, context) =>
    getRecentRuns(aiContext(context), input.limit),
});

export const mastraGetWeeklyStats = createTool({
  id: "get-weekly-stats",
  description: "Calculate deterministic weekly training statistics.",
  inputSchema: z.object({}),
  execute: async (_input, context) => getWeeklyStats(aiContext(context)),
});

export const mastraGetGoal = createTool({
  id: "get-active-goal",
  description: "Load the authenticated user's active goal.",
  inputSchema: z.object({ goalId: z.string().uuid().optional() }),
  execute: async (input, context) => getGoal(aiContext(context), input.goalId),
});

export const mastraGetComparableRuns = createTool({
  id: "get-comparable-runs",
  description: "Find authenticated runs comparable to a target run.",
  inputSchema: z.object({
    runId: z.string().uuid(),
    limit: z.number().int().min(1).max(20).default(5),
  }),
  execute: async (input, context) =>
    getComparableRuns(aiContext(context), input.runId, input.limit),
});

export const mastraGetRecoverySignals = createTool({
  id: "get-recovery-signals",
  description: "Calculate deterministic recovery signals.",
  inputSchema: z.object({}),
  execute: async (_input, context) => getRecoverySignals(aiContext(context)),
});

export const mastraGetSavedInsights = createTool({
  id: "get-saved-insights",
  description: "Retrieve prior authenticated AI insights for continuity.",
  inputSchema: z.object({
    limit: z.number().int().min(1).max(100).default(20),
  }),
  execute: async (input, context) =>
    getSavedInsights(aiContext(context), input.limit),
});

export const mastraSaveInsight = createTool({
  id: "save-insight",
  description: "Persist a structured AI insight for the authenticated user.",
  inputSchema: z.object({
    insightType: z.string().min(1).max(80),
    runId: z.string().uuid().nullable().optional(),
    inputSummary: z.record(z.string(), z.unknown()).default({}),
    output: z.record(z.string(), z.unknown()),
  }),
  execute: async (input, context) => saveInsight(aiContext(context), input),
});

export const mastraTools = {
  getRunById: mastraGetRunById,
  getRecentRuns: mastraGetRecentRuns,
  getWeeklyStats: mastraGetWeeklyStats,
  getGoal: mastraGetGoal,
  getComparableRuns: mastraGetComparableRuns,
  getRecoverySignals: mastraGetRecoverySignals,
  getSavedInsights: mastraGetSavedInsights,
  saveInsight: mastraSaveInsight,
};

export type { LaelapsRequestContext };
