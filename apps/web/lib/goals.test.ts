import { describe, expect, it } from "vitest";

import { countActiveGoals, type Goal } from "@/lib/goals";

const baseGoal: Goal = {
  id: "00000000-0000-4000-8000-000000000010",
  type: "weekly_distance",
  target_value: 40,
  target_date: "2026-08-31",
  status: "active",
  created_at: "2026-08-01T00:00:00.000Z",
  updated_at: "2026-08-01T00:00:00.000Z",
};

describe("countActiveGoals", () => {
  it("counts only active goals", () => {
    expect(
      countActiveGoals([
        baseGoal,
        {
          ...baseGoal,
          id: "00000000-0000-4000-8000-000000000011",
          status: "completed",
        },
        {
          ...baseGoal,
          id: "00000000-0000-4000-8000-000000000012",
          status: "paused",
        },
      ]),
    ).toBe(1);
  });

  it("returns zero for an empty goal list", () => {
    expect(countActiveGoals([])).toBe(0);
  });
});
