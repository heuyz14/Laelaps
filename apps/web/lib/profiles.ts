import type { SupabaseClient, User } from "@supabase/supabase-js";

import { profileSchema, type Profile } from "@/lib/validation/profile";

export async function ensureUserProfile(
  supabase: SupabaseClient,
  user: User,
): Promise<Profile> {
  const { data: existingProfile, error: selectError } = await supabase
    .from("profiles")
    .select("id, display_name, preferred_unit")
    .eq("id", user.id)
    .maybeSingle();

  if (selectError) {
    throw new Error("Unable to load user profile.");
  }

  if (existingProfile) {
    return profileSchema.parse(existingProfile);
  }

  const displayName =
    typeof user.user_metadata.full_name === "string" &&
    user.user_metadata.full_name.trim().length > 0
      ? user.user_metadata.full_name.trim()
      : null;

  const { data, error } = await supabase
    .from("profiles")
    .insert({
      id: user.id,
      display_name: displayName,
      preferred_unit: "metric",
    })
    .select("id, display_name, preferred_unit")
    .single();

  if (error) {
    throw new Error("Unable to load user profile.");
  }

  return profileSchema.parse(data);
}
