import type { SupabaseClient } from "@supabase/supabase-js";

export type Goal = {
  id: string;
  type: string;
  target_value: number | null;
  target_date: string | null;
  status: "active" | "completed" | "paused" | "archived";
  created_at: string;
  updated_at: string;
};

export async function getGoals(supabase: SupabaseClient): Promise<Goal[]> {
  const { data, error } = await supabase
    .from("goals")
    .select(
      "id, type, target_value, target_date, status, created_at, updated_at",
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Unable to load goals.");
  }

  return (data ?? []) as Goal[];
}

export function countActiveGoals(goals: Goal[]) {
  return goals.filter((goal) => goal.status === "active").length;
}
