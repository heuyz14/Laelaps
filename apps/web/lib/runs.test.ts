import { describe, expect, it } from "vitest";

import {
  formatDistance,
  formatDuration,
  formatPace,
  getRunAnalytics,
  getAveragePaceSecondsPerKm,
  getRunDashboardStats,
  getShoeName,
  splitDuration,
} from "@/lib/runs";

describe("getRunDashboardStats", () => {
  it("summarizes run count, distance, and duration", () => {
    expect(
      getRunDashboardStats([
        {
          id: "run-1",
          run_date: "2026-07-30",
          distance_meters: 5000,
          duration_seconds: 1500,
          effort: 5,
        },
        {
          id: "run-2",
          run_date: "2026-07-29",
          distance_meters: 8000,
          duration_seconds: 2700,
          effort: null,
        },
      ]),
    ).toEqual({
      runCount: 2,
      distanceMeters: 13000,
      durationSeconds: 4200,
    });
  });
});

describe("getRunAnalytics", () => {
  it("normalizes database run rows into analytics metrics", () => {
    const analytics = getRunAnalytics([
      {
        id: "run-1",
        run_date: "2026-07-30",
        distance_meters: 5000,
        duration_seconds: 1500,
        effort: 8,
        avg_heart_rate: 168,
      },
    ]);

    expect(analytics.summary).toMatchObject({
      runCount: 1,
      distanceMeters: 5000,
      durationSeconds: 1500,
      averagePaceSecondsPerKm: 300,
    });
    expect(analytics.effortZones.hard).toEqual({
      runCount: 1,
      distanceMeters: 5000,
    });
  });
});

describe("formatDistance", () => {
  it("formats kilometers and miles", () => {
    expect(formatDistance(5000, "km")).toBe("5.0 km");
    expect(formatDistance(16093, "mi")).toBe("10.0 mi");
  });
});

describe("formatDuration", () => {
  it("formats durations with or without hours", () => {
    expect(formatDuration(1530)).toBe("25:30");
    expect(formatDuration(4230)).toBe("1:10:30");
  });
});

describe("splitDuration", () => {
  it("splits total seconds into edit-form parts", () => {
    expect(splitDuration(4230)).toEqual({
      hours: 1,
      minutes: 10,
      seconds: 30,
    });
  });
});

describe("pace helpers", () => {
  it("calculates and formats average pace", () => {
    const pace = getAveragePaceSecondsPerKm({
      distance_meters: 5000,
      duration_seconds: 1500,
    });

    expect(pace).toBe(300);
    expect(formatPace(pace, "km")).toBe("5:00 /km");
    expect(formatPace(pace, "mi")).toBe("8:03 /mi");
  });
});

describe("getShoeName", () => {
  it("normalizes Supabase relationship shapes", () => {
    expect(getShoeName({ shoes: { name: "Daily Trainer" } })).toBe(
      "Daily Trainer",
    );
    expect(getShoeName({ shoes: [{ name: "Tempo Shoe" }] })).toBe("Tempo Shoe");
    expect(getShoeName({ shoes: [] })).toBeNull();
    expect(getShoeName({ shoes: null })).toBeNull();
  });
});
