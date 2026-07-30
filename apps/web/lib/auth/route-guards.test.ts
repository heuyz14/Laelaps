import { describe, expect, it } from "vitest";

import {
  isAuthenticatedEntryRoute,
  isProtectedAppRoute,
} from "@/lib/auth/route-guards";

describe("auth route guards", () => {
  it("marks authenticated app routes as protected", () => {
    expect(isProtectedAppRoute("/dashboard")).toBe(true);
    expect(isProtectedAppRoute("/runs/123")).toBe(true);
    expect(isProtectedAppRoute("/shoes")).toBe(true);
    expect(isProtectedAppRoute("/goals")).toBe(true);
  });

  it("does not treat sign out as an authenticated entry route", () => {
    expect(isAuthenticatedEntryRoute("/")).toBe(true);
    expect(isAuthenticatedEntryRoute("/auth/sign-in")).toBe(true);
    expect(isAuthenticatedEntryRoute("/auth/callback")).toBe(true);
    expect(isAuthenticatedEntryRoute("/auth/sign-out")).toBe(false);
  });
});
