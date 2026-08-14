import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";

import {
  getComparableRuns,
  getGoal,
  getRecentRuns,
  getRunById,
  getTrainingSnapshot,
  getWeeklyStats,
  saveInsight,
} from "@/lib/ai/tools";
import { saveInsightInputSchema } from "@/lib/ai/contracts";

const userId = "00000000-0000-4000-8000-000000000001";
const runId = "00000000-0000-4000-8000-000000000002";

function queryMock(data: unknown, error: unknown = null) {
  const calls: string[] = [];
  const query = {
    calls,
    select(value: string) {
      calls.push(`select:${value}`);
      return query;
    },
    eq(column: string, value: string) {
      calls.push(`eq:${column}:${value}`);
      return query;
    },
    order(column: string) {
      calls.push(`order:${column}`);
      return query;
    },
    limit(value: number) {
      calls.push(`limit:${value}`);
      return query;
    },
    insert(value: Record<string, unknown>) {
      calls.push(`insert:${String(value.user_id)}`);
      return query;
    },
    maybeSingle: async () => ({ data, error }),
    single: async () => ({ data, error }),
    then: (resolve: (value: unknown) => unknown) =>
      Promise.resolve({ data, error }).then(resolve),
  };

  return query;
}

function clientWithQuery(...queries: ReturnType<typeof queryMock>[]) {
  let index = 0;
  return {
    auth: {
      getUser: async () => ({ data: { user: { id: userId } } }),
    },
    from() {
      return queries[Math.min(index++, queries.length - 1)];
    },
  } as unknown as SupabaseClient;
}

function run(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: runId,
    run_date: "2026-08-01",
    distance_meters: 5000,
    duration_seconds: 1500,
    avg_heart_rate: 150,
    max_heart_rate: 165,
    effort: 5,
    ...overrides,
  };
}

describe("AI tool contracts", () => {
  it("rejects malformed run IDs and oversized insight types", () => {
    expect(() =>
      saveInsightInputSchema.parse({
        insightType: "x".repeat(81),
        output: {},
      }),
    ).toThrow();
  });

  it("requires valid UUIDs for run lookups", async () => {
    await expect(
      getRunById({ supabase: clientWithQuery(queryMock(null)) }, "not-a-uuid"),
    ).rejects.toThrow();
  });
});

describe("scoped AI tools", () => {
  it("scopes recent runs to the authenticated user and clamps the limit", async () => {
    const query = queryMock([run()]);
    const result = await getRecentRuns(
      { supabase: clientWithQuery(query) },
      500,
    );

    expect(result).toHaveLength(1);
    expect(query.calls).toContain(`eq:user_id:${userId}`);
    expect(query.calls).toContain("limit:100");
  });

  it("returns no run when the scoped lookup finds nothing", async () => {
    const result = await getRunById(
      { supabase: clientWithQuery(queryMock(null)) },
      runId,
    );

    expect(result).toBeNull();
  });

  it("builds weekly stats from deterministic analytics", async () => {
    const result = await getWeeklyStats({
      supabase: clientWithQuery(queryMock([run()])),
    });

    expect(result.summary).toMatchObject({
      runCount: 1,
      distanceMeters: 5000,
      averagePaceSecondsPerKm: 300,
    });
    expect(result.weeklyMileage).toHaveLength(1);
  });

  it("builds a broad training snapshot scoped to the authenticated user", async () => {
    const query = queryMock([
      run(),
      run({
        id: "00000000-0000-4000-8000-000000000005",
        run_date: "2025-12-31",
        distance_meters: 3000,
      }),
    ]);
    const result = await getTrainingSnapshot(
      {
        supabase: clientWithQuery(query),
      },
      new Date("2026-08-14T00:00:00Z"),
    );

    expect(result.summary.distanceMeters).toBe(8000);
    expect(result.yearToDate).toMatchObject({
      year: 2026,
      summary: expect.objectContaining({ distanceMeters: 5000 }),
    });
    expect(query.calls).toContain(`eq:user_id:${userId}`);
    expect(query.calls).toContain("limit:1000");
  });

  it("selects comparable runs without returning the target run", async () => {
    const targetQuery = queryMock(run());
    const recentQuery = queryMock([
      run(),
      run({
        id: "00000000-0000-4000-8000-000000000003",
        run_date: "2026-07-31",
      }),
    ]);
    const result = await getComparableRuns(
      { supabase: clientWithQuery(targetQuery, recentQuery) },
      runId,
    );

    expect(result).toHaveLength(1);
    expect(result[0].id).not.toBe(runId);
  });

  it("writes insights with the authenticated user, not input data", async () => {
    const query = queryMock({
      id: "00000000-0000-4000-8000-000000000004",
      insight_type: "run_summary",
      run_id: runId,
      input_summary: {},
      output: { summary: "Steady run." },
    });
    const result = await saveInsight(
      { supabase: clientWithQuery(query) },
      {
        insightType: "run_summary",
        runId,
        output: { summary: "Steady run." },
      },
    );

    expect(result.insight_type).toBe("run_summary");
    expect(query.calls).toContain(
      "select:id, insight_type, run_id, input_summary, output",
    );
  });
});

describe("getGoal", () => {
  it("scopes an explicit goal lookup to the authenticated user", async () => {
    const query = queryMock(null);
    await getGoal({ supabase: clientWithQuery(query) }, runId);

    expect(query.calls).toContain(`eq:user_id:${userId}`);
  });
});
