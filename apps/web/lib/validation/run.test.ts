import { describe, expect, it } from "vitest";

import { parseRunFormData, toMeters } from "@/lib/validation/run";

function createRunForm(overrides: Record<string, string> = {}) {
  const formData = new FormData();
  const values = {
    runDate: "2026-07-30",
    shoeId: "",
    distance: "5",
    distanceUnit: "kilometers",
    durationHours: "0",
    durationMinutes: "25",
    durationSeconds: "30",
    avgHeartRate: "150",
    maxHeartRate: "172",
    effort: "6",
    notes: "Easy aerobic run",
    ...overrides,
  };

  Object.entries(values).forEach(([key, value]) => {
    formData.set(key, value);
  });

  return formData;
}

describe("toMeters", () => {
  it("converts kilometers and miles to rounded meters", () => {
    expect(toMeters(5, "kilometers")).toBe(5000);
    expect(toMeters(3.1, "miles")).toBe(4989);
  });
});

describe("parseRunFormData", () => {
  it("returns database-ready run values from form data", () => {
    expect(parseRunFormData(createRunForm())).toEqual({
      run_date: "2026-07-30",
      shoe_id: null,
      distance_meters: 5000,
      duration_seconds: 1530,
      avg_heart_rate: 150,
      max_heart_rate: 172,
      effort: 6,
      notes: "Easy aerobic run",
    });
  });

  it("allows optional training fields to be blank", () => {
    expect(
      parseRunFormData(
        createRunForm({
          avgHeartRate: "",
          maxHeartRate: "",
          effort: "",
          notes: "",
        }),
      ),
    ).toMatchObject({
      avg_heart_rate: null,
      max_heart_rate: null,
      effort: null,
      notes: null,
    });
  });

  it("accepts an owned shoe id from the run form", () => {
    expect(
      parseRunFormData(
        createRunForm({
          shoeId: "550e8400-e29b-41d4-a716-446655440000",
        }),
      ),
    ).toMatchObject({
      shoe_id: "550e8400-e29b-41d4-a716-446655440000",
    });
  });

  it("rejects a zero duration", () => {
    expect(() =>
      parseRunFormData(
        createRunForm({
          durationHours: "0",
          durationMinutes: "0",
          durationSeconds: "0",
        }),
      ),
    ).toThrow("Duration must be greater than zero.");
  });

  it("rejects average heart rate above max heart rate", () => {
    expect(() =>
      parseRunFormData(
        createRunForm({
          avgHeartRate: "180",
          maxHeartRate: "170",
        }),
      ),
    ).toThrow("Average heart rate cannot exceed max heart rate.");
  });
});
