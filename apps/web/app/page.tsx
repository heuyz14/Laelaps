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
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
