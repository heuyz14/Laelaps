import { redirect } from "next/navigation";

import { AuthLandingPage } from "@/components/auth/auth-landing-page";
import { getAuthMessage } from "@/lib/auth/auth-messages";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function HomePage({
  searchParams,
}: {
  searchParams?: Promise<{
    auth_error?: string | string[];
    auth_notice?: string | string[];
  }>;
}) {
  const supabase = await createServerSupabaseClient();
  let user = null;

  try {
    const result = await supabase.auth.getUser();
    user = result.data.user;
  } catch {
    // Keep the public landing page usable while auth infrastructure is unavailable.
  }

  if (user) {
    redirect("/dashboard");
  }

  const params = searchParams ? await searchParams : {};

  return (
    <AuthLandingPage
      authMessage={getAuthMessage({
        authError: params.auth_error,
        authNotice: params.auth_notice,
      })}
    />
  );
}
