import { describe, expect, it } from "vitest";

import { publicEnvSchema } from "@/lib/env";

describe("publicEnvSchema", () => {
  it("accepts the browser-safe Supabase configuration", () => {
    const result = publicEnvSchema.safeParse({
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
      NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid Supabase URLs", () => {
    const result = publicEnvSchema.safeParse({
      NEXT_PUBLIC_SUPABASE_URL: "not-a-url",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
      NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
    });

    expect(result.success).toBe(false);
  });
});
