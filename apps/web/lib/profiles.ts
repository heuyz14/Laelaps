import type { SupabaseClient, User } from "@supabase/supabase-js";

import { profileSchema, type Profile } from "@/lib/validation/profile";

export async function ensureUserProfile(
  supabase: SupabaseClient,
  user: User,
): Promise<Profile> {
  const displayName =
    typeof user.user_metadata.full_name === "string" &&
    user.user_metadata.full_name.trim().length > 0
      ? user.user_metadata.full_name.trim()
      : null;

  const { data, error } = await supabase
    .from("profiles")
    .upsert(
      {
        id: user.id,
        display_name: displayName,
        preferred_unit: "metric",
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "id",
        ignoreDuplicates: false,
      },
    )
    .select("id, display_name, preferred_unit")
    .single();

  if (error) {
    throw new Error("Unable to load user profile.");
  }

  return profileSchema.parse(data);
}
