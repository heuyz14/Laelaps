import { getSiteUrl } from "@/lib/site-url";

export function getAuthCallbackUrl() {
  return `${getSiteUrl()}/auth/callback`;
}
