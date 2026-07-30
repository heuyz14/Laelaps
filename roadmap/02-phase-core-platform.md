# Phase 2: Core Platform

Status: Complete  
Target: Week 2  
Depends on: Phase 1

## Executive Summary

Phase 2 builds the non-AI running product in `apps/web`: run CRUD, history, detail views, goals, shoes, and dashboard summaries. The application should be useful with AI disabled.

## Scope

In scope:

- Create, edit, delete, and view runs
- Run history with filters and sorting
- Run detail page
- Dashboard summary cards
- Goal tracking basics
- Shoe tracking basics
- Web-first responsive UX

Out of scope:

- Mobile app screens
- AI summaries
- External sync from Garmin or Strava
- Advanced training plan generation
- Shared package extraction unless duplication appears during implementation

## Deliverables

- Run form with validation
- Run history table/list
- Run detail route
- Dashboard cards
- Goal and shoe data models
- CRUD tests for user-owned data
- Clear empty, loading, and error states in the web app

## Monorepo Notes

Keep feature code in `apps/web` during this phase unless a boundary is already clear. Candidate future package boundaries include:

- `packages/types` for stable domain types
- `packages/db` for generated database types or safe data helpers
- `packages/ui` only after reusable components are proven

## Acceptance Criteria

- A signed-in user can manage runs end to end.
- Invalid distance, duration, and date values are rejected.
- Dashboard metrics update after run changes.
- Deleted runs no longer appear in history or analytics.
- User data remains isolated by RLS.
- Core flows work from root pnpm scripts.

## Completion Notes

Phase 2 is implemented in `apps/web` as the complete non-AI core platform slice.

Delivered:

- Dashboard summaries for recent runs, distance, training time, active goals, and active shoes.
- Manual run creation from the dashboard.
- Run history route with note search and sorting by date or distance.
- Run detail route with distance, duration, pace, effort, heart-rate, shoe, and notes.
- Run edit route.
- Run delete action.
- Shoe management route with create, update, retire, and delete actions.
- Goal management route with create, update, status, target, date, and delete actions.
- Shared app shell navigation for dashboard, runs, shoes, and goals.
- Zod validation for run, shoe, and goal form inputs.
- Unit tests for validation, formatting, pace, duration, and Supabase relationship normalization.
- OAuth callback handoff improvement so successful Google login uses a history-replacing client redirect to the dashboard.

Implementation boundaries:

- Phase 2 stays inside `apps/web`.
- No AI features were added.
- No Strava, Garmin, Apple Health, GPX, or FIT integrations were added.
- No shared packages were extracted because reuse pressure is not high enough yet.
- Existing Supabase RLS policies remain the data isolation boundary.

Known follow-up candidates:

- Add stronger confirmation UX before destructive deletes.
- Add Playwright coverage for the authenticated CRUD flows.
- Add richer dashboard analytics in Phase 3 after deterministic analytics utilities are introduced.
- Replace untyped Supabase casts with generated database types when `packages/db` becomes useful.
