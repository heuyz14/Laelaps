import { describe, expect, it } from "vitest";

import { parseGoalFormData } from "@/lib/validation/goal";

describe("parseGoalFormData", () => {
  it("returns goal values ready for persistence", () => {
    const formData = new FormData();
    formData.set("type", "  Weekly distance  ");
    formData.set("targetValue", "40");
    formData.set("targetDate", "2026-08-15");
    formData.set("status", "active");

    expect(parseGoalFormData(formData)).toEqual({
      type: "Weekly distance",
      targetValue: 40,
      targetDate: "2026-08-15",
      status: "active",
    });
  });

  it("allows optional target fields to be blank", () => {
    const formData = new FormData();
    formData.set("type", "Run consistently");
    formData.set("targetValue", "");
    formData.set("targetDate", "");
    formData.set("status", "paused");

    expect(parseGoalFormData(formData)).toMatchObject({
      targetValue: null,
      targetDate: null,
      status: "paused",
    });
  });

  it("rejects unsupported goal status values", () => {
    const formData = new FormData();
    formData.set("type", "Weekly distance");
    formData.set("status", "unknown");

    expect(() => parseGoalFormData(formData)).toThrow();
  });
});
