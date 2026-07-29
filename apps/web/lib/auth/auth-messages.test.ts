import { describe, expect, it } from "vitest";

import { getAuthMessage } from "@/lib/auth/auth-messages";

describe("getAuthMessage", () => {
  it("returns known generic auth errors", () => {
    expect(
      getAuthMessage({
        authError: "email_sign_in_failed",
      }),
    ).toEqual({
      kind: "error",
      text: "Unable to sign in with those credentials.",
    });
  });

  it("returns known auth notices", () => {
    expect(
      getAuthMessage({
        authNotice: "check_email",
      }),
    ).toEqual({
      kind: "notice",
      text: "Check your email to confirm your account, then sign in.",
    });
  });

  it("ignores unknown query values", () => {
    expect(
      getAuthMessage({
        authError: "unexpected",
        authNotice: "also_unexpected",
      }),
    ).toBeNull();
  });
});
