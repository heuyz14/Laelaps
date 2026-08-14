import { NextResponse } from "next/server";

import { runSummaryRequestSchema } from "@/lib/ai/contracts";
import { getAiProviderConfig } from "@/lib/ai/config";
import { createOpenAiCompatibleProvider } from "@/lib/ai/providers/openai-compatible";
import { generateRunSummary } from "@/lib/ai/run-summary-agent";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAiToolContext, recordAiUsage } from "@/lib/ai/tools";

export async function POST(request: Request) {
  const parsedBody = await parseRequestBody(request);
  if (!parsedBody.success) {
    return NextResponse.json(
      { error: "Invalid run summary request." },
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
  const startedAt = Date.now();
  const config = getAiProviderConfig();
  if (!config) {
    await recordUsageSafely(aiContext, "skipped");
    return NextResponse.json(
      { error: "AI summary service is not configured." },
      { status: 503 },
    );
  }

  try {
    const result = await generateRunSummary(
      aiContext,
      parsedBody.data.runId,
      createOpenAiCompatibleProvider(config),
    );
    await recordUsageSafely(aiContext, "success", Date.now() - startedAt);

    return NextResponse.json(result);
  } catch (error) {
    await recordUsageSafely(aiContext, "error", Date.now() - startedAt);
    if (error instanceof Error && error.message === "Run not found.") {
      return NextResponse.json({ error: "Run not found." }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Unable to generate run summary." },
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
      agentName: "run_summary",
      toolNames: [
        "getRunById",
        "getComparableRuns",
        "getWeeklyStats",
        "getGoal",
        "saveInsight",
      ],
      status,
      latencyMs,
    });
  } catch {
    // Usage telemetry must not turn a successful summary into an application error.
  }
}

async function parseRequestBody(request: Request) {
  try {
    return runSummaryRequestSchema.safeParse(await request.json());
  } catch {
    return { success: false as const, error: "invalid_json" };
  }
}
