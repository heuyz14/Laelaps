import { NextRequest, NextResponse } from "next/server";

import { createReplaceRedirectResponse } from "@/lib/auth/replace-redirect-response";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return createReplaceRedirectResponse(`${origin}/dashboard`);
    }
  }

  return NextResponse.redirect(`${origin}/?auth_error=oauth_callback_failed`);
}
