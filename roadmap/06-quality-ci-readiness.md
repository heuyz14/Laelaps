# Quality Gates and CI/CD Readiness

Status: Planned  
Owner: Project maintainer  
Current focus: `apps/web`  
Last reviewed: 2026-07-30

## Executive Summary

Laelaps already has the minimum local tooling needed to start testing Phase 1: Vitest, jsdom, Testing Library, ESLint, Prettier, TypeScript, and root pnpm scripts that run recursively across the workspace.

The next step is not deployment automation. The next step is to make quality gates repeatable locally and in GitHub Actions, then expand tests around the Phase 1 auth, environment, profile, and Supabase boundary code. Deployment should stay out of CI until the GCP target is chosen.

## Current Test Readiness

Existing tooling:

- `pnpm` workspace with recursive root scripts.
- Next.js App Router in `apps/web`.
- Vitest configured with jsdom.
- Testing Library and jest-dom dependencies are installed.
- ESLint, Prettier, and TypeScript are installed.

Existing root scripts:

- `pnpm dev`
- `pnpm build`
- `pnpm lint`
- `pnpm test`
- `pnpm typecheck`
- `pnpm format`

Existing `apps/web` scripts:

- `pnpm --filter @laelaps/web dev`
- `pnpm --filter @laelaps/web build`
- `pnpm --filter @laelaps/web lint`
- `pnpm --filter @laelaps/web test`
- `pnpm --filter @laelaps/web typecheck`
- `pnpm --filter @laelaps/web format`

Missing or incomplete:

- Shared Vitest setup file for Testing Library cleanup and jest-dom matchers.
- Component tests for the Phase 1 auth UI.
- Focused tests for profile validation and profile bootstrap behavior.
- GitHub Actions CI workflow.
- Coverage script.
- Root `verify` script that runs the normal quality gates in order.
- Dependency audit script.
- Secret scanning workflow.
- Environment-variable CI documentation.
- Optional smoke tests for authenticated flows.

## Unit Testing Strategy

Recommended framework:

- Use Vitest for `apps/web` unit tests.
- Use jsdom only for React component tests.
- Keep pure utility tests small and dependency-free.
- Use Testing Library for component behavior, not implementation details.

Test file conventions:

- Put tests next to the code they cover.
- Use `*.test.ts` for pure TypeScript modules.
- Use `*.test.tsx` for React components.
- Prefer descriptive test names that read like requirements.

Phase 1 tests to add first:

- Environment parsing and site URL normalization.
- Email/password validation.
- Auth message parsing.
- Profile schema validation.
- Profile bootstrap behavior using a fake Supabase client.
- Email auth panel default mode and mode switching.

How to test common areas:

- Auth helpers: test validation, safe message mapping, redirect URL construction, and failure messages without hitting real Supabase.
- Validation schemas: test accepted values, rejected values, trimming behavior, and defaults.
- UI components: test rendered labels, active mode, mode switching, accessible controls, and submit button labels.
- Analytics utilities: test deterministic calculations as pure functions once they exist.
- Supabase wrappers: test app-owned wrapper behavior with fake clients; do not unit test Supabase internals.

Do not unit-test yet:

- Real OAuth redirects against Google.
- Real Supabase network behavior.
- Next.js routing internals.
- Styling details beyond critical accessibility or layout state.
- Future analytics/package APIs before the Phase 2/3 boundaries exist.

## Future Package Testing Strategy

`packages/analytics`:

- Use Vitest.
- Keep formulas pure and heavily tested.
- Cover pace, duration, distance conversion, weekly totals, PR detection, HR zones, race prediction, and edge cases.

`packages/types`:

- Prefer TypeScript compile-time validation.
- Add lightweight runtime schema tests only if Zod schemas live there.

`packages/db`:

- Store generated Supabase types when schema stabilizes.
- Test query helpers with mocked Supabase clients.
- Keep service role code server-only and out of browser bundles.

`packages/ui`:

- Add component tests once UI is shared.
- Test accessibility, interaction states, and rendering contracts.
- Avoid snapshot-heavy tests.

## Quality Gates

Required now:

- Typecheck: `pnpm typecheck`
- Lint: `pnpm lint`
- Format check: `pnpm format`
- Unit tests: `pnpm test`
- Production build: `pnpm build`

Recommended next:

- Root `verify` script that runs format, lint, typecheck, test, and build.
- Coverage command for test visibility.
- Dependency audit command.
- Secret scanning in GitHub Actions.
- Environment variable validation in CI with safe fake public values.

Later:

- Playwright smoke tests for login page rendering and protected route redirects.
- Authenticated smoke tests against a staging Supabase project.
- Deployment health checks after GCP target selection.

## Security-Oriented CI/CD Design

CI should use least privilege:

- Set `permissions: contents: read` for normal CI.
- Do not expose Supabase service role keys in CI.
- Do not run deployment jobs on untrusted pull requests.
- Use GitHub environments for production secrets later.
- Keep production deployment in a separate workflow after the hosting target is chosen.

Branch protection expectations:

- Require CI to pass before merging to `main`.
- Require pull request review before merging once collaborators are involved.
- Require linear history if the project prefers a clean portfolio history.

Secret and state protections:

- Keep `.env*` ignored except safe example files.
- Keep generated cloud state out of git.
- Never commit Supabase service role keys.
- Never expose non-public keys with `NEXT_PUBLIC_`.

## GitHub Actions Plan

Minimal CI workflow:

- Trigger on pull requests and pushes to `main`.
- Use Node 22.
- Use pnpm with caching.
- Run `pnpm install --frozen-lockfile`.
- Run `pnpm lint`.
- Run `pnpm typecheck`.
- Run `pnpm test`.
- Run `pnpm format`.
- Run `pnpm build`.
- Provide safe fake public Supabase environment variables for build-time validation.

Deployment should wait until the GCP target is chosen.

## GCP Deployment Readiness

Prepare now:

- Keep root build scripts reproducible.
- Maintain `.env.local.example`.
- Document required environment variables.
- Keep Supabase migrations versioned.
- Track security concerns in `architecture/`.
- Keep deployment target notes in roadmap docs.

Wait until architecture stabilizes:

- Dockerfile.
- Terraform.
- Cloud Build config.
- Real deployment workflow.
- GCP service accounts.
- Production secrets.

Likely future options:

- Cloud Run: strongest fit for a server-rendered Next.js app or combined web/API service.
- Firebase Hosting + Cloud Run: useful if the app benefits from static hosting plus dynamic server routes.
- Firebase App Hosting: worth evaluating if the final Next.js app fits the supported workflow and free-tier constraints.

## Recommended Implementation Order

1. Add Vitest setup for Testing Library.
2. Add Phase 1 unit tests around profile, auth, and component behavior.
3. Add root quality scripts such as `verify`, `test:coverage`, and `audit`.
4. Add a minimal GitHub Actions CI workflow.
5. Run the full local gate.
6. Commit quality/test setup separately from future Phase 2 product work.

## Do Now

- Add missing Phase 1 unit tests.
- Add Vitest setup.
- Add root quality scripts.
- Add minimal CI workflow with no deployment.
- Verify from the monorepo root.

## Do Later

- Add Playwright smoke tests.
- Add coverage thresholds after enough tests exist.
- Add dependency scanning and secret scanning hard gates.
- Add staging Supabase integration tests.
- Add deployment workflow after the GCP target is chosen.
