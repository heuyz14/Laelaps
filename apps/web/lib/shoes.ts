import type { SupabaseClient } from "@supabase/supabase-js";

export type Shoe = {
  id: string;
  name: string;
  retired_at: string | null;
  created_at: string;
};

export async function getShoes(supabase: SupabaseClient): Promise<Shoe[]> {
  const { data, error } = await supabase
    .from("shoes")
    .select("id, name, retired_at, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Unable to load shoes.");
  }

  return (data ?? []) as Shoe[];
}

export function getActiveShoes(shoes: Shoe[]) {
  return shoes.filter((shoe) => !shoe.retired_at);
}
