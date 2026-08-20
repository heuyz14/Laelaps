const protectedPrefixes = [
  "/dashboard",
  "/runs",
  "/shoes",
  "/goals",
  "/settings",
];

const authenticatedEntryRoutes = new Set([
  "/",
  "/auth",
  "/auth/sign-in",
  "/auth/callback",
]);

export function isProtectedAppRoute(pathname: string) {
  return protectedPrefixes.some((prefix) => pathname.startsWith(prefix));
}

export function isAuthenticatedEntryRoute(pathname: string) {
  return authenticatedEntryRoutes.has(pathname);
}
