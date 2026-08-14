import { NextResponse } from "next/server";

import { getAiProviderConfig } from "@/lib/ai/config";
import { analyzeRecovery } from "@/lib/ai/recovery-agent";
import { createOpenAiCompatibleProvider } from "@/lib/ai/providers/openai-compatible";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAiToolContext, recordAiUsage } from "@/lib/ai/tools";

export async function POST() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 },
    );

  const context = createAiToolContext(supabase);
  const config = getAiProviderConfig();
  if (!config) {
    await recordUsageSafely(context, "skipped");
    return NextResponse.json(
      { error: "AI analysis service is not configured." },
      { status: 503 },
    );
  }

  const startedAt = Date.now();
  try {
    const result = await analyzeRecovery(
      context,
      createOpenAiCompatibleProvider(config),
    );
    await recordUsageSafely(context, "success", Date.now() - startedAt);
    return NextResponse.json(result);
  } catch {
    await recordUsageSafely(context, "error", Date.now() - startedAt);
    return NextResponse.json(
      { error: "Unable to analyze recovery signals." },
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
      agentName: "recovery_analyst",
      toolNames: ["getWeeklyStats", "getRecoverySignals", "saveInsight"],
      status,
      latencyMs,
    });
  } catch {
    // Telemetry is best effort.
  }
}
