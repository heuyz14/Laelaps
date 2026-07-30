import { describe, expect, it } from "vitest";

import { parseShoeFormData } from "@/lib/validation/shoe";

describe("parseShoeFormData", () => {
  it("trims shoe names and reads retired state", () => {
    const formData = new FormData();
    formData.set("name", "  Daily Trainer  ");
    formData.set("retired", "on");

    expect(parseShoeFormData(formData)).toEqual({
      name: "Daily Trainer",
      retired: true,
    });
  });

  it("rejects blank shoe names", () => {
    const formData = new FormData();
    formData.set("name", "   ");

    expect(() => parseShoeFormData(formData)).toThrow("Shoe name is required.");
  });
});
