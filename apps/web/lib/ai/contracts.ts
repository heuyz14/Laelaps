import { z } from "zod";

export const aiRunIdSchema = z.string().uuid();

export const runSummaryRequestSchema = z.object({
  runId: aiRunIdSchema,
});

export const saveInsightInputSchema = z.object({
  insightType: z.string().trim().min(1).max(80),
  runId: aiRunIdSchema.nullable().optional(),
  inputSummary: z.record(z.string(), z.unknown()).default({}),
  output: z.record(z.string(), z.unknown()),
});

export type SaveInsightInput = z.input<typeof saveInsightInputSchema>;

export type AiToolContext = {
  supabase: import("@supabase/supabase-js").SupabaseClient;
};

export type AiRun = {
  id: string;
  run_date: string;
  distance_meters: number;
  duration_seconds: number;
  avg_heart_rate: number | null;
  max_heart_rate: number | null;
  effort: number | null;
  notes?: string | null;
};

export type AiWeeklyStats = {
  summary: {
    runCount: number;
    distanceMeters: number;
    durationSeconds: number;
    averagePaceSecondsPerKm: number | null;
  };
  weeklyMileage: ReturnType<
    typeof import("@/lib/analytics").buildRunAnalytics
  >["weeklyMileage"];
  recoverySignals: ReturnType<
    typeof import("@/lib/analytics").buildRunAnalytics
  >["recoverySignals"];
};

export type SavedInsight = {
  id: string;
  insight_type: string;
  run_id: string | null;
  input_summary: Record<string, unknown>;
  output: Record<string, unknown>;
  created_at?: string;
};
