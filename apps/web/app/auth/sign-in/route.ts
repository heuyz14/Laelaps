import { NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site-url";

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const siteUrl = getSiteUrl();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${siteUrl}/auth/callback`,
    },
  });

  if (error || !data.url) {
    return NextResponse.redirect(`${siteUrl}/?auth_error=oauth_start_failed`);
  }

  return NextResponse.redirect(data.url);
}
