import { describe, expect, it } from "vitest";

import { emailPasswordSchema } from "@/lib/auth/email-password";

describe("emailPasswordSchema", () => {
  it("accepts a valid email and password", () => {
    const result = emailPasswordSchema.safeParse({
      email: "runner@example.com",
      password: "strong-password",
    });

    expect(result.success).toBe(true);
  });

  it("trims email addresses before validation", () => {
    const result = emailPasswordSchema.parse({
      email: "  runner@example.com  ",
      password: "strong-password",
    });

    expect(result.email).toBe("runner@example.com");
  });

  it("rejects short passwords", () => {
    const result = emailPasswordSchema.safeParse({
      email: "runner@example.com",
      password: "short",
    });

    expect(result.success).toBe(false);
  });
});
