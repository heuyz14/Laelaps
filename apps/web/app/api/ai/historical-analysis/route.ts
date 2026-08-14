import { NextResponse } from "next/server";

import { getAiProviderConfig } from "@/lib/ai/config";
import {
  historicalAnalystRequestSchema,
  analyzeTrainingHistory,
} from "@/lib/ai/historical-analyst";
import { createOpenAiCompatibleProvider } from "@/lib/ai/providers/openai-compatible";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAiToolContext, recordAiUsage } from "@/lib/ai/tools";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid historical analysis request." },
      { status: 400 },
    );
  }

  const parsed = historicalAnalystRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid historical analysis request." },
      { status: 400 },
    );
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 },
    );
  }

  const aiContext = createAiToolContext(supabase);
  const config = getAiProviderConfig();
  if (!config) {
    await recordUsageSafely(aiContext, "skipped");
    return NextResponse.json(
      { error: "AI analysis service is not configured." },
      { status: 503 },
    );
  }

  const startedAt = Date.now();
  try {
    const result = await analyzeTrainingHistory(
      aiContext,
      parsed.data.question,
      createOpenAiCompatibleProvider(config),
    );
    await recordUsageSafely(aiContext, "success", Date.now() - startedAt);
    return NextResponse.json(result);
  } catch {
    await recordUsageSafely(aiContext, "error", Date.now() - startedAt);
    return NextResponse.json(
      { error: "Unable to analyze training history." },
      { status: 502 },
    );
  }
}

async function recordUsageSafely(
  context: ReturnType<typeof createAiToolContext>,
  status: "success" | "error" | "skipped",
  latencyMs?: number,
) {
  try {
    await recordAiUsage(context, {
      agentName: "historical_analyst",
      toolNames: [
        "getRecentRuns",
        "getWeeklyStats",
        "getRecoverySignals",
        "getGoal",
        "saveInsight",
      ],
      status,
      latencyMs,
    });
  } catch {
    // Telemetry must not change the user-facing analysis result.
  }
}
