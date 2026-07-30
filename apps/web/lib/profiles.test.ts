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

function createSupabaseClient({
  selectResult,
  insertResult,
}: {
  selectResult: {
    data: unknown;
    error: { message: string } | null;
  };
  insertResult?: {
    data: unknown;
    error: { message: string } | null;
  };
}) {
  const calls: Array<{
    operation: "select" | "insert";
    table: string;
    payload?: unknown;
    columns?: string;
    eq?: [string, string];
  }> = [];

  return {
    calls,
    client: {
      from(table: string) {
        return {
          select(columns: string) {
            const call = {
              operation: "select" as const,
              table,
              columns,
            };
            calls.push(call);

            return {
              eq(column: string, value: string) {
                calls[calls.length - 1].eq = [column, value];

                return {
                  maybeSingle: async () => selectResult,
                };
              },
              single: async () => insertResult ?? selectResult,
            };
          },
          insert(payload: unknown) {
            calls.push({
              operation: "insert",
              table,
              payload,
            });

            return {
              select(columns: string) {
                calls[calls.length - 1].columns = columns;

                return {
                  single: async () => insertResult,
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
  it("returns an existing profile without writing on normal navigation", async () => {
    const supabase = createSupabaseClient({
      selectResult: {
        data: {
          id: userId,
          display_name: "Bubba",
          preferred_unit: "metric",
        },
        error: null,
      },
    });

    const profile = await ensureUserProfile(
      supabase.client as never,
      createUser({ full_name: "  Updated Name  " }),
    );

    expect(profile).toEqual({
      id: userId,
      display_name: "Bubba",
      preferred_unit: "metric",
    });
    expect(supabase.calls).toEqual([
      {
        operation: "select",
        table: "profiles",
        columns: "id, display_name, preferred_unit",
        eq: ["id", userId],
      },
    ]);
  });

  it("inserts a profile with a trimmed metadata display name when missing", async () => {
    const supabase = createSupabaseClient({
      selectResult: {
        data: null,
        error: null,
      },
      insertResult: {
        data: {
          id: userId,
          display_name: "Bubba",
          preferred_unit: "metric",
        },
        error: null,
      },
    });

    const profile = await ensureUserProfile(
      supabase.client as never,
      createUser({ full_name: "  Bubba  " }),
    );

    expect(profile.display_name).toBe("Bubba");
    expect(supabase.calls[1]).toMatchObject({
      operation: "insert",
      table: "profiles",
      payload: {
        id: userId,
        display_name: "Bubba",
        preferred_unit: "metric",
      },
      columns: "id, display_name, preferred_unit",
    });
  });

  it("uses a null display name when auth metadata does not provide one", async () => {
    const supabase = createSupabaseClient({
      selectResult: {
        data: null,
        error: null,
      },
      insertResult: {
        data: {
          id: userId,
          display_name: null,
          preferred_unit: "metric",
        },
        error: null,
      },
    });

    await ensureUserProfile(supabase.client as never, createUser({}));

    expect(supabase.calls[1].payload).toMatchObject({
      display_name: null,
    });
  });

  it("throws a safe generic error when profile loading fails", async () => {
    const supabase = createSupabaseClient({
      selectResult: {
        data: null,
        error: { message: "database connection failed" },
      },
    });

    await expect(
      ensureUserProfile(supabase.client as never, createUser({})),
    ).rejects.toThrow("Unable to load user profile.");
  });
});
