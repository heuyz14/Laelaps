# Phase 3 Analytics Kickoff

Date: 2026-07-30

## Result

Started Phase 3 with a deterministic analytics engine in `apps/web/lib/analytics.ts`.

Implemented:

- Typed analytics run input.
- Summary metrics: run count, invalid row count, distance, duration, aggregate average pace, and longest run distance.
- Weekly mileage using ISO weeks that start on Monday in UTC.
- Monthly mileage using `YYYY-MM` calendar months.
- Personal records for longest run and fastest pace.
- Day and week streak detection.
- Effort zone grouping:
  - Easy: effort 1-3
  - Moderate: effort 4-7
  - Hard: effort 8-10
  - Unknown: missing or out-of-range effort
- Comparable run selection by distance tolerance, distance delta, and recency.
- Deterministic recovery signals for volume spikes, hard-effort clusters, and elevated average heart rate.

Integrated:

- `getRunDashboardStats` now delegates to the analytics engine so the dashboard uses the Phase 3 calculation path without changing the UI.

## Assumptions

- Analytics functions are pure and do not depend on Supabase, request state, UI state, or AI runtime.
- Invalid run rows are excluded from calculations and counted in `summary.invalidRunCount`.
- Pace is represented internally as seconds per kilometer.
- Package extraction is deferred because there is not yet a second consumer from AI tools or mobile.

## Verification

- `pnpm --dir apps/web test -- lib/analytics.test.ts lib/runs.test.ts`
- Full verification should pass before committing this slice.

## Remaining Phase 3 Work

- Surface weekly/monthly/PR/streak/recovery outputs in UI where useful.
- Decide whether to fetch more than the current recent-run limit for dashboard analytics.
- Add documentation near AI tool contracts once Phase 4 consumers exist.
- Revisit extraction to `packages/analytics` when AI or mobile needs the same module.
