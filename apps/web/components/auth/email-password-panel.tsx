import { signInWithEmail, signUpWithEmail } from "@/app/auth/email/actions";
import { EmailPasswordPanelClient } from "@/components/auth/email-password-panel-client";
import type { AuthMessage } from "@/lib/auth/auth-messages";

export function EmailPasswordPanel({
  authMessage,
}: {
  authMessage: AuthMessage | null;
}) {
  return (
    <EmailPasswordPanelClient
      authMessage={authMessage}
      signInAction={signInWithEmail}
      signUpAction={signUpWithEmail}
    />
  );
}
