"use client";

import { useState } from "react";

import { signInWithEmail, signUpWithEmail } from "@/app/auth/email/actions";
import { Button } from "@/components/ui/button";
import type { AuthMessage } from "@/lib/auth/auth-messages";
import { cn } from "@/lib/utils";

type AuthMode = "sign-in" | "create-account";

export function EmailPasswordPanel({
  authMessage,
}: {
  authMessage: AuthMessage | null;
}) {
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const isSignIn = mode === "sign-in";

  return (
    <div className="mt-5 rounded-2xl border border-border/80 bg-white/70 p-5 shadow-sm backdrop-blur">
      <div className="mb-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
          Or use email
        </p>
        <div className="h-px flex-1 bg-border" />
      </div>

      <div className="mb-5 grid grid-cols-2 rounded-xl border border-border bg-muted/55 p-1">
        <button
          type="button"
          onClick={() => setMode("sign-in")}
          className={cn(
            "h-10 rounded-lg text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            isSignIn
              ? "bg-white text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
          aria-pressed={isSignIn}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => setMode("create-account")}
          className={cn(
            "h-10 rounded-lg text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            !isSignIn
              ? "bg-white text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
          aria-pressed={!isSignIn}
        >
          Create account
        </button>
      </div>

      {authMessage ? (
        <p
          className={cn(
            "mb-5 rounded-xl border px-3 py-2 text-sm leading-5",
            authMessage.kind === "error"
              ? "border-destructive/25 bg-destructive/10 text-destructive"
              : "border-primary/20 bg-primary/10 text-accent-foreground",
          )}
          role={authMessage.kind === "error" ? "alert" : "status"}
        >
          {authMessage.text}
        </p>
      ) : null}

      <EmailPasswordForm
        key={mode}
        action={isSignIn ? signInWithEmail : signUpWithEmail}
        submitLabel={isSignIn ? "Sign in" : "Create account"}
        passwordAutoComplete={isSignIn ? "current-password" : "new-password"}
      />

      <button
        type="button"
        onClick={() => setMode(isSignIn ? "create-account" : "sign-in")}
        className="mt-3 w-full text-center text-sm font-medium text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {isSignIn
          ? "New to Laelaps? Create an account"
          : "Already have an account? Sign in"}
      </button>
    </div>
  );
}

function EmailPasswordForm({
  action,
  submitLabel,
  passwordAutoComplete,
}: {
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  passwordAutoComplete: "current-password" | "new-password";
}) {
  const idPrefix = submitLabel.toLowerCase().replace(/\s+/g, "-");

  return (
    <form action={action} className="grid gap-3">
      <div className="grid gap-1.5">
        <label
          htmlFor={`${idPrefix}-email`}
          className="text-sm font-medium text-foreground"
        >
          Email
        </label>
        <input
          id={`${idPrefix}-email`}
          name="email"
          type="email"
          autoComplete="email"
          required
          className="h-12 rounded-xl border border-input bg-white px-3.5 text-base text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          placeholder="runner@example.com"
        />
      </div>
      <div className="grid gap-1.5">
        <label
          htmlFor={`${idPrefix}-password`}
          className="text-sm font-medium text-foreground"
        >
          Password
        </label>
        <input
          id={`${idPrefix}-password`}
          name="password"
          type="password"
          autoComplete={passwordAutoComplete}
          required
          minLength={8}
          maxLength={128}
          className="h-12 rounded-xl border border-input bg-white px-3.5 text-base text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          placeholder="At least 8 characters"
        />
      </div>
      <Button type="submit" variant="outline" className="mt-1 h-11 rounded-xl">
        {submitLabel}
      </Button>
    </form>
  );
}
