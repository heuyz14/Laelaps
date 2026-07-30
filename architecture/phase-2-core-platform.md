# Phase 2 Core Platform Implementation

Status: Implemented  
Date: 2026-07-30  
Scope: `apps/web`

## Summary

Phase 2 turns the authenticated Laelaps shell into a usable non-AI running product. A signed-in user can create, view, edit, and delete runs; manage shoes; manage goals; and see deterministic dashboard summaries.

## How The Pieces Connect

The data path is:

```text
HTML form
-> server action
-> Zod validation
-> Supabase query using the user's session cookies
-> Supabase RLS policy
-> revalidate affected routes
-> redirect with a safe notice/error code
```

The read path is:

```text
protected server route
-> Supabase getUser
-> profile bootstrap
-> user-owned table query through RLS
-> deterministic formatting/stat helpers
-> server-rendered UI
```

## Routes

- `/dashboard`: overview, run creation, recent runs, summary cards.
- `/runs`: run history with note search and sorting.
- `/runs/[runId]`: run detail view and delete action.
- `/runs/[runId]/edit`: run edit form.
- `/shoes`: shoe create/update/retire/delete.
- `/goals`: goal create/update/status/delete.

## Server Actions

Server actions live in `apps/web/app/dashboard/actions.ts` for this phase:

- `createRun`
- `updateRun`
- `deleteRun`
- `createShoe`
- `updateShoe`
- `deleteShoe`
- `createGoal`
- `updateGoal`
- `deleteGoal`

The actions intentionally use the normal Supabase anon client plus session cookies. They do not use a service role key. RLS remains the authorization boundary for user-owned rows.

## Validation

Validation lives in `apps/web/lib/validation/`:

- `run.ts`: date, distance, unit conversion, duration, heart rate order, effort, notes, optional shoe.
- `shoe.ts`: shoe name and retired state.
- `goal.ts`: goal type, optional target, optional target date, and status.

Client-side input attributes improve ergonomics, but server-side Zod parsing is the real validation boundary.

## Deterministic Helpers

Run display and summaries use helpers in `apps/web/lib/runs.ts`:

- distance formatting
- duration formatting and splitting
- pace calculation and formatting
- recent-run summary totals
- Supabase relationship normalization for shoe names

These helpers are intentionally deterministic. Phase 3 should build analytics on the same principle.

## Security Notes

- User identity is read server-side with `supabase.auth.getUser()`.
- Writes include `user_id` only after the server confirms the session.
- Updates and deletes filter by row id and rely on RLS to prevent cross-user access.
- Shoe assignment on runs is protected by existing RLS policies that require the referenced shoe to belong to the same user.
- Service role keys are not used.
- Form errors redirect to generic message codes instead of exposing database details.

## Test Coverage

Current unit coverage includes:

- run parsing and unit conversion
- duration and pace helpers
- run summary stats
- Supabase relationship shape normalization
- shoe form validation
- goal form validation
- existing Phase 1 auth/profile/env tests

Recommended later coverage:

- Playwright authenticated CRUD smoke tests.
- Supabase integration tests against a staging/local project.
- Generated database type checks when `packages/db` is introduced.
