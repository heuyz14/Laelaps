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

const answerAliases = [
  "answer",
  "directAnswer",
  "summary",
  "response",
  "message",
  "recommendation",
  "nextRunSuggestion",
] as const;

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
): Promise<{ output: TrainingChatOutput; insight: SavedInsight | null }> {
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

  const output = parseTrainingChatOutput(rawOutput);
  const insight = await saveInsightSafely(context, dependencies, {
    question: input.question,
    runCount: snapshot.summary.runCount,
    distanceMeters: snapshot.summary.distanceMeters,
    year: snapshot.yearToDate.year,
    yearToDateDistanceMeters: snapshot.yearToDate.summary.distanceMeters,
    activeGoalId: activeGoal?.id ?? null,
    recoverySignalKinds: snapshot.recoverySignals.map((signal) => signal.kind),
    output,
  });

  return { output, insight };
}

function parseTrainingChatOutput(rawOutput: unknown) {
  if (!isRecord(rawOutput)) {
    return trainingChatOutputSchema.parse(rawOutput);
  }

  const answer = answerAliases
    .map((key) => rawOutput[key])
    .find((value): value is string => isNonEmptyString(value));

  if (!answer) {
    return trainingChatOutputSchema.parse(rawOutput);
  }

  return trainingChatOutputSchema.parse({
    answer,
    evidence: readStringList(rawOutput.evidence),
    followUp: isNonEmptyString(rawOutput.followUp)
      ? rawOutput.followUp
      : isNonEmptyString(rawOutput.suggestedNextAction)
        ? rawOutput.suggestedNextAction
        : undefined,
    confidence: readConfidence(rawOutput.confidence),
  });
}

async function saveInsightSafely(
  context: AiToolContext,
  dependencies: TrainingChatDependencies,
  input: {
    question: string;
    runCount: number;
    distanceMeters: number;
    year: number;
    yearToDateDistanceMeters: number;
    activeGoalId: string | null;
    recoverySignalKinds: string[];
    output: TrainingChatOutput;
  },
) {
  try {
    return await dependencies.saveInsight(context, {
      insightType: "training_chat",
      inputSummary: {
        question: input.question,
        runCount: input.runCount,
        distanceMeters: input.distanceMeters,
        year: input.year,
        yearToDateDistanceMeters: input.yearToDateDistanceMeters,
        activeGoalId: input.activeGoalId,
        recoverySignalKinds: input.recoverySignalKinds,
      },
      output: input.output,
    });
  } catch {
    return null;
  }
}

function readStringList(value: unknown) {
  if (Array.isArray(value)) {
    return value.filter(isNonEmptyString).slice(0, 6);
  }

  if (isNonEmptyString(value)) {
    return [value];
  }

  return [];
}

function readConfidence(value: unknown) {
  if (value === "high" || value === "medium" || value === "low") {
    return value;
  }

  return "low";
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export type { TrainingChatDependencies };
