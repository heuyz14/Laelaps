import { NextResponse } from "next/server";

import { getAiProviderConfig } from "@/lib/ai/config";
import { createOpenAiCompatibleProvider } from "@/lib/ai/providers/openai-compatible";
import { generateTrainingCoachAdvice } from "@/lib/ai/training-coach";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAiToolContext, recordAiUsage } from "@/lib/ai/tools";

export async function POST() {
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

  const context = createAiToolContext(supabase);
  const config = getAiProviderConfig();
  if (!config) {
    await recordUsageSafely(context, "skipped");
    return NextResponse.json(
      { error: "AI coaching service is not configured." },
      { status: 503 },
    );
  }

  const startedAt = Date.now();
  try {
    const result = await generateTrainingCoachAdvice(
      context,
      createOpenAiCompatibleProvider(config),
    );
    await recordUsageSafely(context, "success", Date.now() - startedAt);
    return NextResponse.json(result);
  } catch {
    await recordUsageSafely(context, "error", Date.now() - startedAt);
    return NextResponse.json(
      { error: "Unable to generate training guidance." },
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
      agentName: "training_coach",
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
    // Telemetry must not change the user-facing coaching result.
  }
}
