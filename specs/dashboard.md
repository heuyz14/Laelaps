# Dashboard Spec

Status: Draft  
Phase: Core Platform

## Executive Summary

The dashboard gives runners a quick view of recent progress and current training status. It should remain useful before AI features are enabled.

## Scope

In scope:

- Weekly mileage
- Monthly mileage
- Average pace
- Longest run
- Recent activity
- Goal progress summary

Out of scope:

- AI chat
- Social feed
- Advanced race prediction

## User Stories

- As a runner, I can see whether I am training consistently.
- As a runner, I can quickly find my latest runs.
- As a runner, I can understand my current weekly volume.

## Functional Requirements

- Show summary cards based on authenticated user's runs.
- Show recent activity ordered by date.
- Show empty state for new users.
- Link to add-run flow.

## UI/UX Requirements

- Dashboard should prioritize scanning.
- Cards should be compact and data-first.
- Empty states should guide the user to add a first run.
- Loading states should not shift layout significantly.

## Responsive Layout Ratios

Use browser zoom `100%` as the baseline for future UI work. The shell should feel broad, operational, and data-first, but it should not require the user to zoom out to see the dashboard structure.

Desktop and wide screens:

- Use a full-width app shell with a constrained max width near `92rem` for the default desktop density.
- Keep page gutters around `1.5rem-1.75rem` on large screens.
- Summary cards should render as four equal columns with a stable height near `7.5rem-8rem`.
- The main dashboard body should use a two-column split where the run form is about `42%` and recent history is about `58%`.
- The recent history panel should be wide enough to feel like the primary workspace.
- Empty states should preserve the panel ratio and avoid shrinking the layout.

Tablet screens:

- Collapse summary cards to two columns.
- Stack the form and history panels unless there is enough horizontal room to preserve readable inputs and table columns.

Mobile screens:

- Use a single-column flow.
- Keep cards and forms full width with stable vertical spacing.
- Do not force desktop aspect ratios when they make touch targets or text cramped.

When adding future dashboard modules, choose ratios by role: compact metrics stay equal-width, primary work surfaces get the larger column, and forms should not dominate the viewport unless the task is explicitly form-first. Validate at browser zoom `100%` before tuning for other display sizes.

## Data Requirements

Dashboard reads from:

- `runs`
- `goals`
- Analytics engine outputs

## Testing Plan

- Empty dashboard state.
- Dashboard with one run.
- Dashboard with multiple weeks of runs.
- Dashboard updates after run CRUD.

## Acceptance Criteria

- Dashboard displays accurate deterministic metrics.
- New users understand the next action.
- Recent activity links to run detail.
- Analytics panels show weekly mileage, monthly mileage, streaks, effort zones, and recovery signals from the analytics engine.
