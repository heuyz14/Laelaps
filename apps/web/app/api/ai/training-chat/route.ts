import { NextResponse } from "next/server";

import { getAiProviderConfig } from "@/lib/ai/config";
import { trainingChatRequestSchema } from "@/lib/ai/contracts";
import { createOpenAiCompatibleProvider } from "@/lib/ai/providers/openai-compatible";
import { answerTrainingChat } from "@/lib/ai/training-chat";
import { createAiToolContext, recordAiUsage } from "@/lib/ai/tools";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const parsedBody = await parseRequestBody(request);
  if (!parsedBody.success) {
    return NextResponse.json(
      { error: "Invalid training chat request." },
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

  const context = createAiToolContext(supabase);
  const config = getAiProviderConfig();
  if (!config) {
    void recordUsageSafely(context, "skipped");
    return NextResponse.json(
      { error: "AI chat service is not configured." },
      { status: 503 },
    );
  }

  const startedAt = Date.now();
  try {
    const result = await answerTrainingChat(
      context,
      parsedBody.data,
      createOpenAiCompatibleProvider(config),
    );
    void recordUsageSafely(context, "success", Date.now() - startedAt);
    return NextResponse.json(result);
  } catch {
    void recordUsageSafely(context, "error", Date.now() - startedAt);
    return NextResponse.json(
      { error: "Unable to answer training chat." },
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
      agentName: "training_chat",
      toolNames: ["getTrainingSnapshot", "getGoal", "saveInsight"],
      status,
      latencyMs,
    });
  } catch {
    // Telemetry must not change the user-facing chat result.
  }
}

async function parseRequestBody(request: Request) {
  try {
    return trainingChatRequestSchema.safeParse(await request.json());
  } catch {
    return { success: false as const, error: "invalid_json" };
  }
}
