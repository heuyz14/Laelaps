import type { SupabaseClient } from "@supabase/supabase-js";

import {
  buildRunAnalytics,
  selectComparableRuns,
  type AnalyticsRun,
} from "@/lib/analytics";
import { getGoals, type Goal } from "@/lib/goals";
import {
  aiRunIdSchema,
  saveInsightInputSchema,
  type AiRun,
  type AiToolContext,
  type AiWeeklyStats,
  type SavedInsight,
  type SaveInsightInput,
} from "@/lib/ai/contracts";

const runSelect =
  "id, run_date, distance_meters, duration_seconds, avg_heart_rate, max_heart_rate, effort, notes";

export async function getRunById(
  context: AiToolContext,
  runId: string,
): Promise<AiRun | null> {
  const id = aiRunIdSchema.parse(runId);
  const userId = await getAuthenticatedUserId(context);
  const { data, error } = await context.supabase
    .from("runs")
    .select(runSelect)
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error("Unable to load AI run context.");
  }

  return data as AiRun | null;
}

export async function getRecentRuns(
  context: AiToolContext,
  limit = 8,
): Promise<AiRun[]> {
  const safeLimit = Math.min(Math.max(Math.trunc(limit), 1), 100);
  const userId = await getAuthenticatedUserId(context);
  const { data, error } = await context.supabase
    .from("runs")
    .select(runSelect)
    .eq("user_id", userId)
    .order("run_date", { ascending: false })
    .limit(safeLimit);

  if (error) {
    throw new Error("Unable to load recent AI run context.");
  }

  return (data ?? []) as AiRun[];
}

export async function getTrainingSnapshot(
  context: AiToolContext,
  now = new Date(),
) {
  const userId = await getAuthenticatedUserId(context);
  const { data, error } = await context.supabase
    .from("runs")
    .select(runSelect)
    .eq("user_id", userId)
    .order("run_date", { ascending: false })
    .limit(1000);

  if (error) {
    throw new Error("Unable to load AI training snapshot.");
  }

  const runs = (data ?? []) as AiRun[];
  const analytics = buildRunAnalytics(runs.map(toAnalyticsRun));
  const currentYear = now.getUTCFullYear();
  const yearToDateAnalytics = buildRunAnalytics(
    runs
      .filter(
        (run) =>
          new Date(`${run.run_date}T00:00:00Z`).getUTCFullYear() ===
          currentYear,
      )
      .map(toAnalyticsRun),
  );

  return {
    recentRuns: runs.slice(0, 20),
    summary: analytics.summary,
    yearToDate: {
      year: currentYear,
      summary: yearToDateAnalytics.summary,
    },
    weeklyMileage: analytics.weeklyMileage.slice(0, 12),
    monthlyMileage: analytics.monthlyMileage.slice(0, 6),
    streaks: analytics.streaks,
    effortZones: analytics.effortZones,
    recoverySignals: analytics.recoverySignals,
  };
}

export async function getWeeklyStats(
  context: AiToolContext,
): Promise<AiWeeklyStats> {
  const runs = await getRecentRuns(context, 100);
  const analytics = buildRunAnalytics(runs.map(toAnalyticsRun));

  return {
    summary: analytics.summary,
    weeklyMileage: analytics.weeklyMileage,
    recoverySignals: analytics.recoverySignals,
  };
}

export async function getGoal(
  context: AiToolContext,
  goalId?: string,
): Promise<Goal | null> {
  const userId = await getAuthenticatedUserId(context);

  if (goalId) {
    const id = aiRunIdSchema.parse(goalId);
    const { data, error } = await context.supabase
      .from("goals")
      .select(
        "id, type, target_value, target_date, status, created_at, updated_at",
      )
      .eq("id", id)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      throw new Error("Unable to load AI goal context.");
    }

    return data as Goal | null;
  }

  const goals = await getGoals(context.supabase);
  return goals.find((goal) => goal.status === "active") ?? null;
}

export async function getComparableRuns(
  context: AiToolContext,
  runId: string,
  limit = 5,
): Promise<AiRun[]> {
  const target = await getRunById(context, runId);
  if (!target) {
    return [];
  }

  const runs = await getRecentRuns(context, 100);
  return selectComparableRuns(runs.map(toAnalyticsRun), {
    targetDistanceMeters: target.distance_meters,
    excludeRunId: target.id,
    limit: Math.min(Math.max(Math.trunc(limit), 1), 20),
  }).map(fromAnalyticsRun);
}

export async function getRecoverySignals(context: AiToolContext) {
  const stats = await getWeeklyStats(context);
  return stats.recoverySignals;
}

export async function saveInsight(
  context: AiToolContext,
  input: SaveInsightInput,
): Promise<SavedInsight> {
  const values = saveInsightInputSchema.parse(input);
  const userId = await getAuthenticatedUserId(context);
  const { data, error } = await context.supabase
    .from("ai_insights")
    .insert({
      user_id: userId,
      run_id: values.runId ?? null,
      insight_type: values.insightType,
      input_summary: values.inputSummary,
      output: values.output,
    })
    .select("id, insight_type, run_id, input_summary, output")
    .single();

  if (error || !data) {
    throw new Error("Unable to save AI insight.");
  }

  return data as SavedInsight;
}

export async function getSavedInsights(
  context: AiToolContext,
  limit = 20,
): Promise<SavedInsight[]> {
  const safeLimit = Math.min(Math.max(Math.trunc(limit), 1), 100);
  const userId = await getAuthenticatedUserId(context);
  const { data, error } = await context.supabase
    .from("ai_insights")
    .select("id, insight_type, run_id, input_summary, output, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(safeLimit);

  if (error) {
    throw new Error("Unable to load saved AI insights.");
  }

  return (data ?? []) as SavedInsight[];
}

export async function recordAiUsage(
  context: AiToolContext,
  input: {
    agentName: string;
    toolNames: string[];
    status: "success" | "error" | "skipped";
    latencyMs?: number;
  },
) {
  const userId = await getAuthenticatedUserId(context);
  const { error } = await context.supabase.from("ai_usage").insert({
    user_id: userId,
    agent_name: input.agentName,
    tool_names: input.toolNames,
    status: input.status,
    latency_ms: input.latencyMs ?? null,
  });

  if (error) {
    throw new Error("Unable to record AI usage.");
  }
}

function toAnalyticsRun(run: AiRun): AnalyticsRun {
  return {
    id: run.id,
    runDate: run.run_date,
    distanceMeters: run.distance_meters,
    durationSeconds: run.duration_seconds,
    avgHeartRate: run.avg_heart_rate,
    maxHeartRate: run.max_heart_rate,
    effort: run.effort,
  };
}

function fromAnalyticsRun(run: AnalyticsRun): AiRun {
  return {
    id: run.id,
    run_date: run.runDate,
    distance_meters: run.distanceMeters,
    duration_seconds: run.durationSeconds,
    avg_heart_rate: run.avgHeartRate ?? null,
    max_heart_rate: run.maxHeartRate ?? null,
    effort: run.effort ?? null,
  };
}

export function createAiToolContext(supabase: SupabaseClient): AiToolContext {
  return { supabase };
}

async function getAuthenticatedUserId(context: AiToolContext) {
  const {
    data: { user },
  } = await context.supabase.auth.getUser();

  if (!user) {
    throw new Error("Authenticated user required for AI tools.");
  }

  return user.id;
}
