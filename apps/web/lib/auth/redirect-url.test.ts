import { describe, expect, it, vi } from "vitest";

describe("getAuthCallbackUrl", () => {
  it("uses the configured canonical site instead of the request host", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://laelaps-web.vercel.app/");

    const { getAuthCallbackUrl } = await import("@/lib/auth/redirect-url");

    expect(getAuthCallbackUrl()).toBe(
      "https://laelaps-web.vercel.app/auth/callback",
    );
    vi.unstubAllEnvs();
  });
});

describe("getGoogleOAuthQueryParams", () => {
  it("forces Google to show the account chooser", async () => {
    const { getGoogleOAuthQueryParams } = await import(
      "@/lib/auth/redirect-url"
    );

    expect(getGoogleOAuthQueryParams()).toEqual({ prompt: "select_account" });
  });
});
