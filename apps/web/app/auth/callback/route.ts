import { NextRequest, NextResponse } from "next/server";

import { createReplaceRedirectResponse } from "@/lib/auth/replace-redirect-response";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site-url";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const siteUrl = getSiteUrl();

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return createReplaceRedirectResponse(`${siteUrl}/dashboard`);
    }
  }

  return NextResponse.redirect(`${siteUrl}/?auth_error=oauth_callback_failed`);
}
