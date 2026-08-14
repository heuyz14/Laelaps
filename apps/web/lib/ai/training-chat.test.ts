import { describe, expect, it, vi } from "vitest";

import type { AiToolContext, SavedInsight } from "@/lib/ai/contracts";
import type { AiProvider } from "@/lib/ai/provider";
import {
  answerTrainingChat,
  type TrainingChatDependencies,
} from "@/lib/ai/training-chat";

const output = {
  answer: "You have run 42.8 km this year.",
  evidence: ["The authenticated training snapshot totals 42.8 km."],
  followUp: "Ask for month-to-date distance if you want a narrower view.",
  confidence: "high" as const,
};

function dependencies(overrides: Partial<TrainingChatDependencies> = {}) {
  const insight: SavedInsight = {
    id: "00000000-0000-4000-8000-000000000004",
    insight_type: "training_chat",
    run_id: null,
    input_summary: { question: "How far have I run this year?" },
    output,
  };

  return {
    getTrainingSnapshot: vi.fn(async () => ({
      recentRuns: [],
      summary: {
        runCount: 7,
        distanceMeters: 42800,
        durationSeconds: 13608,
        averagePaceSecondsPerKm: 318,
      },
      weeklyMileage: [],
      monthlyMileage: [],
      streaks: {
        currentRunDayStreak: 0,
        currentRunWeekStreak: 1,
      },
      effortZones: {
        easy: { runCount: 3, distanceMeters: 18000 },
        moderate: { runCount: 3, distanceMeters: 19000 },
        hard: { runCount: 1, distanceMeters: 5800 },
        unknown: { runCount: 0, distanceMeters: 0 },
      },
      recoverySignals: [],
    })),
    getGoal: vi.fn(async () => null),
    saveInsight: vi.fn(async () => insight),
    ...overrides,
  } as TrainingChatDependencies;
}

describe("training chat agent", () => {
  it("answers arbitrary training questions from authenticated metrics", async () => {
    const provider: AiProvider = {
      generateStructured: vi.fn(async () => output),
    };
    const deps = dependencies();
    const result = await answerTrainingChat(
      {} as AiToolContext,
      { question: "How far have I run this year?", mode: "coach" },
      provider,
      deps,
    );

    expect(result.output.answer).toBe("You have run 42.8 km this year.");
    expect(provider.generateStructured).toHaveBeenCalledWith(
      expect.objectContaining({
        userPrompt: expect.stringContaining("distanceMeters"),
      }),
    );
    expect(deps.saveInsight).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        insightType: "training_chat",
        inputSummary: expect.objectContaining({
          distanceMeters: 42800,
          runCount: 7,
        }),
      }),
    );
  });

  it("does not save malformed chat output", async () => {
    const deps = dependencies();
    await expect(
      answerTrainingChat(
        {} as AiToolContext,
        { question: "How far have I run this year?", mode: "coach" },
        { generateStructured: vi.fn(async () => ({ answer: "" })) },
        deps,
      ),
    ).rejects.toThrow();
    expect(deps.saveInsight).not.toHaveBeenCalled();
  });
});
