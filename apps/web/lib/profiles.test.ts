import type { User } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";

import { ensureUserProfile } from "@/lib/profiles";

const userId = "550e8400-e29b-41d4-a716-446655440000";

function createUser(metadata: User["user_metadata"]): User {
  return {
    id: userId,
    user_metadata: metadata,
  } as User;
}

function createSupabaseClient(result: {
  data: unknown;
  error: { message: string } | null;
}) {
  const calls: Array<{
    table: string;
    payload: unknown;
    options: unknown;
    columns: string;
  }> = [];

  return {
    calls,
    client: {
      from(table: string) {
        return {
          upsert(payload: unknown, options: unknown) {
            calls.push({
              table,
              payload,
              options,
              columns: "",
            });

            return {
              select(columns: string) {
                calls[0].columns = columns;

                return {
                  single: async () => result,
                };
              },
            };
          },
        };
      },
    },
  };
}

describe("ensureUserProfile", () => {
  it("upserts a user profile with a trimmed metadata display name", async () => {
    const supabase = createSupabaseClient({
      data: {
        id: userId,
        display_name: "Bubba",
        preferred_unit: "metric",
      },
      error: null,
    });

    const profile = await ensureUserProfile(
      supabase.client as never,
      createUser({ full_name: "  Bubba  " }),
    );

    expect(profile).toEqual({
      id: userId,
      display_name: "Bubba",
      preferred_unit: "metric",
    });
    expect(supabase.calls[0]).toMatchObject({
      table: "profiles",
      payload: {
        id: userId,
        display_name: "Bubba",
        preferred_unit: "metric",
      },
      options: {
        onConflict: "id",
        ignoreDuplicates: false,
      },
      columns: "id, display_name, preferred_unit",
    });
  });

  it("uses a null display name when auth metadata does not provide one", async () => {
    const supabase = createSupabaseClient({
      data: {
        id: userId,
        display_name: null,
        preferred_unit: "metric",
      },
      error: null,
    });

    await ensureUserProfile(supabase.client as never, createUser({}));

    expect(supabase.calls[0].payload).toMatchObject({
      display_name: null,
    });
  });

  it("throws a safe generic error when profile loading fails", async () => {
    const supabase = createSupabaseClient({
      data: null,
      error: { message: "database connection failed" },
    });

    await expect(
      ensureUserProfile(supabase.client as never, createUser({})),
    ).rejects.toThrow("Unable to load user profile.");
  });
});
