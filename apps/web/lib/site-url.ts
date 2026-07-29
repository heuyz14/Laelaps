import { getPublicEnv } from "@/lib/env";

export function getSiteUrl() {
  return getPublicEnv().NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
}
