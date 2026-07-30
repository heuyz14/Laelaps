import { describe, expect, it } from "vitest";

import {
  buildRunAnalytics,
  selectComparableRuns,
  type AnalyticsRun,
} from "@/lib/analytics";

const runs: AnalyticsRun[] = [
  {
    id: "long-easy",
    runDate: "2026-07-20",
    distanceMeters: 12000,
    durationSeconds: 4200,
    effort: 3,
    avgHeartRate: 132,
  },
  {
    id: "tempo",
    runDate: "2026-07-25",
    distanceMeters: 5000,
    durationSeconds: 1500,
    effort: 8,
    avgHeartRate: 168,
  },
  {
    id: "moderate",
    runDate: "2026-07-26",
    distanceMeters: 8000,
    durationSeconds: 2880,
    effort: 6,
    avgHeartRate: 148,
  },
  {
    id: "hard",
    runDate: "2026-07-27",
    distanceMeters: 5000,
    durationSeconds: 1560,
    effort: 9,
    avgHeartRate: 172,
  },
  {
    id: "latest-hard",
    runDate: "2026-07-28",
    distanceMeters: 6000,
    durationSeconds: 2100,
    effort: 8,
    avgHeartRate: 176,
  },
];

describe("buildRunAnalytics", () => {
  it("returns zeroed metrics for empty input", () => {
    expect(buildRunAnalytics([])).toEqual({
      summary: {
        runCount: 0,
        invalidRunCount: 0,
        distanceMeters: 0,
        durationSeconds: 0,
        averagePaceSecondsPerKm: null,
        longestRunMeters: 0,
      },
      weeklyMileage: [],
      monthlyMileage: [],
      personalRecords: {
        longestRun: null,
        fastestPace: null,
      },
      streaks: {
        currentRunDayStreak: 0,
        longestRunDayStreak: 0,
        currentRunWeekStreak: 0,
      },
      effortZones: {
        easy: { runCount: 0, distanceMeters: 0 },
        moderate: { runCount: 0, distanceMeters: 0 },
        hard: { runCount: 0, distanceMeters: 0 },
        unknown: { runCount: 0, distanceMeters: 0 },
      },
      recoverySignals: [],
    });
  });

  it("computes stable summary, mileage, records, streaks, and effort zones", () => {
    const analytics = buildRunAnalytics(runs);

    expect(analytics.summary).toEqual({
      runCount: 5,
      invalidRunCount: 0,
      distanceMeters: 36000,
      durationSeconds: 12240,
      averagePaceSecondsPerKm: 340,
      longestRunMeters: 12000,
    });
    expect(analytics.weeklyMileage).toEqual([
      { period: "2026-W30", distanceMeters: 25000, runCount: 3 },
      { period: "2026-W31", distanceMeters: 11000, runCount: 2 },
    ]);
    expect(analytics.monthlyMileage).toEqual([
      { period: "2026-07", distanceMeters: 36000, runCount: 5 },
    ]);
    expect(analytics.personalRecords.longestRun?.id).toBe("long-easy");
    expect(analytics.personalRecords.fastestPace).toMatchObject({
      id: "tempo",
      paceSecondsPerKm: 300,
    });
    expect(analytics.streaks).toEqual({
      currentRunDayStreak: 4,
      longestRunDayStreak: 4,
      currentRunWeekStreak: 2,
    });
    expect(analytics.effortZones).toEqual({
      easy: { runCount: 1, distanceMeters: 12000 },
      moderate: { runCount: 1, distanceMeters: 8000 },
      hard: { runCount: 3, distanceMeters: 16000 },
      unknown: { runCount: 0, distanceMeters: 0 },
    });
    expect(analytics.recoverySignals).toEqual([
      {
        kind: "volume_spike",
        severity: "high",
        message:
          "Latest 7-day volume is more than 25% above the previous 7 days.",
      },
      {
        kind: "hard_effort_cluster",
        severity: "medium",
        message: "3 hard efforts in the latest 7-day window.",
      },
      {
        kind: "elevated_heart_rate",
        severity: "low",
        message: "Latest average heart rate is more than 10% above baseline.",
      },
    ]);
  });

  it("ignores invalid rows without crashing sparse optional data", () => {
    const analytics = buildRunAnalytics([
      {
        id: "valid",
        runDate: "2026-07-30",
        distanceMeters: 3000,
        durationSeconds: 1020,
        effort: null,
      },
      {
        id: "bad-distance",
        runDate: "2026-07-29",
        distanceMeters: 0,
        durationSeconds: 900,
        effort: 5,
      },
      {
        id: "bad-date",
        runDate: "not-a-date",
        distanceMeters: 5000,
        durationSeconds: 1500,
        effort: 4,
      },
    ]);

    expect(analytics.summary.runCount).toBe(1);
    expect(analytics.summary.invalidRunCount).toBe(2);
    expect(analytics.effortZones.unknown).toEqual({
      runCount: 1,
      distanceMeters: 3000,
    });
  });

  it("counts consecutive ISO weeks across year boundaries", () => {
    const analytics = buildRunAnalytics([
      {
        id: "year-end",
        runDate: "2024-12-29",
        distanceMeters: 5000,
        durationSeconds: 1500,
      },
      {
        id: "new-year",
        runDate: "2025-01-05",
        distanceMeters: 5000,
        durationSeconds: 1500,
      },
    ]);

    expect(analytics.weeklyMileage).toEqual([
      { period: "2024-W52", distanceMeters: 5000, runCount: 1 },
      { period: "2025-W01", distanceMeters: 5000, runCount: 1 },
    ]);
    expect(analytics.streaks.currentRunWeekStreak).toBe(2);
  });
});

describe("selectComparableRuns", () => {
  it("selects deterministic comparable runs by distance delta and recency", () => {
    expect(
      selectComparableRuns(runs, {
        targetDistanceMeters: 5200,
        excludeRunId: "tempo",
        limit: 2,
      }).map((run) => run.id),
    ).toEqual(["hard", "latest-hard"]);
  });
});
