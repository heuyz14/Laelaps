import type { SupabaseClient } from "@supabase/supabase-js";

export type DashboardRun = {
  id: string;
  shoe_id?: string | null;
  run_date: string;
  distance_meters: number;
  duration_seconds: number;
  avg_heart_rate?: number | null;
  max_heart_rate?: number | null;
  effort: number | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
  shoes?:
    | {
        name: string;
      }
    | {
        name: string;
      }[]
    | null;
};

export type RunDashboardStats = {
  runCount: number;
  distanceMeters: number;
  durationSeconds: number;
};

export async function getRecentRuns(
  supabase: SupabaseClient,
): Promise<DashboardRun[]> {
  const { data, error } = await supabase
    .from("runs")
    .select(
      "id, shoe_id, run_date, distance_meters, duration_seconds, avg_heart_rate, max_heart_rate, effort, notes, shoes(name)",
    )
    .order("run_date", { ascending: false })
    .limit(8);

  if (error) {
    throw new Error("Unable to load recent runs.");
  }

  return (data ?? []) as unknown as DashboardRun[];
}

export async function getRuns(
  supabase: SupabaseClient,
  options: {
    query?: string;
    sort?: "newest" | "oldest" | "distance_desc" | "distance_asc";
  } = {},
): Promise<DashboardRun[]> {
  let query = supabase
    .from("runs")
    .select(
      "id, shoe_id, run_date, distance_meters, duration_seconds, avg_heart_rate, max_heart_rate, effort, notes, created_at, updated_at, shoes(name)",
    );

  if (options.query) {
    query = query.ilike("notes", `%${options.query}%`);
  }

  if (options.sort === "oldest") {
    query = query.order("run_date", { ascending: true });
  } else if (options.sort === "distance_desc") {
    query = query.order("distance_meters", { ascending: false });
  } else if (options.sort === "distance_asc") {
    query = query.order("distance_meters", { ascending: true });
  } else {
    query = query.order("run_date", { ascending: false });
  }

  const { data, error } = await query.limit(100);

  if (error) {
    throw new Error("Unable to load runs.");
  }

  return (data ?? []) as DashboardRun[];
}

export async function getRunById(
  supabase: SupabaseClient,
  runId: string,
): Promise<DashboardRun | null> {
  const { data, error } = await supabase
    .from("runs")
    .select(
      "id, shoe_id, run_date, distance_meters, duration_seconds, avg_heart_rate, max_heart_rate, effort, notes, created_at, updated_at, shoes(name)",
    )
    .eq("id", runId)
    .maybeSingle();

  if (error) {
    throw new Error("Unable to load run.");
  }

  return data as unknown as DashboardRun | null;
}

export function getRunDashboardStats(runs: DashboardRun[]): RunDashboardStats {
  return runs.reduce(
    (stats, run) => ({
      runCount: stats.runCount + 1,
      distanceMeters: stats.distanceMeters + run.distance_meters,
      durationSeconds: stats.durationSeconds + run.duration_seconds,
    }),
    {
      runCount: 0,
      distanceMeters: 0,
      durationSeconds: 0,
    },
  );
}

export function formatDistance(meters: number, unit: "metric" | "imperial") {
  const value = unit === "metric" ? meters / 1000 : meters / 1609.344;
  const suffix = unit === "metric" ? "km" : "mi";

  return `${value.toFixed(1)} ${suffix}`;
}

export function formatDuration(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function splitDuration(totalSeconds: number) {
  return {
    hours: Math.floor(totalSeconds / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

export function getAveragePaceSecondsPerKm(run: {
  distance_meters: number;
  duration_seconds: number;
}) {
  return Math.round(run.duration_seconds / (run.distance_meters / 1000));
}

export function formatPace(secondsPerKm: number, unit: "metric" | "imperial") {
  const adjustedSeconds =
    unit === "metric" ? secondsPerKm : Math.round(secondsPerKm * 1.609344);
  const minutes = Math.floor(adjustedSeconds / 60);
  const seconds = adjustedSeconds % 60;
  const suffix = unit === "metric" ? "/km" : "/mi";

  return `${minutes}:${String(seconds).padStart(2, "0")} ${suffix}`;
}

export function getShoeName(run: Pick<DashboardRun, "shoes">) {
  if (Array.isArray(run.shoes)) {
    return run.shoes[0]?.name ?? null;
  }

  return run.shoes?.name ?? null;
}
