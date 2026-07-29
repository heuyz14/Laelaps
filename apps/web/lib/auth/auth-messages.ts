const authErrors = {
  invalid_email_password:
    "Enter a valid email and a password with at least 8 characters.",
  email_sign_in_failed: "Unable to sign in with those credentials.",
  email_sign_up_failed: "Unable to create an account with those details.",
  oauth_start_failed: "Unable to start Google sign-in.",
  oauth_callback_failed: "Unable to complete Google sign-in.",
} as const;

const authNotices = {
  check_email: "Check your email to confirm your account, then sign in.",
} as const;

export type AuthMessage =
  | {
      kind: "error";
      text: string;
    }
  | {
      kind: "notice";
      text: string;
    };

export function getAuthMessage({
  authError,
  authNotice,
}: {
  authError?: string | string[];
  authNotice?: string | string[];
}): AuthMessage | null {
  const errorKey = Array.isArray(authError) ? authError[0] : authError;
  const noticeKey = Array.isArray(authNotice) ? authNotice[0] : authNotice;

  if (errorKey && errorKey in authErrors) {
    return {
      kind: "error",
      text: authErrors[errorKey as keyof typeof authErrors],
    };
  }

  if (noticeKey && noticeKey in authNotices) {
    return {
      kind: "notice",
      text: authNotices[noticeKey as keyof typeof authNotices],
    };
  }

  return null;
}
