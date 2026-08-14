import { z } from "zod";

import type { AiToolContext, SavedInsight } from "@/lib/ai/contracts";
import type { AiProvider } from "@/lib/ai/provider";
import { getGoal, getTrainingSnapshot, saveInsight } from "@/lib/ai/tools";

export const trainingChatOutputSchema = z.object({
  answer: z.string().trim().min(1).max(1400),
  evidence: z.array(z.string().trim().min(1).max(400)).max(6),
  followUp: z.string().trim().min(1).max(500).optional(),
  confidence: z.enum(["low", "medium", "high"]),
});

export type TrainingChatOutput = z.infer<typeof trainingChatOutputSchema>;

type TrainingChatDependencies = {
  getTrainingSnapshot: typeof getTrainingSnapshot;
  getGoal: typeof getGoal;
  saveInsight: typeof saveInsight;
};

const defaultDependencies: TrainingChatDependencies = {
  getTrainingSnapshot,
  getGoal,
  saveInsight,
};

const systemPrompt = [
  "You are the Laelaps training chat agent.",
  "Answer the user's question using only the supplied authenticated run data and deterministic metrics.",
  "If the question asks for totals, counts, distance, pace, streaks, or recovery signals, answer directly from the supplied metrics.",
  "If the question asks what to run today, give conservative, non-medical guidance grounded in recent load and recovery signals.",
  "Do not invent runs, goals, distances, paces, or health claims.",
  "Return only JSON with answer, evidence, optional followUp, and confidence.",
].join(" ");

export async function answerTrainingChat(
  context: AiToolContext,
  input: {
    question: string;
    mode: "coach" | "recovery" | "history";
  },
  provider: AiProvider,
  dependencies: TrainingChatDependencies = defaultDependencies,
): Promise<{ output: TrainingChatOutput; insight: SavedInsight }> {
  const [snapshot, activeGoal] = await Promise.all([
    dependencies.getTrainingSnapshot(context),
    dependencies.getGoal(context),
  ]);
  const groundedContext = {
    question: input.question,
    mode: input.mode,
    snapshot,
    activeGoal,
  };

  let rawOutput: unknown;
  try {
    rawOutput = await provider.generateStructured({
      systemPrompt,
      userPrompt: JSON.stringify(groundedContext),
      schema: trainingChatOutputSchema,
    });
  } catch {
    throw new Error("Unable to answer training chat.");
  }

  const output = trainingChatOutputSchema.parse(rawOutput);
  const insight = await dependencies.saveInsight(context, {
    insightType: "training_chat",
    inputSummary: {
      question: input.question,
      mode: input.mode,
      runCount: snapshot.summary.runCount,
      distanceMeters: snapshot.summary.distanceMeters,
      activeGoalId: activeGoal?.id ?? null,
      recoverySignalKinds: snapshot.recoverySignals.map(
        (signal) => signal.kind,
      ),
    },
    output,
  });

  return { output, insight };
}

export type { TrainingChatDependencies };
