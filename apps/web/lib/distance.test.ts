import { describe, expect, it } from "vitest";

import { formatDistance } from "@/lib/distance";

describe("formatDistance", () => {
  it("formats meters as kilometers by default", () => {
    expect(formatDistance(5000)).toBe("5.0 km");
  });

  it("formats meters as miles when selected", () => {
    expect(formatDistance(16093.44, "mi")).toBe("10.0 mi");
  });
});
