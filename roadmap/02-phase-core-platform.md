# Phase 2: Core Platform

Status: Draft  
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
