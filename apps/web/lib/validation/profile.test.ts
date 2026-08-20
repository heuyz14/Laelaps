import { describe, expect, it } from "vitest";

import { profileSchema } from "@/lib/validation/profile";

const profileId = "550e8400-e29b-41d4-a716-446655440000";

describe("profileSchema", () => {
  it("accepts a valid profile and defaults preferred_unit to km", () => {
    const profile = profileSchema.parse({
      id: profileId,
      display_name: "Bubba",
    });

    expect(profile).toEqual({
      id: profileId,
      display_name: "Bubba",
      preferred_unit: "km",
    });
  });

  it("trims display names before returning a profile", () => {
    const profile = profileSchema.parse({
      id: profileId,
      display_name: "  Laelaps Runner  ",
      preferred_unit: "mi",
    });

    expect(profile.display_name).toBe("Laelaps Runner");
  });

  it("rejects unsupported unit preferences", () => {
    expect(() =>
      profileSchema.parse({
        id: profileId,
        display_name: null,
        preferred_unit: "metric",
      }),
    ).toThrow();
  });
});
