# Phase 1 + Phase 2 Acceptance Log

Date: 2026-07-30  
Tester: Codex local tooling  
Scope: Laelaps `apps/web` Phase 1 foundation and Phase 2 core platform

## Tooling Availability

Chrome DevTools MCP is not installed in this session, so browser-driven acceptance, screenshots, console inspection, and authenticated click-through testing could not be run through that connector.

Fallback checks performed:

- Root quality gate: `pnpm verify`
- Dependency audit: `pnpm audit --audit-level moderate`
- Local HTTP route checks with `curl -I`
- Unit tests for auth helpers, route guards, validation, profile bootstrap, and run formatting
- Code review against Phase 1 and Phase 2 acceptance criteria

## Verification Summary

Passed:

- `pnpm verify`
- `pnpm audit --audit-level moderate`
- Unit tests: 13 files, 41 tests
- Production build completes
- Public landing route returns `200 OK` when unauthenticated
- Protected `/dashboard` redirects unauthenticated users to `/?redirectedFrom=%2Fdashboard`
- Protected `/runs` redirects unauthenticated users to `/?redirectedFrom=%2Fruns`
- Protected `/shoes` redirects unauthenticated users to `/?redirectedFrom=%2Fshoes`
- Protected `/goals` redirects unauthenticated users to `/?redirectedFrom=%2Fgoals`
- `/auth/callback` without an OAuth code redirects to `/?auth_error=oauth_callback_failed`

Build warnings:

- Next build still reports the known Supabase JS Edge-runtime warning from middleware import usage. Build succeeds.

Not fully verified without browser automation:

- Google OAuth end-to-end login.
- Browser Back behavior after a real Google OAuth login.
- Authenticated run create/edit/delete through rendered forms.
- Authenticated shoe and goal create/update/delete through rendered forms.
- Visual layout at 1440px, laptop, tablet, and mobile viewport sizes.
- Browser console errors and network waterfalls.

## Phase 1 Acceptance

| Criteria | Status | Evidence |
| --- | --- | --- |
| Workspace and web app foundation exist | Pass | Root pnpm scripts and `apps/web` build pass |
| Supabase auth routes exist | Pass | `/auth/sign-in`, `/auth/callback`, `/auth/sign-out` build |
| Auth callback handles missing/invalid code safely | Pass | Local `/auth/callback` redirects with generic error code |
| Protected dashboard requires auth | Pass | Unauthenticated `/dashboard` redirects to landing |
| Environment validation exists | Pass | Env tests pass |
| Profile bootstrap exists | Pass | Profile tests pass |
| Dependency audit is clean | Pass | `pnpm audit --audit-level moderate` found no known vulnerabilities |

## Phase 2 Acceptance

| Criteria | Status | Evidence |
| --- | --- | --- |
| Signed-in user can manage runs end to end | Not fully automated | Routes/actions exist and validation tests pass; browser-auth flow not run |
| Invalid distance, duration, and date values are rejected | Pass | Run validation tests pass |
| Dashboard metrics update after run changes | Not fully automated | Server actions revalidate dashboard; browser-auth flow not run |
| Deleted runs no longer appear in history or analytics | Not fully automated | Delete action exists and revalidates routes; browser-auth flow not run |
| User data remains isolated by RLS | Partially pass | Existing RLS migration covers user-owned rows; live cross-user test not run |
| Core flows work from root pnpm scripts | Pass | `pnpm verify` passes |
| Shoes and goals have management flows | Not fully automated | Routes/actions exist; browser-auth flow not run |

## Bug Log

### BUG-001: Runs navigation tab is not active on run pages

Severity: Medium  
Area: App shell navigation  
Status: Open

Observed by code review:

- `AppShell` marks the active nav item with `const isActive = item.label === title`.
- `/runs` passes title `"Run history"`, while the nav item label is `"Runs"`.
- `/runs/[runId]` passes title `"Run detail"`.
- `/runs/[runId]/edit` passes title `"Edit run"`.

Expected:

- The Runs nav item should be active for `/runs`, `/runs/[runId]`, and `/runs/[runId]/edit`.

Impact:

- Navigation feedback is inconsistent and can make the app feel less polished.

Suggested fix:

- Pass an explicit active nav key into `AppShell`, for example `activeNav="runs"`, instead of inferring active state from page title.

### TECH-001: Supabase middleware import emits Edge-runtime build warning

Severity: Low  
Area: Build/runtime compatibility  
Status: Open

Observed:

- Production build completes but warns that Supabase JS references `process.version` through middleware import paths.

Expected:

- Production build should be warning-free where practical.

Impact:

- Not currently blocking local development or production build.
- Should be revisited before production deployment.

Suggested fix:

- Evaluate Supabase middleware pattern and package versions before Phase 5 production hardening.

## Recommended Next Test Pass

Use Chrome DevTools MCP or Playwright to run:

1. Google OAuth login from landing page.
2. Browser Back after successful OAuth; expected result is authenticated app fallback to `/dashboard`.
3. Create a shoe.
4. Create a goal.
5. Create a run with a shoe.
6. Verify dashboard metrics and recent run table.
7. Open run detail.
8. Edit run.
9. Delete run.
10. Confirm deleted run no longer appears in `/runs` or dashboard recent runs.
11. Check browser console for errors.
12. Capture desktop/tablet/mobile screenshots.
