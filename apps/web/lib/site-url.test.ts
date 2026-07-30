import { describe, expect, it, vi } from "vitest";

describe("getSiteUrl", () => {
  it("removes one trailing slash from the configured site URL", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://laelaps.example/");

    const { getSiteUrl } = await import("@/lib/site-url");

    expect(getSiteUrl()).toBe("https://laelaps.example");
    vi.unstubAllEnvs();
  });

  it("uses the local development URL when the site URL is omitted", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", undefined);

    const { getSiteUrl } = await import("@/lib/site-url");

    expect(getSiteUrl()).toBe("http://localhost:3000");
    vi.unstubAllEnvs();
  });
});
