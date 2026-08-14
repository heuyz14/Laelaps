import { z } from "zod";

import type { AiToolContext, SavedInsight } from "@/lib/ai/contracts";
import type { AiProvider } from "@/lib/ai/provider";
import { getGoal, getTrainingSnapshot, saveInsight } from "@/lib/ai/tools";

export const trainingChatOutputSchema = z.object({
  answer: z.string().trim().min(1).max(1400),
  evidence: z.array(z.string().trim().min(1).max(400)).max(6).default([]),
  followUp: z.string().trim().min(1).max(500).optional(),
  confidence: z.enum(["low", "medium", "high"]).default("low"),
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
  "You are the autonomous Laelaps training chat agent.",
  "Answer the user's running and training questions using only the supplied authenticated run data, goals, recovery signals, and deterministic metrics.",
  "Decide from the user's question whether they need history, totals, year-to-date distance, trends, recovery guidance, or a next-run suggestion.",
  "When the user asks about this year, use snapshot.yearToDate as the source of truth.",
  "If the available data is incomplete, say what is missing and answer from the evidence you do have.",
  "Do not invent runs, goals, distances, paces, or health claims.",
  "Return only JSON with answer, evidence, optional followUp, and confidence.",
].join(" ");

export async function answerTrainingChat(
  context: AiToolContext,
  input: {
    question: string;
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
      runCount: snapshot.summary.runCount,
      distanceMeters: snapshot.summary.distanceMeters,
      year: snapshot.yearToDate.year,
      yearToDateDistanceMeters: snapshot.yearToDate.summary.distanceMeters,
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
