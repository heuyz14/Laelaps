import { z } from "zod";

import type { AiToolContext, SavedInsight } from "@/lib/ai/contracts";
import { formatDistance, type DistanceUnit } from "@/lib/distance";
import type { AiProvider } from "@/lib/ai/provider";
import {
  getGoal,
  getPreferredDistanceUnit,
  getTrainingSnapshot,
  saveInsight,
} from "@/lib/ai/tools";

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
  getPreferredDistanceUnit?: typeof getPreferredDistanceUnit;
  saveInsight: typeof saveInsight;
};

const defaultDependencies: TrainingChatDependencies = {
  getTrainingSnapshot,
  getGoal,
  getPreferredDistanceUnit,
  saveInsight,
};

const systemPrompt = [
  "You are the autonomous Laelaps training chat agent.",
  "Answer the user's running and training questions using only the supplied authenticated run data, goals, recovery signals, and deterministic metrics.",
  "Decide from the user's question whether they need history, totals, year-to-date distance, trends, recovery guidance, or a next-run suggestion.",
  "The context includes display distances already formatted in the user's selected distanceUnit; use those values as the source of truth.",
  "Use only the selected distanceUnit as the primary distance unit and never include both kilometers and miles unless the user explicitly asks for a conversion or comparison.",
  "When the user asks about this year, use snapshot.yearToDate as the source of truth.",
  "If the available data is incomplete, say what is missing and answer from the evidence you do have.",
  "Do not invent runs, goals, distances, paces, or health claims.",
  "Return only JSON with answer, evidence, optional followUp, and confidence. Evidence must be human-readable and must not expose raw meter fields.",
].join(" ");

export async function answerTrainingChat(
  context: AiToolContext,
  input: {
    question: string;
  },
  provider: AiProvider,
  dependencies: TrainingChatDependencies = defaultDependencies,
): Promise<{ output: TrainingChatOutput; insight: SavedInsight | null }> {
  const [snapshot, activeGoal, distanceUnit] = await Promise.all([
    dependencies.getTrainingSnapshot(context),
    dependencies.getGoal(context),
    dependencies.getPreferredDistanceUnit?.(context) ??
      Promise.resolve("km" as const),
  ]);
  const displaySnapshot = buildTrainingChatContext(snapshot, distanceUnit);
  const groundedContext = {
    question: input.question,
    distanceUnit,
    snapshot: displaySnapshot,
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

  const output = parseTrainingChatOutput(rawOutput, distanceUnit);
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

export function buildTrainingChatContext(
  snapshot: Awaited<ReturnType<typeof getTrainingSnapshot>>,
  distanceUnit: DistanceUnit,
) {
  return {
    recentRuns: snapshot.recentRuns.map((run) => ({
      runDate: run.run_date,
      distance: formatDistance(run.distance_meters, distanceUnit),
      durationSeconds: run.duration_seconds,
      effort: run.effort,
    })),
    summary: formatSummary(snapshot.summary, distanceUnit),
    yearToDate: {
      year: snapshot.yearToDate.year,
      summary: formatSummary(snapshot.yearToDate.summary, distanceUnit),
    },
    weeklyMileage: snapshot.weeklyMileage.map((period) => ({
      period: period.period,
      distance: formatDistance(period.distanceMeters, distanceUnit),
      runCount: period.runCount,
    })),
    monthlyMileage: snapshot.monthlyMileage.map((period) => ({
      period: period.period,
      distance: formatDistance(period.distanceMeters, distanceUnit),
      runCount: period.runCount,
    })),
    streaks: snapshot.streaks,
    effortZones: Object.fromEntries(
      Object.entries(snapshot.effortZones).map(([key, zone]) => [
        key,
        {
          runCount: zone.runCount,
          distance: formatDistance(zone.distanceMeters, distanceUnit),
        },
      ]),
    ),
    recoverySignals: snapshot.recoverySignals,
  };
}

function formatSummary(
  summary: {
    runCount: number;
    distanceMeters: number;
    durationSeconds: number;
    averagePaceSecondsPerKm: number | null;
  },
  distanceUnit: DistanceUnit,
) {
  return {
    runCount: summary.runCount,
    distance: formatDistance(summary.distanceMeters, distanceUnit),
    durationSeconds: summary.durationSeconds,
    averagePaceSecondsPerKm: summary.averagePaceSecondsPerKm,
  };
}

function parseTrainingChatOutput(
  rawOutput: unknown,
  distanceUnit: DistanceUnit,
) {
  if (!isRecord(rawOutput)) {
    return normalizeTrainingChatOutput(
      trainingChatOutputSchema.parse(rawOutput),
      distanceUnit,
    );
  }

  const answer = answerAliases
    .map((key) => rawOutput[key])
    .find((value): value is string => isNonEmptyString(value));

  if (!answer) {
    return normalizeTrainingChatOutput(
      trainingChatOutputSchema.parse(rawOutput),
      distanceUnit,
    );
  }

  return normalizeTrainingChatOutput(
    trainingChatOutputSchema.parse({
      answer,
      evidence: readStringList(rawOutput.evidence),
      followUp: isNonEmptyString(rawOutput.followUp)
        ? rawOutput.followUp
        : isNonEmptyString(rawOutput.suggestedNextAction)
          ? rawOutput.suggestedNextAction
          : undefined,
      confidence: readConfidence(rawOutput.confidence),
    }),
    distanceUnit,
  );
}

function normalizeTrainingChatOutput(
  output: TrainingChatOutput,
  distanceUnit: DistanceUnit,
): TrainingChatOutput {
  return {
    ...output,
    answer: normalizeTrainingText(output.answer, distanceUnit),
    evidence: output.evidence.map((item) =>
      normalizeTrainingText(item, distanceUnit),
    ),
    followUp: output.followUp
      ? normalizeTrainingText(output.followUp, distanceUnit)
      : undefined,
  };
}

function normalizeTrainingText(text: string, distanceUnit: DistanceUnit) {
  let normalized = text.replace(
    /distanceMeters\s*[:=]\s*(\d+(?:\.\d+)?)/gi,
    (_, meters: string) => formatDistance(Number(meters), distanceUnit),
  );

  if (distanceUnit === "km") {
    normalized = normalized.replace(
      /(\d+(?:\.\d+)?)\s*(?:km|kilometers?)\s*\(\s*\d+(?:\.\d+)?\s*(?:mi|miles?)\s*\)/gi,
      "$1 km",
    );
  } else {
    normalized = normalized.replace(
      /\d+(?:\.\d+)?\s*(?:km|kilometers?)\s*\(\s*(\d+(?:\.\d+)?)\s*(?:mi|miles?)\s*\)/gi,
      "$1 mi",
    );
  }

  return normalized;
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
