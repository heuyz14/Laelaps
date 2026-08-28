import { getSiteUrl } from "@/lib/site-url";

export function getAuthCallbackUrl() {
  return `${getSiteUrl()}/auth/callback`;
}

export function getGoogleOAuthQueryParams() {
  return { prompt: "select_account" } as const;
}
