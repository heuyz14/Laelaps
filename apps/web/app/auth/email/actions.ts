"use server";

import { redirect } from "next/navigation";

import { emailPasswordSchema } from "@/lib/auth/email-password";
import { getSiteUrl } from "@/lib/site-url";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function signInWithEmail(formData: FormData) {
  const parsed = emailPasswordSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    redirect("/?auth_error=invalid_email_password");
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    redirect("/?auth_error=email_sign_in_failed");
  }

  redirect("/dashboard");
}

export async function signUpWithEmail(formData: FormData) {
  const parsed = emailPasswordSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    redirect("/?auth_error=invalid_email_password");
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.signUp({
    ...parsed.data,
    options: {
      emailRedirectTo: `${getSiteUrl()}/auth/callback`,
    },
  });

  if (error) {
    redirect("/?auth_error=email_sign_up_failed");
  }

  if (data.session) {
    redirect("/dashboard");
  }

  redirect("/?auth_notice=check_email");
}
